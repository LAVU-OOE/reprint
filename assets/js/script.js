// Globale Variablen für Sortiment und Vorlagen
let sortiment = [];
let templates = {};
let appSettings = {
    sortimentUrl: 'https://sortiment-api.lavu-ooe.workers.dev/',
    hasCustomSortiment: false
};

// Konstanten für LocalStorage-Schlüssel
const STORAGE_KEY_SORTIMENT = 'lavu_studio_sortiment_v9';
const STORAGE_KEY_SETTINGS = 'lavu_studio_settings_v9';
const STORAGE_KEY_LOCATIONS_CACHE = 'lavu_locations_cache';

// Fallback-Sortiment
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

// Fallback-Standorte
const fallbackLocations = [
    "ASZ Asten", "ASZ Ansfelden", "ASZ Enns", "ASZ Haid", "ASZ Hörsching",
    "ASZ Leonding", "ASZ Neuhofen", "ASZ Oftering", "ASZ Pasching", "ASZ Pucking",
    "ASZ St. Florian", "ASZ Traun", "ASZ Wilhering", "ASZ Kirchdorf", "ASZ Micheldorf",
    "ASZ Pettenbach", "ASZ Windischgarsten", "ASZ Grünburg", "ASZ Kremsmünster",
    "ASZ Molln", "ASZ Klaus", "ASZ Steyr", "ASZ Garsten"
];

// DOM-Elemente
const s1Select = document.getElementById('s1');
const i1Input = document.getElementById('i1');
const s2ArtSelect = document.getElementById('s2_art');
const s2NameSelect = document.getElementById('s2_name');
const i2Input = document.getElementById('i2');
const i3Input = document.getElementById('i3');
const labelFormatSelect = document.getElementById('labelFormatSelect');
const modalLabelFormatSelect = document.getElementById('modalLabelFormatSelect');

// Event-Listener beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadLocations();
    loadSortiment();
    loadTemplates();
    setupEventListeners();
    updatePreview();
});

