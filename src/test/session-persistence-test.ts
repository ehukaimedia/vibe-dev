#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';

console.log('Testing Vibe Terminal Session Persistence...\n');

async function runTests() {
  try {
    // Test 1: Directory persistence
    console.log('Test 1: Directory persistence');
    console.log('Changing to /tmp directory...');
    const cd_result = await executeTerminalCommand('cd /tmp');
    console.log(`Output: ${cd_result.output}`);
    console.log(`Exit code: ${cd_result.exitCode}`);
    console.log(`Duration: ${cd_result.duration}ms\n`);
    
    console.log('Checking current directory with pwd...');
    const pwd_result = await executeTerminalCommand('pwd');
    console.log(`Output: ${pwd_result.output}`);
    console.log(`Exit code: ${pwd_result.exitCode}`);
    
    if (pwd_result.output.trim() === '/tmp') {
      console.log('✅ SUCCESS: Directory persistence works!\n');
    } else {
      console.log(`❌ FAIL: Expected /tmp, got: ${pwd_result.output}\n`);
    }
    
    // Test 2: Environment variable persistence
    console.log('Test 2: Environment variable persistence');
    console.log('Setting TEST_VAR...');
    const export_result = await executeTerminalCommand('export TEST_VAR="Vibe Dev Works!"');
    console.log(`Exit code: ${export_result.exitCode}\n`);
    
    console.log('Reading TEST_VAR...');
    const echo_result = await executeTerminalCommand('echo "TEST_VAR is: $TEST_VAR"');
    console.log(`Output: ${echo_result.output}`);
    console.log(`Exit code: ${echo_result.exitCode}`);
    
    if (echo_result.output.includes('Vibe Dev Works!')) {
      console.log('✅ SUCCESS: Environment variable persistence works!\n');
    } else {
      console.log(`❌ FAIL: Expected "Vibe Dev Works!", got: ${echo_result.output}\n`);
    }
    
    // Test 3: Complex command
    console.log('Test 3: Complex piped command');
    const complex_result = await executeTerminalCommand('ls -la | grep -v "^d" | wc -l');
    console.log(`Output: ${complex_result.output}`);
    console.log(`Exit code: ${complex_result.exitCode}`);
    console.log(`Duration: ${complex_result.duration}ms`);
    
    if (complex_result.exitCode === 0 && /^\d+$/.test(complex_result.output.trim())) {
      console.log('✅ SUCCESS: Complex commands work!\n');
    } else {
      console.log('❌ FAIL: Complex command did not execute properly\n');
    }
    
    // Test 4: Command with quotes
    console.log('Test 4: Command with quotes');
    const quote_result = await executeTerminalCommand('echo "Hello from Vibe Dev"');
    console.log(`Output: ${quote_result.output}`);
    
    if (quote_result.output.includes('Hello from Vibe Dev')) {
      console.log('✅ SUCCESS: Quote handling works!\n');
    } else {
      console.log('❌ FAIL: Quote handling failed\n');
    }
    
    console.log('All tests completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

runTests();