// Utility functions
const api = {
    async getFE2Config() {
        const response = await fetch('/api/config/fe2');
        return response.json();
    },
    
    async setFE2Config(config) {
        await fetch('/api/config/fe2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
    },
    
    async getDevices() {
        const response = await fetch('/api/config/devices');
        return response.json();
    },
    
    async addDevice(device) {
        await fetch('/api/config/devices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device)
        });
    },
    
    async removeDevice(id) {
        await fetch(`/api/config/devices/${id}`, {
            method: 'DELETE'
        });
    },

    async updateDevice(device) {
        await fetch(`/api/config/devices/${device.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(device)
        });
    },

    async triggerSmokeTest(deviceId) {
        const response = await fetch(`/api/devices/${deviceId}/test/smoke`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to trigger smoke test');
    },

    async triggerBatteryTest(deviceId) {
        const response = await fetch(`/api/devices/${deviceId}/test/battery`, {
            method: 'POST'
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
            <h4>Webhook Configuration</h4>
            <p>Configure these webhooks in your Shelly device's web interface under "Actions" → "Webhooks":</p>
            
            <div class="webhook-url">
                <strong>Alarm Webhook:</strong>
                <ul>
                    <li>Trigger: When smoke is detected</li>
                    <li>URL: ${webhooks.alarm}</li>
                    <li>Method: POST</li>
                </ul>
                <button class="copy-button" onclick="copyToClipboard('${webhooks.alarm}')">Copy URL</button>
            </div>
            
            <div class="webhook-url">
                <strong>Battery Webhook:</strong>
                <ul>
                    <li>Trigger: When battery level changes</li>
                    <li>URL: ${webhooks.battery}</li>
                    <li>Method: POST</li>
                </ul>
                <button class="copy-button" onclick="copyToClipboard('${webhooks.battery}')">Copy URL</button>
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
                <p>Smoke Unit: ${device.unit}</p>
                <p>Battery Unit: ${device.batteryUnit}</p>
                <p>Location: ${device.location.street} ${device.location.house}, ${device.location.city}</p>
                <p>Coordinates: ${device.location.coordinates.join(', ')}</p>
                
                <div id="webhook-${device.id}" class="webhook-info" style="display: none;">
                    <h4>Webhook URLs</h4>
                    <div class="webhook-url">
                        <strong>Alarm Webhook:</strong> 
                        ${webhooks.alarm}
                        <button class="copy-button" onclick="copyToClipboard('${webhooks.alarm}')">Copy</button>
                    </div>
                    <div class="webhook-url">
                        <strong>Battery Webhook:</strong> 
                        ${webhooks.battery}
                        <button class="copy-button" onclick="copyToClipboard('${webhooks.battery}')">Copy</button>
                    </div>
                </div>
                 <div class="device-actions">
                    <button class="show-webhooks" onclick="toggleWebhooks('${device.id}')">Webhooks</button>
                    <button class="edit" onclick="editDevice('${device.id}')">Edit</button>
                    <button class="remove" onclick="removeDevice('${device.id}')">Remove</button>
                    <button class="test" onclick="triggerSmokeTest('${device.id}')">Test Smoke Alarm</button>
                    <button class="test" onclick="triggerBatteryTest('${device.id}')">Test Battery Alarm</button>
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

document.getElementById('btn-fe2').addEventListener('click', () => {
    setActiveTab('btn-fe2');
    document.getElementById('fe2-panel').style.display = 'block';
    document.getElementById('devices-panel').style.display = 'none';
});

document.getElementById('btn-devices').addEventListener('click', () => {
    setActiveTab('btn-devices');
    document.getElementById('fe2-panel').style.display = 'none';
    document.getElementById('devices-panel').style.display = 'block';
});

// Event listeners
document.getElementById('fe2-config-form').addEventListener('submit', saveFE2Config);
document.getElementById('device-form').addEventListener('submit', handleDeviceForm);

// Initial load
loadFE2Config();
loadDevices();