// Event-Listener einrichten
function setupEventListeners() {
    // Standort-Dropdown
    if (s1Select) {
        s1Select.addEventListener('change', () => {
            if (i1Input) i1Input.value = s1Select.value;
            updatePreview();
        });
    }

    // Manuelle Standort-Eingabe
    if (i1Input) {
        i1Input.addEventListener('input', updatePreview);
    }

    // Sortiment-Dropdowns synchronisieren
    if (s2ArtSelect) {
        s2ArtSelect.addEventListener('change', () => {
            if (s2NameSelect) s2NameSelect.value = s2ArtSelect.value;
            if (i2Input) i2Input.value = s2ArtSelect.value;
            updatePreview();
        });
    }

    if (s2NameSelect) {
        s2NameSelect.addEventListener('change', () => {
            if (s2ArtSelect) s2ArtSelect.value = s2NameSelect.value;
            if (i2Input) i2Input.value = s2NameSelect.value;
            updatePreview();
        });
    }

    // Manuelle Eingabe
    if (i2Input) {
        i2Input.addEventListener('input', updatePreview);
    }

    // Druck-Button
    const printBtn = document.getElementById('btn-print-now');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            printLabels();
        });
    }

    // Optionen-Button (Modal öffnen)
    const optionsBtn = document.getElementById('btn-options');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', () => {
            const modal = document.getElementById('m1');
            if (modal) modal.style.display = 'flex';
        });
    }

    // Modal-Schließen
    const modal1Close = document.getElementById('modal1CloseBtn');
    if (modal1Close) {
        modal1Close.addEventListener('click', () => {
            const modal = document.getElementById('m1');
            if (modal) modal.style.display = 'none';
        });
    }

    // Modal 1 - Klick außerhalb schließen
    const modal1 = document.getElementById('m1');
    if (modal1) {
        modal1.addEventListener('click', (e) => {
            if (e.target === modal1) modal1.style.display = 'none';
        });
    }

    // Modal 2 - Großansicht
    const layoutTitle = document.getElementById('layout-title-attr');
    if (layoutTitle) {
        layoutTitle.addEventListener('click', () => {
            openFullPreview();
        });
    }

    const modal2Close = document.getElementById('modal2CloseBtn');
    if (modal2Close) {
        modal2Close.addEventListener('click', () => {
            const modal = document.getElementById('m2');
            if (modal) modal.style.display = 'none';
        });
    }

    const modal2 = document.getElementById('m2');
    if (modal2) {
        modal2.addEventListener('click', (e) => {
            if (e.target === modal2) modal2.style.display = 'none';
        });
    }

    const modalClose = document.getElementById('btn-modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            const modal = document.getElementById('m2');
            if (modal) modal.style.display = 'none';
        });
    }

    // Modal-Drucken
    const modalPrintBtn = document.getElementById('btn-modal-print');
    if (modalPrintBtn) {
        modalPrintBtn.addEventListener('click', () => {
            printLabels();
        });
    }

    // Zoom-Slider
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    if (zoomSlider && zoomVal) {
        zoomSlider.addEventListener('input', () => {
            const val = zoomSlider.value;
            zoomVal.textContent = val + '%';
            const pc = document.querySelector('#m2 .pc');
            if (pc) {
                const scale = val / 100;
                pc.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
        });
    }

    // Tabs im Modal
    const tabSelect = document.getElementById('t2');
    const tabManage = document.getElementById('t3');
    const panelSelect = document.getElementById('s3');
    const panelManage = document.getElementById('s4');

    if (tabSelect && tabManage && panelSelect && panelManage) {
        tabSelect.addEventListener('click', () => {
            tabSelect.classList.add('a');
            tabManage.classList.remove('a');
            panelSelect.classList.add('a');
            panelManage.classList.remove('a');
        });

        tabManage.addEventListener('click', () => {
            tabManage.classList.add('a');
            tabSelect.classList.remove('a');
            panelManage.classList.add('a');
            panelSelect.classList.remove('a');
            renderManagementTable();
        });
    }

    // Neu hinzufügen
    const btnAddNew = document.getElementById('btn-add-new');
    if (btnAddNew) {
        btnAddNew.addEventListener('click', () => {
            const artNr = document.getElementById('c1');
            const suffix = document.getElementById('c2');
            const name = document.getElementById('c3');

            if (artNr && artNr.value.trim() && name && name.value.trim()) {
                const newItem = {
                    artNr: artNr.value.trim(),
                    name: name.value.trim(),
                    symbol: suffix ? suffix.value.trim() || '📦' : '📦'
                };

                if (sortiment.some(item => item.artNr === newItem.artNr)) {
                    alert('Diese Artikelnummer existiert bereits!');
                    return;
                }

                sortiment.push(newItem);
                saveSortimentToLocalStorage();
                populateSortimentDropdowns();
                renderManagementTable();

                if (artNr) artNr.value = '';
                if (suffix) suffix.value = '';
                if (name) name.value = '';
            } else {
                alert('Bitte Art.Nr. und Bezeichnung eingeben!');
            }
        });
    }

    // Abbrechen
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            const c1 = document.getElementById('c1');
            const c2 = document.getElementById('c2');
            const c3 = document.getElementById('c3');
            if (c1) c1.value = '';
            if (c2) c2.value = '';
            if (c3) c3.value = '';
        });
    }

    // Update-Button für URL
    const btnUpdate = document.getElementById('btn-update');
    if (btnUpdate) {
        btnUpdate.addEventListener('click', () => {
            const urlInput = document.getElementById('i4');
            if (urlInput && urlInput.value.trim()) {
                appSettings.sortimentUrl = urlInput.value.trim();
                saveSettings();
                fetchSortimentFromUrl(appSettings.sortimentUrl);
            }
        });
    }

    // Download JSON
    const btnDownload = document.getElementById('btn-download-json');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const dataStr = JSON.stringify(sortiment, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sortiment_backup.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Standard sichern
    const btnSaveDefault = document.getElementById('b2');
    if (btnSaveDefault) {
        btnSaveDefault.addEventListener('click', () => {
            saveSortimentToLocalStorage();
            appSettings.hasCustomSortiment = true;
            saveSettings();
            alert('Sortiment wurde lokal gesichert!');
        });
    }

    // Fertig (Modal schließen)
    const btnDone = document.getElementById('btn-done');
    if (btnDone) {
        btnDone.addEventListener('click', () => {
            const modal = document.getElementById('m1');
            if (modal) modal.style.display = 'none';
        });
    }

    // PWA Installation
    const pwaBtn = document.getElementById('b3');
    if (pwaBtn) {
        pwaBtn.addEventListener('click', () => {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    window.deferredPrompt = null;
                    const banner = document.getElementById('pwaBanner');
                    if (banner) banner.style.display = 'none';
                });
            }
        });
    }

    // Sprachumschalter
    const langToggle = document.getElementById('langToggleBtn');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const current = langToggle.textContent;
            langToggle.textContent = current === 'EN' ? 'DE' : 'EN';
            // Hier könnte Sprachumschaltung implementiert werden
        });
    }
}

