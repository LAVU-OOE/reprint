// Globale Variablen für Sortiment und Vorlagen
let sortiment = [];
let templates = {};

// Konstanten für LocalStorage-Schlüssel
const STORAGE_KEY_SORTIMENT = 'lavu_studio_sortiment_v8';
const STORAGE_KEY_SETTINGS = 'lavu_studio_settings_v8';
const STORAGE_KEY_LOCATIONS_CACHE = 'lavu_locations_cache';

// Fallback-Sortiment, falls alles andere fehlschlägt
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

// Fallback-Standorte (ASZ Liste), falls das Laden der locations.json fehlschlägt und kein Cache existiert
const fallbackLocations = [
    "ASZ Asten", "ASZ Ansfelden", "ASZ Enns", "ASZ Haid", "ASZ Hörsching", 
    "ASZ Leonding", "ASZ Neuhofen", "ASZ Oftering", "ASZ Pasching", "ASZ Pucking", 
    "ASZ St. Florian", "ASZ Traun", "ASZ Wilhering", "ASZ Kirchdorf", "ASZ Micheldorf", 
    "ASZ Pettenbach", "ASZ Windischgarsten", "ASZ Grünburg", "ASZ Kremsmünster", 
    "ASZ Molln", "ASZ Klaus", "ASZ Steyr", "ASZ Garsten"
];

// App-Einstellungen
let appSettings = {
    sortimentUrl: 'https://sortiment-api.lavu-ooe.workers.dev/', // Aktualisiert auf Cloudflare Worker API
    hasCustomSortiment: false
};

// DOM-Elemente
const s1Select = document.getElementById('s1');
const i1Input = document.getElementById('i1');
const s2ArtSelect = document.getElementById('s2_art');
const s2NameSelect = document.getElementById('s2_name');
const i2Input = document.getElementById('i2');
const labelPreview = document.getElementById('labelPreview');
const printBtn = document.getElementById('printBtn');
const customTextCheckbox = document.getElementById('customTextCheckbox');
const customTextFields = document.getElementById('customTextFields');
const customArtInput = document.getElementById('customArt');
const customNameInput = document.getElementById('customName');

// Management-UI-Elemente
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const settingsUrlInput = document.getElementById('settingsUrl');
const loadSettingsUrlBtn = document.getElementById('loadSettingsUrlBtn');
const resetSettingsUrlBtn = document.getElementById('resetSettingsUrlBtn');
const manageSortimentTable = document.querySelector('#manageSortimentTable tbody');
const addSortimentForm = document.getElementById('addSortimentForm');
const resetSortimentBtn = document.getElementById('resetSortimentBtn');

// Template Selector UI
const templateThumbnails = document.querySelectorAll('.template-thumbnail');
let activeTemplateId = 'template_v1'; // Standardvorlage

// Event-Listener beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadLocations();
    loadSortiment();
    loadTemplates();
    setupEventListeners();
    initSettingsModal();
});

// Event-Listener einrichten
function setupEventListeners() {
    // Wenn im Dropdown s1 ausgewählt wird, Text in i1 übernehmen
    s1Select.addEventListener('change', () => {
        i1Input.value = s1Select.value;
        updatePreview();
    });

    // Wenn manuell in i1 getippt wird, Dropdown s1 zurücksetzen (zeigt leere Option oder bleibt unverändert)
    i1Input.addEventListener('input', () => {
        updatePreview();
    });

    // Synchronisation der beiden Sortiment-Dropdowns
    s2ArtSelect.addEventListener('change', () => {
        s2NameSelect.value = s2ArtSelect.value;
        i2Input.value = s2ArtSelect.value;
        updatePreview();
    });

    s2NameSelect.addEventListener('change', () => {
        s2ArtSelect.value = s2NameSelect.value;
        i2Input.value = s2NameSelect.value;
        updatePreview();
    });

    // Manuelle Eingabe in i2 (nicht mehr direkt gekoppelt an dropdowns)
    i2Input.addEventListener('input', () => {
        updatePreview();
    });

    // Checkbox für Freitext
    customTextCheckbox.addEventListener('change', () => {
        if (customTextCheckbox.checked) {
            customTextFields.classList.remove('hidden');
        } else {
            customTextFields.classList.add('hidden');
        }
        updatePreview();
    });

    customArtInput.addEventListener('input', updatePreview);
    customNameInput.addEventListener('input', updatePreview);

    // Drucken-Button
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Template-Auswahl per Klick auf die Thumbnails
    templateThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            templateThumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            activeTemplateId = thumbnail.dataset.template;
            updatePreview();
        });
    });
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
}

// Einstellungen speichern
function saveSettings() {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
}

