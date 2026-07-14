// ============================================================
// LAVU OÖ - Label Studio v9
// Complete JavaScript with all fixes applied
// ============================================================

// ----- Data & State -----
let sortimentData = [];
let currentFormatKey = '4473';
let currentLang = localStorage.getItem('lavu_lang') || 'de';
let locationData = [];
let deferredPrompt = null;

const LOCATION_JSON_URL = 'https://sortiment-api.lavu-ooe.workers.dev/';
const DEFAULT_LOCATION_VALUE = '106';

const fallbackSortiment = [
    { artNr: '4040', bez: 'Elektro-Kleingeräte (ohne Akku)', geb: 'QR-Box' },
    { artNr: '4010', bez: 'Elektro-Großgeräte', geb: 'Gitterbox' },
    { artNr: '3120', bez: 'Altholz thermisch (beschichtet)', geb: 'Mulde' },
    { artNr: '3110', bez: 'Altholz stofflich (unbeschichtet)', geb: 'Container' },
    { artNr: '1720', bez: 'Altmetall / Schrott', geb: 'Mulde' },
    { artNr: '1610', bez: 'Verpackungsholz (Paletten)', geb: 'Stapel' },
    { artNr: '1410', bez: 'Altpapier (Kartonagen)', geb: 'Presse' },
    { artNr: '1420', bez: 'Altpapier (Mischpapier)', geb: 'Umleersystem' },
    { artNr: '5510', bez: 'Bauschutt rein', geb: 'Mulde' },
    { artNr: '5530', bez: 'Baustellenabfälle gemischt', geb: 'Großcontainer' }
];

const defaultSortimentData = [
    { artNr: '1000', bez: 'Textilen' },
    { artNr: '2100', bez: 'Kartonagen (ARA-lizenziert)' },
    { artNr: '2200', bez: 'Metallverpackungen' },
    { artNr: '2210', bez: 'Metallverpackungen - geöffnete Gasbehältnisse' },
    { artNr: '2300', bez: 'Glasverpackungen' },
    { artNr: '2400', bez: 'Getränke-Verbundkartons' },
    { artNr: '2520', bez: 'Eimer & Kanister' },
    { artNr: '2540', bez: 'Kunststoff Verpackungsfolien' },
    { artNr: '2555', bez: 'Big-Bags' },
    { artNr: '2565', bez: 'EPS-Styropor' },
    { artNr: '2580', bez: 'Holzverpackungen' },
    { artNr: '2590', bez: 'Keramikverpackungen' },
    { artNr: '3000', bez: 'Altpapier (Deinking-Qualität)' },
    { artNr: '3005', bez: 'Datenschutzpapier' },
    { artNr: '3210', bez: 'Nichteisen-Metalle' },
    { artNr: '3211', bez: 'Armaturen & Messing' },
    { artNr: '3212', bez: 'Alu-Kaffeekapseln' },
    { artNr: '3220', bez: 'Kabelschrott' },
    { artNr: '3300', bez: 'Flachglas' },
    { artNr: '3310', bez: 'Altfenster PVC' },
    { artNr: '3315', bez: 'Altfenster PVC' },
    { artNr: '3320', bez: 'Flachglas' },
    { artNr: '3400', bez: 'Speisefett/-öl (Haushalts-Öl)' },
    { artNr: '3405', bez: 'Speisefett/-öl (Gastro-Öl)' },
    { artNr: '3410', bez: 'Speisefett/-öl (in Kleingebinden)' },
    { artNr: '3430', bez: 'Kerzen' },
    { artNr: '3500', bez: 'Altreifen' },
    { artNr: '3520', bez: 'Hartkunststoffe' },
    { artNr: '3526', bez: 'Kunststoff-Mülltonnen' },
    { artNr: '3540', bez: 'Kunststoff-Sonstige Folien' },
    { artNr: '3560', bez: 'Filmmaterial' },
    { artNr: '3572', bez: 'Compact-Disk (CD)' },
    { artNr: '3580', bez: 'Sonderreifen' },
    { artNr: '3585', bez: 'Reifen m. Felgen' },
    { artNr: '3600', bez: 'Mineralischer Bauschutt' },
    { artNr: '3610', bez: 'Gipskarton' },
    { artNr: '3700', bez: 'Altholz' },
    { artNr: '3805', bez: 'Ersatzbrennstoff' },
    { artNr: '4010', bez: 'Elektro-Großgeräte' },
    { artNr: '4015', bez: 'Nachtspeicheröfen' },
    { artNr: '4020', bez: 'Kühlgeräte' },
    { artNr: '4030', bez: 'Bildschirmgeräte' },
    { artNr: '4031', bez: 'Flachbildschirmgeräte' },
    { artNr: '4040', bez: 'Elektro-Kleingeräte' },
    { artNr: '4041', bez: 'Elektro-Kleingeräte,schadst. f.' },
    { artNr: '4050', bez: 'Gasentladungslampen' },
    { artNr: '4051', bez: 'Gasentladungslampen Sonderformen' },
    { artNr: '4100', bez: 'Gerätebatterien' },
    { artNr: '4110', bez: 'Fahrzeugbatterien' },
    { artNr: '4111', bez: 'Lithium-Batterien' },
    { artNr: '4120', bez: 'Ni-Cd Akkumulatoren' },
    { artNr: '4125', bez: 'Traktionsbatterien' },
    { artNr: '4200', bez: 'Altöle' },
    { artNr: '4221', bez: 'Feuerlöscher' },
    { artNr: '4230', bez: 'Gasflaschen' },
    { artNr: '4250', bez: 'Altöl' },
    { artNr: '4260', bez: 'Lösemittel-Wassergemische' },
    { artNr: '4270', bez: 'Säurengemische' },
    { artNr: '4275', bez: 'Laugengemische' },
    { artNr: '4280', bez: 'Ölverunreinigtes Erdmaterial' },
    { artNr: '4300', bez: 'Altlacke & Werkstättenabfälle' },
    { artNr: '4305', bez: 'Lack- & Farbschlamm' },
    { artNr: '4310', bez: 'Kunststoffemballagen (mit schädlichen Restinhalten)' },
    { artNr: '4320', bez: 'Öl-/Wassergemische & Emulsionen' },
    { artNr: '4325', bez: 'Ölschlamm & Ölgatsch' },
    { artNr: '4330', bez: 'Schädlingsbekämpfungs- & Chemikalienreste' },
    { artNr: '4340', bez: 'Altmedikamente (unsortierte Arzneien)' },
    { artNr: '4350', bez: 'Spraydosen (mit Restinhalt)' },
    { artNr: '4360', bez: 'Spraydosen (mit Restinhalt)' },
    { artNr: '4380', bez: 'Kondensatoren' },
    { artNr: '4390', bez: 'XPS-Dämmplatten' },
    { artNr: '4395', bez: 'Mineralwolle' },
    { artNr: '4430', bez: 'Netze & Schnüre' },
    { artNr: '4450', bez: 'Dispersionsfarben' },
    { artNr: '4460', bez: 'Altmedikamente (vorsortiert)' },
    { artNr: '4461', bez: 'Altmedikamente (vorsortiert/Apotheken)' },
    { artNr: '4464', bez: 'Injektionsnadeln' },
    { artNr: '4465', bez: 'Injektionsnadeln (aus Spitälern)' },
    { artNr: '5100', bez: 'Ungefährliche medizinische Abfälle' },
    { artNr: '9900', bez: 'Hilfsgebinde' }
];