// Standorte laden
function loadLocations() {
    const cachedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE);
    if (cachedLocations) {
        try {
            const locations = JSON.parse(cachedLocations);
            populateLocationsDropdown(locations);
        } catch (e) {
            console.error("Fehler beim Parsen der Standorte", e);
        }
    }

    fetch('https://locations-api.lavu-ooe.workers.dev/')
        .then(response => {
            if (!response.ok) throw new Error("Netzwerkantwort nicht ok");
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem(STORAGE_KEY_LOCATIONS_CACHE, JSON.stringify(data));
                populateLocationsDropdown(data);
            }
        })
        .catch(error => {
            console.warn("Fehler beim Abrufen der Locations-API. Verwende Cache oder Fallback.", error);
            if (!localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE)) {
                populateLocationsDropdown(fallbackLocations);
            }
        });
}

// Standorte-Dropdown befüllen
function populateLocationsDropdown(locationsList) {
    if (!s1Select) return;

    const currentValue = s1Select.value;
    s1Select.innerHTML = '<option value="" disabled selected>Zentren auswählen...</option>';

    locationsList.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        s1Select.appendChild(option);
    });

    if (currentValue && locationsList.includes(currentValue)) {
        s1Select.value = currentValue;
    } else if (locationsList.length > 0) {
        s1Select.selectedIndex = 1;
        if (i1Input) i1Input.value = s1Select.value;
    }
    updatePreview();
}

// Einstellungen laden
function loadSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
        try {
            appSettings = JSON.parse(saved);
        } catch (e) {
            console.error("Fehler beim Laden der Einstellungen", e);
        }
    }
    // URL ins Input-Feld setzen
    const urlInput = document.getElementById('i4');
    if (urlInput && appSettings.sortimentUrl) {
        urlInput.value = appSettings.sortimentUrl;
    }
}

// Einstellungen speichern
function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
}

// Sortiment laden
function loadSortiment() {
    const localData = localStorage.getItem(STORAGE_KEY_SORTIMENT);
    if (localData) {
        try {
            sortiment = JSON.parse(localData);
            populateSortimentDropdowns();
            renderManagementTable();
            return;
        } catch (e) {
            console.error("Fehler beim Parsen des lokalen Sortiments", e);
        }
    }
    fetchSortimentFromUrl(appSettings.sortimentUrl);
}

// Sortiment von URL laden
function fetchSortimentFromUrl(url) {
    if (!url) {
        sortiment = fallbackSortiment;
        populateSortimentDropdowns();
        renderManagementTable();
        return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Server-Fehler beim Laden des Sortiments");
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                sortiment = data;
                saveSortimentToLocalStorage();
                populateSortimentDropdowns();
                renderManagementTable();
            } else {
                throw new Error("Ungültiges Datenformat");
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden des Remote-Sortiments. Verwende Fallback.", error);
            sortiment = fallbackSortiment;
            populateSortimentDropdowns();
            renderManagementTable();
        });
}

// Sortiment im LocalStorage speichern
function saveSortimentToLocalStorage() {
    localStorage.setItem(STORAGE_KEY_SORTIMENT, JSON.stringify(sortiment));
}

// Sortiment-Dropdowns befüllen
function populateSortimentDropdowns() {
    if (!s2ArtSelect || !s2NameSelect) return;

    const currentSelection = s2ArtSelect.value;

    s2ArtSelect.innerHTML = '<option value="" disabled selected>Art.Nr....</option>';
    s2NameSelect.innerHTML = '<option value="" disabled selected>Bezeichnung...</option>';

    sortiment.forEach(item => {
        const optionArt = document.createElement('option');
        optionArt.value = item.artNr;
        optionArt.textContent = item.artNr;
        s2ArtSelect.appendChild(optionArt);

        const optionName = document.createElement('option');
        optionName.value = item.artNr;
        optionName.textContent = item.name;
        s2NameSelect.appendChild(optionName);
    });

    if (currentSelection && sortiment.some(item => item.artNr === currentSelection)) {
        s2ArtSelect.value = currentSelection;
        s2NameSelect.value = currentSelection;
        if (i2Input) i2Input.value = currentSelection;
    } else if (sortiment.length > 0) {
        s2ArtSelect.selectedIndex = 1;
        s2NameSelect.selectedIndex = 1;
        if (i2Input) i2Input.value = s2ArtSelect.value;
    }
    updatePreview();
}

