// ===== Configuration & Endpoints =====
const ENDPOINTS = {
    sortiment: 'https://sortiment-api.lavu-ooe.workers.dev/',
    locations: 'https://locations-api.lavu-ooe.workers.dev/',
    printLayout: 'https://print-layout-api.lavu-ooe.workers.dev/'
};

let selectedEndpoint = 'sortiment';

// ===== DOM Elements with null checks =====
function getElements() {
    return {
        fileInput: document.getElementById('fileInput'),
        passwordInput: document.getElementById('passwordInput'),
        uploadBtn: document.getElementById('uploadBtn'),
        resultDiv: document.getElementById('result'),
        debugDiv: document.getElementById('debugArea'),
        endpointToggles: document.querySelectorAll('input[name="endpoint"]'),
        selectedEndpointText: document.getElementById('endpointDisplay'),
        togglePasswordBtn: document.getElementById('togglePassword'),
        fileInfo: document.getElementById('fileInfo'),
        stats: document.getElementById('stats'),
        itemCount: document.getElementById('itemCount'),
        fileSize: document.getElementById('fileSize'),
        debugToggle: document.getElementById('debugToggle')
    };
}

// ===== Helper Functions =====
function setDebug(message) {
    const elements = getElements();
    if (elements.debugDiv) {
        const timestamp = new Date().toLocaleTimeString();
        elements.debugDiv.textContent = `[${timestamp}] ${message}`;
    } else {
        console.log(`[DEBUG] ${message}`);
    }
}

function setResult(message, type) {
    const elements = getElements();
    if (elements.resultDiv) {
        elements.resultDiv.className = 'result ' + type;
        elements.resultDiv.textContent = message;
    } else {
        console.log(`[RESULT] ${message}`);
    }
}

function clearPassword() {
    const elements = getElements();
    if (elements.passwordInput) {
        elements.passwordInput.value = '';
        setResult('Password cleared for security.', '');
    }
}

function updateEndpointDisplay() {
    const elements = getElements();
    const endpointUrl = ENDPOINTS[selectedEndpoint];
    if (elements.selectedEndpointText) {
        elements.selectedEndpointText.textContent = endpointUrl;
    }
}

function toggleDebug() {
    const elements = getElements();
    if (elements.debugDiv) {
        elements.debugDiv.classList.toggle('visible');
        if (elements.debugToggle) {
            elements.debugToggle.textContent = elements.debugDiv.classList.contains('visible') 
                ? '🔧 Hide Debug' 
                : '🔧 Toggle Debug';
        }
    }
}

// ===== File Upload Logic =====
async function uploadFile() {
    const elements = getElements();
    const file = elements.fileInput ? elements.fileInput.files[0] : null;
    const password = elements.passwordInput ? elements.passwordInput.value.trim() : '';
    const endpointUrl = ENDPOINTS[selectedEndpoint];
    const endpointName = selectedEndpoint.toUpperCase();

    if (!file) {
        setResult('❌ Please select a JSON file first!', 'error');
        return;
    }

    if (!password) {
        setResult('❌ Password is required!', 'error');
        if (elements.passwordInput) elements.passwordInput.focus();
        return;
    }

    if (elements.uploadBtn) {
        elements.uploadBtn.disabled = true;
        elements.uploadBtn.textContent = '⏳ Uploading...';
    }
    setResult('Reading file...', '');
    setDebug(`Starting upload sequence for ${endpointName}...`);

    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            setDebug('JSON parsed successfully. Sending request...');

            const response = await fetch(endpointUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Auth': password
                },
                body: JSON.stringify(jsonData)
            });

            if (response.ok) {
                setResult(`✅ Success! ${endpointName} database updated successfully.`, 'success');
                setDebug(`HTTP ${response.status}: Upload completed.`);
                clearPassword(); 
            } else {
                let errorMsg = `Upload failed (Status: ${response.status})`;
                try {
                    const errData = await response.json();
                    if (errData.error) errorMsg = `❌ Error: ${errData.error}`;
                } catch(pErr) {
                    const textErr = await response.text();
                    if (textErr) errorMsg = `❌ Error: ${textErr}`;
                }
                setResult(errorMsg, 'error');
                setDebug(`Server rejected request with status ${response.status}`);
            }
        } catch (error) {
            setResult('❌ Invalid JSON file format!', 'error');
            setDebug('Error: ' + error.stack);
        } finally {
            if (elements.uploadBtn) {
                elements.uploadBtn.disabled = false;
                elements.uploadBtn.textContent = `📤 Upload ${endpointName} to Cloudflare`;
            }
        }
    };

    reader.onerror = function() {
        setResult('❌ Error reading file!', 'error');
        setDebug('FileReader error');
        if (elements.uploadBtn) {
            elements.uploadBtn.disabled = false;
            elements.uploadBtn.textContent = `📤 Upload ${endpointName} to Cloudflare`;
        }
    };

    reader.readAsText(file);
}

