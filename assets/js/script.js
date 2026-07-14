let a2 = [];
let a3 = 'select';
let currentLang = localStorage.getItem('lavu_lang') || 'de';
let locationData = [];
const LOCATION_JSON_URL = "https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/locations.json";

const sortimentData = [
    { artNr: "1000", bez: "Textilen" },
    { artNr: "2100", bez: "Kartonagen (ARA-lizenziert)" },
    { artNr: "2200", bez: "Metallverpackungen" },
    { artNr: "2210", bez: "Metallverpackungen - geöffnete Gasbehältnisse" },
    { artNr: "2300", bez: "Glasverpackungen" },
    { artNr: "2400", bez: "Getränke-Verbundkartons" },
    { artNr: "2520", bez: "Eimer & Kanister" },
    { artNr: "2540", bez: "Kunststoff Verpackungsfolien" },
    { artNr: "2555", bez: "Big-Bags" },
    { artNr: "2565", bez: "EPS-Styropor" },
    { artNr: "2580", bez: "Holzverpackungen" },
    { artNr: "2590", bez: "Keramikverpackungen" },
    { artNr: "3000", bez: "Altpapier (Deinking-Qualität)" },
    { artNr: "3005", bez: "Datenschutzpapier" },
    { artNr: "3210", bez: "Nichteisen-Metalle" },
    { artNr: "3211", bez: "Armaturen & Messing" },
    { artNr: "3212", bez: "Alu-Kaffeekapseln" },
    { artNr: "3220", bez: "Kabelschrott" },
    { artNr: "3300", bez: "Flachglas" },
    { artNr: "3310", bez: "Altfenster PVC" },
    { artNr: "3315", bez: "Altfenster PVC" },
    { artNr: "3320", bez: "Flachglas" },
    { artNr: "3400", bez: "Speisefett/-öl (Haushalts-Öl)" },
    { artNr: "3405", bez: "Speisefett/-öl (Gastro-Öl)" },
    { artNr: "3410", bez: "Speisefett/-öl (in Kleingebinden)" },
    { artNr: "3430", bez: "Kerzen" },
    { artNr: "3500", bez: "Altreifen" },
    { artNr: "3520", bez: "Hartkunststoffe" },
    { artNr: "3526", bez: "Kunststoff-Mülltonnen" },
    { artNr: "3540", bez: "Kunststoff-Sonstige Folien" },
    { artNr: "3560", bez: "Filmmaterial" },
    { artNr: "3572", bez: "Compact-Disk (CD)" },
    { artNr: "3580", bez: "Sonderreifen" },
    { artNr: "3585", bez: "Reifen m. Felgen" },
    { artNr: "3600", bez: "Mineralischer Bauschutt" },
    { artNr: "3610", bez: "Gipskarton" },
    { artNr: "3700", bez: "Altholz" },
    { artNr: "3805", bez: "Ersatzbrennstoff" },
    { artNr: "4010", bez: "Elektro-Großgeräte" },
    { artNr: "4015", bez: "Nachtspeicheröfen" },
    { artNr: "4020", bez: "Kühlgeräte" },
    { artNr: "4030", bez: "Bildschirmgeräte" },
    { artNr: "4031", bez: "Flachbildschirmgeräte" },
    { artNr: "4040", bez: "Elektro-Kleingeräte" },
    { artNr: "4041", bez: "Elektro-Kleingeräte,schadst. f." },
    { artNr: "4050", bez: "Gasentladungslampen" },
    { artNr: "4051", bez: "Gasentladungslampen Sonderformen" },
    { artNr: "4100", bez: "Gerätebatterien" },
    { artNr: "4110", bez: "Fahrzeugbatterien" },
    { artNr: "4111", bez: "Lithium-Batterien" },
    { artNr: "4120", bez: "Ni-Cd Akkumulatoren" },
    { artNr: "4125", bez: "Traktionsbatterien" },
    { artNr: "4200", bez: "Altöle" },
    { artNr: "4221", bez: "Feuerlöscher" },
    { artNr: "4230", bez: "Gasflaschen" },
    { artNr: "4250", bez: "Altöl" },
    { artNr: "4260", bez: "Lösemittel-Wassergemische" },
    { artNr: "4270", bez: "Säurengemische" },
    { artNr: "4275", bez: "Laugengemische" },
    { artNr: "4280", bez: "Ölverunreinigtes Erdmaterial" },
    { artNr: "4300", bez: "Altlacke & Werkstättenabfälle" },
    { artNr: "4305", bez: "Lack- & Farbschlamm" },
    { artNr: "4310", bez: "Kunststoffemballagen (mit schädlichen Restinhalten)" },
    { artNr: "4320", bez: "Öl-/Wassergemische & Emulsionen" },
    { artNr: "4325", bez: "Ölschlamm & Ölgatsch" },
    { artNr: "4330", bez: "Schädlingsbekämpfungs- & Chemikalienreste" },
    { artNr: "4340", bez: "Altmedikamente (unsortierte Arzneien)" },
    { artNr: "4350", bez: "Spraydosen (mit Restinhalt)" },
    { artNr: "4360", bez: "Spraydosen (mit Restinhalt)" },
    { artNr: "4380", bez: "Kondensatoren" },
    { artNr: "4390", bez: "XPS-Dämmplatten" },
    { artNr: "4395", bez: "Mineralwolle" },
    { artNr: "4430", bez: "Netze & Schnüre" },
    { artNr: "4450", bez: "Dispersionsfarben" },
    { artNr: "4460", bez: "Altmedikamente (vorsortiert)" },
    { artNr: "4461", bez: "Altmedikamente (vorsortiert/Apotheken)" },
    { artNr: "4464", bez: "Injektionsnadeln" },
    { artNr: "4465", bez: "Injektionsnadeln (aus Spitälern)" },
    { artNr: "5100", bez: "Ungefährliche medizinische Abfälle" },
    { artNr: "9900", bez: "Hilfsgebinde" }
];

