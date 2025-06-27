#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';

async function testTimeoutFix() {
  console.log('Testing timeout handling fix...\n');
  
  try {
    console.log('1. Testing basic command before timeout:');
    const result1 = await executeTerminalCommand('echo "Before timeout"');
    console.log(`   Output: ${result1.output}`);
    console.log(`   Exit code: ${result1.exitCode}`);
    console.log(`   Duration: ${result1.duration}ms\n`);
    
    console.log('2. Testing command that will timeout (sleep 4):');
    const result2 = await executeTerminalCommand('sleep 4');
    console.log(`   Output: ${result2.output}`);
    console.log(`   Exit code: ${result2.exitCode}`);
    console.log(`   Duration: ${result2.duration}ms`);
    console.log(`   Expected: Exit code -1 (timeout) after ~3000ms\n`);
    
    console.log('3. Testing command after timeout:');
    const result3 = await executeTerminalCommand('echo "After timeout - session should still work"');
    console.log(`   Output: ${result3.output}`);
    console.log(`   Exit code: ${result3.exitCode}`);
    console.log(`   Duration: ${result3.duration}ms\n`);
    
    console.log('4. Testing pwd to verify session state:');
    const result4 = await executeTerminalCommand('pwd');
    console.log(`   Output: ${result4.output}`);
    console.log(`   Exit code: ${result4.exitCode}\n`);
    
    console.log('5. Testing ls to verify commands work:');
    const result5 = await executeTerminalCommand('ls -la | head -5');
    console.log(`   Output: ${result5.output}`);
    console.log(`   Exit code: ${result5.exitCode}\n`);
    
    // Check if session survived
    if (result3.exitCode === 0 && result4.exitCode === 0 && result5.exitCode === 0) {
      console.log('✅ SUCCESS: Terminal session survived timeout and remains functional!');
    } else {
      console.log('❌ FAILED: Terminal session did not survive timeout');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testTimeoutFix();