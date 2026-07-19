// core.js
export const LabelCore = {
  // Correctly maps matching keys to the dataset array layout
  renderSelectionDropdowns(sortedData, artNrDropdown, bezDropdown) {
    if (!artNrDropdown || !bezDropdown) return;
    
    // Clear legacy options
    artNrDropdown.innerHTML = '<option value="">-- Artikel Nr --</option>';
    bezDropdown.innerHTML = '<option value="">-- Bezeichnung auswählen --</option>';

    if (!Array.isArray(sortedData)) return;

    sortedData.forEach(item => {
      // 1. Map Article Number Dropdown
      let opt1 = document.createElement('option');
      opt1.value = item.artNr;
      opt1.textContent = item.artNr;
      artNrDropdown.appendChild(opt1);

      // 2. Map Designation Dropdown (patched keys from 'bezeichnung' to 'bez' and 'suffix' to 'geb')
      let opt2 = document.createElement('option');
      opt2.value = item.artNr;
      opt2.textContent = `${item.bez} ${item.geb || ''}`.trim(); 
      bezDropdown.appendChild(opt2);
    });
  },

  // Securely check local storage caches before defaulting to destructive fallback states
  getLocalCache(key, fallbackValue) {
    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : fallbackValue;
    } catch (e) {
      console.warn(`Cache parsing failed for key: ${key}`, e);
      return fallbackValue;
    }
  }
};