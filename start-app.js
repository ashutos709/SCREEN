const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to start a process
function startProcess(command, args, cwd) {
  console.log(`Starting ${command} in ${cwd}...`);
  const process = spawn(command, args, { 
    cwd, 
    shell: true,
    stdio: 'inherit'
  });

  process.on('error', (err) => {
    console.error(`Failed to start ${command}:`, err);
  });

  return process;
}

// Start the authentication app (log folder)
const authProcess = startProcess('npm', ['run', 'dev'], path.join(__dirname, 'log'));

// Wait a bit before starting the screen app to ensure auth app is running
setTimeout(() => {
  // Start the screen sharing app (SCREEN folder)
  const screenProcess = startProcess('npm', ['start'], path.join(__dirname, 'SCREEN'));
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down applications...');
    authProcess.kill();
    screenProcess.kill();
    process.exit(0);
  });
}, 5000);

console.log('Both applications are starting...');
console.log('Auth app will be available at: http://localhost:8080');
console.log('Screen app will be available at: http://localhost:3010');
console.log('Press Ctrl+C to stop both applications'); 