const formats = {
    '4473': { cols: 3, rows: 8, name: 'HERMA 4473 (70 x 36 mm)' },
    '4273': { cols: 3, rows: 8, name: 'HERMA 4273 (70 x 36 mm)' },
    '4676': { cols: 3, rows: 8, name: 'HERMA 4676 (70 x 36 mm)' },
    '5074': { cols: 3, rows: 8, name: 'HERMA 5074 (70 x 36 mm)' },
    '4428': { cols: 2, rows: 4, name: 'HERMA 4428 (105 x 68 mm)' },
    '4282': { cols: 2, rows: 4, name: 'HERMA 4282 (105 x 68 mm)' },
    '4463': { cols: 2, rows: 4, name: 'HERMA 4463 (105 x 68 mm)' },
    '4276': { cols: 2, rows: 6, name: 'HERMA 4276 (99,1 x 42,3 mm)' },
    '4465': { cols: 2, rows: 6, name: 'HERMA 4465 (99,1 x 42,3 mm)' },
    '5077': { cols: 2, rows: 4, name: 'HERMA 5077 (99,1 x 67,7 mm)' },
    '4269': { cols: 2, rows: 4, name: 'HERMA 4269 (99,1 x 67,7 mm)' },
    '4459': { cols: 3, rows: 17, name: 'HERMA 4459 (70 x 16,9 mm)' },
    '4278': { cols: 3, rows: 5, name: 'HERMA 4278 (70 x 50,8 mm)' },
    '5055': { cols: 3, rows: 5, name: 'HERMA 5055 (70 x 50,8 mm)' },
    '4456': { cols: 3, rows: 10, name: 'HERMA 4456 (70 x 29,7 mm)' },
    '4441': { cols: 3, rows: 7, name: 'HERMA 4441 (70 x 42 mm)' },
    '4623': { cols: 2, rows: 7, name: 'HERMA 4623 (97 x 42,3 mm)' },
    '8645': { cols: 2, rows: 4, name: 'HERMA 8645 (105 x 74 mm)' },
    '5062': { cols: 2, rows: 4, name: 'HERMA 5062 (105 x 74 mm)' },
    '4626': { cols: 2, rows: 4, name: 'HERMA 4626 (105 x 74 mm)' },
    '4470': { cols: 2, rows: 4, name: 'HERMA 4470 (105 x 74 mm)' },
    '4462': { cols: 2, rows: 8, name: 'HERMA 4462 (105 x 37 mm)' },
    '4359': { cols: 2, rows: 4, name: 'HERMA 4359 (97 x 67,7 mm)' }
};

