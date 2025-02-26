// Utility functions
const api = {
    async getFE2Config() {
        const response = await fetch('/api/config/fe2', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },
    
    async setFE2Config(config) {
        await fetch('/api/config/fe2', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(config)
        });
    },
    
    async getDevices() {
        const response = await fetch('/api/config/devices', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },
    
    async addDevice(device) {
        await fetch('/api/config/devices', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(device)
        });
    },
    
    async removeDevice(id) {
        await fetch(`/api/config/devices/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
    },

    async updateDevice(device) {
        await fetch(`/api/config/devices/${device.id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(device)
        });
    },

    async triggerSmokeTest(deviceId) {
        const response = await fetch(`/api/devices/${deviceId}/test/smoke`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to trigger smoke test');
    },

    async triggerBatteryTest(deviceId) {
        const response = await fetch(`/api/devices/${deviceId}/test/battery`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to trigger battery test');
    }
};

let editingDeviceId = null;

function getWebhookUrls(deviceId) {
    const baseUrl = window.location.origin;
    return {
        alarm: `${baseUrl}/api/alarm`,
        battery: `${baseUrl}/api/battery`
    };
}

async function copyToClipboard(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Avoid scrolling to bottom
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

function toggleWebhooks(deviceId) {
    const webhookInfo = document.getElementById(`webhook-${deviceId}`);
    if (webhookInfo.style.display === 'none') {
        const webhooks = getWebhookUrls(deviceId);
        webhookInfo.innerHTML = `
            <h4>Webhook-Konfiguration</h4>
            <p>Konfigurieren Sie diese Webhooks in der Weboberfläche Ihres Shelly-Geräts unter "Aktionen" → "Webhooks":</p>
            
            <div class="webhook-url">
                <strong>Alarm Webhook:</strong>
                <ul>
                    <li>Auslöser: Wenn Rauch erkannt wird</li>
                    <li>URL: ${webhooks.alarm}</li>
                    <li>Methode: POST</li>
                </ul>
                <button class="copy-button" onclick="copyToClipboard('${webhooks.alarm}')">URL kopieren</button>
            </div>
            
            <div class="webhook-url">
                <strong>Batterie Webhook:</strong>
                <ul>
                    <li>Auslöser: Wenn sich der Batteriestand ändert</li>
                    <li>URL: ${webhooks.battery}</li>
                    <li>Methode: POST</li>
                </ul>
                <button class="copy-button" onclick="copyToClipboard('${webhooks.battery}')">URL kopieren</button>
            </div>
        `;
        webhookInfo.style.display = 'block';
    } else {
        webhookInfo.style.display = 'none';
    }
}

// UI handlers
async function loadFE2Config() {
    const config = await api.getFE2Config();
    document.getElementById('fe2-url').value = config.url;
    document.getElementById('fe2-auth').value = config.authorization;
    document.getElementById('fe2-sender').value = config.sender;
}

async function saveFE2Config(event) {
    event.preventDefault();
    const config = {
        url: document.getElementById('fe2-url').value,
        authorization: document.getElementById('fe2-auth').value,
        sender: document.getElementById('fe2-sender').value
    };
    await api.setFE2Config(config);
    alert('FE2 configuration saved successfully');
}

async function loadDevices() {
    const devices = await api.getDevices();
    const listElement = document.getElementById('devices-list');
    
    listElement.innerHTML = devices.map(device => {
        const webhooks = getWebhookUrls(device.id);
        return `
            <div class="device-item">
               
                <h3>${device.name}</h3>
                <p>ID: ${device.id}</p>
                <p>Raucheinheit: ${device.unit}</p>
                <p>Batterieeinheit: ${device.batteryUnit}</p>
                <p>Standort: ${device.location.street} ${device.location.house}, ${device.location.city}</p>
                <p>Koordinaten: ${device.location.coordinates.join(', ')}</p>
                
                <div id="webhook-${device.id}" class="webhook-info" style="display: none;">
                    <h4>Webhook-URLs</h4>
                    <div class="webhook-url">
                        <strong>Alarm Webhook:</strong> 
                        ${webhooks.alarm}
                        <button class="copy-button" onclick="copyToClipboard('${webhooks.alarm}')">Kopieren</button>
                    </div>
                    <div class="webhook-url">
                        <strong>Batterie Webhook:</strong> 
                        ${webhooks.battery}
                        <button class="copy-button" onclick="copyToClipboard('${webhooks.battery}')">Kopieren</button>
                    </div>
                </div>
                 <div class="device-actions">
                    <button class="show-webhooks" onclick="toggleWebhooks('${device.id}')">Webhooks</button>
                    <button class="edit" onclick="editDevice('${device.id}')">Bearbeiten</button>
                    <button class="remove" onclick="removeDevice('${device.id}')">Entfernen</button>
                    <button class="test" onclick="triggerSmokeTest('${device.id}')">Rauchalarm testen</button>
                    <button class="test" onclick="triggerBatteryTest('${device.id}')">Batteriealarm testen</button>
                </div>
            </div>
        `;
    }).join('');
}

async function addDevice(event) {
    event.preventDefault();
    const device = {
        id: document.getElementById('device-id').value,
        name: document.getElementById('device-name').value,
        unit: document.getElementById('device-unit').value,
        batteryUnit: document.getElementById('device-battery-unit').value,
        location: {
            street: document.getElementById('device-street').value,
            house: document.getElementById('device-house').value,
            city: document.getElementById('device-city').value,
            coordinates: [
                parseFloat(document.getElementById('device-lat').value),
                parseFloat(document.getElementById('device-lon').value)
            ]
        }
    };
    
    await api.addDevice(device);
    event.target.reset();
    await loadDevices();
}

async function removeDevice(id) {
    if (confirm('Are you sure you want to remove this device?')) {
        await api.removeDevice(id);
        await loadDevices();
    }
}

async function editDevice(id) {
    const devices = await api.getDevices();
    const device = devices.find(d => d.id === id);
    if (!device) return;

    editingDeviceId = id;
    
    // Populate form with device data
    document.getElementById('device-id').value = device.id;
    document.getElementById('device-id').readOnly = true;
    document.getElementById('device-name').value = device.name;
    document.getElementById('device-unit').value = device.unit;
    document.getElementById('device-battery-unit').value = device.batteryUnit;
    document.getElementById('device-street').value = device.location.street;
    document.getElementById('device-house').value = device.location.house;
    document.getElementById('device-city').value = device.location.city;
    document.getElementById('device-lat').value = device.location.coordinates[0];
    document.getElementById('device-lon').value = device.location.coordinates[1];

    // Change form button text
    const submitButton = document.querySelector('#device-form button[type="submit"]');
    submitButton.textContent = 'Update Device';
}

async function handleDeviceForm(event) {
    event.preventDefault();
    const device = {
        id: document.getElementById('device-id').value,
        name: document.getElementById('device-name').value,
        unit: document.getElementById('device-unit').value,
        batteryUnit: document.getElementById('device-battery-unit').value,
        location: {
            street: document.getElementById('device-street').value,
            house: document.getElementById('device-house').value,
            city: document.getElementById('device-city').value,
            coordinates: [
                parseFloat(document.getElementById('device-lat').value),
                parseFloat(document.getElementById('device-lon').value)
            ]
        }
    };
    
    if (editingDeviceId) {
        await api.updateDevice(device);
        editingDeviceId = null;
        document.getElementById('device-id').readOnly = false;
        const submitButton = document.querySelector('#device-form button[type="submit"]');
        submitButton.textContent = 'Add Device';
    } else {
        await api.addDevice(device);
    }
    
    event.target.reset();
    await loadDevices();
}

async function triggerSmokeTest(deviceId) {
    try {
        await api.triggerSmokeTest(deviceId);
        alert('Smoke test alarm triggered successfully');
    } catch (error) {
        alert('Failed to trigger smoke test alarm');
        console.error(error);
    }
}

async function triggerBatteryTest(deviceId) {
    try {
        await api.triggerBatteryTest(deviceId);
        alert('Battery test alarm triggered successfully');
    } catch (error) {
        alert('Failed to trigger battery test alarm');
        console.error(error);
    }
}

// Update tab switching for new sidebar buttons
function setActiveTab(activeBtnId) {
    document.querySelectorAll('.sidebar button').forEach(btn => {
        btn.classList.toggle('active', btn.id === activeBtnId);
    });
}

// New code to persist sidebar tab selection in the URI
window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash === '#devices') {
        setActiveTab('btn-devices');
        document.getElementById('fe2-panel').style.display = 'none';
        document.getElementById('devices-panel').style.display = 'block';
    } else { // default to FE2 configuration if hash is '#fe2-config' or not set
        setActiveTab('btn-fe2');
        document.getElementById('fe2-panel').style.display = 'block';
        document.getElementById('devices-panel').style.display = 'none';
    }
});

