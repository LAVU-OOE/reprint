/**
 * LAVU OÖ - Label Studio v9
 * Core Application Logic & Data Management
 */

// Global App State
let i18n = {};
let formats = {};
let a2 = []; // Local Workspace Database Cache
let fallbackSortiment = []; // Fallback inventory array if everything fails

// Initialize Configuration on Page Load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Main application entry point
 */
async function initApp() {
    updateNetworkStatus('netLoading');
    
    // Load local workspace data or pull from remote API if configured
    await loadExternalData();
    
    // Initialize UI Elements, event listeners, and default selections
    initUiElements();
    renderSelectionDropdowns();
    renderPrintSheetPreview();
}

/**
 * Loads external JSON resources safely with robust workspace cache preservation
 */
async function loadExternalData() {
    try {
        const [i18nRes, formatsRes, sortimentRes] = await Promise.all([
            fetch('scripts/i18n.json'),
            fetch('scripts/formats.json'),
            fetch('scripts/sortiment.json')
        ]);
        
        if (!i18nRes.ok || !formatsRes.ok || !sortimentRes.ok) {
            throw new Error('One or more JSON files not found');
        }
        
        i18n = await i18nRes.json();
        formats = await formatsRes.json();
        const sortimentData = await sortimentRes.json();
        
        if (Array.isArray(sortimentData) && sortimentData.length > 0) {
            a2 = sortimentData;
            localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
            updateNetworkStatus('netSuccessLocal');
        } else {
            throw new Error('Invalid sortiment data structure');
        }
    } catch (err) {
        console.warn('External data load failed, using fallbacks and local cache:', err);
        
        // Hardcoded i18n Localization Fallbacks
        i18n = {
            de: {
                studioV9: "Etiketten-Studio v9",
                loadingFormat: "Format wird geladen...",
                printLayout: "Druck-Layout",
                artNr: "Art.Nr.",
                bezeichnung: "Bezeichnung",
                printNow: "Jetzt Drucken",
                options: "Optionen",
                modal1Title: "Druck- & Standorteinstellungen",
                lblLocation: "Standort (ASZ Niederlassung OÖ):",
                lblFormat: "Etiketten-Hersteller & Format:",
                lblCount: "Anzahl Etiketten",
                lblStartPos: "Start-Position",
                tabSelect: "LAVU Service-Worker",
                tabManage: "Datenbank verwalten",
                lblUrl: "Sortiment API:",
                lblLocationsUrl: "Locations API:",
                btnUpdate: "Aktualisieren",
                btnUpdateLocations: "Aktualisieren",
                lblDbSuffix: "Gebinde / Suffix:",
                lblDbBez: "Bezeichnung:",
                btnSave: "💾 Ändern",
                btnAddNew: "➕ Neu hinzufügen",
                btnCancel: "Abbrechen",
                btnDownloadJson: "📥 Aktuelle Datenbank als JSON herunterladen",
                lblCurrentEntries: "Aktuelle Einträge im lokalen Workspace:",
                btnSaveDefault: "Standard sichern",
                btnDone: "Fertig",
                modal2Title: "Interaktiver A4-Druckbogen",
                btnModalPrint: "Drucken",
                btnModalClose: "Schließen",
                txtPwaTitle: "Als App installieren",
                txtPwaSub: "Schnellerer Zugriff & Offline-Nutzung",
                btnPwaInstall: "Installieren",
                layoutTitleAttr: "Klicken für vollständige A4-Großansicht",
                alertSaved: "Aktuelle Einstellungen wurden als Standard im Browser gespeichert!",
                confirmDelete: "Möchten Sie diesen Eintrag wirklich löschen?",
                alertFillForm: "Bitte zumindest Art.Nr. und Bezeichnung ausfüllen.",
                alertErrorChange: "Fehler beim Ändern.",
                alertDuplicate: "Diese Artikelnummer existiert bereits!",
                netLoading: "⏳ Verbinde...",
                netSuccessLocal: "🟢 Lokale sortiment.json erfolgreich aktiv",
                netSuccessRemote: "🟢 Verbunden mit externem JSON Repository",
                netFallbackLocal: "⚠️ Keine lokale sortiment.json gefunden. Cache geladen.",
                netFallbackRemote: "⚠️ Remote JSON Offline! Lokaler Cache geladen.",
                txtZoom: "Zoom",
                locationLoading: "Standorte werden geladen...",
                locationError: "Fehler beim Laden der Standorte",
                locUrlSaved: "📍 Locations-URL gespeichert.",
                locUrlUpdated: "✅ Locations-URL aktualisiert!",
                locUrlInvalid: "❌ Bitte gültige URL eingeben."
            },
            en: {
                studioV9: "Label Studio v9",
                loadingFormat: "Loading format...",
                printLayout: "Print Layout",
                artNr: "Item No.",
                bezeichnung: "Description",
                printNow: "Print Now",
                options: "Options",
                modal1Title: "Print & Location Settings",
                lblLocation: "Location (ASZ Branch OÖ):",
                lblFormat: "Label Manufacturer & Format:",
                lblCount: "Number of Labels",
                lblStartPos: "Start Position",
                tabSelect: "LAVU Service-Worker",
                tabManage: "Manage Database",
                lblUrl: "Sortiment API:",
                lblLocationsUrl: "Locations API:",
                btnUpdate: "Update",
                btnUpdateLocations: "Update",
                lblDbSuffix: "Container / Suffix:",
                lblDbBez: "Description:",
                btnSave: "💾 Change",
                btnAddNew: "➕ Add New",
                btnCancel: "Cancel",
                btnDownloadJson: "📥 Download Current Database as JSON",
                lblCurrentEntries: "Current entries in local workspace:",
                btnSaveDefault: "Save Defaults",
                btnDone: "Done",
                modal2Title: "Interactive A4 Print Sheet",
                btnModalPrint: "Print",
                btnModalClose: "Close",
                txtPwaTitle: "Install as App",
                txtPwaSub: "Faster access & offline usage",
                btnPwaInstall: "Install",
                layoutTitleAttr: "Click for full A4 sheet preview",
                alertSaved: "Current settings saved as defaults in browser!",
                confirmDelete: "Do you really want to delete this entry?",
                alertFillForm: "Please fill in at least Item No. and Description.",
                alertErrorChange: "Error applying changes.",
                alertDuplicate: "This Article Number already exists!",
                netLoading: "⏳ Connecting...",
                netSuccessLocal: "🟢 Local sortiment.json active successfully",
                netSuccessRemote: "🟢 Connected to remote JSON Repository",
                netFallbackLocal: "⚠️ No local sortiment.json found. Cache loaded.",
                netFallbackRemote: "⚠️ Remote JSON Offline! Local cache loaded.",
                txtZoom: "Zoom",
                locationLoading: "Loading locations...",
                locationError: "Error loading locations",
                locUrlSaved: "📍 Locations URL saved.",
                locUrlUpdated: "✅ Locations URL updated!",
                locUrlInvalid: "❌ Please enter a valid URL."
            }
        };

        // Hardcoded Label Dimension Formats Fallbacks
        formats = {
            "4473": { cols: 3, rows: 8, name: "HERMA 4473 (70 x 36 mm)" },
            "4273": { cols: 3, rows: 8, name: "HERMA 4273 (70 x 36 mm)" },
            "4676": { cols: 3, rows: 8, name: "HERMA 4676 (70 x 36 mm)" },
            "5074": { cols: 3, rows: 8, name: "HERMA 5074 (70 x 36 mm)" },
            "4428": { cols: 2, rows: 4, name: "HERMA 4428 (105 x 68 mm)" },
            "4282": { cols: 2, rows: 4, name: "HERMA 4282 (105 x 68 mm)" },
            "4463": { cols: 2, rows: 4, name: "HERMA 4463 (105 x 68 mm)" },
            "4276": { cols: 2, rows: 6, name: "HERMA 4276 (99,1 x 42,3 mm)" },
            "4465": { cols: 2, rows: 6, name: "HERMA 4465 (99,1 x 42,3 mm)" },
            "5077": { cols: 2, rows: 4, name: "HERMA 5077 (99,1 x 67,7 mm)" },
            "4269": { cols: 2, rows: 4, name: "HERMA 4269 (99,1 x 67,7 mm)" },
            "4459": { cols: 3, rows: 17, name: "HERMA 4459 (70 x 16,9 mm)" },
            "4278": { cols: 3, rows: 5, name: "HERMA 4278 (70 x 50,8 mm)" },
            "5055": { cols: 3, rows: 5, name: "HERMA 5055 (70 x 50,8 mm)" },
            "4456": { cols: 3, rows: 10, name: "HERMA 4456 (70 x 29,7 mm)" },
            "4441": { cols: 3, rows: 7, name: "HERMA 4441 (70 x 42 mm)" },
            "4623": { cols: 2, rows: 7, name: "HERMA 4623 (97 x 42,3 mm)" },
            "8645": { cols: 2, rows: 4, name: "HERMA 8645 (105 x 74 mm)" },
            "5062": { cols: 2, rows: 4, name: "HERMA 5062 (105 x 74 mm)" },
            "4626": { cols: 2, rows: 4, name: "HERMA 4626 (105 x 74 mm)" },
            "4470": { cols: 2, rows: 4, name: "HERMA 4470 (105 x 74 mm)" },
            "4462": { cols: 2, rows: 8, name: "HERMA 4462 (105 x 37 mm)" },
            "4359": { cols: 2, rows: 4, name: "HERMA 4359 (97 x 67,7 mm)" }
        };

        // CRITICAL FIX: Safe Cache Lookup prevents overwriting existing user data during outages
        const localCache = localStorage.getItem('lavu_studio_sortiment_v8');
        if (localCache) {
            try {
                a2 = JSON.parse(localCache);
                updateNetworkStatus('netFallbackRemote');
            } catch (e) {
                a2 = fallbackSortiment.slice();
                localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
                updateNetworkStatus('netFallbackLocal');
            }
        } else {
            a2 = fallbackSortiment.slice();
            localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
            updateNetworkStatus('netFallbackLocal');
        }
    }
}

