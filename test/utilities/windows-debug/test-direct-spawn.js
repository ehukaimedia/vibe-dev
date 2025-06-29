// Test Windows Terminal Spawn Directly
// This bypasses the MCP server layer to test if PowerShell can be spawned

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing PowerShell spawn directly...\n');

// Test 1: Try PowerShell with full path
console.log('Test 1: PowerShell with full path');
const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const ps = spawn(powershellPath, ['-NoProfile', '-NoLogo']);

ps.stdout.on('data', (data) => {
  console.log('PowerShell stdout:', data.toString());
});

ps.stderr.on('data', (data) => {
  console.error('PowerShell stderr:', data.toString());
});

ps.on('error', (err) => {
  console.error('PowerShell spawn error:', err);
});

ps.on('exit', async (code) => {
  console.log('PowerShell exited with code:', code);
  
  // Test 2: Try loading the terminal class directly
  console.log('\nTest 2: Loading VibeTerminalPC class...');
  try {
    const terminalPath = join(__dirname, '..', '..', '..', 'dist', 'src', 'vibe-terminal-pc.js');
    const { VibeTerminalPC } = await import(terminalPath);
    console.log('VibeTerminalPC loaded successfully');
    
    const terminal = new VibeTerminalPC();
    console.log('Terminal instantiated');
    console.log('Default shell:', terminal.getDefaultShell());
  } catch (err) {
    console.error('Error loading terminal:', err);
  }
});

// Send a test command
setTimeout(() => {
  ps.stdin.write('echo "PowerShell is working"\n');
  setTimeout(() => {
    ps.stdin.write('exit\n');
  }, 1000);
}, 500);