// Test MCP Server Terminal Function
// This tests the server.js executeTerminalCommand function

const path = require('path');

console.log('Testing MCP server terminal execution...\n');

async function testServerTerminal() {
  try {
    // First, check if we can even load the server module
    console.log('Loading server module...');
    const serverPath = path.join(__dirname, '..', '..', '..', 'dist', 'src', 'server.js');
    console.log('Server path:', serverPath);
    
    // Check if the compiled file exists
    const fs = require('fs');
    if (!fs.existsSync(serverPath)) {
      console.error('Server.js not found at:', serverPath);
      console.log('Available files in dist/src:');
      const distFiles = fs.readdirSync(path.join(__dirname, '..', '..', '..', 'dist', 'src'));
      distFiles.forEach(f => console.log('  -', f));
      return;
    }
    
    // Try to load the terminal factory
    console.log('\nLoading vibe-terminal factory...');
    const terminalPath = path.join(__dirname, '..', '..', '..', 'dist', 'src', 'vibe-terminal.js');
    
    if (!fs.existsSync(terminalPath)) {
      console.error('vibe-terminal.js not found');
      return;
    }
    
    const { createVibeTerminal } = require(terminalPath);
    console.log('Factory loaded, creating terminal...');
    
    const terminal = createVibeTerminal();
    console.log('Terminal created:', terminal.constructor.name);
    
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