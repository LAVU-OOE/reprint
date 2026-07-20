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
    let currentZoom = 1;
    let firstClickPosition = null; // Reference anchor tracking for range selection

    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    function runInitialization() {
        initApiInputValues();
        initApp();
        setupStoragePersistence();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInitialization);
    } else {
        runInitialization();
    }

    async function initApp() {
        updateNetworkStatus('netLoading');
        await loadExternalData();
        // Ensure we have at least hardcoded data if everything else failed
        if (!a2 || a2.length === 0) {
            loadEmbeddedSortimentFallbacks();
        }
        if (!locationsData || locationsData.length === 0) {
            loadEmbeddedLocationsFallbacks();
        }
        initUiElements();
        renderSelectionDropdowns();
        renderLocationsDropdown();
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
       Dedicated Cloudflare Worker API Endpoints
       - Sortiment & Locations: root URL returns the data
       - Product (formats): must call /formats path
       ========================================================================== */
    async function loadExternalData() {
        const rawSortimentApi = localStorage.getItem('apiBase') || 'https://sortiment-api.lavu-ooe.workers.dev';
        const rawLocationsApi = localStorage.getItem('locationsApiBase') || 'https://locations-api.lavu-ooe.workers.dev';
        const rawProductApi = localStorage.getItem('productApiBase') || 'https://product-api.lavu-ooe.workers.dev';

        const sortimentUrl = rawSortimentApi.replace(/\/+$/, '');
        const locationsUrl = rawLocationsApi.replace(/\/+$/, '');
        const productUrl = rawProductApi.replace(/\/+$/, '') + '/formats';

        try {
            const [manifestRes, i18nRes, formatsRes, sortimentRes, locationsRes] = await Promise.all([
                fetch('manifest.json').catch(() => ({ ok: false })),
                fetch('scripts/i18n.json').catch(() => ({ ok: false })),
                fetch(productUrl).catch(() => ({ ok: false })),
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

            let formatsData = null;
            if (formatsRes && formatsRes.ok) {
                const contentType = formatsRes.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    formatsData = await formatsRes.json().catch(() => null);
                }
            }

            if (formatsData && typeof formatsData === 'object' && Object.keys(formatsData).length > 0) {
                formats = formatsData;
            } else {
                loadEmbeddedFormatsFallbacks();
            }

            // Sortiment cache invalidation
            const cacheTimestamp = localStorage.getItem('lavu_studio_sortiment_timestamp');
            if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp, 10) > CACHE_TTL_MS)) {
                localStorage.removeItem('lavu_studio_sortiment_v9');
                localStorage.removeItem('lavu_studio_sortiment_timestamp');
            }

            let sortimentData = [];
            if (sortimentRes && sortimentRes.ok) {
                sortimentData = await sortimentRes.json().catch(() => []);
            }

            if (Array.isArray(sortimentData) && sortimentData.length > 0) {
                a2 = sortimentData;
                localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
                localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
            } else {
                const localCache = localStorage.getItem('lavu_studio_sortiment_v9');
                try {
                    a2 = localCache ? JSON.parse(localCache) : [];
                } catch (e) {
                    a2 = [];
                }
                if (!a2 || a2.length === 0) {
                    loadEmbeddedSortimentFallbacks();
                }
            }

            // Locations cache invalidation
            const locCacheTimestamp = localStorage.getItem('lavu_studio_locations_timestamp');
            if (locCacheTimestamp && (Date.now() - parseInt(locCacheTimestamp, 10) > CACHE_TTL_MS)) {
                localStorage.removeItem('lavu_studio_locations_v9');
                localStorage.removeItem('lavu_studio_locations_timestamp');
            }

            let locData = [];
            if (locationsRes && locationsRes.ok) {
                locData = await locationsRes.json().catch(() => []);
            }

            if (Array.isArray(locData) && locData.length > 0) {
                locationsData = locData;
                localStorage.setItem('lavu_studio_locations_v9', JSON.stringify(locationsData));
                localStorage.setItem('lavu_studio_locations_timestamp', Date.now().toString());
            } else {
                const localLocCache = localStorage.getItem('lavu_studio_locations_v9');
                try {
                    locationsData = localLocCache ? JSON.parse(localLocCache) : [];
                } catch (e) {
                    locationsData = [];
                }
                if (!locationsData || locationsData.length === 0) {
                    loadEmbeddedLocationsFallbacks();
                }
            }

            // Update status badge
            if (sortimentRes.ok || locationsRes.ok || formatsRes.ok) {
                updateNetworkStatus('netSuccessLocal');
            } else {
                if (a2.length > 0 && !sortimentRes.ok) {
                    updateNetworkStatus('netFallbackLocal');
                } else {
                    updateNetworkStatus('netHardcoded');
                }
            }
            hideLoadingScreen();

        } catch (err) {
            console.warn('API fetch cycle failed completely, falling back to local storage or hardcoded data:', err);
            loadEmbeddedI18nFallbacks();
            loadEmbeddedFormatsFallbacks();

            const localCache = localStorage.getItem('lavu_studio_sortiment_v9');
            a2 = localCache ? JSON.parse(localCache) : [];
            if (!a2 || a2.length === 0) {
                loadEmbeddedSortimentFallbacks();
            }

            const localLocCache = localStorage.getItem('lavu_studio_locations_v9');
            locationsData = localLocCache ? JSON.parse(localLocCache) : [];
            if (!locationsData || locationsData.length === 0) {
                loadEmbeddedLocationsFallbacks();
            }

            updateNetworkStatus('netHardcoded');
            hideLoadingScreen();
        }
    }

    function initApiInputValues() {
        const sortimentInput = document.getElementById('input-sortiment-api') || document.getElementById('input-url');
        const locationsInput = document.getElementById('input-location-api');
        const productInput = document.getElementById('input-product-api');

        if (sortimentInput) {
            sortimentInput.value = localStorage.getItem('apiBase') || 'https://sortiment-api.lavu-ooe.workers.dev';
        }
        if (locationsInput) {
            locationsInput.value = localStorage.getItem('locationsApiBase') || 'https://locations-api.lavu-ooe.workers.dev';
        }
        if (productInput) {
            productInput.value = localStorage.getItem('productApiBase') || 'https://product-api.lavu-ooe.workers.dev';
        }
    }

    function hideLoadingScreen() {
        const loader = document.getElementById('loadingOverlay') || document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    // --- Hardcoded fallback for sortiment (last resort) ---
    function loadEmbeddedSortimentFallbacks() {
        a2 = [
            { artNr: "1001", bez: "Bürocontainer 240 l", geb: "blau" },
            { artNr: "1002", bez: "Wertstoffsack 120 l", geb: "gelb" },
            { artNr: "1003", bez: "Altpapierbehälter 60 l", geb: "grün" },
            { artNr: "1004", bez: "Glascontainer 1100 l", geb: "weiß" },
            { artNr: "1005", bez: "Restmülltonne 80 l", geb: "schwarz" }
        ];
        localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
        localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
    }

    // --- Hardcoded fallback for locations ---
    function loadEmbeddedLocationsFallbacks() {
        locationsData = [
            { id: "loc1", name: "Linz - Hauptlager" },
            { id: "loc2", name: "Wels - Nord" },
            { id: "loc3", name: "Steyr - Ost" },
            { id: "loc4", name: "Vöcklabruck - Süd" }
        ];
        localStorage.setItem('lavu_studio_locations_v9', JSON.stringify(locationsData));
        localStorage.setItem('lavu_studio_locations_timestamp', Date.now().toString());
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
                lblLocation: "Standort",
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
                netSuccessLocal: "🟢 APIs & Cloudflare Workers aktiv",
                netFallbackLocal: "⚠️ Offline. Lokaler Gerätespeicher aktiv.",
                netHardcoded: "⚠️ Fallback-Daten (Hardcoded)",
                txtZoom: "Zoom"
            },
            en: {
                studioV9: "Label Studio v9",
                loadingFormat: "Loading format...",
                printLayout: "Print Layout",
                artNr: "Item No.",
                bezeichnung: "Description",
                lblLocation: "Location",
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
                netSuccessLocal: "🟢 APIs & Cloudflare Workers active",
                netFallbackLocal: "⚠️ Offline. Local device cache active.",
                netHardcoded: "⚠️ Fallback data (Hardcoded)",
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
        translateUi(document.documentElement.lang || 'de');

        const zoomSlider = document.getElementById('zoom-range');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                currentZoom = parseFloat(e.target.value) || 1;
                const previewSheet = document.getElementById('interactive-sheet-preview') || document.getElementById('previewContainer');
                if (previewSheet) {
                    previewSheet.style.transform = `scale(${currentZoom})`;
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

        setupApiUpdateHandlers();

        const saveDefaultsBtn = document.getElementById('btn-settings-save-default');
        if (saveDefaultsBtn) {
            saveDefaultsBtn.addEventListener('click', () => {
                const sortimentInput = document.getElementById('input-sortiment-api') || document.getElementById('input-url');
                const locationsInput = document.getElementById('input-location-api');
                const productInput = document.getElementById('input-product-api');

                if (sortimentInput) localStorage.setItem('apiBase', sortimentInput.value.trim());
                if (locationsInput) localStorage.setItem('locationsApiBase', locationsInput.value.trim());
                if (productInput) localStorage.setItem('productApiBase', productInput.value.trim());

                const lang = document.documentElement.lang || 'de';
                alert(i18n[lang]?.alertSaved || 'Standard gespeichert!');
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

        // Sync location dropdown changes to trigger preview update
        document.getElementById('select-location')?.addEventListener('change', renderPrintSheetPreview);

        const syncTriggers = ['select-artnr', 'select-bezeichnung', 'input-count', 'input-startpos', 'select-format', 'select-location'];
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
                firstClickPosition = null; // Clear range anchor on template switch
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

    function setupApiUpdateHandlers() {
        const updateSortiment = document.getElementById('btn-update-sortiment');
        const updateLocations = document.getElementById('btn-update-locations');

        const updateHandler = async () => {
            const sortimentInput = document.getElementById('input-sortiment-api') || document.getElementById('input-url');
            const locationsInput = document.getElementById('input-location-api');
            const productInput = document.getElementById('input-product-api');

            if (sortimentInput) localStorage.setItem('apiBase', sortimentInput.value.trim());
            if (locationsInput) localStorage.setItem('locationsApiBase', locationsInput.value.trim());
            if (productInput) localStorage.setItem('productApiBase', productInput.value.trim());

            alert("API-Einstellungen gespeichert. Daten werden neu geladen...");
            await initApp();
        };

        if (updateSortiment) updateSortiment.addEventListener('click', updateHandler);
        if (updateLocations) updateLocations.addEventListener('click', updateHandler);
    }

    function setupDatabaseManagementHandlers() {
        const btnDbAdd = document.getElementById('btn-db-add');
        const btnDbSave = document.getElementById('btn-db-save');
        const dbArtNr = document.getElementById('db-input-artnr');
        const dbBez = document.getElementById('db-input-bez');
        const dbSuffix = document.getElementById('db-input-suffix');

        const downloadBtn = document.getElementById('btn-download-database');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const dataStr = JSON.stringify(a2, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sortiment_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

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
                if (a2.some(item => String(item.artNr || item.ID).trim() === newArtNr)) {
                    alert(getAlertText('alertDuplicate', 'Diese Artikelnummer existiert bereits!'));
                    return;
                }
                a2.push({
                    artNr: newArtNr,
                    bez: dbBez.value.trim(),
                    geb: dbSuffix ? dbSuffix.value.trim() : ''
                });
                localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(a2));
                localStorage.setItem('lavu_studio_sortiment_timestamp', Date.now().toString());
                renderSelectionDropdowns();
                dbArtNr.value = '';
                dbBez.value = '';
                if (dbSuffix) dbSuffix.value = '';
            });
        }

        if (btnDbSave && dbArtNr && dbBez) {
            btnDbSave.addEventListener('click', () => {
                if (!validateDbInputs()) return;
                const targetArtNr = dbArtNr.value.trim();
                const index = a2.findIndex(item => String(item.artNr || item.ID).trim() === targetArtNr);
                if (index === -1) {
                    alert("Artikelnummer nicht gefunden. Bitte stattdessen 'Neu hinzufügen' verwenden.");
                    return;
                }
                a2[index].bez = dbBez.value.trim();
                if (dbSuffix) a2[index].geb = dbSuffix.value.trim();
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

        if (!a2 || a2.length === 0) {
            loadEmbeddedSortimentFallbacks();
        }

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

    function renderLocationsDropdown() {
        const locDropdown = document.getElementById('select-location');
        if (!locDropdown) return;

        if (!locationsData || locationsData.length === 0) {
            loadEmbeddedLocationsFallbacks();
        }

        locDropdown.innerHTML = '<option value="">-- Standort wählen --</option>';
        locationsData.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc.id || loc.name; // use id if available, else name
            opt.textContent = loc.name || loc;
            locDropdown.appendChild(opt);
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

        const locDropdown = document.getElementById('select-location');
        const selectedLocId = locDropdown?.value;
        const activeLocation = locationsData.find(loc => (loc.id || loc.name) === selectedLocId);

        targetSheet.innerHTML = '';
        targetSheet.style.display = 'grid';
        targetSheet.style.gridTemplateColumns = `repeat(${formatConfig.cols}, 1fr)`;
        targetSheet.style.gridTemplateRows = `repeat(${formatConfig.rows}, 1fr)`;
        targetSheet.style.transform = `scale(${currentZoom})`;

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
                    let suffixText = activeItem.geb || '';
                    if (activeLocation) {
                        suffixText += suffixText ? ' | ' : '';
                        suffixText += activeLocation.name || '';
                    }
                    smallEl.textContent = suffixText;

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

            // Click range builder interaction logic
            gridCell.addEventListener('click', () => {
                if (startPosInput && countInput) {
                    if (firstClickPosition === null) {
                        // First click sets reference anchor
                        firstClickPosition = cellPosition;
                        startPosInput.value = cellPosition;
                        countInput.value = 1;
                    } else {
                        // Second click fills labels in between relative to the first click reference
                        const start = Math.min(firstClickPosition, cellPosition);
                        const end = Math.max(firstClickPosition, cellPosition);
                        
                        startPosInput.value = start;
                        countInput.value = (end - start) + 1;
                        
                        // Reset selection tracker context state for next cycle sequence
                        firstClickPosition = null;
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