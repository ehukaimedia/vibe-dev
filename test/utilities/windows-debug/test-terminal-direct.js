// Test if VibeTerminalPC can be instantiated
const { VibeTerminalPC } = require('./dist/src/vibe-terminal-pc.js');

console.log('Testing VibeTerminalPC instantiation...');

try {
  const terminal = new VibeTerminalPC();
  console.log('Success! Terminal created.');
  console.log('Default shell:', terminal.getDefaultShell());
  
  // Try to execute a simple command
  console.log('\nTrying to execute echo test...');
  terminal.execute('echo test').then(result => {
    console.log('Result:', result);
    process.exit(0);
  }).catch(err => {
    console.log('Error:', err);
    process.exit(1);
  });
  
} catch (err) {
  console.log('Failed to create terminal:', err);
  console.log('Stack:', err.stack);
  process.exit(1);
}