// Einstellungen-Modal initialisieren und verwalten
function initSettingsModal() {
    settingsBtn.addEventListener('click', () => {
        settingsUrlInput.value = appSettings.sortimentUrl;
        renderSortimentManagementTable();
        settingsModal.classList.remove('hidden');
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Schließen bei Klick außerhalb des Modals
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // URL laden
    loadSettingsUrlBtn.addEventListener('click', () => {
        const url = settingsUrlInput.value.trim();
        if (url) {
            appSettings.sortimentUrl = url;
            saveSettings();
            fetchSortimentFromUrl(url);
        }
    });

    // URL zurücksetzen auf Werkseinstellung
    resetSettingsUrlBtn.addEventListener('click', () => {
        const defaultUrl = 'https://sortiment-api.lavu-ooe.workers.dev/'; // Aktualisiert auf Cloudflare Worker API
        settingsUrlInput.value = defaultUrl;
        appSettings.sortimentUrl = defaultUrl;
        saveSettings();
        fetchSortimentFromUrl(defaultUrl);
    });

    // Neues Element im Management hinzufügen
    addSortimentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const artNr = document.getElementById('addArtNr').value.trim();
        const name = document.getElementById('addName').value.trim();
        const symbol = document.getElementById('addSymbol').value.trim() || '📦';

        if (artNr && name) {
            // Prüfen, ob ArtNr bereits existiert
            if (sortiment.some(item => item.artNr === artNr)) {
                alert("Diese Artikelnummer existiert bereits!");
                return;
            }

            sortiment.push({ artNr, name, symbol });
            appSettings.hasCustomSortiment = true;
            saveSettings();
            saveSortimentToLocalStorage();
            populateSortimentDropdowns();
            renderSortimentManagementTable();
            addSortimentForm.reset();
        }
    });

    // Sortiment komplett zurücksetzen
    resetSortimentBtn.addEventListener('click', () => {
        if (confirm("Möchten Sie das Sortiment wirklich auf die Standardeinstellungen der aktuellen URL zurücksetzen? Alle manuellen Änderungen gehen verloren.")) {
            localStorage.removeItem(STORAGE_KEY_SORTIMENT);
            appSettings.hasCustomSortiment = false;
            saveSettings();
            fetchSortimentFromUrl(appSettings.sortimentUrl);
        }
    });
}

// Standorte von der Cloudflare Worker API laden (mit Cache & Fallback)
function loadLocations() {
    // 1. Zuerst versuchen, aus dem LocalStorage-Cache zu laden (für schnelles Rendering)
    const cachedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE);
    if (cachedLocations) {
        try {
            const locations = JSON.parse(cachedLocations);
            populateLocationsDropdown(locations);
        } catch (e) {
            console.error("Fehler beim Parsen der gehashten Standorte", e);
        }
    }

    // 2. Netzwerk-Request an die aktualisierte API senden
    fetch('https://locations-api.lavu-ooe.workers.dev/')
        .then(response => {
            if (!response.ok) {
                throw new Error("Netzwerkantwort war nicht ok");
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                // Im Cache speichern für das nächste Mal
                localStorage.setItem(STORAGE_KEY_LOCATIONS_CACHE, JSON.stringify(data));
                // UI aktualisieren mit den frischen Daten
                populateLocationsDropdown(data);
            }
        })
        .catch(error => {
            console.warn("Fehler beim Abrufen der Locations-API. Verwende Cache oder Fallback.", error);
            // Wenn kein Cache existiert, Fallback verwenden
            if (!localStorage.getItem(STORAGE_KEY_LOCATIONS_CACHE)) {
                populateLocationsDropdown(fallbackLocations);
            }
        });
}

// Standorte-Dropdown befüllen
function populateLocationsDropdown(locationsList) {
    // Aktuellen Wert sichern
    const currentValue = s1Select.value;
    
    // Dropdown leeren und Standardoption hinzufügen
    s1Select.innerHTML = '<option value="" disabled selected>Zentren auswählen...</option>';
    
    locationsList.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc;
        option.textContent = loc;
        s1Select.appendChild(option);
    });

    // Wert wiederherstellen, falls er noch in der neuen Liste existiert
    if (currentValue && locationsList.includes(currentValue)) {
        s1Select.value = currentValue;
    } else if (locationsList.length > 0 && !currentValue) {
        // Standardmäßig den ersten Eintrag auswählen und ins Input-Feld schreiben
        s1Select.selectedIndex = 1;
        i1Input.value = s1Select.value;
    }
    updatePreview();
}

// Sortiment laden (Kaskade: LocalStorage -> API/URL -> Fallback)
function loadSortiment() {
    const localData = localStorage.getItem(STORAGE_KEY_SORTIMENT);
    if (localData) {
        try {
            sortiment = JSON.parse(localData);
            populateSortimentDropdowns();
            return;
        } catch (e) {
            console.error("Fehler beim Parsen des lokalen Sortiments", e);
        }
    }

    // Wenn kein lokales Sortiment vorhanden ist oder dieses zurückgesetzt wurde, von URL laden
    fetchSortimentFromUrl(appSettings.sortimentUrl);
}

