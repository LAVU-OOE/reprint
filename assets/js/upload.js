// ===== Configuration & Endpoints =====
const ENDPOINTS = {
    sortiment: 'https://sortiment-api.lavu-ooe.workers.dev/',
    locations: 'https://locations-api.lavu-ooe.workers.dev/'
};

let selectedEndpoint = 'sortiment';

// ===== DOM Elements =====
const fileInput = document.getElementById('fileInput');
const passwordInput = document.getElementById('passwordInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultDiv = document.getElementById('result');
const debugDiv = document.getElementById('debugArea');
const endpointToggles = document.querySelectorAll('input[name="endpoint"]');
const selectedEndpointText = document.getElementById('endpointDisplay');

// ===== Helper Functions =====
function setResult(message, type) {
    resultDiv.className = 'result ' + type;
    resultDiv.textContent = message;
}

function setDebug(message) {
    const timestamp = new Date().toLocaleTimeString();
    debugDiv.textContent = `[${timestamp}] ${message}`;
}

function clearPassword() {
    passwordInput.value = '';
    setResult('Password cleared for security.', '');
}

function updateEndpointDisplay() {
    const endpointUrl = ENDPOINTS[selectedEndpoint];
    selectedEndpointText.textContent = endpointUrl;
}

// ===== Event Listeners =====
endpointToggles.forEach(toggle => {
    toggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            selectedEndpoint = e.target.value;
            updateEndpointDisplay();
            setDebug(`Switched endpoint to: ${selectedEndpoint}`);
            
            // Update label styling
            document.querySelectorAll('.endpoint-selector label').forEach(label => {
                label.classList.remove('selected');
            });
            const labelId = selectedEndpoint === 'sortiment' ? 'labelSortiment' : 'labelLocations';
            document.getElementById(labelId).classList.add('selected');
        }
    });
});

// Password visibility toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// File input change handler
fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        document.getElementById('fileInfo').textContent = `📎 Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        setDebug(`File selected: ${file.name}`);
        
        // Show stats
        document.getElementById('stats').style.display = 'flex';
        document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
        
        // Try to count items
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    document.getElementById('itemCount').textContent = data.length;
                } else if (typeof data === 'object') {
                    document.getElementById('itemCount').textContent = Object.keys(data).length;
                }
            } catch(err) {
                document.getElementById('itemCount').textContent = '?';
            }
        };
        reader.readAsText(file);
    } else {
        document.getElementById('fileInfo').textContent = 'Select a valid JSON file with your data array.';
        document.getElementById('stats').style.display = 'none';
    }
});

// ===== Core Upload Logic =====
async function uploadFile() {
    const file = fileInput.files[0];
    const password = passwordInput.value.trim();
    const endpointUrl = ENDPOINTS[selectedEndpoint];
    const endpointName = selectedEndpoint.toUpperCase();

    if (!file) {
        setResult('❌ Please select a JSON file first!', 'error');
        return;
    }

    if (!password) {
        setResult('❌ Password is required!', 'error');
        passwordInput.focus();
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ Uploading...';
    setResult('Reading file...', '');
    setDebug(`Starting upload sequence for ${endpointName}...`);

    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            // Validate JSON format locally before pushing
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
            uploadBtn.disabled = false;
            uploadBtn.textContent = `📤 Upload ${endpointName} to Cloudflare`;
        }
    };

    reader.onerror = function() {
        setResult('❌ Error reading file!', 'error');
        setDebug('FileReader error');
        uploadBtn.disabled = false;
        uploadBtn.textContent = `📤 Upload ${endpointName} to Cloudflare`;
    };

    reader.readAsText(file);
}

// ===== Debug Toggle =====
function toggleDebug() {
    const debugArea = document.getElementById('debugArea');
    debugArea.classList.toggle('visible');
    const btn = document.getElementById('debugToggle');
    btn.textContent = debugArea.classList.contains('visible') ? '🔧 Hide Debug' : '🔧 Toggle Debug';
}

// ===== Keyboard Shortcuts =====
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

// ===== Init =====
setResult('Ready to upload. Select a JSON file and enter your password.', '');
setDebug('Ready');
updateEndpointDisplay();
document.getElementById('debugArea').classList.add('visible');

console.log('📤 Cloudflare JSON Uploader v2.0 (Sortiment & Locations)');
console.log('🔗 Sortiment API:', ENDPOINTS.sortiment);
console.log('🔗 Locations API:', ENDPOINTS.locations);
console.log('⌨️  Shortcuts: Ctrl+Enter to upload, Escape to clear password');