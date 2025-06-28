#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';

async function debugCommand() {
  console.log('Debugging specific commands...\n');
  
  const commands = [
    'echo "User is: $(whoami)"',
    'echo "Test with special chars: $HOME | && > < \'\\" `test`"',
    'echo "Simple test"'
  ];
  
  for (const cmd of commands) {
    console.log(`\nTesting: ${cmd}`);
    const result = await executeTerminalCommand(cmd);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Output length: ${result.output.length}`);
    console.log(`Output: "${result.output}"`);
    console.log(`Raw output (first 200 chars): ${JSON.stringify(result.output.substring(0, 200))}`);
  }
  
  process.exit(0);
}

debugCommand();