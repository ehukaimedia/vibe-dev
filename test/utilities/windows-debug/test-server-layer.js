// Test MCP Server Terminal Function
// This tests the server.js executeTerminalCommand function

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing MCP server terminal execution...\n');

async function testServerTerminal() {
  try {
    // First, check if we can even load the server module
    console.log('Loading server module...');
    const serverPath = join(__dirname, '..', '..', '..', 'dist', 'src', 'server.js');
    console.log('Server path:', serverPath);
    
    // Check if the compiled file exists
    if (!existsSync(serverPath)) {
      console.error('Server.js not found at:', serverPath);
      console.log('Available files in dist/src:');
      const distFiles = readdirSync(join(__dirname, '..', '..', '..', 'dist', 'src'));
      distFiles.forEach(f => console.log('  -', f));
      return;
    }
    
    // Try to load the terminal factory
    console.log('\nLoading vibe-terminal factory...');
    const terminalPath = join(__dirname, '..', '..', '..', 'dist', 'src', 'vibe-terminal.js');
    
    if (!existsSync(terminalPath)) {
      console.error('vibe-terminal.js not found');
      return;
    }
    
    const terminalModule = await import(`file:///${terminalPath.replace(/\\/g, '/')}`);
    const { createVibeTerminal } = terminalModule;
    console.log('Factory loaded, creating terminal...');
    
    const terminal = createVibeTerminal();
    console.log('Terminal created:', terminal.constructor.name);
    console.log('Terminal shell type:', terminal.getSessionState().shellType);
    console.log('Terminal shell path:', terminal.getDefaultShell());
    
    // Try executing a simple command
    console.log('\nExecuting test command...');
    const result = await terminal.execute('echo "Test from server layer"');
    console.log('Result:', result);
    
  } catch (err) {
    console.error('Error in test:', err);
    console.error('Stack:', err.stack);
  }
}

// Run the test
testServerTerminal();