const i18n = {
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
        tabSelect: "Sortiment wählen",
        tabManage: "Datenbank verwalten",
        lblUrl: "Zentrale Sortiment-URL (GitHub Raw JSON):",
        btnUpdate: "Aktualisieren",
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
        locationError: "Fehler beim Laden der Standorte"
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
        tabSelect: "Select Assortment",
        tabManage: "Manage Database",
        lblUrl: "Central Assortment URL (GitHub Raw JSON):",
        btnUpdate: "Update",
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
        locationError: "Error loading locations"
    }
};

const formats = {
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

let currentFormatKey = "4473";
let fallbackSortiment = [
    { artNr: "4040", bez: "Elektro-Kleingeräte (ohne Akku)", geb: "QR-Box" },
    { artNr: "4010", bez: "Elektro-Großgeräte", geb: "Gitterbox" },
    { artNr: "3120", bez: "Altholz thermisch (beschichtet)", geb: "Mulde" },
    { artNr: "3110", bez: "Altholz stofflich (unbeschichtet)", geb: "Container" },
    { artNr: "1720", bez: "Altmetall / Schrott", geb: "Mulde" },
    { artNr: "1610", bez: "Verpackungsholz (Paletten)", geb: "Stapel" },
    { artNr: "1410", bez: "Altpapier (Kartonagen)", geb: "Presse" },
    { artNr: "1420", bez: "Altpapier (Mischpapier)", geb: "Umleersystem" },
    { artNr: "5510", bez: "Bauschutt rein", geb: "Mulde" },
    { artNr: "5530", bez: "Baustellenabfälle gemischt", geb: "Großcontainer" }
];

// DEFAULT LOCATION: ASZ Asten (106)
const DEFAULT_LOCATION_VALUE = "106";

function populateLocationDropdowns(locations) {
    const s1 = document.getElementById('s1');
    const i1 = document.getElementById('i1');
    if (!s1 || !i1) return;
    s1.innerHTML = '';
    i1.innerHTML = '';
    if (!locations || locations.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = i18n[currentLang].locationError || 'No locations found';
        option.disabled = true;
        option.selected = true;
        s1.appendChild(option);
        i1.appendChild(option.cloneNode(true));
        return;
    }
    const grouped = {};
    locations.forEach(loc => {
        const region = loc.region || 'Andere';
        if (!grouped[region]) {
            grouped[region] = [];
        }
        grouped[region].push(loc);
    });
    const sortedRegions = Object.keys(grouped).sort();
    sortedRegions.forEach(region => {
        const optgroupS1 = document.createElement('optgroup');
        const optgroupI1 = document.createElement('optgroup');
        optgroupS1.label = region;
        optgroupI1.label = region;
        const sortedLocs = grouped[region].sort((a, b) => a.name.localeCompare(b.name, 'de'));
        sortedLocs.forEach(loc => {
            const value = loc.siteCode || loc.name;
            const displayName = loc.siteCode ? `${loc.name} (${loc.siteCode})` : loc.name;
            const optionS1 = document.createElement('option');
            optionS1.value = value;
            optionS1.textContent = displayName;
            optgroupS1.appendChild(optionS1);
            const optionI1 = document.createElement('option');
            optionI1.value = value;
            optionI1.textContent = displayName;
            optgroupI1.appendChild(optionI1);
        });
        s1.appendChild(optgroupS1);
        i1.appendChild(optgroupI1);
    });
    
    // Set default to "ASZ Asten (106)" - value "106"
    // First check if there's a saved location, otherwise use default
    const savedLocation = localStorage.getItem('lavu_location');
    let targetValue = savedLocation || DEFAULT_LOCATION_VALUE;
    
    // If saved location exists and is valid, use it
    if (savedLocation && s1.querySelector('option[value="' + savedLocation + '"]')) {
        targetValue = savedLocation;
    }
    
    // If the target value doesn't exist in dropdown, use first available
    if (!s1.querySelector('option[value="' + targetValue + '"]')) {
        // Try to find by siteCode
        const defaultLoc = locations.find(loc => loc.siteCode === DEFAULT_LOCATION_VALUE);
        if (defaultLoc && s1.querySelector('option[value="' + defaultLoc.siteCode + '"]')) {
            targetValue = defaultLoc.siteCode;
        } else {
            // Fallback to first option
            for (let opt of s1.options) {
                if (!opt.disabled && opt.value) {
                    targetValue = opt.value;
                    break;
                }
            }
        }
    }
    
    // Apply the selected value
    if (targetValue && s1.querySelector('option[value="' + targetValue + '"]')) {
        s1.value = targetValue;
        i1.value = targetValue;
        // Save to localStorage
        localStorage.setItem('lavu_location', targetValue);
    }
}

function loadLocations() {
    const s1 = document.getElementById('s1');
    const i1 = document.getElementById('i1');
    const t = i18n[currentLang];
    if (s1) {
        s1.innerHTML = '';
        const loadingOpt = document.createElement('option');
        loadingOpt.value = '';
        loadingOpt.textContent = t.locationLoading || 'Loading locations...';
        loadingOpt.disabled = true;
        loadingOpt.selected = true;
        s1.appendChild(loadingOpt);
    }
    if (i1) {
        i1.innerHTML = '';
        const loadingOpt = document.createElement('option');
        loadingOpt.value = '';
        loadingOpt.textContent = t.locationLoading || 'Loading locations...';
        loadingOpt.disabled = true;
        loadingOpt.selected = true;
        i1.appendChild(loadingOpt);
    }
    const cachedLocations = localStorage.getItem('lavu_locations_cache');
    if (cachedLocations) {
        try {
            const parsed = JSON.parse(cachedLocations);
            if (Array.isArray(parsed) && parsed.length > 0) {
                locationData = parsed;
                populateLocationDropdowns(locationData);
            }
        } catch (e) {}
    }
    fetch(LOCATION_JSON_URL, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                locationData = data;
                localStorage.setItem('lavu_locations_cache', JSON.stringify(locationData));
                populateLocationDropdowns(locationData);
            } else {
                throw new Error("Invalid location data format");
            }
        })
        .catch(err => {
            console.warn("Error loading locations from URL, using fallback:", err);
            if (!locationData || locationData.length === 0) {
                locationData = [
                    { siteCode: "106", name: "ASZ Asten", zipCode: "4481", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Ansfelden", zipCode: "4053", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Enns", zipCode: "4470", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Hörsching", zipCode: "4063", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Leonding", zipCode: "4060", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Neuhofen", zipCode: "4501", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Pasching", zipCode: "4061", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ St. Florian", zipCode: "4490", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Traun", zipCode: "4050", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Wilhering", zipCode: "4073", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Linz-Nebingerstraße", zipCode: "4020", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Linz-Mostnnystraße", zipCode: "4040", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Linz-Wiener Straße", zipCode: "4030", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Linz-Dornach", zipCode: "4040", region: "Linz-Land & Linz Stadt" },
                    { siteCode: "N/G", name: "ASZ Wels-Nord", zipCode: "4600", region: "Wels & Wels-Land" },
                    { siteCode: "N/G", name: "ASZ Wels-Kenten", zipCode: "4600", region: "Wels & Wels-Land" },
                    { siteCode: "N/G", name: "ASZ Marchtrenk", zipCode: "4614", region: "Wels & Wels-Land" },
                    { siteCode: "N/G", name: "ASZ Gunskirchen", zipCode: "4623", region: "Wels & Wels-Land" },
                    { siteCode: "N/G", name: "ASZ Thalheim", zipCode: "4600", region: "Wels & Wels-Land" },
                    { siteCode: "N/G", name: "ASZ Steyr", zipCode: "4400", region: "Steyr & Steyr-Land" },
                    { siteCode: "N/G", name: "ASZ Bad Hall", zipCode: "4540", region: "Steyr & Steyr-Land" },
                    { siteCode: "N/G", name: "ASZ Garsten", zipCode: "4451", region: "Steyr & Steyr-Land" },
                    { siteCode: "N/G", name: "ASZ Sierning", zipCode: "4522", region: "Steyr & Steyr-Land" }
                ];
                populateLocationDropdowns(locationData);
            }
        });
}

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
        if (!groups[letter]) {
            groups[letter] = [];
        }
        groups[letter].push(item);
    });
    return groups;
}