// Management-Tabelle rendern
function renderManagementTable() {
    const container = document.getElementById('c4');
    if (!container) return;

    container.innerHTML = '';
    sortiment.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cir';
        div.innerHTML = `
            <span class="cii"><strong>${escapeHtml(item.artNr)}</strong> - ${escapeHtml(item.name)} ${item.symbol ? escapeHtml(item.symbol) : ''}</span>
            <button onclick="deleteSortimentItem(${index})" style="color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;">✕</button>
        `;
        container.appendChild(div);
    });
}

// Sortimentselement löschen
window.deleteSortimentItem = function(index) {
    if (confirm(`Möchten Sie "${sortiment[index].name}" wirklich löschen?`)) {
        sortiment.splice(index, 1);
        appSettings.hasCustomSortiment = true;
        saveSettings();
        saveSortimentToLocalStorage();
        populateSortimentDropdowns();
        renderManagementTable();
    }
};

// Vorlagen laden
function loadTemplates() {
    templates = {
        template_v1: `
            <div class="lb">
                <div class="lbt" id="v1_tag">LAVU OÖ</div>
                <div class="lbm">
                    <div class="lba" id="v1_symbol">📦</div>
                    <div class="lbs" id="v1_art">Art.Nr. 101</div>
                </div>
                <div class="lbb" id="v1_name">Elektro-Kleingeräte</div>
                <div class="lbt" id="v1_loc" style="border-bottom:none;padding-top:2px;">ASZ Asten</div>
            </div>
        `,
        template_v2: `
            <div class="lb" style="background: #f0f7f0; border-color: #27ae60;">
                <div class="lbt" id="v2_tag" style="color:#27ae60;">LAVU OÖ</div>
                <div class="lbm">
                    <div class="lba" id="v2_symbol" style="font-size:28pt;">📦</div>
                    <div class="lbs" id="v2_art" style="border-color:#27ae60;color:#27ae60;">#101</div>
                </div>
                <div class="lbb" id="v2_name" style="color:#1a4b60;">Elektro-Kleingeräte</div>
                <div class="lbt" id="v2_loc" style="border-bottom:none;padding-top:2px;color:#27ae60;">ASZ Asten</div>
            </div>
        `,
        template_v3: `
            <div class="lb" style="background: #1a4b60; color: white; border-color: #1a4b60;">
                <div class="lbt" id="v3_tag" style="color: #6cb4db; border-bottom-color: #6cb4db;">LAVU OÖ</div>
                <div class="lbm">
                    <div class="lba" id="v3_symbol" style="color: white;">📦</div>
                    <div class="lbs" id="v3_art" style="border-color: white; color: white; background: #1a4b60;">#101</div>
                </div>
                <div class="lbb" id="v3_name" style="color: white;">Elektro-Kleingeräte</div>
                <div class="lbt" id="v3_loc" style="border-bottom:none;padding-top:2px;color:#6cb4db;">ASZ Asten</div>
            </div>
        `
    };
}

