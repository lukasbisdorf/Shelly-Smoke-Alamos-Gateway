const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'ShellySmoke2FE2',
  description: 'Shelly Smoke to Feuerwehr Einheit 2 Interface Service',
  script: path.join(__dirname, 'shelly2alamos.exe'), // Using the packaged executable
  env: [{
    name: "NODE_ENV",
    value: "production"
  }]
});

// Listen for installation events
svc.on('install', () => {
  console.log('Service installed successfully!');
  svc.start();
});

svc.on('start', () => {
  console.log('Service started!');
  console.log('You can manage the service from Windows Service Manager');
});

svc.on('error', (error) => {
  console.error('Error occurred during installation:', error);
});

// Install the service
console.log('Installing the service...');
svc.install();
