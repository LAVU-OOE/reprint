// Globale Variablen für Sortiment und Vorlagen
let sortiment = [];
let templates = {};

// Konstanten für LocalStorage-Schlüssel (passend zur Struktur)
const STORAGE_KEY_SORTIMENT = 'lavu_studio_sortiment_v8';
const STORAGE_KEY_SETTINGS = 'lavu_studio_settings_v8';
const STORAGE_KEY_LOCATIONS_CACHE = 'lavu_locations_cache';

// Fallback-Sortiment, falls die API offline ist
const fallbackSortiment = [
    { artNr: "101", name: "Elektro-Kleingeräte", symbol: "🔌" },
    { artNr: "102", name: "Elektro-Großgeräte", symbol: "📺" },
    { artNr: "103", name: "Kühlgeräte", symbol: "❄️" },
    { artNr: "104", name: "Altholz", symbol: "🪵" },
    { artNr: "105", name: "Sperrmüll", symbol: "🛋️" },
    { artNr: "106", name: "Altmetall", symbol: "🔩" },
    { artNr: "107", name: "Bauschutt", symbol: "🧱" },
    { artNr: "108", name: "Grünschnitt", symbol: "🌿" },
    { artNr: "109", name: "Problemstoffe", symbol: "⚠️" },
    { artNr: "110", name: "Kartonagen", symbol: "📦" }
];

// Fallback-Standorte (ASZ Liste)
const fallbackLocations = [
    "ASZ Asten", "ASZ Ansfelden", "ASZ Enns", "ASZ Haid", "ASZ Hörsching", 
    "ASZ Leonding", "ASZ Neuhofen", "ASZ Oftering", "ASZ Pasching", "ASZ Pucking", 
    "ASZ St. Florian", "ASZ Traun", "ASZ Wilhering"
];

// App-Einstellungen mit den neuen Cloudflare Worker URLs
let appSettings = {
    sortimentUrl: 'https://sortiment-api.lavu-ooe.workers.dev/',
    locationsUrl: 'https://locations-api.lavu-ooe.workers.dev/'
};

// DOM-Elemente basierend auf den IDs Ihrer index.html
const s1Select = document.getElementById('s1'); // Standorte-Dropdown
const i1Input = document.getElementById('i1');   // Manueller Standort-Text
const s2Select = document.getElementById('s2');   // Sortiment-Dropdown
const i2Input = document.getElementById('i2');   // Anzahl der Etiketten
const labelPreview = document.getElementById('t1'); // Das Live-Vorschaubehältnis
const printBtn = document.getElementById('btn-print-now'); // Drucken-Button

// Optionale/Management Elemente aus Ihrer index.html
const settingsBtn = document.getElementById('btn-options'); // "Zahnrad" / Optionen Button
const settingsModal = document.getElementById('m1'); // Modal Container
const closeSettingsBtn = document.getElementById('modal1CloseBtn'); // Modal Schließen oben
const doneSettingsBtn = document.getElementById('btn-done'); // Modal Schließen unten
const settingsUrlInput = document.getElementById('i4'); // Sortiment URL Input
const updateSettingsUrlBtn = document.getElementById('btn-update'); // Aktualisieren Button
const manageSortimentContainer = document.getElementById('c4'); // Container für Sortiments-Management

// Template Verwaltung (In Ihrer index.html fest verdrahtet, standardmäßig v1)
let activeTemplateId = 'template_v1';

// Event-Listener beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadLocations();
    loadSortiment();
    loadTemplates();
    setupEventListeners();
});

// Event-Listener einrichten
function setupEventListeners() {
    if (s1Select && i1Input) {
        s1Select.addEventListener('change', () => {
            i1Input.value = s1Select.value;
            updatePreview();
        });
        i1Input.addEventListener('input', updatePreview);
    }

    if (s2Select) {
        s2Select.addEventListener('change', updatePreview);
    }

    if (i2Input) {
        i2Input.addEventListener('input', updatePreview);
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Modal Events
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', () => {
            if (settingsUrlInput) settingsUrlInput.value = appSettings.sortimentUrl;
            renderSortimentManagement();
            settingsModal.style.display = 'flex';
        });
    }

    const closeDialog = () => { if (settingsModal) settingsModal.style.display = 'none'; };
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeDialog);
    if (doneSettingsBtn) doneSettingsBtn.addEventListener('click', closeDialog);

    if (updateSettingsUrlBtn && settingsUrlInput) {
        updateSettingsUrlBtn.addEventListener('click', () => {
            const url = settingsUrlInput.value.trim();
            if (url) {
                appSettings.sortimentUrl = url;
                saveSettings();
                fetchSortimentFromUrl(url);
            }
        });
    }
}

function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
        try { appSettings = JSON.parse(saved); } catch (e) { console.error(e); }
    }
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
}

// Standorte von Worker API laden
function loadLocations() {
    const cached = localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE);
    if (cached) {
        try { populateLocationsDropdown(JSON.parse(cached)); } catch (e) {}
    }

    fetch(appSettings.locationsUrl)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem(STORAGE_KEY_LOCATIONS_CACHE, JSON.stringify(data));
                populateLocationsDropdown(data);
            }
        })
        .catch(() => {
            if (!localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE)) {
                populateLocationsDropdown(fallbackLocations);
            }
        });
}

function populateLocationsDropdown(locationsList) {
    if (!s1Select) return;
    s1Select.innerHTML = '<option value="" disabled selected>Zentren auswählen...</option>';
    locationsList.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc;
        opt.textContent = loc;
        s1Select.appendChild(opt);
    });
    if (locationsList.length > 0 && i1Input && !i1Input.value) {
        s1Select.selectedIndex = 1;
        i1Input.value = s1Select.value;
    }
    updatePreview();
}