function groupByNumericRange(items) {
    const groups = {};
    items.forEach(item => {
        const num = parseInt(item.artNr) || 0;
        const groupKey = Math.floor(num / 1000);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
    });
    return groups;
}

function populateNameDropdownWithGroups(selectElement, items) {
    if (!selectElement) return;
    const groups = groupByFirstLetter(items);
    const sortedLetters = Object.keys(groups).sort();
    selectElement.innerHTML = '';
    sortedLetters.forEach((letter) => {
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
    sortedKeys.forEach((key) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = key;
        const sortedItems = groups[key].sort((a, b) => {
            return (parseInt(a.artNr) || 0) - (parseInt(b.artNr) || 0);
        });
        sortedItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.artNr;
            option.textContent = '· ' + item.artNr;
            optgroup.appendChild(option);
        });
        selectElement.appendChild(optgroup);
    });
}

function i1() {
    const selectArt = document.getElementById('s2_art');
    const selectName = document.getElementById('s2_name');
    if (!selectArt || !selectName) return;
    const currentSelectedArtNr = selectArt.value;
    populateArtDropdownWithGroups(selectArt, a2);
    populateNameDropdownWithGroups(selectName, a2);
    if (currentSelectedArtNr !== "") {
        if (selectArt.querySelector('option[value="' + currentSelectedArtNr + '"]')) {
            selectArt.value = currentSelectedArtNr;
        }
        if (selectName.querySelector('option[value="' + currentSelectedArtNr + '"]')) {
            selectName.value = currentSelectedArtNr;
        }
    } else if (a2.length > 0) {
        const firstItem = a2[0];
        if (selectArt.querySelector('option[value="' + firstItem.artNr + '"]')) {
            selectArt.value = firstItem.artNr;
        }
        if (selectName.querySelector('option[value="' + firstItem.artNr + '"]')) {
            selectName.value = firstItem.artNr;
        }
    }
    r1();
    p1();
}