/**
 * Updates the network diagnostic status message in the UI
 */
function updateNetworkStatus(statusKey) {
    const currentLang = document.documentElement.lang || 'de';
    const statusText = i18n[currentLang] ? i18n[currentLang][statusKey] : "Connecting...";
    const badge = document.getElementById('network-status-badge');
    if (badge) {
        badge.textContent = statusText;
    }
}

/**
 * Configures event listeners, sliders, and sets up settings triggers
 */
function initUiElements() {
    // 1. Zoom Handler Setup
    const zoomSlider = document.getElementById('zoom-range');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            const previewSheet = document.getElementById('interactive-sheet-preview');
            if (previewSheet) {
                previewSheet.style.transform = `scale(${e.target.value})`;
            }
        });
    }

    // 2. Language Toggle Setup
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const newLang = document.documentElement.lang === 'de' ? 'en' : 'de';
            document.documentElement.lang = newLang;
            translateUi(newLang);
        });
    }

    // 3. Modal Open & Close Event Listeners
    const optionsBtn = document.getElementById('btn-options-modal');
    const settingsModal = document.getElementById('settings-modal');
    const closeTriggers = document.querySelectorAll('.modal-close-trigger');

    if (optionsBtn && settingsModal) {
        optionsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
        });

        closeTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
            });
        });
    }

    // 4. Set Default API URL Values
    const sortimentInput = document.getElementById('input-sortiment-api');
    const locationsInput = document.getElementById('input-location-api');

    if (sortimentInput && !sortimentInput.value) {
        sortimentInput.value = 'https://sortiment-api.lavu-ooe.workers.dev/';
    }
    if (locationsInput && !locationsInput.value) {
        locationsInput.value = 'https://locations-api.lavu-ooe.workers.dev/';
    }

    // 5. Interactive Tab Navigation Logic
    const tabButtons = document.querySelectorAll('.tab-navigation .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            const contentPanels = document.querySelectorAll('.tab-content-panel');
            contentPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // 6. Sync Art.Nr. and Bezeichnung Dropdowns
    const artNrDropdown = document.getElementById('select-artnr');
    const bezDropdown = document.getElementById('select-bezeichnung');

    if (artNrDropdown && bezDropdown) {
        artNrDropdown.addEventListener('change', (e) => {
            bezDropdown.selectedIndex = artNrDropdown.selectedIndex;
        });

        bezDropdown.addEventListener('change', (e) => {
            artNrDropdown.selectedIndex = bezDropdown.selectedIndex;
        });
    }

    // 7. Re-trigger layout calculations on value adjustment updates
    const syncTriggers = ['select-artnr', 'select-bezeichnung', 'input-count', 'input-startpos'];
    syncTriggers.forEach(id => {
        document.getElementById(id)?.addEventListener('change', renderPrintSheetPreview);
    });
    document.getElementById('input-count')?.addEventListener('input', renderPrintSheetPreview);
    document.getElementById('input-startpos')?.addEventListener('input', renderPrintSheetPreview);

    // 8. Grid Click Synchronization Logic
    const targetSheetContainer = document.getElementById('interactive-sheet-preview');
    const startPosInput = document.getElementById('input-startpos');
    const countInput = document.getElementById('input-count');

    if (targetSheetContainer && startPosInput && countInput) {
        targetSheetContainer.addEventListener('click', (e) => {
            const cell = e.target.closest('.label-grid-cell');
            if (!cell) return;

            const chosenPosition = parseInt(cell.dataset.index, 10) + 1;
            const currentStart = parseInt(startPosInput.value, 10) || 1;
            const currentCount = parseInt(countInput.value, 10) || 1;

            if (chosenPosition < currentStart || currentCount <= 1 && chosenPosition === currentStart) {
                startPosInput.value = chosenPosition;
                countInput.value = 1;
            } 
            else if (chosenPosition === currentStart && currentCount > 1) {
                countInput.value = 1;
            }
            else {
                countInput.value = (chosenPosition - currentStart) + 1;
            }

            renderPrintSheetPreview();
        });
    }


    // =========================================================================
    // PLACE IT RIGHT HERE AT THE BOTTOM OF THE FUNCTION
    // =========================================================================

    // --- ADD THIS: Format Selector Updates Entire Selection Span ---
    const formatSelect = document.getElementById('select-format');
    if (formatSelect) {
        formatSelect.addEventListener('change', () => {
            const countInput = document.getElementById('input-count');
            const startPosInput = document.getElementById('input-startpos');
            
            if (countInput && startPosInput) {
                // Remove the manual user marker flag to let it auto-calculate max size
                delete countInput.dataset.userModified; 
                
                // Clear values temporarily to force renderPrintSheetPreview to calculate maximum bounds
                countInput.value = '';
                startPosInput.value = 1;
            }
            renderPrintSheetPreview();
        });
    }

    // --- Adjust Grid Click Handler to Track Manual Changes ---
    const targetSheet = document.getElementById('interactive-sheet-preview');
    if (targetSheet) {
        targetSheet.addEventListener('click', () => {
            const countInput = document.getElementById('input-count');
            if (countInput) {
                // Set a marker flag when the user starts customizing manually
                countInput.dataset.userModified = "true";
            }
        });
    }
}

