// ─── Global state ──────────────────────────────────────────────

let apiBase = localStorage.getItem('apiBase') || 'https://sortiment-api.lavu-ooe.workers.dev';
let currentLang = localStorage.getItem('lang') || 'de';
let sortimentData = [];          // still mutable (reloaded from API)
let selectedItems = [];          // user's current label list

// ─── #13: load static resources with top‑level await, store as const ──

const [manifest, i18nData, formatsData] = await Promise.all([
  fetch('manifest.json').then(r => r.json()),
  fetch('i18n.json').then(r => r.json()),
  fetch('formats.json').then(r => r.json())
]).catch(err => {
  console.error('Critical: failed to load static resources', err);
  // fallback empty objects to prevent total crash
  return [{}, {}, {}];
});

// ─── Translation helper ────────────────────────────────────────

function t(key) {
  const keys = key.split('.');
  let val = i18nData[currentLang] || i18nData['de'] || {};
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) val = val[k];
    else return key;
  }
  return val;
}

// ─── DOM refs ──────────────────────────────────────────────────

const articleInput = document.getElementById('articleInput');
const addBtn = document.getElementById('addBtn');
const formatSelect = document.getElementById('formatSelect');
const countInput = document.getElementById('countInput');
const startPosInput = document.getElementById('startPosInput');
const printBtn = document.getElementById('printBtn');
const optionsBtn = document.getElementById('optionsBtn');
const clearBtn = document.getElementById('clearBtn');
const previewContainer = document.getElementById('previewContainer');
const optionsModal = document.getElementById('optionsModal');
const closeModal = document.getElementById('closeModal');
const apiInput = document.getElementById('apiInput');
const saveApiBtn = document.getElementById('saveApiBtn');
const langSelect = document.getElementById('langSelect');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const reloadDataBtn = document.getElementById('reloadDataBtn');
const appTitle = document.getElementById('appTitle');

// ─── Load sortiment (from configurable API) ──────────────────