// Vorschau aktualisieren
function updatePreview() {
    const previewContainer = document.getElementById('t1');
    const previewContainer2 = document.getElementById('mdl');
    if (!previewContainer) return;

    // Daten ermitteln
    const locValue = i1Input ? i1Input.value.trim() || "Kein Standort" : "Kein Standort";
    let artNrValue = "";
    let nameValue = "";
    let symbolValue = "📦";

    if (s2ArtSelect && s2ArtSelect.value) {
        const selectedArtNr = s2ArtSelect.value;
        const selectedItem = sortiment.find(item => item.artNr === selectedArtNr);
        if (selectedItem) {
            artNrValue = selectedItem.artNr;
            nameValue = selectedItem.name;
            symbolValue = selectedItem.symbol || "📦";
        }
    }

    const today = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Standard-Vorlage für Vorschau und Modal
    const activeTemplate = 'template_v2'; // Standard

    // Vorschau in t1
    let html = templates[activeTemplate] || templates.template_v1;
    previewContainer.innerHTML = html;

    // Werte injizieren - für template_v2 (Standard)
    const v2Tag = document.getElementById('v2_tag');
    const v2Loc = document.getElementById('v2_loc');
    const v2Symbol = document.getElementById('v2_symbol');
    const v2Art = document.getElementById('v2_art');
    const v2Name = document.getElementById('v2_name');

    if (v2Tag) v2Tag.textContent = 'LAVU OÖ';
    if (v2Loc) v2Loc.textContent = locValue;
    if (v2Symbol) v2Symbol.textContent = symbolValue;
    if (v2Art) v2Art.textContent = artNrValue ? `#${artNrValue}` : '';
    if (v2Name) {
        v2Name.textContent = nameValue || 'Bitte wählen...';
        adjustFontSize(v2Name, 28, 12);
    }

    // D0, D1, D2, D3 für die Sidebar aktualisieren
    const d0 = document.getElementById('d0');
    const d1 = document.getElementById('d1');
    const d2 = document.getElementById('d2');
    const d3 = document.getElementById('d3');

    if (d0) d0.textContent = 'LAVU OÖ';
    if (d1) {
        d1.textContent = nameValue || 'Bitte wählen...';
        adjustFontSize(d1, 20, 10);
    }
    if (d2) d2.textContent = symbolValue;
    if (d3) d3.textContent = artNrValue ? `#${artNrValue}` : '';

    // Modal-Vorschau aktualisieren
    if (previewContainer2) {
        previewContainer2.innerHTML = html;
        const m2Tag = previewContainer2.querySelector('#v2_tag');
        const m2Loc = previewContainer2.querySelector('#v2_loc');
        const m2Symbol = previewContainer2.querySelector('#v2_symbol');
        const m2Art = previewContainer2.querySelector('#v2_art');
        const m2Name = previewContainer2.querySelector('#v2_name');

        if (m2Tag) m2Tag.textContent = 'LAVU OÖ';
        if (m2Loc) m2Loc.textContent = locValue;
        if (m2Symbol) m2Symbol.textContent = symbolValue;
        if (m2Art) m2Art.textContent = artNrValue ? `#${artNrValue}` : '';
        if (m2Name) {
            m2Name.textContent = nameValue || 'Bitte wählen...';
            adjustFontSize(m2Name, 28, 12);
        }
    }

    // Modal-Format-Select befüllen
    if (modalLabelFormatSelect && modalLabelFormatSelect.options.length === 0) {
        const formats = [
            { value: 'template_v1', label: 'Standard' },
            { value: 'template_v2', label: 'Grün' },
            { value: 'template_v3', label: 'Dunkel' }
        ];
        formats.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.value;
            opt.textContent = f.label;
            modalLabelFormatSelect.appendChild(opt);
        });
        modalLabelFormatSelect.value = 'template_v2';
    }

    // Format-Select für Modal
    if (modalLabelFormatSelect) {
        modalLabelFormatSelect.addEventListener('change', (e) => {
            const selectedTemplate = e.target.value;
            if (selectedTemplate && templates[selectedTemplate]) {
                const modalPreview = document.getElementById('mdl');
                if (modalPreview) {
                    modalPreview.innerHTML = templates[selectedTemplate];
                    // Werte neu injizieren
                    const mTag = modalPreview.querySelector('[id$="_tag"]');
                    const mLoc = modalPreview.querySelector('[id$="_loc"]');
                    const mSymbol = modalPreview.querySelector('[id$="_symbol"]');
                    const mArt = modalPreview.querySelector('[id$="_art"]');
                    const mName = modalPreview.querySelector('[id$="_name"]');

                    if (mTag) mTag.textContent = 'LAVU OÖ';
                    if (mLoc) mLoc.textContent = locValue;
                    if (mSymbol) mSymbol.textContent = symbolValue;
                    if (mArt) mArt.textContent = artNrValue ? `#${artNrValue}` : '';
                    if (mName) {
                        mName.textContent = nameValue || 'Bitte wählen...';
                        adjustFontSize(mName, 28, 12);
                    }
                }
            }
        });
    }
}

// Schriftgröße automatisch anpassen
function adjustFontSize(element, maxPx, minPx) {
    if (!element) return;
    let size = maxPx;
    element.style.fontSize = `${size}px`;

    while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && size > minPx) {
        size -= 1;
        element.style.fontSize = `${size}px`;
    }
}