document.addEventListener('DOMContentLoaded', function () {
    a2 = sortimentData.slice();
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
    loadLocations();
    initFormatSelects();
    initHeaderSelects();
    applyLanguage();
    l1();
    setupEventListeners();
    let a4 = localStorage.getItem('lavu_sortiment_url');
    if (a4 === null) {
        a4 = "https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/sortiment.json";
        localStorage.setItem('lavu_sortiment_url', a4);
    }
    document.getElementById('i4').value = a4;
    const t = i18n[currentLang];
    document.getElementById('n1').innerHTML = t.netLoading;
    document.getElementById('n1').style.color = '#f39c12';
    f2();
    u1();
    const savedZoom = localStorage.getItem('lavu_preview_zoom') || '100';
    document.getElementById('zoomSlider').value = savedZoom;
    applyFastZoom(savedZoom);
    document.getElementById('s1').addEventListener('change', function () {
        const val = this.value;
        document.getElementById('i1').value = val;
        localStorage.setItem('lavu_location', val);
        u1();
        s7();
    });
    document.getElementById('i1').addEventListener('change', function () {
        const val = this.value;
        document.getElementById('s1').value = val;
        localStorage.setItem('lavu_location', val);
        u1();
        s7();
    });
});

function setupEventListeners() {
    document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);
    document.getElementById('s1').addEventListener('change', function () {
        x1(this.value);
        s7();
    });
    document.getElementById('i1').addEventListener('change', function () {
        x2(this.value);
    });
    document.getElementById('btn-print-now').addEventListener('click', function () {
        window.print();
    });
    document.getElementById('btn-options').addEventListener('click', o2);
    document.getElementById('modal1CloseBtn').addEventListener('click', c2);
    document.getElementById('m1').addEventListener('click', function (e) {
        if (e.target.id === 'm1') c2();
    });
    document.getElementById('modal2CloseBtn').addEventListener('click', c5);
    document.getElementById('m2').addEventListener('click', function (e) {
        if (e.target.id === 'm2') c5();
    });
    document.getElementById('btn-modal-print').addEventListener('click', function () {
        window.print();
    });
    document.getElementById('btn-modal-close').addEventListener('click', c5);
    document.getElementById('labelFormatSelect').addEventListener('change', function () {
        changeFormat(this.value);
        s7();
    });
    document.getElementById('modalLabelFormatSelect').addEventListener('change', function () {
        changeFormat(this.value);
    });
    document.getElementById('layout-title-attr').addEventListener('click', o1);
    document.getElementById('i2').addEventListener('input', function () {
        u1();
        s7();
    });
    document.getElementById('i3').addEventListener('input', function () {
        u1();
        s7();
    });
    document.getElementById('t2').addEventListener('click', function () {
        m2('select');
    });
    document.getElementById('t3').addEventListener('click', function () {
        m2('input');
    });
    document.getElementById('btn-update').addEventListener('click', function () {
        localStorage.setItem('lavu_sortiment_url', document.getElementById('i4').value.trim());
        f2();
    });
    document.getElementById('btn-add-new').addEventListener('click', s3);
    document.getElementById('btn-cancel').addEventListener('click', e1);
    document.getElementById('btn-download-json').addEventListener('click', e2);
    document.getElementById('b1').addEventListener('click', s4);
    document.getElementById('b2').addEventListener('click', s6);
    document.getElementById('btn-done').addEventListener('click', function () {
        document.getElementById('m1').style.display = 'none';
    });
    document.getElementById('zoomSlider').addEventListener('input', function () {
        applyFastZoom(this.value);
    });
    document.getElementById('s2_art').addEventListener('change', function () {
        syncDropdowns(this.value);
    });
    document.getElementById('s2_name').addEventListener('change', function () {
        syncDropdowns(this.value);
    });
    document.getElementById('b3').addEventListener('click', function () {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function (choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                document.getElementById('pwaBanner').style.display = 'none';
                deferredPrompt = null;
            });
        }
    });
    window.addEventListener('resize', function () {
        if (document.getElementById('m2').style.display === 'flex') {
            const zoomVal = document.getElementById('zoomSlider').value;
            s8(parseFloat(zoomVal) / 100);
        }
    });
}

