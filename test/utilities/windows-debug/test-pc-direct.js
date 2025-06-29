// Direct test of VibeTerminalPC without factory
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing VibeTerminalPC directly (bypassing factory)...\n');

async function testDirectPC() {
  try {
    // Import VibeTerminalPC directly
    const pcPath = join(__dirname, '..', '..', '..', 'dist', 'src', 'vibe-terminal-pc.js');
    const pcModule = await import(`file:///${pcPath.replace(/\\/g, '/')}`);
    const { VibeTerminalPC } = pcModule;
    
    console.log('Creating VibeTerminalPC instance...');
    const terminal = new VibeTerminalPC();
    
    console.log('Terminal created successfully!');
    console.log('Default shell:', terminal.getDefaultShell());
    console.log('Shell type:', terminal.getSessionState().shellType);
    
    // Test a simple command
    console.log('\nExecuting test command...');
    const result = await terminal.execute('echo "Windows terminal works!"');
    console.log('Result:', result);
    
    // Test PowerShell command
    console.log('\nTesting PowerShell command...');
    const psResult = await terminal.execute('Get-Location');
    console.log('PowerShell result:', psResult);
    
    // Clean up
    terminal.kill();
    console.log('\nTerminal killed successfully');
    
  } catch (err) {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
  }
}

testDirectPC();