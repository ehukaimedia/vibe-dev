// Direct test of PowerShell execution
const { spawn } = require('child_process');
const path = require('path');

console.log('Testing PowerShell execution...');

// Test paths
const powershellPaths = [
  'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
  'powershell.exe',
  'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
];

async function testPowerShell(psPath) {
  return new Promise((resolve) => {
    console.log(`\nTesting: ${psPath}`);
    
    try {
      const ps = spawn(psPath, ['-NoProfile', '-Command', 'echo "Hello from PowerShell"'], {
        shell: false,
        windowsHide: true
      });
      
      let output = '';
      let error = '';
      
      ps.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      ps.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      ps.on('error', (err) => {
        console.log(`  Error spawning: ${err.message}`);
        resolve(false);
      });
      
      ps.on('close', (code) => {
        console.log(`  Exit code: ${code}`);
        if (output) console.log(`  Output: ${output.trim()}`);
        if (error) console.log(`  Error: ${error.trim()}`);
        resolve(code === 0);
      });
      
      // Send a test command
      setTimeout(() => {
        ps.stdin.write('exit\n');
      }, 100);
      
    } catch (err) {
      console.log(`  Exception: ${err.message}`);
      resolve(false);
    }
  });
}

async function runTests() {
  for (const psPath of powershellPaths) {
    await testPowerShell(psPath);
  }
  
  // Also test the vibe terminal approach
  console.log('\n\nTesting node-pty approach...');
  try {
    const pty = require('node-pty');
    console.log('node-pty is available');
    
    const shell = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });
    
    console.log('PTY process created');
    
    ptyProcess.onData((data) => {
      console.log('PTY output:', data);
    });
    
    setTimeout(() => {
      ptyProcess.write('echo "PTY test"\r\n');
      setTimeout(() => {
        ptyProcess.write('exit\r\n');
      }, 500);
    }, 500);
    
  } catch (err) {
    console.log('node-pty error:', err.message);
  }
}

runTests();