// Sortiment von URL laden
function fetchSortimentFromUrl(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Server-Fehler beim Laden des Sortiments");
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                sortiment = data;
                saveSortimentToLocalStorage();
                populateSortimentDropdowns();
                renderSortimentManagementTable();
            } else {
                throw new Error("Ungültiges Datenformat");
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden des Remote-Sortiments. Verwende Fallback.", error);
            sortiment = fallbackSortiment;
            populateSortimentDropdowns();
            renderSortimentManagementTable();
        });
}

// Sortiment im LocalStorage speichern
function saveSortimentToLocalStorage() {
    localStorage.setItem(STORAGE_KEY_SORTIMENT, JSON.stringify(sortiment));
}

// Sortiment-Dropdowns befüllen (Art.Nr. und Name getrennt, aber synchronisiert)
function populateSortimentDropdowns() {
    const currentSelection = s2ArtSelect.value;

    s2ArtSelect.innerHTML = '<option value="" disabled selected>Art.Nr....</option>';
    s2NameSelect.innerHTML = '<option value="" disabled selected>Bezeichnung...</option>';

    sortiment.forEach(item => {
        // Option für Artikelnummer-Dropdown
        const optionArt = document.createElement('option');
        optionArt.value = item.artNr;
        optionArt.textContent = item.artNr;
        s2ArtSelect.appendChild(optionArt);

        // Option für Namen-Dropdown
        const optionName = document.createElement('option');
        optionName.value = item.artNr; // Gleicher Value zur einfachen Synchronisation
        optionName.textContent = item.name;
        s2NameSelect.appendChild(optionName);
    });

    // Selektion wiederherstellen
    if (currentSelection && sortiment.some(item => item.artNr === currentSelection)) {
        s2ArtSelect.value = currentSelection;
        s2NameSelect.value = currentSelection;
        i2Input.value = currentSelection;
    } else if (sortiment.length > 0) {
        s2ArtSelect.selectedIndex = 1;
        s2NameSelect.selectedIndex = 1;
        i2Input.value = s2ArtSelect.value;
    }
    updatePreview();
}

// Sortiment-Verwaltungstabelle rendern
function renderSortimentManagementTable() {
    manageSortimentTable.innerHTML = '';
    sortiment.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50';
        tr.innerHTML = `
            <td class="px-4 py-2 font-mono text-sm">${escapeHtml(item.artNr)}</td>
            <td class="px-4 py-2">${escapeHtml(item.name)}</td>
            <td class="px-4 py-2 text-center text-lg">${escapeHtml(item.symbol || '📦')}</td>
            <td class="px-4 py-2 text-right">
                <button class="text-red-600 hover:text-red-900 focus:outline-none" onclick="deleteSortimentItem(${index})">
                    Löschen
                </button>
            </td>
        `;
        manageSortimentTable.appendChild(tr);
    });
}

// Sortimentselement löschen (wird über globalen Scope aufgerufen)
window.deleteSortimentItem = function(index) {
    if (confirm(`Möchten Sie "${sortiment[index].name}" wirklich löschen?`)) {
        sortiment.splice(index, 1);
        appSettings.hasCustomSortiment = true;
        saveSettings();
        saveSortimentToLocalStorage();
        populateSortimentDropdowns();
        renderSortimentManagementTable();
    }
};

// Vorlagen (Templates) laden
function loadTemplates() {
    templates = {
        template_v1: `
            <div class="template-v1-container">
                <div class="v1-header">
                    <span id="v1_tag">LAVU OÖ</span>
                    <span id="v1_loc" class="v1-location-text"></span>
                </div>
                <div class="v1-main">
                    <div id="v1_symbol" class="v1-symbol"></div>
                    <div class="v1-content">
                        <div id="v1_art" class="v1-art"></div>
                        <div id="v1_name" class="v1-name"></div>
                    </div>
                </div>
                <div class="v1-footer">
                    <span>label-studio</span>
                    <span id="v1_date"></span>
                </div>
            </div>
        `,
        template_v2: `
            <div class="template-v2-container">
                <div class="v2-top-bar"></div>
                <div class="v2-body">
                    <div class="v2-meta">
                        <span id="v2_loc" class="v2-location"></span>
                        <span id="v2_art" class="v2-art"></span>
                    </div>
                    <div id="v2_name" class="v2-name"></div>
                    <div id="v2_symbol" class="v2-symbol"></div>
                </div>
                <div class="v2-footer">
                    <span>LAVU OÖ</span>
                    <span id="v2_date"></span>
                </div>
            </div>
        `,
        template_v3: `
            <div class="template-v3-container">
                <div class="v3-sidebar">
                    <div class="v3-vertical-text">LAVU OÖ</div>
                    <div id="v3_art" class="v3-art-vertical"></div>
                </div>
                <div class="v3-main-content">
                    <div id="v3_loc" class="v3-location"></div>
                    <div class="v3-divider"></div>
                    <div id="v3_name" class="v3-name"></div>
                    <div id="v3_symbol" class="v3-symbol"></div>
                    <div class="v3-footer-date" id="v3_date"></div>
                </div>
            </div>
        `
    };
}