// Sortiment laden
function loadSortiment() {
    const localData = localStorage.getItem(STORAGE_KEY_SORTIMENT);
    if (localData) {
        try {
            sortiment = JSON.parse(localData);
            populateSortimentDropdown();
            return;
        } catch (e) {}
    }
    fetchSortimentFromUrl(appSettings.sortimentUrl);
}

function fetchSortimentFromUrl(url) {
    fetch(url)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
            if (Array.isArray(data)) {
                sortiment = data;
                localStorage.setItem(STORAGE_KEY_SORTIMENT, JSON.stringify(sortiment));
                populateSortimentDropdown();
            }
        })
        .catch(() => {
            sortiment = fallbackSortiment;
            populateSortimentDropdown();
        });
}

function populateSortimentDropdown() {
    if (!s2Select) return;
    s2Select.innerHTML = '<option value="" disabled selected>Müllart auswählen...</option>';
    sortiment.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.artNr;
        opt.textContent = `${item.artNr} - ${item.name || item.bez}`;
        s2Select.appendChild(opt);
    });
    if (sortiment.length > 0) {
        s2Select.selectedIndex = 1;
    }
    updatePreview();
}

// Rendert das Sortiment im Verwaltungsbereich (c4)
function renderSortimentManagement() {
    if (!manageSortimentContainer) return;
    manageSortimentContainer.innerHTML = '';
    sortiment.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.style = "display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee; font-size:0.9rem;";
        itemEl.innerHTML = `
            <span><strong>${escapeHtml(item.artNr)}</strong>: ${escapeHtml(item.name || item.bez)}</span>
            <button style="color:#e74c3c; background:none; border:none; cursor:pointer;" onclick="deleteSortimentItem(${index})">Löschen</button>
        `;
        manageSortimentContainer.appendChild(itemEl);
    });
}

window.deleteSortimentItem = function(index) {
    if (confirm(`Möchten Sie "${sortiment[index].name || sortiment[index].bez}" löschen?`)) {
        sortiment.splice(index, 1);
        localStorage.setItem(STORAGE_KEY_SORTIMENT, JSON.stringify(sortiment));
        populateSortimentDropdown();
        renderSortimentManagement();
    }
};

function loadTemplates() {
    templates = {
        template_v1: `
            <div class="template-v1-container" style="width:100%; height:100%; padding:20px; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; border-bottom:3px solid #1a4b60; padding-bottom:5px;">
                    <span style="background:#1a4b60; color:white; font-weight:bold; padding:2px 6px; border-radius:4px; font-size:12px;">LAVU OÖ</span>
                    <span id="v1_loc" style="font-weight:bold; color:#555; font-size:13px;"></span>
                </div>
                <div style="display:flex; align-items:center; flex-grow:1; margin-top:10px;">
                    <div id="v1_symbol" style="font-size:70px; margin-right:20px; min-width:80px; text-align:center;">📦</div>
                    <div>
                        <div id="v1_art" style="font-family:monospace; font-size:16px; font-weight:bold; color:#1a4b60; background:#eef2f5; padding:2px 6px; border-radius:4px; display:inline-block; margin-bottom:4px;"></div>
                        <div id="v1_name" style="font-weight:800; color:#111; line-height:1.2; font-size:24px;"></div>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; border-top:1px solid #eef2f5; padding-top:8px; font-size:11px; color:#aaa;">
                    <span>Etiketten-Druckstudio</span>
                    <span id="v1_date"></span>
                </div>
            </div>
        `
    };
}

function updatePreview() {
    if (!labelPreview) return;

    const locValue = i1Input ? i1Input.value.trim() : "Kein Standort gewählt";
    const selectedArtNr = s2Select ? s2Select.value : "";
    const selectedItem = sortiment.find(item => item.artNr === selectedArtNr);

    let artNrValue = selectedItem ? selectedItem.artNr : "";
    let nameValue = selectedItem ? (selectedItem.name || selectedItem.bez) : "Bitte wählen...";
    let symbolValue = selectedItem ? (selectedItem.symbol || "📦") : "📦";

    const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    labelPreview.innerHTML = templates[activeTemplateId] || '';

    const locEl = document.getElementById('v1_loc');
    const symbolEl = document.getElementById('v1_symbol');
    const artEl = document.getElementById('v1_art');
    const nameEl = document.getElementById('v1_name');
    const dateEl = document.getElementById('v1_date');

    if (locEl) locEl.textContent = locValue;
    if (symbolEl) symbolEl.textContent = symbolValue;
    if (artEl) artEl.textContent = artNrValue ? `Art.Nr. ${artNrValue}` : '';
    if (nameEl) {
        nameEl.textContent = nameValue;
        adjustFontSize(nameEl, 24, 12);
    }
    if (dateEl) dateEl.textContent = today;

    // Synchronisation mit dem unsichtbaren Druckcontainer (A4-Druckbogen)
    const printContainer = document.getElementById('d5');
    if (printContainer) {
        printContainer.innerHTML = '';
        const count = i2Input ? parseInt(i2Input.value) || 1 : 1;
        for (let i = 0; i < count; i++) {
            const labelCopy = document.createElement('div');
            labelCopy.className = 'lb';
            labelCopy.innerHTML = labelPreview.innerHTML;
            printContainer.appendChild(labelCopy);
        }
    }
}

function adjustFontSize(element, maxPx, minPx) {
    if (!element) return;
    let size = maxPx;
    element.style.fontSize = `${size}px`;
    while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && size > minPx) {
        size -= 1;
        element.style.fontSize = `${size}px`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}