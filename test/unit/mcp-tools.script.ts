#!/usr/bin/env node
import { executeTerminalCommand } from '../../src/vibe-terminal.js';
import { generateRecap } from '../../src/vibe-recap.js';

console.log('Testing MCP Tools directly...\n');

async function testTools() {
  try {
    // Test vibe_terminal tool
    console.log('1. Testing vibe_terminal:');
    console.log('Running: ls -la');
    const lsResult = await executeTerminalCommand('ls -la');
    console.log(`Exit code: ${lsResult.exitCode}`);
    console.log(`Duration: ${lsResult.duration}ms`);
    console.log(`Output preview: ${lsResult.output.split('\n').slice(0, 3).join('\n')}`);
    console.log();
    
    // Change directory
    console.log('Running: cd /tmp');
    const cdResult = await executeTerminalCommand('cd /tmp');
    console.log(`Exit code: ${cdResult.exitCode}`);
    console.log();
    
    // Verify persistence
    console.log('Running: pwd');
    const pwdResult = await executeTerminalCommand('pwd');
    console.log(`Output: ${pwdResult.output}`);
    console.log(`Success: ${pwdResult.output.trim() === '/tmp' ? 'YES' : 'NO'}`);
    console.log();
    
    // Test vibe_recap tool
    console.log('2. Testing vibe_recap:');
    const recap = await generateRecap({
      hours: 1,
      type: 'summary',
      format: 'text'
    });
    
    console.log('Recap output:');
    console.log(recap.split('\n').slice(0, 20).join('\n'));
    console.log('... (truncated)');
    console.log();
    
    // Test JSON format
    console.log('3. Testing vibe_recap JSON format:');
    const recapJson = await generateRecap({
      hours: 1,
      format: 'json'
    });
    
    const parsed = JSON.parse(recapJson);
    console.log(`Session ID: ${parsed.sessionId}`);
    console.log(`Command count: ${parsed.commandCount}`);
    console.log(`Start time: ${parsed.startTime}`);
    
    console.log('\nAll tests completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testTools();