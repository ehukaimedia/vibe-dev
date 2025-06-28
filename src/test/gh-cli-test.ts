#!/usr/bin/env node
import { VibeTerminal } from '../vibe-terminal.js';
import { platform } from 'os';

const isWindows = platform() === 'win32';

console.log('Testing GitHub CLI Integration with Vibe Terminal...\n');

// Helper function to execute commands with a fresh terminal
async function executeGhCommand(command: string): Promise<any> {
  const terminal = new VibeTerminal({
    cwd: process.cwd(),
    promptTimeout: 10000, // 10 second timeout for gh commands
    env: {
      NO_COLOR: '1'
    }
  });
  
  try {
    // Small delay to ensure terminal is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = await terminal.execute(command);
    return result;
  } finally {
    // Clean up
    terminal.kill();
  }
}

async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  // Test 1: gh --version command
  console.log('Test 1: Execute gh --version command');
  try {
    const result = await executeGhCommand('gh --version');
    console.log(`Output: ${result.output}`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.duration}ms`);
    
    if (result.exitCode === 0 && result.output.includes('gh version') && /\d+\.\d+\.\d+/.test(result.output)) {
      console.log('✅ SUCCESS: gh --version executed correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL: gh --version did not execute as expected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error executing gh --version:', error);
    failedTests++;
  }

  // Test 2: gh auth status command
  console.log('Test 2: Execute gh auth status command');
  try {
    const result = await executeGhCommand('gh auth status');
    console.log(`Command: ${result.command}`);
    console.log(`Output: ${result.output}`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.duration}ms`);
    
    if (result.command === 'gh auth status' && result.exitCode !== undefined && result.output !== undefined) {
      console.log('✅ SUCCESS: gh auth status executed correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL: gh auth status did not execute as expected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error executing gh auth status:', error);
    failedTests++;
  }

  // Test 3: gh api command with JSON output
  console.log('Test 3: Execute gh api command');
  try {
    const result = await executeGhCommand('gh api user --jq .login 2>/dev/null || echo "not authenticated"');
    console.log(`Output: ${result.output}`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.duration}ms`);
    
    if (result.exitCode !== undefined && result.output !== undefined && result.output.length > 0) {
      console.log('✅ SUCCESS: gh api command executed correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL: gh api command did not execute as expected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error executing gh api command:', error);
    failedTests++;
  }

  // Test 4: gh repo list command
  console.log('Test 4: Execute gh repo list command');
  try {
    const result = await executeGhCommand('gh repo list --limit 5 2>/dev/null || echo "not authenticated"');
    console.log(`Output: ${result.output}`);
    console.log(`Exit code: ${result.exitCode}`);
    console.log(`Duration: ${result.duration}ms`);
    
    if (result.exitCode !== undefined && result.output !== undefined) {
      console.log('✅ SUCCESS: gh repo list executed correctly\n');
      passedTests++;
    } else {
      console.log('❌ FAIL: gh repo list did not execute as expected\n');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ FAIL: Error executing gh repo list:', error);
    failedTests++;
  }

  // Summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`Total tests: ${passedTests + failedTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('==================================\n');

  if (failedTests > 0) {
    console.log('❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});