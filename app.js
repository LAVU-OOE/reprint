// app.js
import { LabelCore } from './core.js';

const DOM = {
  artNrSelect: document.getElementById('i1'), // Resolved global collision path
  bezSelect: document.getElementById('i2'),
  statusAlert: document.getElementById('status-alert')
};

let activeSortimentData = [];

async function loadExternalData() {
  const fallbackSortiment = [
    { "artNr": "1000", "bez": "Textilen", "geb": "" }
  ];

  try {
    const response = await fetch('https://sortiment-api.lavu-ooe.workers.dev/');
    if (!response.ok) throw new Error("Network configuration returned non-200 state");
    
    activeSortimentData = await response.json();
    localStorage.setItem('lavu_studio_sortiment_v9', JSON.stringify(activeSortimentData));
  } catch (error) {
    console.warn("Worker unreachable. Pulling cached assets...", error);
    
    // Fallback securely checks core cache layer instead of hard-erasing active data structures
    activeSortimentData = LabelCore.getLocalCache('lavu_studio_sortiment_v9', fallbackSortiment);
    
    if (DOM.statusAlert) {
      DOM.statusAlert.textContent = "Offline Mode active. Using cached assortment.";
      DOM.statusAlert.style.display = "block";
    }
  }

  // Safely triggers selection rendering mappings using the renamed controller function
  refreshDropdowns();
}

function refreshDropdowns() {
  if (activeSortimentData && DOM.artNrSelect && DOM.bezSelect) {
    LabelCore.renderSelectionDropdowns(activeSortimentData, DOM.artNrSelect, DOM.bezSelect);
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', loadExternalData);