function toggleLanguage() {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    localStorage.setItem('lavu_lang', currentLang);
    applyLanguage();
    u1();
    r1();
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
    printLayoutEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.printLayout}`;
    document.getElementById('txt-art-nr').textContent = t.artNr;
    document.getElementById('txt-bezeichnung').textContent = t.bezeichnung;
    const printBtn = document.getElementById('btn-print-now');
    printBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.printNow}`;
    const optionsBtn = document.getElementById('btn-options');
    optionsBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> ${t.options}`;
    document.getElementById('txt-modal1-title').textContent = t.modal1Title;
    document.getElementById('lbl-location').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${t.lblLocation}`;
    document.getElementById('lbl-format').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg> ${t.lblFormat}`;
    document.getElementById('txt-tab-select').textContent = t.tabSelect;
    document.getElementById('txt-tab-manage').textContent = t.tabManage;
    document.getElementById('lbl-url').innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> ${t.lblUrl}`;
    document.getElementById('btn-update').textContent = t.btnUpdate;
    document.getElementById('lbl-db-suffix').textContent = t.lblDbSuffix;
    document.getElementById('lbl-db-bez').textContent = t.lblDbBez;
    document.getElementById('btn-add-new').textContent = t.btnAddNew;
    document.getElementById('btn-cancel').textContent = t.btnCancel;
    document.getElementById('btn-download-json').textContent = t.btnDownloadJson;
    document.getElementById('lbl-current-entries').textContent = t.lblCurrentEntries;
    document.getElementById('btn-save-default').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> ${t.btnSaveDefault}`;
    document.getElementById('btn-done').textContent = t.btnDone;
    document.getElementById('modalTitle').textContent = t.modal2Title;
    const modalPrintBtn = document.getElementById('btn-modal-print');
    modalPrintBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> ${t.btnModalPrint}`;
    document.getElementById('btn-modal-close').textContent = t.btnModalClose;
    document.getElementById('txt-pwa-title').textContent = t.txtPwaTitle;
    document.getElementById('txt-pwa-sub').textContent = t.txtPwaSub;
    document.getElementById('b3').textContent = t.btnPwaInstall;
    document.getElementById('layout-title-attr').setAttribute('title', t.layoutTitleAttr);
    const f = formats[currentFormatKey];
    const maxLabels = f.cols * f.rows;
    document.getElementById('lblCount').textContent = `${t.lblCount} (max. ${maxLabels}):`;
    document.getElementById('lblStartPos').textContent = `${t.lblStartPos} (1-${maxLabels}):`;
    changeFormat(currentFormatKey);
}

function applyFastZoom(value) {
    document.getElementById('zoomVal').textContent = value + '%';
    const element = document.getElementById('p1');
    if (element) {
        s8(parseFloat(value) / 100);
    }
    localStorage.setItem('lavu_preview_zoom', value);
}