// ----- i18n -----
const i18n = {
    de: {
        studioV9: 'Etiketten-Studio v9',
        loadingFormat: 'Format wird geladen...',
        printLayout: 'Druck-Layout',
        artNr: 'Art.Nr.',
        bezeichnung: 'Bezeichnung',
        printNow: 'Jetzt Drucken',
        options: 'Optionen',
        modal1Title: 'Druck- & Standorteinstellungen',
        tabSelect: 'Sortiment wählen',
        tabManage: 'Datenbank verwalten',
        lblUrl: 'Zentrale Sortiment-URL (Worker-API JSON):',
        btnUpdate: 'Aktualisieren',
        lblDbSuffix: 'Gebinde / Suffix:',
        lblDbBez: 'Bezeichnung:',
        btnSave: '💾 Ändern',
        btnAddNew: '➕ Neu hinzufügen',
        btnCancel: 'Abbrechen',
        btnDownloadJson: '📥 Aktuelle Datenbank als JSON herunterladen',
        lblCurrentEntries: 'Aktuelle Einträge im lokalen Workspace:',
        btnSaveDefault: 'Standard sichern',
        btnDone: 'Fertig',
        modal2Title: 'Interaktiver A4-Druckbogen',
        btnModalPrint: 'Drucken',
        btnModalClose: 'Schließen',
        txtPwaTitle: 'Als App installieren',
        txtPwaSub: 'Schnellerer Zugriff & Offline-Nutzung',
        btnPwaInstall: 'Installieren',
        layoutTitleAttr: 'Klicken für vollständige A4-Großansicht',
        alertSaved: 'Aktuelle Einstellungen wurden als Standard im Browser gespeichert!',
        confirmDelete: 'Möchten Sie diesen Eintrag wirklich löschen?',
        alertFillForm: 'Bitte zumindest Art.Nr. und Bezeichnung ausfüllen.',
        alertErrorChange: 'Fehler beim Ändern.',
        alertDuplicate: 'Diese Artikelnummer existiert bereits!',
        netLoading: '⏳ Verbinde...',
        netSuccessLocal: '🟢 Lokale sortiment.json erfolgreich aktiv',
        netSuccessRemote: '🟢 Verbunden mit externem JSON Repository',
        netFallbackLocal: '⚠️ Keine lokale sortiment.json gefunden. Cache geladen.',
        netFallbackRemote: '⚠️ Remote JSON Offline! Lokaler Cache geladen.',
        txtZoom: 'Zoom',
        locationLoading: 'Standorte werden geladen...',
        locationError: 'Fehler beim Laden der Standorte'
    },
    en: {
        studioV9: 'Label Studio v9',
        loadingFormat: 'Loading format...',
        printLayout: 'Print Layout',
        artNr: 'Item No.',
        bezeichnung: 'Description',
        printNow: 'Print Now',
        options: 'Options',
        modal1Title: 'Print & Location Settings',
        tabSelect: 'Select Assortment',
        tabManage: 'Manage Database',
        lblUrl: 'Central Assortment URL (Worker-API JSON):',
        btnUpdate: 'Update',
        lblDbSuffix: 'Container / Suffix:',
        lblDbBez: 'Description:',
        btnSave: '💾 Change',
        btnAddNew: '➕ Add New',
        btnCancel: 'Cancel',
        btnDownloadJson: '📥 Download Current Database as JSON',
        lblCurrentEntries: 'Current entries in local workspace:',
        btnSaveDefault: 'Save Defaults',
        btnDone: 'Done',
        modal2Title: 'Interactive A4 Print Sheet',
        btnModalPrint: 'Print',
        btnModalClose: 'Close',
        txtPwaTitle: 'Install as App',
        txtPwaSub: 'Faster access & offline usage',
        btnPwaInstall: 'Install',
        layoutTitleAttr: 'Click for full A4 sheet preview',
        alertSaved: 'Current settings saved as defaults in browser!',
        confirmDelete: 'Do you really want to delete this entry?',
        alertFillForm: 'Please fill in at least Item No. and Description.',
        alertErrorChange: 'Error applying changes.',
        alertDuplicate: 'This Article Number already exists!',
        netLoading: '⏳ Connecting...',
        netSuccessLocal: '🟢 Local sortiment.json active successfully',
        netSuccessRemote: '🟢 Connected to remote JSON Repository',
        netFallbackLocal: '⚠️ No local sortiment.json found. Cache loaded.',
        netFallbackRemote: '⚠️ Remote JSON Offline! Local cache loaded.',
        txtZoom: 'Zoom',
        locationLoading: 'Loading locations...',
        locationError: 'Error loading locations'
    }
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

// ----- Helpers -----
function getFirstLetter(text) {
    if (!text) return '';
    const first = text.charAt(0).toUpperCase();
    const map = { 'Ä': 'A', 'Ö': 'O', 'Ü': 'U', 'ẞ': 'S' };
    return map[first] || first;
}

function groupByFirstLetter(items) {
    const groups = {};
    items.forEach(item => {
        const letter = getFirstLetter(item.bez);
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(item);
    });
    return groups;
}

function groupByNumericRange(items) {
    const groups = {};
    items.forEach(item => {
        const num = parseInt(item.artNr) || 0;
        const groupKey = Math.floor(num / 1000);
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(item);
    });
    return groups;
}

function getLocationDisplayName(locationValue) {
    if (!locationValue || !locationData || locationData.length === 0) return locationValue;
    const found = locationData.find(loc => (loc.siteCode && loc.siteCode === locationValue) || loc.name === locationValue);
    if (found) {
        return found.siteCode ? `${found.name} (${found.siteCode})` : found.name;
    }
    return locationValue;
}

// ----- Location Loading -----
function populateLocationDropdowns(locations) {
    const select = document.getElementById('locationSelect');
    if (!select) return;
    select.innerHTML = '';
    if (!locations || locations.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = i18n[currentLang].locationError || 'No locations found';
        option.disabled = true;
        option.selected = true;
        select.appendChild(option);
        return;
    }
    const grouped = {};
    locations.forEach(loc => {
        const region = loc.region || 'Andere';
        if (!grouped[region]) grouped[region] = [];
        grouped[region].push(loc);
    });
    const sortedRegions = Object.keys(grouped).sort();
    sortedRegions.forEach(region => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = region;
        const sortedLocs = grouped[region].sort((a, b) => a.name.localeCompare(b.name, 'de'));
        sortedLocs.forEach(loc => {
            const value = loc.siteCode || loc.name;
            const displayName = loc.siteCode ? `${loc.name} (${loc.siteCode})` : loc.name;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = displayName;
            optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
    });
    // Set default
    const savedLocation = localStorage.getItem('lavu_location');
    let targetValue = savedLocation || DEFAULT_LOCATION_VALUE;
    if (savedLocation && select.querySelector(`option[value="${savedLocation}"]`)) {
        targetValue = savedLocation;
    } else if (!select.querySelector(`option[value="${targetValue}"]`)) {
        const defaultLoc = locations.find(loc => loc.siteCode === DEFAULT_LOCATION_VALUE);
        if (defaultLoc && select.querySelector(`option[value="${defaultLoc.siteCode}"]`)) {
            targetValue = defaultLoc.siteCode;
        } else {
            for (let opt of select.options) {
                if (!opt.disabled && opt.value) {
                    targetValue = opt.value;
                    break;
                }
            }
        }
    }
    if (targetValue && select.querySelector(`option[value="${targetValue}"]`)) {
        select.value = targetValue;
        localStorage.setItem('lavu_location', targetValue);
    }
}

function loadLocations() {
    const select = document.getElementById('locationSelect');
    if (!select) return;
    const t = i18n[currentLang];
    select.innerHTML = '';
    const loadingOpt = document.createElement('option');
    loadingOpt.value = '';
    loadingOpt.textContent = t.locationLoading || 'Loading locations...';
    loadingOpt.disabled = true;
    loadingOpt.selected = true;
    select.appendChild(loadingOpt);
    const cachedLocations = localStorage.getItem('lavu_locations_cache');
    if (cachedLocations) {
        try {
            const parsed = JSON.parse(cachedLocations);
            if (Array.isArray(parsed) && parsed.length > 0) {
                locationData = parsed;
                populateLocationDropdowns(locationData);
            }
        } catch (e) { /* ignore */ }
    }
    fetch(LOCATION_JSON_URL, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                locationData = data;
                localStorage.setItem('lavu_locations_cache', JSON.stringify(locationData));
                populateLocationDropdowns(locationData);
            } else {
                throw new Error('Invalid location data format');
            }
        })
        .catch(err => {
            console.warn('Error loading locations from URL, using fallback:', err);
            if (!locationData || locationData.length === 0) {
                locationData = [
                    { siteCode: '106', name: 'ASZ Asten', zipCode: '4481', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Ansfelden', zipCode: '4053', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Enns', zipCode: '4470', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Hörsching', zipCode: '4063', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Leonding', zipCode: '4060', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Neuhofen', zipCode: '4501', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Pasching', zipCode: '4061', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ St. Florian', zipCode: '4490', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Traun', zipCode: '4050', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Wilhering', zipCode: '4073', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Linz-Nebingerstraße', zipCode: '4020', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Linz-Mostnnystraße', zipCode: '4040', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Linz-Wiener Straße', zipCode: '4030', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Linz-Dornach', zipCode: '4040', region: 'Linz-Land & Linz Stadt' },
                    { siteCode: 'N/G', name: 'ASZ Wels-Nord', zipCode: '4600', region: 'Wels & Wels-Land' },
                    { siteCode: 'N/G', name: 'ASZ Wels-Kenten', zipCode: '4600', region: 'Wels & Wels-Land' },
                    { siteCode: 'N/G', name: 'ASZ Marchtrenk', zipCode: '4614', region: 'Wels & Wels-Land' },
                    { siteCode: 'N/G', name: 'ASZ Gunskirchen', zipCode: '4623', region: 'Wels & Wels-Land' },
                    { siteCode: 'N/G', name: 'ASZ Thalheim', zipCode: '4600', region: 'Wels & Wels-Land' },
                    { siteCode: 'N/G', name: 'ASZ Steyr', zipCode: '4400', region: 'Steyr & Steyr-Land' },
                    { siteCode: 'N/G', name: 'ASZ Bad Hall', zipCode: '4540', region: 'Steyr & Steyr-Land' },
                    { siteCode: 'N/G', name: 'ASZ Garsten', zipCode: '4451', region: 'Steyr & Steyr-Land' },
                    { siteCode: 'N/G', name: 'ASZ Sierning', zipCode: '4522', region: 'Steyr & Steyr-Land' }
                ];
                populateLocationDropdowns(locationData);
            }
        });
}

// ----- Dropdown Population -----
function populateNameDropdownWithGroups(selectElement, items) {
    if (!selectElement) return;
    const groups = groupByFirstLetter(items);
    const sortedLetters = Object.keys(groups).sort();
    selectElement.innerHTML = '';
    sortedLetters.forEach(letter => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = letter;
        const sortedItems = groups[letter].sort((a, b) => a.bez.localeCompare(b.bez, 'de'));
        sortedItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.artNr;
            option.textContent = '· ' + item.bez;
            optgroup.appendChild(option);
        });
        selectElement.appendChild(optgroup);
    });
}

