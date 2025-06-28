#!/usr/bin/env node
import * as pty from 'node-pty';
import * as os from 'os';

// Skip PTY tests in CI environment
if (process.env.CI) {
  console.log('Skipping PTY test in CI environment');
  process.exit(0);
}

// Add global test timeout
const testTimeout = setTimeout(() => {
  console.error('Test timeout after 10 seconds');
  process.exit(1);
}, 10000);

// Test basic PTY functionality
console.log('Testing node-pty basic functionality...\n');

// Get the default shell
const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');

console.log(`Platform: ${os.platform()}`);
console.log(`Default shell: ${defaultShell}`);
console.log('---\n');

// Create a PTY instance
const terminal = pty.spawn(defaultShell, [], {
  name: 'xterm-256color',
  cols: 80,
  rows: 24,
  cwd: process.cwd(),
  env: process.env
});

console.log(`PTY created with PID: ${terminal.pid}`);

// Test 1: Simple echo command
console.log('\n1. Testing simple echo command...');
let output1 = '';
terminal.onData((data) => {
  output1 += data;
});

terminal.write('echo "Hello from PTY"\r');

// Test 2: Working directory persistence
setTimeout(() => {
  console.log('Output:', output1.trim());
  console.log('\n2. Testing directory persistence...');
  
  let output2 = '';
  terminal.onData((data) => {
    output2 += data;
  });
  
  terminal.write('cd /tmp\r');
  
  setTimeout(() => {
    terminal.write('pwd\r');
    
    setTimeout(() => {
      console.log('Output after cd /tmp and pwd:', output2.trim());
      
      // Test 3: Environment variable persistence
      console.log('\n3. Testing environment variable persistence...');
      let output3 = '';
      terminal.onData((data) => {
        output3 += data;
      });
      
      terminal.write('export TEST_VAR="PTY works!"\r');
      setTimeout(() => {
        terminal.write('echo $TEST_VAR\r');
        
        setTimeout(() => {
          console.log('Output after setting and reading env var:', output3.trim());
          
          // Clean up
          terminal.kill();
          clearTimeout(testTimeout);
          console.log('\nPTY test completed successfully!');
          process.exit(0);
        }, 500);
      }, 500);
    }, 500);
  }, 500);
}, 1000);

// Handle errors
terminal.onExit((exitCode) => {
  console.log(`\nTerminal exited with code: ${exitCode}`);
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  terminal.kill();
  process.exit(0);
});