/**
 * Parses and displays selection dropdown menus alphabetized dynamically
 */
function renderSelectionDropdowns() {
    const artNrDropdown = document.getElementById('select-artnr');
    const bezDropdown = document.getElementById('select-bezeichnung');
    
    if (!artNrDropdown || !bezDropdown) return;

    // Clear and add styled placeholder options first
    artNrDropdown.innerHTML = '<option value="">-- Wähle Art.Nr. --</option>';
    bezDropdown.innerHTML = '<option value="">-- Wähle Bezeichnung --</option>';

    // Alphabetical Sorting based on Article Numbers
    const sortedData = [...a2].sort((a, b) => String(a.artNr).localeCompare(String(b.artNr)));

    sortedData.forEach(item => {
        let opt1 = document.createElement('option');
        opt1.value = item.artNr;
        opt1.textContent = item.artNr;
        artNrDropdown.appendChild(opt1);

        let opt2 = document.createElement('option');
        opt2.value = item.artNr;
        opt2.textContent = `${item.bez} ${item.geb || ''}`.trim(); 
        bezDropdown.appendChild(opt2);
    });
}

/**
 * Computes grid measurements and prints visual overlays inside the interactive target
 */
/**
 * Computes grid measurements and prints visual overlays inside the interactive target
 */
