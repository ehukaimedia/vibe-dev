#!/usr/bin/env node
import { executeTerminalCommand } from '../../../src/vibe-terminal.js';
import { generateRecap } from '../../../src/vibe-recap.js';
import { getTerminal } from '../../../src/vibe-terminal.js';

async function debugRecap() {
  console.log('Debugging recap pattern detection...\n');
  
  // Execute test commands
  console.log('Executing commands...');
  await executeTerminalCommand('cd /tmp');
  await executeTerminalCommand('git status');
  await executeTerminalCommand('git diff');
  await executeTerminalCommand('npm test');
  await executeTerminalCommand('npm run build');
  
  // Get history
  const terminal = getTerminal();
  const history = terminal.getHistory();
  
  console.log('\nCommand history:');
  history.forEach((cmd, i) => {
    console.log(`${i + 1}. "${cmd.command}" (base: "${cmd.command.split(' ')[0]}")`);
  });
  
  // Get summary
  const summary = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
  console.log('\nGenerated summary:');
  console.log(summary);
  
  process.exit(0);
}

debugRecap();