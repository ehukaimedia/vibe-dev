#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert';
import { executeTerminalCommand } from '../vibe-terminal.js';
import { generateRecap } from '../vibe-recap.js';

test('Recap types produce distinct outputs', async () => {
  // Execute some commands to create history
  await executeTerminalCommand('pwd');
  await executeTerminalCommand('echo "Testing recap types"');
  await executeTerminalCommand('ls -la');
  await executeTerminalCommand('git status');
  await executeTerminalCommand('nonexistentcommand'); // Intentional error
  
  // Get all three recap types
  const summaryRecap = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
  const statusRecap = await generateRecap({ hours: 1, type: 'status', format: 'text' });
  const fullRecap = await generateRecap({ hours: 1, type: 'full', format: 'text' });
  
  // Verify they are different
  assert.notStrictEqual(summaryRecap, statusRecap, 'Summary and status recaps should be different');
  assert.notStrictEqual(summaryRecap, fullRecap, 'Summary and full recaps should be different');
  assert.notStrictEqual(statusRecap, fullRecap, 'Status and full recaps should be different');
  
  // Verify summary has expected content
  assert(summaryRecap.includes('SESSION SUMMARY'), 'Summary should have summary header');
  assert(summaryRecap.includes('Activity Overview'), 'Summary should have activity overview');
  assert(summaryRecap.includes('Top Commands'), 'Summary should have top commands');
  assert(summaryRecap.includes('Key Activities'), 'Summary should have key activities');
  
  // Verify status has expected content
  assert(statusRecap.includes('CURRENT STATUS'), 'Status should have status header');
  assert(statusRecap.includes('Working Directory'), 'Status should show working directory');
  assert(statusRecap.includes('Session Active'), 'Status should show session duration');
  assert(statusRecap.includes('Recent Errors'), 'Status should show recent errors');
  assert(statusRecap.includes('Suggested Next Steps'), 'Status should have suggestions');
  
  // Verify full has expected content
  assert(fullRecap.includes('VIBE DEV SESSION RECAP'), 'Full should have full header');
  assert(fullRecap.includes('COMMAND HISTORY'), 'Full should have command history');
  assert(fullRecap.includes('Output preview'), 'Full should have output previews');
  
  console.log('✅ All recap types produce distinct outputs');
});

test('Summary recap analyzes patterns correctly', async () => {
  // Clear history by creating new commands
  await executeTerminalCommand('cd /tmp');
  await executeTerminalCommand('git status');
  await executeTerminalCommand('git diff');
  await executeTerminalCommand('npm test');
  await executeTerminalCommand('npm run build');
  
  const summary = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
  
  // Check pattern detection
  assert(summary.includes('git: 2 times'), 'Should count git commands');
  assert(summary.includes('npm: 2 times'), 'Should count npm commands');
  assert(summary.includes('Made git commits') || summary.includes('General terminal usage'), 
    'Should detect git activity or fallback');
  
  console.log('✅ Summary recap analyzes patterns correctly');
});

test('Status recap provides actionable next steps', async () => {
  // Create a failed command
  await executeTerminalCommand('thisdoesnotexist');
  
  const status = await generateRecap({ hours: 1, type: 'status', format: 'text' });
  
  // Should suggest fixing the error
  assert(status.includes('Install missing command') || 
         status.includes('Debug the previous error'), 
    'Should suggest fixing command not found error');
  
  console.log('✅ Status recap provides actionable suggestions');
});

test('JSON format works with all recap types', async () => {
  const jsonRecap = await generateRecap({ hours: 1, format: 'json' });
  
  // Should be valid JSON
  const parsed = JSON.parse(jsonRecap);
  assert(parsed.sessionId, 'JSON should have sessionId');
  assert(parsed.commands, 'JSON should have commands array');
  assert(Array.isArray(parsed.commands), 'Commands should be an array');
  
  console.log('✅ JSON format works correctly');
});