const { spawn } = require('child_process');
const path = require('path');

// Path to the executable relative to this script
const exePath = path.join(__dirname, 'shelly2alamos.exe');

console.log(`Starting application: ${exePath}`);

// Spawn the process
const child = spawn(exePath, [], {
  detached: false,
  stdio: 'inherit'
});

// Handle process events
child.on('error', (err) => {
  console.error(`Failed to start process: ${err}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Process exited with code ${code} and signal ${signal}`);
    process.exit(code || 1);
  }
});

process.on('SIGTERM', () => {
  console.log('Terminating application...');
  child.kill();
});