async function loadSortiment() {
  try {
    const url = `${apiBase}/sortiment.json`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    sortimentData = data;
    localStorage.setItem('cachedSortiment', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Failed to load sortiment:', err);
    // try cached
    const cached = localStorage.getItem('cachedSortiment');
    if (cached) {
      try {
        sortimentData = JSON.parse(cached);
        return sortimentData;
      } catch (_) { /* ignore */ }
    }
    alert(t('error.loadSortiment') || 'Fehler beim Laden der Artikel-Daten.');
    return [];
  }
}

// ─── Preview rendering ────────────────────────────────────────

function updatePreview() {
  const format = formatSelect.value;
  if (!format) {
    previewContainer.innerHTML = `<p style="color:#94a3b8;padding:2rem;">${t('preview.selectFormat') || 'Bitte wählen Sie ein Format.'}</p>`;
    return;
  }
  const formatData = formatsData[format];
  if (!formatData) {
    previewContainer.innerHTML = `<p style="color:#ef4444;">${t('preview.invalidFormat') || 'Ungültiges Format.'}</p>`;
    return;
  }

  const labelsPerPage = formatData.labelsPerPage || 10;
  const startPos = parseInt(startPosInput.value, 10) || 1;
  const count = parseInt(countInput.value, 10) || 1;

  // Clamp start position
  const clampedStart = Math.max(1, Math.min(startPos, labelsPerPage));

  // Build label list (full items, repeat according to count)
  let allLabels = [];
  for (const item of selectedItems) {
    for (let i = 0; i < count; i++) {
      allLabels.push(item);
    }
  }

  // Slice from start position – but we need to offset by (startPos-1) blanks
  const totalSlots = labelsPerPage * Math.ceil((allLabels.length + clampedStart - 1) / labelsPerPage);
  const filledSlots = [];
  let labelIdx = 0;
  for (let i = 1; i <= totalSlots; i++) {
    if (i >= clampedStart && labelIdx < allLabels.length) {
      filledSlots.push(allLabels[labelIdx]);
      labelIdx++;
    } else {
      filledSlots.push(null); // empty slot
    }
  }

  // Render grid
  let html = `<div style="display:grid;grid-template-columns:repeat(${formatData.columns || 3},1fr);gap:0.3rem;">`;
  for (const slot of filledSlots) {
    if (slot) {
      const art = slot['Art.Nr.'] || slot.artNr || '';
      const desc = slot.Bezeichnung || slot.description || '';
      html += `<div class="label-card"><span class="art">${art}</span><span class="desc">${desc}</span></div>`;
    } else {
      html += `<div class="label-card" style="border-color:#e9edf3;background:#f8fafc;">&nbsp;</div>`;
    }
  }
  html += '</div>';
  previewContainer.innerHTML = html;
}

// ─── #15: Print with iframe removal ──────────────────────────

function printLabels() {
  if (selectedItems.length === 0) {
    alert(t('error.noItems') || 'Keine Artikel in der Liste.');
    return;
  }
  const format = formatSelect.value;
  if (!format) {
    alert(t('error.noFormat') || 'Bitte wählen Sie ein Format.');
    return;
  }
  const formatData = formatsData[format];
  if (!formatData) {
    alert(t('error.invalidFormat') || 'Format-Daten fehlen.');
    return;
  }

  // Build the same label grid as preview, but in a clean iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#fff; padding:0; margin:0; }
        .grid {
          display: grid;
          grid-template-columns: repeat(${formatData.columns || 3}, 1fr);
          gap: 0.2rem;
          padding: 0.2rem;
          width: 100%;
        }
        .label {
          border: 1px solid #000;
          aspect-ratio: 3 / 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          font-size: 0.55rem;
          padding: 0.1rem;
          page-break-inside: avoid;
          word-break: break-word;
        }
        .label .art { font-weight:600; }
        .label .desc { font-size:0.5rem; }
        .empty { border-color:#ccc; background:#f9f9f9; }
        @page { margin:0; }
      </style>
    </head>
    <body>
      <div class="grid" id="printGrid"></div>
    </body>
    </html>
  `);
  doc.close();

  // Re‑use the same logic as preview to fill the grid
  const labelsPerPage = formatData.labelsPerPage || 10;
  const startPos = parseInt(startPosInput.value, 10) || 1;
  const count = parseInt(countInput.value, 10) || 1;
  const clampedStart = Math.max(1, Math.min(startPos, labelsPerPage));

  let allLabels = [];
  for (const item of selectedItems) {
    for (let i = 0; i < count; i++) {
      allLabels.push(item);
    }
  }
  const totalSlots = labelsPerPage * Math.ceil((allLabels.length + clampedStart - 1) / labelsPerPage);
  const filledSlots = [];
  let labelIdx = 0;
  for (let i = 1; i <= totalSlots; i++) {
    if (i >= clampedStart && labelIdx < allLabels.length) {
      filledSlots.push(allLabels[labelIdx]);
      labelIdx++;
    } else {
      filledSlots.push(null);
    }
  }

  const grid = doc.getElementById('printGrid');
  for (const slot of filledSlots) {
    const div = doc.createElement('div');
    div.className = 'label' + (slot ? '' : ' empty');
    if (slot) {
      const art = slot['Art.Nr.'] || slot.artNr || '';
      const desc = slot.Bezeichnung || slot.description || '';
      const artSpan = doc.createElement('span');
      artSpan.className = 'art';
      artSpan.textContent = art;
      const descSpan = doc.createElement('span');
      descSpan.className = 'desc';
      descSpan.textContent = desc;
      div.appendChild(artSpan);
      div.appendChild(descSpan);
    } else {
      div.innerHTML = '&nbsp;';
    }
    grid.appendChild(div);
  }

  // ── #15: remove iframe after print ──
  const printWindow = iframe.contentWindow;
  printWindow.addEventListener('afterprint', () => {
    iframe.remove();
  });

  // Trigger print
  printWindow.print();
}

// ─── UI helpers ────────────────────────────────────────────────

function populateFormats() {
  formatSelect.innerHTML = `<option value="">${t('preview.selectFormat') || 'Bitte Format wählen'}</option>`;
  for (const [key, data] of Object.entries(formatsData)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = data.name || key;
    formatSelect.appendChild(opt);
  }
}

function updateTitle() {
  appTitle.textContent = manifest?.name || 'Label Studio v9';
}

function addItem() {
  const query = articleInput.value.trim();
  if (!query) return;
  const found = sortimentData.find(item =>
    (item['Art.Nr.'] && item['Art.Nr.'].toLowerCase().includes(query.toLowerCase())) ||
    (item.Bezeichnung && item.Bezeichnung.toLowerCase().includes(query.toLowerCase()))
  );
  if (found) {
    selectedItems.push(found);
    articleInput.value = '';
    updatePreview();
  } else {
    alert(t('error.notFound') || 'Artikel nicht gefunden.');
  }
}

function clearItems() {
  if (selectedItems.length === 0) return;
  if (confirm(t('confirm.clear') || 'Alle Artikel aus der Liste entfernen?')) {
    selectedItems = [];
    updatePreview();
  }
}

// ─── Options modal ────────────────────────────────────────────

function openOptions() {
  apiInput.value = apiBase;
  langSelect.value = currentLang;
  optionsModal.classList.remove('hidden');
}

function closeOptions() {
  optionsModal.classList.add('hidden');
}

function saveApi() {
  const val = apiInput.value.trim();
  if (val) {
    apiBase = val;
    localStorage.setItem('apiBase', val);
    alert(t('options.saved') || 'Gespeichert.');
  }
}

function saveLang() {
  currentLang = langSelect.value;
  localStorage.setItem('lang', currentLang);
  // update UI texts
  populateFormats();
  updateTitle();
  updatePreview();
}

function clearCache() {
  if (confirm(t('confirm.clearCache') || 'Gesamten Cache leeren?')) {
    localStorage.clear();
    alert(t('options.cacheCleared') || 'Cache geleert.');
  }
}

async function reloadData() {
  await loadSortiment();
  updatePreview();
  alert(t('options.reloaded') || 'Daten neu geladen.');
}

// ─── Event binding ─────────────────────────────────────────────

addBtn.addEventListener('click', addItem);
articleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});
printBtn.addEventListener('click', printLabels);
clearBtn.addEventListener('click', clearItems);
optionsBtn.addEventListener('click', openOptions);
closeModal.addEventListener('click', closeOptions);
optionsModal.addEventListener('click', (e) => {
  if (e.target === optionsModal) closeOptions();
});
saveApiBtn.addEventListener('click', saveApi);
langSelect.addEventListener('change', saveLang);
clearCacheBtn.addEventListener('click', clearCache);
reloadDataBtn.addEventListener('click', reloadData);

formatSelect.addEventListener('change', updatePreview);
countInput.addEventListener('input', updatePreview);
startPosInput.addEventListener('input', updatePreview);

// ─── Init app ──────────────────────────────────────────────────

async function initApp() {
  await loadSortiment();
  populateFormats();
  updateTitle();
  // set initial API input
  apiInput.value = apiBase;
  langSelect.value = currentLang;
  updatePreview();
}

// Wait for DOM to be ready (module script may run before DOM is fully parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}