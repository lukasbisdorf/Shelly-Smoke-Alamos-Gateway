const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'ShellySmoke2FE2',
  script: path.join(__dirname, 'service-wrapper.js'), // Use the wrapper script instead of exe directly
});

// Listen for uninstall events
svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
});

svc.on('error', (error) => {
  console.error('Error occurred during uninstallation:', error);
});

// Uninstall the service
console.log('Uninstalling the service...');
svc.uninstall();