/**
 * Computes grid measurements and prints visual overlays inside the interactive target
 */
function renderPrintSheetPreview() {
    const targetSheet = document.getElementById('interactive-sheet-preview');
    if (!targetSheet) return;

    const selectedFormatKey = document.getElementById('select-format')?.value || "4473";
    const formatConfig = formats[selectedFormatKey];

    if (!formatConfig) return;

    const totalCells = formatConfig.cols * formatConfig.rows;

    // --- ADDED: Auto-fallback inputs to fill the entire template layout context ---
    const startPosInput = document.getElementById('input-startpos');
    const countInput = document.getElementById('input-count');

    if (startPosInput && !startPosInput.value) {
        startPosInput.value = 1;
    }

    // Force the label count to the absolute maximum grid allocation if empty or out-of-bounds
    if (countInput && (!countInput.value || parseInt(countInput.value, 10) === 1 && !countInput.dataset.userModified)) {
        countInput.value = totalCells;
    }

    const artNrDropdown = document.getElementById('select-artnr');
    const inputCount = parseInt(countInput?.value, 10) || totalCells;
    const inputStartPos = parseInt(startPosInput?.value, 10) || 1;

    const selectedArtNr = artNrDropdown?.value;
    const activeItem = a2.find(item => String(item.artNr) === String(selectedArtNr));

    targetSheet.innerHTML = '';
    targetSheet.style.display = 'grid';
    targetSheet.style.gridTemplateColumns = `repeat(${formatConfig.cols}, 1fr)`;
    targetSheet.style.gridTemplateRows = `repeat(${formatConfig.rows}, 1fr)`;

    for (let i = 0; i < totalCells; i++) {
        const gridCell = document.createElement('div');
        gridCell.className = 'label-grid-cell';
        gridCell.dataset.index = i;

        const cellPosition = i + 1;

        if (cellPosition >= inputStartPos && cellPosition < (inputStartPos + inputCount)) {
            if (activeItem) {
                gridCell.innerHTML = `
                    <div class="print-label-content" style="text-align: center; padding: 4px;">
                        <strong style="display: block; font-size: 1rem;">${activeItem.artNr}</strong>
                        <span style="display: block; font-size: 0.8rem; margin-top: 2px;">${activeItem.bez}</span>
                        <small style="font-size: 0.7rem; color: #64748b;">${activeItem.geb || ''}</small>
                    </div>
                `;
            } else {
                gridCell.textContent = `Bereit (Kein Artikel)`;
            }
        } else {
            gridCell.textContent = `Leer (${cellPosition})`;
            gridCell.style.opacity = '0.4';
        }

        targetSheet.appendChild(gridCell);
    }
}

/**
 * Re-maps text components based on selected language locales
 */
function translateUi(lang) {
    if (!i18n[lang]) return;
    
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                el.value = i18n[lang][key];
            } else {
                el.textContent = i18n[lang][key];
            }
        }
    });
}