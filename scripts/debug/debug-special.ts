#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';

async function debugSpecial() {
  console.log('Debugging special characters test...\n');
  
  // Reset with a simple command first
  await executeTerminalCommand('echo "reset"');
  
  const cmd = 'echo "Test with special chars: $HOME | && > < \'\\" `test`"';
  console.log(`Command: ${cmd}`);
  
  const result = await executeTerminalCommand(cmd);
  console.log(`Exit code: ${result.exitCode}`);
  console.log(`Output length: ${result.output.length}`);
  console.log(`Output: "${result.output}"`);
  console.log(`Raw bytes: ${Buffer.from(result.output).toString('hex')}`);
  console.log(`Expected includes: "Test with special chars:" and "|"`);
  console.log(`Actual includes "Test with special chars:": ${result.output.includes('Test with special chars:')}`);
  console.log(`Actual includes "|": ${result.output.includes('|')}`);
  
  process.exit(0);
}

debugSpecial();