// Großansicht öffnen
function openFullPreview() {
    const modal = document.getElementById('m2');
    if (!modal) return;

    // Modal-Vorschau mit aktuellen Daten aktualisieren
    const locValue = i1Input ? i1Input.value.trim() || "Kein Standort" : "Kein Standort";
    let artNrValue = "";
    let nameValue = "";
    let symbolValue = "📦";

    if (s2ArtSelect && s2ArtSelect.value) {
        const selectedArtNr = s2ArtSelect.value;
        const selectedItem = sortiment.find(item => item.artNr === selectedArtNr);
        if (selectedItem) {
            artNrValue = selectedItem.artNr;
            nameValue = selectedItem.name;
            symbolValue = selectedItem.symbol || "📦";
        }
    }

    const previewContainer = document.getElementById('mdl');
    if (previewContainer) {
        const activeTemplate = modalLabelFormatSelect ? modalLabelFormatSelect.value : 'template_v2';
        let html = templates[activeTemplate] || templates.template_v2;
        previewContainer.innerHTML = html;

        const mTag = previewContainer.querySelector('[id$="_tag"]');
        const mLoc = previewContainer.querySelector('[id$="_loc"]');
        const mSymbol = previewContainer.querySelector('[id$="_symbol"]');
        const mArt = previewContainer.querySelector('[id$="_art"]');
        const mName = previewContainer.querySelector('[id$="_name"]');

        if (mTag) mTag.textContent = 'LAVU OÖ';
        if (mLoc) mLoc.textContent = locValue;
        if (mSymbol) mSymbol.textContent = symbolValue;
        if (mArt) mArt.textContent = artNrValue ? `#${artNrValue}` : '';
        if (mName) {
            mName.textContent = nameValue || 'Bitte wählen...';
            adjustFontSize(mName, 28, 12);
        }
    }

    modal.style.display = 'flex';

    // Zoom zurücksetzen
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    if (zoomSlider) {
        zoomSlider.value = 100;
        if (zoomVal) zoomVal.textContent = '100%';
        const pc = document.querySelector('#m2 .pc');
        if (pc) {
            pc.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    }
}

// Druckfunktion
function printLabels() {
    const printContainer = document.getElementById('d5');
    if (!printContainer) return;

    // Aktuelle Vorschau in den Druck-Container kopieren
    const preview = document.getElementById('t1');
    if (preview) {
        printContainer.innerHTML = preview.innerHTML;
    }

    // Anzahl der Etiketten
    let count = parseInt(i2Input ? i2Input.value : 21) || 21;
    const startPos = parseInt(i3Input ? i3Input.value : 1) || 1;

    // A4-Layout: 3x7 = 21 Etiketten pro Seite
    const totalLabels = count;
    const labelsPerPage = 21;
    const cols = 3;
    const rows = 7;

    // Alle Labels generieren
    let allLabels = '';
    for (let i = 0; i < totalLabels; i++) {
        allLabels += printContainer.innerHTML;
    }

    // In Seiten aufteilen
    const pages = Math.ceil(totalLabels / labelsPerPage);
    let fullHtml = '';

    for (let p = 0; p < pages; p++) {
        const start = p * labelsPerPage;
        const end = Math.min(start + labelsPerPage, totalLabels);
        let pageLabels = '';

        // Extrahiere Labels für diese Seite
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = allLabels;
        const labelElements = tempDiv.children;

        for (let i = start; i < end; i++) {
            if (labelElements[i]) {
                pageLabels += labelElements[i].outerHTML;
            }
        }

        // Leere Zellen für fehlende Labels auffüllen
        const existingCount = end - start;
        for (let i = existingCount; i < labelsPerPage; i++) {
            pageLabels += `<div class="lb e"></div>`;
        }

        // Grid für diese Seite
        fullHtml += `
            <div class="pc" style="page-break-after: always; margin: 0; box-shadow: none; position: relative;">
                <div class="psh" style="display: grid; grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr); gap: 0; width: 210mm; height: 297mm; padding: 5mm 2mm; box-sizing: border-box;">
                    ${pageLabels}
                </div>
            </div>
        `;
    }

    // Druck-Container für den Druck vorbereiten
    const hpc = document.getElementById('hpc');
    if (hpc) {
        hpc.innerHTML = fullHtml;
        hpc.style.display = 'block';
    }

    // Drucken
    window.print();

    // Nach dem Druck wieder ausblenden
    setTimeout(() => {
        if (hpc) hpc.style.display = 'none';
    }, 1000);
}

// Hilfsfunktion
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}