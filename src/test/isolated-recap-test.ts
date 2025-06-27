#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert';
import { executeTerminalCommand } from '../vibe-terminal.js';
import { generateRecap } from '../vibe-recap.js';

test('Summary recap analyzes patterns correctly', async () => {
  // Execute commands in sequence
  await executeTerminalCommand('cd /tmp');
  await executeTerminalCommand('git status');
  await executeTerminalCommand('git diff'); 
  await executeTerminalCommand('npm test');
  await executeTerminalCommand('npm run build');
  
  const summary = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
  
  console.log('Generated summary:');
  console.log(summary);
  console.log('---');
  
  // Check pattern detection
  assert(summary.includes('git: 2 times'), 'Should count git commands');
  assert(summary.includes('npm: 2 times'), 'Should count npm commands');
  assert(summary.includes('Made git commits') || summary.includes('General terminal usage') || summary.includes('Ran npm scripts'), 
    'Should detect git activity or fallback');
  
  console.log('✅ Summary recap analyzes patterns correctly');
});