// ===== Initialize Event Listeners =====
function init() {
    const elements = getElements();
    
    // Endpoint toggles
    if (elements.endpointToggles) {
        elements.endpointToggles.forEach(toggle => {
            toggle.addEventListener('change', function(e) {
                if (e.target.checked) {
                    selectedEndpoint = e.target.value;
                    updateEndpointDisplay();
                    setDebug(`Switched endpoint to: ${selectedEndpoint}`);
                    
                    // Update label styling
                    document.querySelectorAll('.endpoint-selector label').forEach(label => {
                        label.classList.remove('selected');
                    });
                    const labelMap = {
                        'sortiment': 'labelSortiment',
                        'locations': 'labelLocations',
                        'printLayout': 'labelPrintLayout'
                    };
                    const labelId = labelMap[selectedEndpoint];
                    const label = document.getElementById(labelId);
                    if (label) label.classList.add('selected');
                }
            });
        });
    }

    // Password visibility toggle
    if (elements.togglePasswordBtn && elements.passwordInput) {
        elements.togglePasswordBtn.addEventListener('click', function() {
            const type = elements.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            elements.passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    // File input change handler
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file && elements.fileInfo) {
                elements.fileInfo.textContent = `📎 Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                setDebug(`File selected: ${file.name}`);
                
                if (elements.stats) elements.stats.style.display = 'flex';
                if (elements.fileSize) elements.fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
                
                // Try to count items
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (elements.itemCount) {
                            if (Array.isArray(data)) {
                                elements.itemCount.textContent = data.length;
                            } else if (typeof data === 'object') {
                                elements.itemCount.textContent = Object.keys(data).length;
                            }
                        }
                    } catch(err) {
                        if (elements.itemCount) elements.itemCount.textContent = '?';
                    }
                };
                reader.readAsText(file);
            } else if (elements.fileInfo) {
                elements.fileInfo.textContent = 'Select a valid JSON file with your data array.';
                if (elements.stats) elements.stats.style.display = 'none';
            }
        });
    }

    // Debug toggle
    if (elements.debugToggle) {
        elements.debugToggle.addEventListener('click', toggleDebug);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            uploadFile();
        }
        if (e.key === 'Escape') {
            clearPassword();
            setDebug('Password cleared (Escape key)');
        }
    });

    // Initial setup
    updateEndpointDisplay();
    setDebug('Ready');
    if (elements.debugDiv) elements.debugDiv.classList.add('visible');
    
    console.log('📤 Cloudflare JSON Uploader v2.0 (Sortiment, Locations & Print Layout)');
    console.log('🔗 Sortiment API:', ENDPOINTS.sortiment);
    console.log('🔗 Locations API:', ENDPOINTS.locations);
    console.log('🔗 Print Layout API:', ENDPOINTS.printLayout);
    console.log('⌨️  Shortcuts: Ctrl+Enter to upload, Escape to clear password');
}

// ===== Initialize when DOM is ready =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}