/**
 * LAVU OÖ - Label Studio v9
 * Core Application Logic, Data Management & Print Engine
 */

(function () {
    let i18n = {};
    let formats = {};
    let a2 = []; 
    let locationsData = [];
    let deferredPrompt;

    const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 Hours Cache TTL

    document.addEventListener('DOMContentLoaded', async () => {
        await initApp();
        setupStoragePersistence();
    });

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initApp();
        setupStoragePersistence();
    }

    async function initApp() {
        updateNetworkStatus('netLoading');
        await loadExternalData();
        initUiElements();
        renderSelectionDropdowns();
        renderPrintSheetPreview();
    }

    async function setupStoragePersistence() {
        try {
            if (navigator && typeof navigator.storage !== 'undefined' && typeof navigator.storage.persist === 'function') {
                const isPersisted = await navigator.storage.persist();
                console.log(`Storage persistence granted: ${isPersisted}`);
            } else {
                console.warn('Storage Persistence API not supported in this environment.');
            }
        } catch (err) {
            console.error('Failed to request storage persistence:', err);
        }
    }

    /* ==========================================================================
       External Loader for scripts/sortiment.json & scripts/locations.json
       ========================================================================== */
    async function loadExternalData() {
        const rawApiBase = localStorage.getItem('apiBase') || '';
        const apiBase = rawApiBase.replace(/\/+$/, '');
        
        // Target external files in the scripts folder or custom API endpoint
        const sortimentUrl = apiBase ? `${apiBase}/sortiment.json` : 'scripts/sortiment.json';
        const locationsUrl = apiBase ? `${apiBase}/locations.json` : 'scripts/locations.json';

        try {
            const [manifestRes, i18nRes, formatsRes, sortimentRes, locationsRes] = await Promise.all([
                fetch('manifest.json').catch(() => ({ ok: false })),
                fetch('scripts/i18n.json').catch(() => ({ ok: false })),
                fetch('scripts/formats.json').catch(() => ({ ok: false })),
                fetch(sortimentUrl).catch(() => ({ ok: false })),
                fetch(locationsUrl).catch(() => ({ ok: false }))
            ]);
            
            if (manifestRes && manifestRes.ok) {
                await manifestRes.json().catch(() => null);
            }

            if (i18nRes.ok) {
                i18n = await i18nRes.json();
            } else {
                loadEmbeddedI18nFallbacks();
            }

            if (formatsRes.ok) {
                formats = await formatsRes.json();
            } else {
                loadEmbeddedFormatsFallbacks();
            }

            // 1. Process Sortiment JSON (External -> Cache fallback -> Empty safety)
            let sortimentData = [];
            if (sortimentRes.ok) {
                const contentType = sortimentRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    sortimentData = await sortimentRes.json();
                } else {
                    sortimentData = await sortimentRes.json().catch(() => []);
                }
            }

            if (Array.isArray(sortimentData) && sortimentData.length > 0) {
                a2 = sortimentData;
                localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
                localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
            } else {
                const localCache = localStorage.getItem('lavu_studio_sortiment_v9');
                if (localCache) {
                    try {
                        a2 = JSON.parse(localCache);
                        console.warn('External sortiment.json unreachable. Loaded modifications from device local storage cache.');
                    } catch (e) {
                        a2 = [];
                    }
                } else {
                    a2 = [];
                }
            }

            // 2. Process Locations JSON (External -> Cache fallback -> Empty safety)
            let locData = [];
            if (locationsRes.ok) {
                const contentType = locationsRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    locData = await locationsRes.json();
                } else {
                    locData = await locationsRes.json().catch(() => []);
                }
            }

            if (Array.isArray(locData) && locData.length > 0) {
                locationsData = locData;
                localStorage.setItem('lavu_studio_locations_v9', JSON.stringify(locationsData));
                localStorage.setItem('lavu_studio_locations_timestamp', Date.now().toString());
            } else {
                const localLocCache = localStorage.getItem('lavu_studio_locations_v9');
                if (localLocCache) {
                    try {
                        locationsData = JSON.parse(localLocCache);
                        console.warn('External locations.json unreachable. Loaded modifications from device local storage cache.');
                    } catch (e) {
                        locationsData = [];
                    }
                } else {
                    locationsData = [];
                }
            }

            if (sortimentRes.ok || locationsRes.ok) {
                updateNetworkStatus('netSuccessLocal');
            } else {
                updateNetworkStatus('netFallbackLocal');
            }
            hideLoadingScreen();

        } catch (err) {
            console.warn('External files load failed completely, falling back to local storage modifications:', err);
            loadEmbeddedI18nFallbacks();
            loadEmbeddedFormatsFallbacks();

            const localCache = localStorage.getItem('lavu_studio_sortiment_v9');
            a2 = localCache ? JSON.parse(localCache) : [];

            const localLocCache = localStorage.getItem('lavu_studio_locations_v9');
            locationsData = localLocCache ? JSON.parse(localLocCache) : [];

            updateNetworkStatus('netFallbackLocal');
            hideLoadingScreen();
        }
    }

    function hideLoadingScreen() {
        const loader = document.getElementById('loadingOverlay') || document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    function loadEmbeddedFormatsFallbacks() {
        formats = {
            "4473": { cols: 3, rows: 8, name: "HERMA 4473 (70 x 36 mm)" },
            "4428": { cols: 2, rows: 4, name: "HERMA 4428 (105 x 68 mm)" },
            "4276": { cols: 2, rows: 6, name: "HERMA 4276 (99,1 x 42,3 mm)" },
            "5077": { cols: 2, rows: 4, name: "HERMA 5077 (99,1 x 67,7 mm)" },
            "4459": { cols: 3, rows: 17, name: "HERMA 4459 (70 x 16,9 mm)" },
            "4456": { cols: 3, rows: 10, name: "HERMA 4456 (70 x 29,7 mm)" },
            "8645": { cols: 2, rows: 4, name: "HERMA 8645 (105 x 74 mm)" }
        };
    }

    function loadEmbeddedI18nFallbacks() {
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
                lblFormat: "Etiketten-Hersteller & Format:",
                lblCount: "Anzahl Etiketten",
                lblStartPos: "Start-Position",
                selectFormatPrompt: "-- Bitte Format wählen --",
                alertSelectFormat: "Bitte wählen Sie zuerst ein Etiketten-Format aus!",
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
                btnSaveDefault: "Standard sichern",
                btnDone: "Fertig",
                modal2Title: "Interaktiver A4-Druckbogen",
                txtPwaTitle: "Als App installieren",
                txtPwaSub: "Schnellerer Zugriff & Offline-Nutzung",
                btnPwaInstall: "Installieren",
                alertSaved: "Aktuelle Einstellungen wurden als Standard im Browser gespeichert!",
                alertFillForm: "Bitte zumindest Art.Nr. und Bezeichnung ausfüllen.",
                alertDuplicate: "Diese Artikelnummer existiert bereits!",
                netLoading: "⏳ Verbinde...",
                netSuccessLocal: "🟢 Externe JSON-Dateien aktiv",
                netFallbackLocal: "⚠️ Offline. Lokaler Gerätespeicher aktiv.",
                txtZoom: "Zoom"
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
                lblFormat: "Label Manufacturer & Format:",
                lblCount: "Number of Labels",
                lblStartPos: "Start Position",
                selectFormatPrompt: "-- Please select a format --",
                alertSelectFormat: "Please select a label format first!",
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
                btnSaveDefault: "Save Defaults",
                btnDone: "Done",
                modal2Title: "Interactive A4 Print Sheet",
                txtPwaTitle: "Install as App",
                txtPwaSub: "Faster access & offline usage",
                btnPwaInstall: "Install",
                alertSaved: "Current settings saved as defaults in browser!",
                alertFillForm: "Please fill in at least Item No. and Description.",
                alertDuplicate: "This Article Number already exists!",
                netLoading: "⏳ Connecting...",
                netSuccessLocal: "🟢 External JSON files active",
                netFallbackLocal: "⚠️ Offline. Local device cache active.",
                txtZoom: "Zoom"
            }
        };
    }

    function updateNetworkStatus(statusKey) {
        const currentLang = document.documentElement.lang || 'de';
        const statusText = i18n[currentLang]?.[statusKey] || "Connecting...";
        const badge = document.getElementById('network-status-badge') || document.querySelector('.status-badge');
        if (badge) {
            badge.textContent = statusText;
        }
    }

    function initUiElements() {
        const zoomSlider = document.getElementById('zoom-range');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                const previewSheet = document.getElementById('interactive-sheet-preview') || document.getElementById('previewContainer');
                if (previewSheet) {
                    previewSheet.style.transform = `scale(${e.target.value})`;
                }
            });
        }

        const langBtn = document.getElementById('language-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                const newLang = document.documentElement.lang === 'de' ? 'en' : 'de';
                document.documentElement.lang = newLang;
                translateUi(newLang);
            });
        }

        const optionsBtn = document.getElementById('btn-options-modal') || document.getElementById('btn-settings');
        const settingsModal = document.getElementById('settings-modal') || document.getElementById('settingsModal');
        const closeTriggers = document.querySelectorAll('.modal-close-trigger, .close-modal');

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

        const artNrDropdown = document.getElementById('select-artnr');
        const bezDropdown = document.getElementById('select-bezeichnung');

        if (artNrDropdown && bezDropdown) {
            artNrDropdown.addEventListener('change', () => {
                bezDropdown.selectedIndex = artNrDropdown.selectedIndex;
            });

            bezDropdown.addEventListener('change', () => {
                artNrDropdown.selectedIndex = bezDropdown.selectedIndex;
            });
        }

        const syncTriggers = ['select-artnr', 'select-bezeichnung', 'input-count', 'input-startpos', 'select-format'];
        syncTriggers.forEach(id => {
            document.getElementById(id)?.addEventListener('change', renderPrintSheetPreview);
        });
        document.getElementById('input-count')?.addEventListener('input', renderPrintSheetPreview);
        document.getElementById('input-startpos')?.addEventListener('input', renderPrintSheetPreview);

        const countInput = document.getElementById('input-count');
        const startPosInput = document.getElementById('input-startpos');
        if (startPosInput && countInput) {
            countInput.addEventListener('input', () => {
                countInput.dataset.userModified = "true";
            });
        }

        const formatSelect = document.getElementById('select-format');
        if (formatSelect) {
            formatSelect.addEventListener('change', () => {
                if (countInput && startPosInput) {
                    delete countInput.dataset.userModified; 
                    countInput.value = '';
                    startPosInput.value = 1;
                }
                renderPrintSheetPreview();
            });
        }

        const printBtn = document.getElementById('btn-print-trigger');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const formatKey = document.getElementById('select-format')?.value;
                if (!formatKey) {
                    const currentLang = document.documentElement.lang || 'de';
                    alert(i18n[currentLang]?.alertSelectFormat || "Bitte wählen Sie zuerst ein Etiketten-Format aus!");
                    document.getElementById('select-format')?.focus();
                    return;
                }
                
                setTimeout(() => {
                    window.print();
                }, 250);
            });
        }

        setupDatabaseManagementHandlers();
        setupPwaHandlers();
    }

    function setupDatabaseManagementHandlers() {
        const btnDbAdd = document.getElementById('btn-db-add');
        const btnDbSave = document.getElementById('btn-db-save');
        const dbArtNr = document.getElementById('db-input-artnr');
        const dbBez = document.getElementById('db-input-bez');
        const dbSuffix = document.getElementById('db-input-suffix');

        function getAlertText(key, fallback) {
            const currentLang = document.documentElement.lang || 'de';
            return (i18n[currentLang] && i18n[currentLang][key]) ? i18n[currentLang][key] : fallback;
        }

        function validateDbInputs() {
            if (!dbArtNr || !dbBez || !dbArtNr.value.trim() || !dbBez.value.trim()) {
                alert(getAlertText('alertFillForm', 'Bitte zumindest Art.Nr. und Bezeichnung ausfüllen.'));
                return false;
            }
            return true;
        }

        [dbArtNr, dbBez, dbSuffix].forEach(inputField => {
            if (inputField) {
                inputField.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (btnDbAdd) btnDbAdd.click();
                    }
                });
            }
        });

        if (btnDbAdd && dbArtNr && dbBez) {
            btnDbAdd.addEventListener('click', () => {
                if (!validateDbInputs()) return;
                const newArtNr = dbArtNr.value.trim();
                if (a2.some(item => String(item.artNr || item.ID) === newArtNr)) {
                    alert(getAlertText('alertDuplicate', 'Diese Artikelnummer existiert bereits!'));
                    return;
                }
                a2.push({ 
                    artNr: newArtNr, 
                    bez: dbBez.value.trim(), 
                    geb: dbSuffix ? dbSuffix.value.trim() : '' 
                });
                // Persist changes directly to device local storage device cache during session/offline changes
                localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
                localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
                renderSelectionDropdowns();
                dbArtNr.value = ''; dbBez.value = ''; if (dbSuffix) dbSuffix.value = '';
            });
        }

        if (btnDbSave && dbArtNr && dbBez) {
            btnDbSave.addEventListener('click', () => {
                if (!validateDbInputs()) return;
                const targetArtNr = dbArtNr.value.trim();
                const index = a2.findIndex(item => String(item.artNr || item.ID) === targetArtNr);
                if (index === -1) {
                    alert("Artikelnummer nicht gefunden. Bitte stattdessen 'Neu hinzufügen' verwenden.");
                    return;
                }
                a2[index].bez = dbBez.value.trim();
                if (dbSuffix) a2[index].geb = dbSuffix.value.trim();
                // Persist updates to device local storage device cache
                localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
                localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
                renderSelectionDropdowns();
            });
        }
    }

    function setupPwaHandlers() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const pwaBanner = document.getElementById('pwa-install-banner');
            if (pwaBanner) pwaBanner.classList.remove('hidden');
        });

        const btnPwaInstall = document.getElementById('btn-pwa-install-trigger');
        if (btnPwaInstall) {
            btnPwaInstall.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        const pwaBanner = document.getElementById('pwa-install-banner');
                        if (pwaBanner) pwaBanner.classList.add('hidden');
                    }
                    deferredPrompt = null;
                }
            });
        }
    }

    function renderSelectionDropdowns() {
        const artNrDropdown = document.getElementById('select-artnr');
        const bezDropdown = document.getElementById('select-bezeichnung');
        
        if (!artNrDropdown || !bezDropdown) return;

        artNrDropdown.innerHTML = '<option value="">-- Wähle Art.Nr. --</option>';
        bezDropdown.innerHTML = '<option value="">-- Wähle Bezeichnung --</option>';

        const sortedData = [...a2].sort((a, b) => String(a.artNr || a.ID || '').localeCompare(String(b.artNr || b.ID || '')));

        sortedData.forEach(item => {
            const identifier = item.artNr || item.ID || '';
            const description = item.bez || item.Bezeichnung || '';
            const suffix = item.geb || '';

            let opt1 = document.createElement('option');
            opt1.value = identifier;
            opt1.textContent = identifier;
            artNrDropdown.appendChild(opt1);

            let opt2 = document.createElement('option');
            opt2.value = identifier;
            opt2.textContent = `${description} ${suffix}`.trim(); 
            bezDropdown.appendChild(opt2);
        });
    }

    function renderPrintSheetPreview() {
        const targetSheet = document.getElementById('interactive-sheet-preview') || document.getElementById('previewContainer');
        if (!targetSheet) return;

        const formatSelect = document.getElementById('select-format');
        const selectedFormatKey = formatSelect?.value;

        if (!selectedFormatKey) {
            targetSheet.innerHTML = `<div class="preview-placeholder-msg" style="padding: 40px; text-align: center; color: #64748b; font-weight: 500;">Bitte wählen Sie oben ein Etiketten-Format aus, um die Vorschau anzuzeigen.</div>`;
            return;
        }

        const rawConfig = formats[selectedFormatKey];
        const formatConfig = {
            cols: (rawConfig && Number.isInteger(rawConfig.cols) && rawConfig.cols > 0) ? rawConfig.cols : 3,
            rows: (rawConfig && Number.isInteger(rawConfig.rows) && rawConfig.rows > 0) ? rawConfig.rows : 8,
            name: (rawConfig && rawConfig.name) ? rawConfig.name : "Default Format"
        };

        const totalCells = formatConfig.cols * formatConfig.rows;
        const startPosInput = document.getElementById('input-startpos');
        const countInput = document.getElementById('input-count');

        if (startPosInput && !startPosInput.value) {
            startPosInput.value = 1;
        }

        if (countInput && (!countInput.value || !countInput.dataset.userModified)) {
            const currentStart = parseInt(startPosInput?.value, 10) || 1;
            countInput.value = Math.max(1, (totalCells - currentStart) + 1);
        }

        const inputCount = Math.max(1, parseInt(countInput?.value, 10) || totalCells);
        const inputStartPos = Math.max(1, parseInt(startPosInput?.value, 10) || 1);

        const artNrDropdown = document.getElementById('select-artnr');
        const selectedArtNr = artNrDropdown?.value;
        const activeItem = a2.find(item => String(item.artNr || item.ID) === String(selectedArtNr));

        targetSheet.innerHTML = '';
        targetSheet.style.display = 'grid';
        targetSheet.style.gridTemplateColumns = `repeat(${formatConfig.cols}, 1fr)`;
        targetSheet.style.gridTemplateRows = `repeat(${formatConfig.rows}, 1fr)`;

        const lastActivePosition = Math.min(totalCells, (inputStartPos + inputCount) - 1);

        for (let i = 0; i < totalCells; i++) {
            const gridCell = document.createElement('div');
            gridCell.dataset.index = i;
            const cellPosition = i + 1;

            if (cellPosition >= inputStartPos && cellPosition <= lastActivePosition) {
                if (activeItem) {
                    gridCell.className = 'label-grid-cell state-selected has-article';
                    
                    const innerWrapper = document.createElement('div');
                    innerWrapper.className = 'print-label-content';
                    innerWrapper.style.cssText = 'text-align: center; padding: 4px;';

                    const strongEl = document.createElement('strong');
                    strongEl.style.cssText = 'display: block; font-size: 1rem;';
                    strongEl.textContent = activeItem.artNr || activeItem.ID || '';

                    const spanEl = document.createElement('span');
                    spanEl.className = 'cell-desc';
                    spanEl.style.cssText = 'display: block; font-size: 0.8rem; margin-top: 2px;';
                    spanEl.textContent = activeItem.bez || activeItem.Bezeichnung || '';

                    const smallEl = document.createElement('small');
                    smallEl.style.cssText = 'font-size: 0.7rem; opacity: 0.8;';
                    smallEl.textContent = activeItem.geb || '';

                    innerWrapper.appendChild(strongEl);
                    innerWrapper.appendChild(spanEl);
                    innerWrapper.appendChild(smallEl);
                    gridCell.appendChild(innerWrapper);
                } else {
                    gridCell.className = 'label-grid-cell state-selected';
                    const spanEl = document.createElement('span');
                    spanEl.style.opacity = '0.9';
                    spanEl.textContent = 'Bereit (Kein Artikel)';
                    gridCell.appendChild(spanEl);
                }
            } else {
                gridCell.className = 'label-grid-cell state-neutral';
                gridCell.textContent = `Leer (${cellPosition})`;
            }

            gridCell.addEventListener('click', () => {
                if (startPosInput && countInput) {
                    if (cellPosition < inputStartPos) {
                        startPosInput.value = cellPosition;
                        countInput.value = (lastActivePosition - cellPosition) + 1;
                    }
                    else if (cellPosition >= inputStartPos && cellPosition <= lastActivePosition) {
                        if (cellPosition === inputStartPos) {
                            if (inputCount <= 1) {
                                countInput.value = 1;
                            } else {
                                startPosInput.value = inputStartPos + 1;
                                countInput.value = inputCount - 1;
                            }
                        } else {
                            countInput.value = (cellPosition - inputStartPos) + 1;
                        }
                    }
                    else {
                        countInput.value = (cellPosition - inputStartPos) + 1;
                    }

                    countInput.dataset.userModified = "true";

                    startPosInput.dispatchEvent(new Event('change', { bubbles: true }));
                    countInput.dispatchEvent(new Event('change', { bubbles: true }));

                    renderPrintSheetPreview();
                }
            });

            targetSheet.appendChild(gridCell);
        }
    }

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
})();