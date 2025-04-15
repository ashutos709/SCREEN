const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Store processes for cleanup
const processes = new Set();

// Function to handle process cleanup
function cleanup() {
  console.log('\nShutting down applications...');
  for (const process of processes) {
    process.kill();
  }
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Function to start a process
function startProcess(command, args, cwd) {
  console.log(`Starting ${command} in ${cwd}...`);
  const process = spawn(command, args, { 
    cwd, 
    shell: true,
    stdio: 'inherit'
  });

  processes.add(process);

  process.on('error', (err) => {
    console.error(`Failed to start ${command}:`, err);
  });

  process.on('exit', (code) => {
    processes.delete(process);
    if (code !== 0) {
      console.error(`${command} exited with code ${code}`);
      cleanup();
    }
  });

  return process;
}

// Check if directories exist
const logDir = path.join(__dirname, 'log');
const screenDir = path.join(__dirname, 'SCREEN');

if (!fs.existsSync(logDir)) {
  console.error('Error: log directory not found');
  process.exit(1);
}

if (!fs.existsSync(screenDir)) {
  console.error('Error: SCREEN directory not found');
  process.exit(1);
}

// Start the authentication app (log folder)
const authProcess = startProcess('npm', ['run', 'dev'], logDir);

// Wait a bit before starting the screen app to ensure auth app is running
setTimeout(() => {
  // Start the screen sharing app (SCREEN folder)
  const screenProcess = startProcess('npm', ['start'], screenDir);
}, 5000);

console.log('Both applications are starting...');
console.log('Auth app will be available at: http://localhost:8080');
console.log('Screen app will be available at: http://localhost:3010');
console.log('Press Ctrl+C to stop both applications'); 