function initFormatSelects() {
    const selectSettings = document.getElementById('labelFormatSelect');
    const selectModal = document.getElementById('modalLabelFormatSelect');
    [selectSettings, selectModal].forEach(function (select) {
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

function initHeaderSelects() {}

function changeFormat(key) {
    currentFormatKey = key;
    const selectSettings = document.getElementById('labelFormatSelect');
    const selectModal = document.getElementById('modalLabelFormatSelect');
    if (selectSettings) selectSettings.value = key;
    if (selectModal) selectModal.value = key;
    const f = formats[key];
    const maxLabels = f.cols * f.rows;
    const i2 = document.getElementById('i2');
    const i3 = document.getElementById('i3');
    const t = i18n[currentLang];
    document.getElementById('lblCount').textContent = `${t.lblCount} (max. ${maxLabels}):`;
    document.getElementById('lblStartPos').textContent = `${t.lblStartPos} (1-${maxLabels}):`;
    i2.max = maxLabels;
    i3.max = maxLabels;
    if (parseInt(i2.value) > maxLabels) i2.value = maxLabels;
    if (parseInt(i3.value) > maxLabels) i3.value = 1;
    u1();
}

function f2() {
    let a4 = localStorage.getItem('lavu_sortiment_url') || "https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/sortiment.json";
    const t = i18n[currentLang];
    fetch(a4, { cache: "no-store" })
        .then(function (response) {
            if (!response.ok) throw new Error("Netzwerkantwort war fehlerhaft");
            return response.json();
        })
        .then(function (data) {
            if (Array.isArray(data) && data.length > 0) {
                a2 = data;
                localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
                if (a4 === "sortiment.json") {
                    document.getElementById('n1').innerHTML = t.netSuccessLocal;
                } else {
                    document.getElementById('n1').innerHTML = t.netSuccessRemote;
                }
                document.getElementById('n1').style.color = '#27ae60';
                i1();
            }
        })
        .catch(function (e) {
            console.warn("Fehler beim Abrufen der JSON-Quelle, weiche auf cache / localStorage aus.", e);
            if (a4 === "sortiment.json") {
                document.getElementById('n1').innerHTML = t.netFallbackLocal;
            } else {
                document.getElementById('n1').innerHTML = t.netFallbackRemote;
            }
            document.getElementById('n1').style.color = '#e74c3c';
            const a7 = localStorage.getItem('lavu_studio_sortiment_v8');
            if (a7) {
                try {
                    a2 = JSON.parse(a7);
                } catch (e) {
                    a2 = fallbackSortiment.slice();
                }
            } else {
                a2 = fallbackSortiment.slice();
            }
            i1();
        });
}

function syncDropdowns(selectedArtNr) {
    const selectArt = document.getElementById('s2_art');
    const selectName = document.getElementById('s2_name');
    if (selectArt && selectArt.querySelector('option[value="' + selectedArtNr + '"]')) {
        selectArt.value = selectedArtNr;
    }
    if (selectName && selectName.querySelector('option[value="' + selectedArtNr + '"]')) {
        selectName.value = selectedArtNr;
    }
    p1();
    s7();
}

function p1() {
    const selectArt = document.getElementById('s2_art');
    if (!selectArt || selectArt.value === "") return;
    const currentArtNr = selectArt.value;
    const item = a2.find(function (i) { return i.artNr === currentArtNr; });
    if (item) {
        document.getElementById('i5').value = item.artNr;
        document.getElementById('i6').value = item.geb || "";
        document.getElementById('i7').value = item.bez;
        u1();
    }
}

function x1(a15) {
    document.getElementById('i1').value = a15;
    localStorage.setItem('lavu_location', a15);
    u1();
    s7();
}

function x2(a15) {
    document.getElementById('s1').value = a15;
    localStorage.setItem('lavu_location', a15);
    u1();
    s7();
}

function m2(a16) {
    a3 = a16;
    document.getElementById('t2').classList.toggle('a', a16 === 'select');
    document.getElementById('t3').classList.toggle('a', a16 === 'input');
    document.getElementById('s3').classList.toggle('a', a16 === 'select');
    document.getElementById('s4').classList.toggle('a', a16 === 'input');
}

function r1() {
    const a17 = document.getElementById('c4');
    if (!a17) return;
    a17.innerHTML = '';
    a2.forEach(function (a12, a13) {
        const a18 = document.createElement('div');
        a18.className = 'cir';
        a18.innerHTML = `
            <div class="cii">
                <b>${a12.artNr}</b> - ${a12.bez} <span style="color:#7f8c8d; font-size:0.75rem;">(${a12.geb || '-'})</span>
            </div>
            <div style="display: flex; gap: 4px;">
                <button class="bc" style="padding: 3px 6px; background: #3498db; color: white; font-size: 0.75rem;" data-index="${a13}" data-action="edit">✏️</button>
                <button class="bc" style="padding: 3px 6px; background: #e74c3c; color: white; font-size: 0.75rem;" data-index="${a13}" data-action="delete">🗑️</button>
            </div>
        `;
        a17.appendChild(a18);
        a18.querySelector('[data-action="edit"]').addEventListener('click', function () {
            e3(parseInt(this.dataset.index));
        });
        a18.querySelector('[data-action="delete"]').addEventListener('click', function () {
            d1(parseInt(this.dataset.index));
        });
    });
}

function e3(a13) {
    const a12 = a2[a13];
    document.getElementById('e1').value = a13;
    document.getElementById('c1').value = a12.artNr;
    document.getElementById('c2').value = a12.geb || "";
    document.getElementById('c3').value = a12.bez;
    document.getElementById('b1').style.display = 'inline-block';
}

function d1(a13) {
    const t = i18n[currentLang];
    if (confirm(t.confirmDelete)) {
        a2.splice(a13, 1);
        localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
        i1();
        s7();
    }
}

function e1() {
    document.getElementById('e1').value = "";
    document.getElementById('c1').value = "";
    document.getElementById('c2').value = "";
    document.getElementById('c3').value = "";
    document.getElementById('b1').style.display = 'none';
}

function s4() {
    const index = document.getElementById('e1').value;
    const c1 = document.getElementById('c1').value.trim();
    const c2 = document.getElementById('c2').value.trim();
    const c3 = document.getElementById('c3').value.trim();
    const t = i18n[currentLang];
    if (index === "" || !c1 || !c3) {
        alert(t.alertErrorChange);
        return;
    }
    a2[index] = { artNr: c1, geb: c2, bez: c3 };
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
    i1();
    e1();
    s7();
}

function e2() {
    try {
        const a24 = JSON.stringify(a2, null, 2);
        const a25 = new Blob([a24], { type: "application/json" });
        const a26 = URL.createObjectURL(a25);
        const a27 = document.createElement('a');
        a27.href = a26;
        a27.download = "sortiment_export.json";
        document.body.appendChild(a27);
        a27.click();
        document.body.removeChild(a27);
        URL.revokeObjectURL(a26);
    } catch (a28) {
        console.error("Fehler beim Exportieren:", a28);
        alert("Export failed: " + a28.message);
    }
}

function getLocationDisplayName(locationValue) {
    if (!locationValue || !locationData || locationData.length === 0) return locationValue;
    const found = locationData.find(loc => (loc.siteCode && loc.siteCode === locationValue) || loc.name === locationValue);
    if (found) {
        return found.siteCode ? `${found.name} (${found.siteCode})` : found.name;
    }
    return locationValue;
}

function g1() {
    const selectArt = document.getElementById('s2_art');
    const locationValue = document.getElementById('i1').value;
    const locationDisplayName = getLocationDisplayName(locationValue);
    return {
        topText: locationDisplayName,
        artNr: document.getElementById('i5').value.trim(),
        suffix: document.getElementById('i6').value.trim(),
        bezeichnung: document.getElementById('i7').value.trim(),
        count: parseInt(document.getElementById('i2').value) || 0,
        startPos: parseInt(document.getElementById('i3').value) || 1,
        sortimentIndex: selectArt ? selectArt.value : "0"
    };
}

function u1() {
    const a29 = g1();
    const f = formats[currentFormatKey];
    document.getElementById('d0').textContent = a29.topText || '-';
    document.getElementById('d1').textContent = a29.bezeichnung || '-';
    document.getElementById('d2').textContent = a29.artNr || '-';
    const badge = document.getElementById('d3');
    if (a29.suffix) {
        badge.textContent = a29.suffix;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
    const t = i18n[currentLang];
    const layoutTranslationText = currentLang === 'de' ? 'ab Position' : 'from position';
    document.getElementById('d4').textContent = `${t.printLayout}: ${a29.count}x ${layoutTranslationText} ${a29.startPos}`;
    document.getElementById('s1').value = document.getElementById('i1').value;
    document.getElementById('fmt-overlay').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg> ${f.name}
    `;
    r2('t1', a29);
    r2('mdl', a29);
    r2('d5', a29);
    if (document.getElementById('m2').style.display === 'flex') {
        const zoomVal = document.getElementById('zoomSlider').value;
        s8(parseFloat(zoomVal) / 100);
    }
}

function r2(a30, a29) {
    const a31 = document.getElementById(a30);
    if (!a31) return;
    a31.innerHTML = '';
    const f = formats[currentFormatKey];
    a31.style.gridTemplateColumns = `repeat(${f.cols}, 1fr)`;
    a31.style.gridTemplateRows = `repeat(${f.rows}, 1fr)`;
    const a32 = f.cols * f.rows;
    const a33 = a29.startPos;
    const a34 = a29.count;
    for (let i = 1; i <= a32; i++) {
        const a35 = document.createElement('div');
        if (i >= a33 && i < a33 + a34) {
            a35.className = 'lb';
            a35.innerHTML = `
                <div class="lbt">${a29.topText || '&nbsp;'}</div>
                <div class="lbm">
                    <div class="lba">${a29.artNr || '&nbsp;'}</div>
                    ${a29.suffix ? `<div class="lbs">${a29.suffix}</div>` : ''}
                </div>
                <div class="lbt bbb-fake-fix" style="border-bottom:none; font-size:1px; height:1px; line-height:1px;"></div>
                <div class="lbb">${a29.bezeichnung || '&nbsp;'}</div>
            `;
        } else {
            a35.className = 'lb e';
        }
        if (a30 === 'mdl') {
            a35.setAttribute('data-index', i);
            a35.addEventListener('click', function (e) {
                const a36 = parseInt(this.getAttribute('data-index'));
                let a37 = a36;
                let a38 = 'add';
                if (this.classList.contains('e')) {
                    a38 = 'add';
                } else {
                    a38 = 'remove';
                }
                s5(a37, a38);
            });
        }
        a31.appendChild(a35);
    }
}

function s5(a37, a38) {
    const f = formats[currentFormatKey];
    const maxLabels = f.cols * f.rows;
    const a39 = document.getElementById('i2');
    const a40 = document.getElementById('i3');
    let a41 = parseInt(a39.value) || 0;
    let a42 = parseInt(a40.value) || 1;
    let a43 = a42 + a41 - 1;
    if (a41 === 0) {
        a42 = a37;
        a41 = 1;
    } else {
        if (a38 === 'add') {
            if (a37 < a42) {
                a41 = a43 - a37 + 1;
                a42 = a37;
            } else if (a37 > a43) {
                a41 = a37 - a42 + 1;
            }
        } else if (a38 === 'remove') {
            if (a37 === a42) {
                a42++;
                a41--;
            } else if (a37 === a43) {
                a41--;
            } else {
                a41 = a37 - a42;
            }
        }
    }
    a41 = Math.max(0, Math.min(maxLabels, a41));
    a42 = Math.max(1, Math.min(maxLabels, a42));
    a39.value = a41;
    a40.value = a42;
    u1();
    s7();
}

function s8(customZoomFactor) {
    customZoomFactor = customZoomFactor || 1;
    const container = document.querySelector('.mbs');
    const element = document.getElementById('p1');
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
    element.style.transform = 'translate(-50%, -50%) scale(' + finalScale + ')';
}

function o2() {
    document.getElementById('m1').style.display = 'flex';
    r1();
}

function c2() {
    document.getElementById('m1').style.display = 'none';
}

function o1() {
    u1();
    document.getElementById('m2').style.display = 'flex';
    const zoomVal = document.getElementById('zoomSlider').value;
    setTimeout(function () {
        s8(parseFloat(zoomVal) / 100);
    }, 50);
}

function c5() {
    document.getElementById('m2').style.display = 'none';
}

function s6() {
    const f = formats[currentFormatKey];
    const maxLabels = f.cols * f.rows;
    const i2 = document.getElementById('i2');
    const i3 = document.getElementById('i3');
    if (parseInt(i2.value) > maxLabels) i2.value = maxLabels;
    if (parseInt(i3.value) > maxLabels) i3.value = 1;
    s7();
    alert(i18n[currentLang].alertSaved);
}

function s7() {
    const data = g1();
    const config = {
        formatKey: currentFormatKey,
        topText: document.getElementById('i1').value,
        count: data.count,
        startPos: data.startPos,
        artNr: data.artNr,
        suffix: data.suffix,
        bezeichnung: data.bezeichnung,
        sortimentIndex: data.sortimentIndex
    };
    localStorage.setItem('lavu_studio_defaults_v8', JSON.stringify(config));
    localStorage.setItem('lavu_location', document.getElementById('i1').value);
}

function l1() {
    const a54Str = localStorage.getItem('lavu_studio_defaults_v8');
    if (a54Str) {
        try {
            const a54 = JSON.parse(a54Str);
            if (a54.formatKey !== undefined && formats[a54.formatKey]) {
                currentFormatKey = a54.formatKey;
                document.getElementById('labelFormatSelect').value = currentFormatKey;
                if (document.getElementById('modalLabelFormatSelect')) {
                    document.getElementById('modalLabelFormatSelect').value = currentFormatKey;
                }
            }
            const f = formats[currentFormatKey];
            const maxLabels = f.cols * f.rows;
            // Use saved location or fallback to default (106)
            const savedLocation = localStorage.getItem('lavu_location');
            const locationValue = (savedLocation && savedLocation !== '') ? savedLocation : DEFAULT_LOCATION_VALUE;
            document.getElementById('i1').value = locationValue;
            document.getElementById('s1').value = locationValue;
            if (a54.count !== undefined) document.getElementById('i2').value = Math.min(maxLabels, a54.count);
            if (a54.startPos !== undefined) document.getElementById('i3').value = Math.min(maxLabels, a54.startPos);
            if (a54.artNr !== undefined) document.getElementById('i5').value = a54.artNr;
            if (a54.suffix !== undefined) document.getElementById('i6').value = a54.suffix;
            if (a54.bezeichnung !== undefined) document.getElementById('i7').value = a54.bezeichnung;
            if (a54.sortimentIndex !== undefined) {
                setTimeout(function () {
                    syncDropdowns(a54.sortimentIndex);
                }, 100);
            }
            changeFormat(currentFormatKey);
        } catch (e) {
            console.warn("Fehler beim Verarbeiten lokaler Defaults.", e);
        }
    } else {
        // No saved defaults - set default location
        document.getElementById('i1').value = DEFAULT_LOCATION_VALUE;
        document.getElementById('s1').value = DEFAULT_LOCATION_VALUE;
        localStorage.setItem('lavu_location', DEFAULT_LOCATION_VALUE);
        changeFormat(currentFormatKey);
    }
}

function s3() {
    const c1 = document.getElementById('c1').value.trim();
    const c2 = document.getElementById('c2').value.trim();
    const c3 = document.getElementById('c3').value.trim();
    const t = i18n[currentLang];
    if (!c1 || !c3) {
        alert(t.alertFillForm);
        return;
    }
    if (a2.some(function (item) { return item.artNr === c1; })) {
        alert(t.alertDuplicate);
        return;
    }
    a2.push({ artNr: c1, geb: c2 || '-', bez: c3 });
    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
    i1();
    e1();
    s7();
}

let deferredPrompt;
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js', { scope: '' })
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    const a60Str = localStorage.getItem('lavu_studio_defaults_v8');
    let a61 = true;
    if (a60Str) {
        try {
            const a62 = JSON.parse(a60Str);
            if (a62.count && parseInt(a62.count) > 0) {
                a61 = false;
            }
        } catch (err) {}
    }
    if (a61) {
        const a63 = document.getElementById('pwaBanner');
        if (a63) {
            a63.style.display = 'flex';
            a63.style.opacity = '1';
            a63.style.transition = 'opacity 1s ease';
            setTimeout(function () {
                a63.style.opacity = '0';
                setTimeout(function () {
                    a63.style.display = 'none';
                }, 1000);
            }, 6000);
        }
    }
});

window.addEventListener('appinstalled', function () {
    console.log('LAVU Etiketten-Druckstudio wurde erfolgreich installiert.');
    const a63 = document.getElementById('pwaBanner');
    if (a63) a63.style.display = 'none';
});