function populateArtDropdownWithGroups(selectElement, items) {
    if (!selectElement) return;
    const groups = groupByNumericRange(items);
    const sortedKeys = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));
    selectElement.innerHTML = '';
    sortedKeys.forEach(key => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = key;
        const sortedItems = groups[key].sort((a, b) => (parseInt(a.artNr) || 0) - (parseInt(b.artNr) || 0));
        sortedItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.artNr;
            option.textContent = '· ' + item.artNr;
            optgroup.appendChild(option);
        });
        selectElement.appendChild(optgroup);
    });
}

// ----- Update Sortiment Dropdowns (renamed from i1) -----
function updateSortimentDropdowns() {
    const selectArt = document.getElementById('artSelect');
    const selectName = document.getElementById('nameSelect');
    if (!selectArt || !selectName) return;
    const currentSelectedArtNr = selectArt.value;
    populateArtDropdownWithGroups(selectArt, sortimentData);
    populateNameDropdownWithGroups(selectName, sortimentData);
    if (currentSelectedArtNr !== '') {
        if (selectArt.querySelector(`option[value="${currentSelectedArtNr}"]`)) {
            selectArt.value = currentSelectedArtNr;
        }
        if (selectName.querySelector(`option[value="${currentSelectedArtNr}"]`)) {
            selectName.value = currentSelectedArtNr;
        }
    } else if (sortimentData.length > 0) {
        const firstItem = sortimentData[0];
        if (selectArt.querySelector(`option[value="${firstItem.artNr}"]`)) {
            selectArt.value = firstItem.artNr;
        }
        if (selectName.querySelector(`option[value="${firstItem.artNr}"]`)) {
            selectName.value = firstItem.artNr;
        }
    }
    updateLabelData();
    renderPreview();
}

// ----- Sync Dropdowns -----
function syncDropdowns(selectedArtNr) {
    const selectArt = document.getElementById('artSelect');
    const selectName = document.getElementById('nameSelect');
    if (selectArt && selectArt.querySelector(`option[value="${selectedArtNr}"]`)) {
        selectArt.value = selectedArtNr;
    }
    if (selectName && selectName.querySelector(`option[value="${selectedArtNr}"]`)) {
        selectName.value = selectedArtNr;
    }
    updateLabelData();
    renderPreview();
}

