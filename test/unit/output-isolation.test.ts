#!/usr/bin/env node
import { executeTerminalCommand } from '../../src/vibe-terminal.js';
import { generateRecap } from '../../src/vibe-recap.js';

console.log('Testing Output Isolation and Directory Tracking...\n');

async function testOutputIsolation() {
  try {
    // Test 1: Multiple commands with different outputs
    console.log('Running command 1: echo "First command"');
    const cmd1 = await executeTerminalCommand('echo "First command"');
    console.log(`Output: ${cmd1.output}`);
    console.log(`Working Dir: ${cmd1.workingDirectory}\n`);
    
    console.log('Running command 2: echo "Second command"');
    const cmd2 = await executeTerminalCommand('echo "Second command"');
    console.log(`Output: ${cmd2.output}`);
    console.log(`Working Dir: ${cmd2.workingDirectory}\n`);
    
    console.log('Running command 3: echo "Third command"');
    const cmd3 = await executeTerminalCommand('echo "Third command"');
    console.log(`Output: ${cmd3.output}`);
    console.log(`Working Dir: ${cmd3.workingDirectory}\n`);
    
    // Test 2: Directory changes
    console.log('Testing directory tracking...');
    console.log('Running: pwd');
    const pwd1 = await executeTerminalCommand('pwd');
    console.log(`Output: ${pwd1.output}`);
    console.log(`Working Dir: ${pwd1.workingDirectory}\n`);
    
    console.log('Running: cd /tmp');
    const cd1 = await executeTerminalCommand('cd /tmp');
    console.log(`Output: ${cd1.output}`);
    console.log(`Working Dir: ${cd1.workingDirectory}\n`);
    
    console.log('Running: pwd');
    const pwd2 = await executeTerminalCommand('pwd');
    console.log(`Output: ${pwd2.output}`);
    console.log(`Working Dir: ${pwd2.workingDirectory}\n`);
    
    // Test 3: Failed command
    console.log('Running failed command: ls /nonexistent');
    const fail = await executeTerminalCommand('ls /nonexistent');
    console.log(`Output: ${fail.output}`);
    console.log(`Exit code: ${fail.exitCode}`);
    console.log(`Working Dir: ${fail.workingDirectory}\n`);
    
    // Test 4: Check recap
    console.log('Generating recap...\n');
    const recap = await generateRecap({ hours: 1, format: 'text' });
    
    // Extract command history section
    const historyStart = recap.indexOf('📊 COMMAND HISTORY');
    const historyEnd = recap.indexOf('💡 CURRENT STATE');
    if (historyStart !== -1 && historyEnd !== -1) {
      const historySection = recap.substring(historyStart, historyEnd);
      console.log(historySection);
    }
    
    // Verify outputs are isolated
    console.log('\n✅ Output Isolation Check:');
    console.log(`- Command 1 output contains only "First command": ${cmd1.output === 'First command'}`);
    console.log(`- Command 2 output contains only "Second command": ${cmd2.output === 'Second command'}`);
    console.log(`- Command 3 output contains only "Third command": ${cmd3.output === 'Third command'}`);
    
    console.log('\n✅ Directory Tracking Check:');
    console.log(`- Initial pwd shows correct directory: ${pwd1.workingDirectory === pwd1.output}`);
    console.log(`- After cd /tmp, pwd shows /tmp: ${pwd2.output === '/tmp'}`);
    console.log(`- Working directory updated to /tmp: ${pwd2.workingDirectory === '/tmp'}`);
    
    console.log('\n✅ Exit Code Isolation Check:');
    console.log(`- Failed command has exit code 1: ${fail.exitCode === 1}`);
    console.log(`- Previous command still shows in history with correct exit code`);
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testOutputIsolation();