document.getElementById('btn-fe2').addEventListener('click', () => {
    window.location.hash = '#fe2-config';
    setActiveTab('btn-fe2');
    document.getElementById('fe2-panel').style.display = 'block';
    document.getElementById('devices-panel').style.display = 'none';
});

document.getElementById('btn-devices').addEventListener('click', () => {
    window.location.hash = '#devices';
    setActiveTab('btn-devices');
    document.getElementById('fe2-panel').style.display = 'none';
    document.getElementById('devices-panel').style.display = 'block';
});

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showApp();
        
    } else {
        document.getElementById('password').value = '';
        alert('Invalid credentials');
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('token');
    showLogin();
}

// Show login form
function showLogin() {
    document.getElementById('login-container').style.display = 'block';
    document.querySelector('.app-container').style.display = 'none';
    document.querySelector('.header').style.display = 'none';
}

// Show app content
function showApp() {
    document.getElementById('login-container').style.display = 'none';
    document.querySelector('.app-container').style.display = 'flex';
    document.querySelector('.header').style.display = 'block';
    loadFE2Config();
    loadDevices();
}

// Check authentication on page load
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        showApp();
    } else {
        showLogin();
    }
}

// Event listeners
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('logout-button').addEventListener('click', handleLogout);

// Initial load
checkAuth();

document.getElementById('fe2-config-form').addEventListener('submit', saveFE2Config);
document.getElementById('device-form').addEventListener('submit', handleDeviceForm);

// Initial load
loadFE2Config();
loadDevices();