// ----- Update Label Data -----
function updateLabelData() {
    const selectArt = document.getElementById('artSelect');
    if (!selectArt || selectArt.value === '') return;
    const currentArtNr = selectArt.value;
    const item = sortimentData.find(i => i.artNr === currentArtNr);
    if (item) {
        document.getElementById('i5').value = item.artNr;
        document.getElementById('i6').value = item.geb || '';
        document.getElementById('i7').value = item.bez;
        updateUI();
    }
}

// ----- Get Current Label Data -----
function getLabelData() {
    const locationValue = document.getElementById('locationSelect').value || DEFAULT_LOCATION_VALUE;
    const locationDisplayName = getLocationDisplayName(locationValue);
    const selectArt = document.getElementById('artSelect');
    return {
        topText: locationDisplayName,
        artNr: document.getElementById('i5').value.trim(),
        suffix: document.getElementById('i6').value.trim(),
        bezeichnung: document.getElementById('i7').value.trim(),
        sortimentIndex: selectArt ? selectArt.value : '0'
    };
}

// ----- Update UI -----
function updateUI() {
    const data = getLabelData();
    const f = formats[currentFormatKey];
    document.getElementById('d0').textContent = data.topText || '-';
    document.getElementById('d1').textContent = data.bezeichnung || '-';
    document.getElementById('d2').textContent = data.artNr || '-';
    const badge = document.getElementById('d3');
    if (data.suffix) {
        badge.textContent = data.suffix;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
    document.getElementById('fmt-overlay').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg> ${f.name}
    `;
    renderLabelGrid('t1', data);
    renderLabelGrid('mdl', data);
    renderLabelGrid('printContent', data);
    if (document.getElementById('previewModal').style.display === 'flex') {
        const zoomVal = document.getElementById('zoomSlider').value;
        applyZoom(parseFloat(zoomVal) / 100);
    }
}

// ----- Render Label Grid -----
function renderLabelGrid(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const f = formats[currentFormatKey];
    container.style.gridTemplateColumns = `repeat(${f.cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${f.rows}, 1fr)`;
    const totalLabels = f.cols * f.rows;
    // Get count and start position from hidden inputs or defaults
    const count = parseInt(document.getElementById('countInput')?.value) || 0;
    const startPos = parseInt(document.getElementById('startPosInput')?.value) || 1;
    for (let i = 1; i <= totalLabels; i++) {
        const label = document.createElement('div');
        if (i >= startPos && i < startPos + count) {
            label.className = 'lb';
            label.innerHTML = `
                <div class="lbt">${data.topText || '&nbsp;'}</div>
                <div class="lbm">
                    <div class="lba">${data.artNr || '&nbsp;'}</div>
                    ${data.suffix ? `<div class="lbs">${data.suffix}</div>` : ''}
                </div>
                <div class="lbt bbb-fake-fix" style="border-bottom:none; font-size:1px; height:1px; line-height:1px;"></div>
                <div class="lbb">${data.bezeichnung || '&nbsp;'}</div>
            `;
        } else {
            label.className = 'lb e';
        }
        if (containerId === 'mdl') {
            label.setAttribute('data-index', i);
            label.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                handleLabelClick(index, this.classList.contains('e'));
            });
        }
        container.appendChild(label);
    }
}

// ----- Handle Label Click (Modal) -----
function handleLabelClick(index, isEmpty) {
    const f = formats[currentFormatKey];
    const maxLabels = f.cols * f.rows;
    const countInput = document.getElementById('countInput');
    const startInput = document.getElementById('startPosInput');
    let count = parseInt(countInput?.value) || 0;
    let startPos = parseInt(startInput?.value) || 1;
    let endPos = startPos + count - 1;
    if (count === 0) {
        startPos = index;
        count = 1;
    } else {
        if (isEmpty) {
            // Add label
            if (index < startPos) {
                count = endPos - index + 1;
                startPos = index;
            } else if (index > endPos) {
                count = index - startPos + 1;
            }
        } else {
            // Remove label
            if (index === startPos) {
                startPos++;
                count--;
            } else if (index === endPos) {
                count--;
            } else {
                count = index - startPos;
            }
        }
    }
    count = Math.max(0, Math.min(maxLabels, count));
    startPos = Math.max(1, Math.min(maxLabels, startPos));
    if (countInput) countInput.value = count;
    if (startInput) startInput.value = startPos;
    updateUI();
    saveDefaults();
}

// ----- Apply Zoom -----
function applyZoom(customZoomFactor) {
    customZoomFactor = customZoomFactor || 1;
    const container = document.querySelector('.mbs');
    const element = document.getElementById('previewContainer');
    if (!container || !element) return;
    const containerWidth = container.clientWidth - 80;
    const containerHeight = container.clientHeight - 40;
    const elementWidth = element.scrollWidth || 794;
    const elementHeight = element.scrollHeight || 1123;
    const scaleX = containerWidth / elementWidth;
    const scaleY = containerHeight / elementHeight;
    const baseScale = Math.min(scaleX, scaleY, 1);
    const finalScale = Math.min(baseScale * customZoomFactor, 2);
    element.style.position = 'absolute';
    element.style.top = '50%';
    element.style.left = '50%';
    element.style.transformOrigin = 'center center';
    element.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
}

function applyFastZoom(value) {
    document.getElementById('zoomVal').textContent = value + '%';
    applyZoom(parseFloat(value) / 100);
    localStorage.setItem('lavu_preview_zoom', value);
}

// ----- Format Change -----
function changeFormat(key) {
    currentFormatKey = key;
    const selectSettings = document.getElementById('labelFormatSelect');
    const selectModal = document.getElementById('modalLabelFormatSelect');
    if (selectSettings) selectSettings.value = key;
    if (selectModal) selectModal.value = key;
    const f = formats[key];
    const maxLabels = f.cols * f.rows;
    const countInput = document.getElementById('countInput');
    const startInput = document.getElementById('startPosInput');
    if (countInput) {
        countInput.max = maxLabels;
        if (parseInt(countInput.value) > maxLabels) countInput.value = maxLabels;
    }
    if (startInput) {
        startInput.max = maxLabels;
        if (parseInt(startInput.value) > maxLabels) startInput.value = 1;
    }
    updateUI();
    saveDefaults();
}

// ----- Fetch Sortiment Data -----
function fetchSortimentData() {
    const url = localStorage.getItem('lavu_sortiment_url') || 'https://sortiment-api.lavu-ooe.workers.dev/';
    const statusEl = document.getElementById('statusMessage');
    const t = i18n[currentLang];
    if (statusEl) {
        statusEl.innerHTML = t.netLoading;
        statusEl.style.color = '#f39c12';
    }
    fetch(url, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                sortimentData = data;
                localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(sortimentData));
                if (statusEl) {
                    statusEl.innerHTML = url === 'sortiment.json' ? t.netSuccessLocal : t.netSuccessRemote;
                    statusEl.style.color = '#27ae60';
                }
                updateSortimentDropdowns();
            }
        })
        .catch(err => {
            console.warn('Error fetching sortiment data, using cache/fallback:', err);
            if (statusEl) {
                statusEl.innerHTML = url === 'sortiment.json' ? t.netFallbackLocal : t.netFallbackRemote;
                statusEl.style.color = '#e74c3c';
            }
            const cached = localStorage.getItem('lavu_studio_sortiment_v8');
            if (cached) {
                try {
                    sortimentData = JSON.parse(cached);
                } catch (e) {
                    sortimentData = fallbackSortiment.slice();
                }
            } else {
                sortimentData = fallbackSortiment.slice();
            }
            updateSortimentDropdowns();
        });
}

// ----- Save / Load Defaults -----
function saveDefaults() {
    const data = getLabelData();
    const config = {
        formatKey: currentFormatKey,
        location: document.getElementById('locationSelect').value || DEFAULT_LOCATION_VALUE,
        count: parseInt(document.getElementById('countInput')?.value) || 0,
        startPos: parseInt(document.getElementById('startPosInput')?.value) || 1,
        artNr: data.artNr,
        suffix: data.suffix,
        bezeichnung: data.bezeichnung,
        sortimentIndex: data.sortimentIndex
    };
    localStorage.setItem('lavu_studio_defaults_v8', JSON.stringify(config));
    localStorage.setItem('lavu_location', config.location);
}

function loadDefaults() {
    const defaultsStr = localStorage.getItem('lavu_studio_defaults_v8');
    if (defaultsStr) {
        try {
            const config = JSON.parse(defaultsStr);
            if (config.formatKey && formats[config.formatKey]) {
                currentFormatKey = config.formatKey;
                const selectSettings = document.getElementById('labelFormatSelect');
                const selectModal = document.getElementById('modalLabelFormatSelect');
                if (selectSettings) selectSettings.value = currentFormatKey;
                if (selectModal) selectModal.value = currentFormatKey;
            }
            const f = formats[currentFormatKey];
            const maxLabels = f.cols * f.rows;
            const savedLocation = localStorage.getItem('lavu_location');
            const locationValue = (savedLocation && savedLocation !== '') ? savedLocation : DEFAULT_LOCATION_VALUE;
            const locSelect = document.getElementById('locationSelect');
            if (locSelect) locSelect.value = locationValue;
            const countInput = document.getElementById('countInput');
            const startInput = document.getElementById('startPosInput');
            if (countInput && config.count !== undefined) countInput.value = Math.min(maxLabels, config.count);
            if (startInput && config.startPos !== undefined) startInput.value = Math.min(maxLabels, config.startPos);
            if (config.artNr !== undefined) document.getElementById('i5').value = config.artNr;
            if (config.suffix !== undefined) document.getElementById('i6').value = config.suffix;
            if (config.bezeichnung !== undefined) document.getElementById('i7').value = config.bezeichnung;
            if (config.sortimentIndex !== undefined) {
                setTimeout(() => syncDropdowns(config.sortimentIndex), 100);
            }
            changeFormat(currentFormatKey);
        } catch (e) {
            console.warn('Error loading defaults:', e);
        }
    } else {
        // Set default location
        const locSelect = document.getElementById('locationSelect');
        if (locSelect) locSelect.value = DEFAULT_LOCATION_VALUE;
        localStorage.setItem('lavu_location', DEFAULT_LOCATION_VALUE);
        changeFormat(currentFormatKey);
    }
}

// ----- Language -----
function toggleLanguage() {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    localStorage.setItem('lavu_lang', currentLang);
    applyLanguage();
    updateUI();
    if (locationData && locationData.length > 0) {
        populateLocationDropdowns(locationData);
    } else {
        loadLocations();
    }
}

function applyLanguage() {
    const t = i18n[currentLang];
    document.getElementById('langToggleBtn').textContent = currentLang === 'de' ? 'EN' : 'DE';
    document.getElementById('txt-studio-v9').textContent = t.studioV9;
    
    const printLayoutEl = document.getElementById('txt-print-layout');
    if (printLayoutEl) {
        printLayoutEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.printLayout}`;
    }
    
    document.getElementById('txt-art-nr').textContent = t.artNr;
    document.getElementById('txt-bezeichnung').textContent = t.bezeichnung;
    
    const printBtn = document.getElementById('btn-print-now');
    if (printBtn) {
        printBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.printNow}`;
    }
    
    const optionsBtn = document.getElementById('btn-options');
    if (optionsBtn) {
        optionsBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> ${t.options}`;
    }
    
    document.getElementById('txt-modal1-title').textContent = t.modal1Title;
    document.getElementById('txt-tab-select').textContent = t.tabSelect;
    document.getElementById('txt-tab-manage').textContent = t.tabManage;
    
    const lblUrl = document.getElementById('lbl-url');
    if (lblUrl) {
        lblUrl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> ${t.lblUrl}`;
    }
    
    const btnUpdate = document.getElementById('btn-update');
    if (btnUpdate) btnUpdate.textContent = t.btnUpdate;
    
    const lblDbSuffix = document.getElementById('lbl-db-suffix');
    if (lblDbSuffix) lblDbSuffix.textContent = t.lblDbSuffix;
    
    const lblDbBez = document.getElementById('lbl-db-bez');
    if (lblDbBez) lblDbBez.textContent = t.lblDbBez;
    
    const btnAddNew = document.getElementById('btn-add-new');
    if (btnAddNew) btnAddNew.textContent = t.btnAddNew;
    
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) btnCancel.textContent = t.btnCancel;
    
    const btnDownloadJson = document.getElementById('btn-download-json');
    if (btnDownloadJson) btnDownloadJson.textContent = t.btnDownloadJson;
    
    const lblCurrentEntries = document.getElementById('lbl-current-entries');
    if (lblCurrentEntries) lblCurrentEntries.textContent = t.lblCurrentEntries;
    
    const btnSaveDefault = document.getElementById('btn-save-default');
    if (btnSaveDefault) {
        btnSaveDefault.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> ${t.btnSaveDefault}`;
    }
    
    const btnDone = document.getElementById('btn-done');
    if (btnDone) btnDone.textContent = t.btnDone;
    
    document.getElementById('modalTitle').textContent = t.modal2Title;
    
    const modalPrintBtn = document.getElementById('btn-modal-print');
    if (modalPrintBtn) {
        modalPrintBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.btnModalPrint}`;
    }
    
    const btnModalClose = document.getElementById('btn-modal-close');
    if (btnModalClose) btnModalClose.textContent = t.btnModalClose;
    
    const txtPwaTitle = document.getElementById('txt-pwa-title');
    if (txtPwaTitle) txtPwaTitle.textContent = t.txtPwaTitle;
    
    const txtPwaSub = document.getElementById('txt-pwa-sub');
    if (txtPwaSub) txtPwaSub.textContent = t.txtPwaSub;
    
    const pwaInstallBtn = document.getElementById('pwaInstallBtn');
    if (pwaInstallBtn) pwaInstallBtn.textContent = t.btnPwaInstall;
    
    const layoutTitleAttr = document.getElementById('layout-title-attr');
    if (layoutTitleAttr) layoutTitleAttr.setAttribute('title', t.layoutTitleAttr);
    
    changeFormat(currentFormatKey);
}

// ----- Modal Tab Switching -----
function switchTab(tab) {
    document.getElementById('tabSelect').classList.toggle('a', tab === 'select');
    document.getElementById('tabManage').classList.toggle('a', tab === 'manage');
    document.getElementById('panelSelect').classList.toggle('a', tab === 'select');
    document.getElementById('panelManage').classList.toggle('a', tab === 'manage');
}

// ----- Database Management -----
function renderEntryList() {
    const container = document.getElementById('entriesContainer');
    if (!container) return;
    container.innerHTML = '';
    sortimentData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cir';
        div.innerHTML = `
            <div class="cii">
                <b>${item.artNr}</b> - ${item.bez} <span style="color:#7f8c8d; font-size:0.75rem;">(${item.geb || '-'})</span>
            </div>
            <div style="display: flex; gap: 4px;">
                <button class="bc" style="padding: 3px 6px; background: #3498db; color: white; font-size: 0.75rem;" data-index="${index}" data-action="edit">✏️</button>
                <button class="bc" style="padding: 3px 6px; background: #e74c3c; color: white; font-size: 0.75rem;" data-index="${index}" data-action="delete">🗑️</button>
            </div>
        `;
        container.appendChild(div);
        div.querySelector('[data-action="edit"]').addEventListener('click', function() {
            editEntry(parseInt(this.dataset.index));
        });
        div.querySelector('[data-action="delete"]').addEventListener('click', function() {
            deleteEntry(parseInt(this.dataset.index));
        });
    });
}

function editEntry(index) {
    const item = sortimentData[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('artInput').value = item.artNr;
    document.getElementById('suffixInput').value = item.geb || '';
    document.getElementById('bezInput').value = item.bez;
    document.getElementById('btn-change').style.display = 'inline-block';
}

function deleteEntry(index) {
    const t = i18n[currentLang];
    if (confirm(t.confirmDelete)) {
        sortimentData.splice(index, 1);
        localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(sortimentData));
        updateSortimentDropdowns();
        renderEntryList();
        updateUI();
    }
}

function cancelEdit() {
    document.getElementById('editIndex').value = '';
    document.getElementById('artInput').value = '';
    document.getElementById('suffixInput').value = '';
    document.getElementById('bezInput').value = '';
    document.getElementById('btn-change').style.display = 'none';
}

function saveChange() {
    const index = document.getElementById('editIndex').value;
    const artNr = document.getElementById('artInput').value.trim();
    const suffix = document.getElementById('suffixInput').value.trim();
    const bez = document.getElementById('bezInput').value.trim();
    const t = i18n[currentLang];
    if (index === '' || !artNr || !bez) {
        alert(t.alertErrorChange);
        return;
    }
    sortimentData[index] = { artNr, geb: suffix || '-', bez };
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(sortimentData));
    updateSortimentDropdowns();
    cancelEdit();
    renderEntryList();
    updateUI();
}

function addNewEntry() {
    const artNr = document.getElementById('artInput').value.trim();
    const suffix = document.getElementById('suffixInput').value.trim();
    const bez = document.getElementById('bezInput').value.trim();
    const t = i18n[currentLang];
    if (!artNr || !bez) {
        alert(t.alertFillForm);
        return;
    }
    if (sortimentData.some(item => item.artNr === artNr)) {
        alert(t.alertDuplicate);
        return;
    }
    sortimentData.push({ artNr, geb: suffix || '-', bez });
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(sortimentData));
    updateSortimentDropdowns();
    cancelEdit();
    renderEntryList();
    updateUI();
}

function downloadJSON() {
    try {
        const json = JSON.stringify(sortimentData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sortiment_export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed: ' + err.message);
    }
}

// ----- Modal Controls -----
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'flex';
    renderEntryList();
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function openPreviewModal() {
    updateUI();
    document.getElementById('previewModal').style.display = 'flex';
    const zoomVal = document.getElementById('zoomSlider').value;
    setTimeout(() => applyZoom(parseFloat(zoomVal) / 100), 50);
}

function closePreviewModal() {
    document.getElementById('previewModal').style.display = 'none';
}

// ----- Init Format Selects -----
function initFormatSelects() {
    const selectSettings = document.getElementById('labelFormatSelect');
    const selectModal = document.getElementById('modalLabelFormatSelect');
    [selectSettings, selectModal].forEach(select => {
        if (!select) return;
        select.innerHTML = '';
        for (const key in formats) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = formats[key].name;
            if (key === currentFormatKey) opt.selected = true;
            select.appendChild(opt);
        }
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    sortimentData = defaultSortimentData.slice();
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(sortimentData));
    
    // Load locations
    loadLocations();
    
    // Init format selects
    initFormatSelects();
    
    // Apply language
    applyLanguage();
    
    // Load defaults
    loadDefaults();
    
    // Set URL input
    const savedUrl = localStorage.getItem('lavu_sortiment_url') || 'https://sortiment-api.lavu-ooe.workers.dev/';
    document.getElementById('urlInput').value = savedUrl;
    
    // Fetch sortiment data
    const t = i18n[currentLang];
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.innerHTML = t.netLoading;
        statusEl.style.color = '#f39c12';
    }
    fetchSortimentData();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Language toggle
    document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);
    
    // Location select
    document.getElementById('locationSelect').addEventListener('change', function() {
        localStorage.setItem('lavu_location', this.value);
        updateUI();
        saveDefaults();
    });
    
    // Print button
    document.getElementById('btn-print-now').addEventListener('click', function() {
        window.print();
    });
    
    // Options button
    document.getElementById('btn-options').addEventListener('click', openSettingsModal);
    
    // Modal close buttons
    document.getElementById('modal1CloseBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target.id === 'settingsModal') closeSettingsModal();
    });
    document.getElementById('modal2CloseBtn').addEventListener('click', closePreviewModal);
    document.getElementById('previewModal').addEventListener('click', function(e) {
        if (e.target.id === 'previewModal') closePreviewModal();
    });
    document.getElementById('btn-modal-close').addEventListener('click', closePreviewModal);
    
    // Preview click
    document.getElementById('layout-title-attr').addEventListener('click', openPreviewModal);
    document.getElementById('layout-title-attr').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPreviewModal();
        }
    });
    
    // Modal print
    document.getElementById('btn-modal-print').addEventListener('click', function() {
        window.print();
    });
    
    // Format selects
    document.getElementById('labelFormatSelect').addEventListener('change', function() {
        changeFormat(this.value);
        saveDefaults();
    });
    document.getElementById('modalLabelFormatSelect').addEventListener('change', function() {
        changeFormat(this.value);
    });
    
    // Tab switching
    document.getElementById('tabSelect').addEventListener('click', function() {
        switchTab('select');
    });
    document.getElementById('tabManage').addEventListener('click', function() {
        switchTab('manage');
        renderEntryList();
    });
    
    // Update URL
    document.getElementById('btn-update').addEventListener('click', function() {
        localStorage.setItem('lavu_sortiment_url', document.getElementById('urlInput').value.trim());
        fetchSortimentData();
    });
    
    // Database management
    document.getElementById('btn-add-new').addEventListener('click', addNewEntry);
    document.getElementById('btn-cancel').addEventListener('click', cancelEdit);
    document.getElementById('btn-download-json').addEventListener('click', downloadJSON);
    document.getElementById('btn-change').addEventListener('click', saveChange);
    
    // Save defaults
    document.getElementById('btn-save-default').addEventListener('click', function() {
        saveDefaults();
        alert(i18n[currentLang].alertSaved);
    });
    
    // Done button
    document.getElementById('btn-done').addEventListener('click', closeSettingsModal);
    
    // Zoom slider
    document.getElementById('zoomSlider').addEventListener('input', function() {
        applyFastZoom(this.value);
    });
    
    // Dropdown sync
    document.getElementById('artSelect').addEventListener('change', function() {
        syncDropdowns(this.value);
    });
    document.getElementById('nameSelect').addEventListener('change', function() {
        syncDropdowns(this.value);
    });
    
    // PWA install
    document.getElementById('pwaInstallBtn').addEventListener('click', function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                document.getElementById('pwaBanner').style.display = 'none';
                deferredPrompt = null;
            });
        }
    });
    
    // Window resize for zoom
    window.addEventListener('resize', function() {
        if (document.getElementById('previewModal').style.display === 'flex') {
            const zoomVal = document.getElementById('zoomSlider').value;
            applyZoom(parseFloat(zoomVal) / 100);
        }
    });
}

// ============================================================
// PWA
// ============================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js', { scope: '' })
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwaBanner');
    if (banner) {
        banner.style.display = 'flex';
        banner.style.opacity = '1';
        banner.style.transition = 'opacity 1s ease';
        setTimeout(function() {
            banner.style.opacity = '0';
            setTimeout(function() {
                banner.style.display = 'none';
            }, 1000);
        }, 6000);
    }
});

window.addEventListener('appinstalled', function() {
    console.log('LAVU label-studio was successfully installed.');
    const banner = document.getElementById('pwaBanner');
    if (banner) banner.style.display = 'none';
});