// Vorschau aktualisieren (und für den Druck vorbereiten)
function updatePreview() {
    // 1. Daten ermitteln
    const locValue = i1Input.value.trim() || "Kein Standort gewählt";
    let artNrValue = "";
    let nameValue = "";
    let symbolValue = "📦";

    if (customTextCheckbox.checked) {
        artNrValue = customArtInput.value.trim();
        nameValue = customNameInput.value.trim();
    } else {
        const selectedArtNr = i2Input.value.trim();
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

    // 2. Aktives Template in die Vorschau laden
    labelPreview.innerHTML = templates[activeTemplateId] || '';

    // 3. Werte in die Vorlage injizieren
    if (activeTemplateId === 'template_v1') {
        const locEl = document.getElementById('v1_loc');
        const symbolEl = document.getElementById('v1_symbol');
        const artEl = document.getElementById('v1_art');
        const nameEl = document.getElementById('v1_name');
        const dateEl = document.getElementById('v1_date');

        if (locEl) locEl.textContent = locValue;
        if (symbolEl) symbolEl.textContent = symbolValue;
        if (artEl) artEl.textContent = artNrValue ? `Art.Nr. ${artNrValue}` : '';
        if (nameEl) nameEl.textContent = nameValue || 'Bitte wählen...';
        if (dateEl) dateEl.textContent = today;
        
        adjustFontSize(nameEl, 28, 14);

    } else if (activeTemplateId === 'template_v2') {
        const locEl = document.getElementById('v2_loc');
        const symbolEl = document.getElementById('v2_symbol');
        const artEl = document.getElementById('v2_art');
        const nameEl = document.getElementById('v2_name');
        const dateEl = document.getElementById('v2_date');

        if (locEl) locEl.textContent = locValue;
        if (symbolEl) symbolEl.textContent = symbolValue;
        if (artEl) artEl.textContent = artNrValue ? `#${artNrValue}` : '';
        if (nameEl) nameEl.textContent = nameValue || 'Bitte wählen...';
        if (dateEl) dateEl.textContent = today;
        
        adjustFontSize(nameEl, 32, 16);

    } else if (activeTemplateId === 'template_v3') {
        const locEl = document.getElementById('v3_loc');
        const symbolEl = document.getElementById('v3_symbol');
        const artEl = document.getElementById('v3_art');
        const nameEl = document.getElementById('v3_name');
        const dateEl = document.getElementById('v3_date');

        if (locEl) locEl.textContent = locValue;
        if (symbolEl) symbolEl.textContent = symbolValue;
        if (artEl) artEl.textContent = artNrValue;
        if (nameEl) nameEl.textContent = nameValue || 'Bitte wählen...';
        if (dateEl) dateEl.textContent = today;
        
        adjustFontSize(nameEl, 30, 15);
    }

    // 4. Den Druckbereich (Print-Only Container) mit derselben HTML-Struktur aktualisieren
    const printContainer = document.getElementById('printContainer');
    if (printContainer) {
        printContainer.innerHTML = labelPreview.innerHTML;
        // Gleiche Schriftgrößen-Anpassung auch für den Druck-Container triggern
        const printedNameEl = printContainer.querySelector('[id$="_name"]');
        if (printedNameEl) {
            const max = activeTemplateId === 'template_v2' ? 32 : (activeTemplateId === 'template_v3' ? 30 : 28);
            const min = activeTemplateId === 'template_v2' ? 16 : (activeTemplateId === 'template_v3' ? 15 : 14);
            adjustFontSize(printedNameEl, max, min);
        }
    }
}

// Hilfsfunktion: Automatische Schriftgrößen-Reduzierung bei zu langem Text
function adjustFontSize(element, maxPx, minPx) {
    if (!element) return;
    let size = maxPx;
    element.style.fontSize = `${size}px`;
    
    // Solange das Element scrollt (Überlauf) und wir über der Mindestgröße sind, Schrift verkleinern
    while ((element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) && size > minPx) {
        size -= 1;
        element.style.fontSize = `${size}px`;
    }
}

// Hilfsfunktion zur Verhinderung von XSS-Injektionen
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}