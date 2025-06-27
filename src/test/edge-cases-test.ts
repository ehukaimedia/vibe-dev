#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';

console.log('Testing Vibe Terminal Edge Cases...\n');

async function runEdgeCaseTests() {
  let passCount = 0;
  let failCount = 0;
  
  async function test(name: string, command: string, validator: (result: any) => boolean) {
    console.log(`Test: ${name}`);
    console.log(`Command: ${command}`);
    try {
      const result = await executeTerminalCommand(command);
      console.log(`Exit code: ${result.exitCode}`);
      console.log(`Duration: ${result.duration}ms`);
      console.log(`Output: ${result.output.substring(0, 100)}${result.output.length > 100 ? '...' : ''}`);
      
      const passed = validator(result);
      if (passed) {
        console.log('✅ PASSED\n');
        passCount++;
      } else {
        console.log('❌ FAILED\n');
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error}\n`);
      failCount++;
    }
  }
  
  // Test 1: Multiple commands with semicolons
  await test(
    'Multiple commands with semicolons',
    'echo "First"; echo "Second"; echo "Third"',
    (result) => result.output.includes('First') && result.output.includes('Second') && result.output.includes('Third')
  );
  
  // Test 2: Command with pipes
  await test(
    'Command with pipes',
    'echo "Hello World" | wc -w',
    (result) => result.output.trim() === '2'
  );
  
  // Test 3: Command with redirects
  await test(
    'Command with output redirect',
    'echo "Test content" > /tmp/vibe-test.txt && cat /tmp/vibe-test.txt',
    (result) => result.output.includes('Test content')
  );
  
  // Test 4: Command with &&
  await test(
    'Commands with && operator',
    'cd /tmp && pwd',
    (result) => result.output.trim() === '/tmp'
  );
  
  // Test 5: Command with ||
  await test(
    'Commands with || operator',
    'false || echo "Fallback executed"',
    (result) => result.output.includes('Fallback executed')
  );
  
  // Test 6: Command with backticks
  await test(
    'Command substitution with backticks',
    'echo "Current directory is: `pwd`"',
    (result) => result.output.includes('Current directory is:') && result.output.includes('/')
  );
  
  // Test 7: Command with $()
  await test(
    'Command substitution with $()',
    'echo "User is: $(whoami)"',
    (result) => result.output.includes('User is:') && result.output.trim().length > 8
  );
  
  // Test 8: Multi-line command with backslash
  await test(
    'Multi-line command',
    'echo "This is a very long command that \\\nspans multiple lines"',
    (result) => result.output.includes('This is a very long command that spans multiple lines')
  );
  
  // Test 9: Special characters in strings
  await test(
    'Special characters',
    'echo "Test with special chars: $HOME | && > < \'\\" `test`"',
    (result) => result.output.includes('Test with special chars:') && result.output.includes('|')
  );
  
  // Test 10: Unicode characters
  await test(
    'Unicode characters',
    'echo "Hello 🌍 World 🚀"',
    (result) => result.output.includes('Hello') && result.output.includes('World')
  );
  
  // Test 11: Environment variable usage
  await test(
    'Environment variable expansion',
    'echo "Home is: $HOME"',
    (result) => result.output.includes('Home is:') && result.output.includes('/Users')
  );
  
  // Test 12: Creating and executing a script
  await test(
    'Create and execute script',
    'echo "#!/bin/bash\\necho Script executed" > /tmp/test.sh && chmod +x /tmp/test.sh && /tmp/test.sh',
    (result) => result.output.includes('Script executed')
  );
  
  // Test 13: Command with quotes in quotes
  await test(
    'Nested quotes',
    'echo "He said \\"Hello\\""',
    (result) => result.output.includes('He said "Hello"')
  );
  
  // Test 14: Long running command (with timeout handling)
  await test(
    'Command timeout handling',
    'sleep 2 && echo "Done"',
    (result) => result.output.includes('Done') || result.exitCode === -1
  );
  
  // Test 15: Error handling
  await test(
    'Command that fails',
    'ls /nonexistent/directory/path',
    (result) => result.exitCode !== 0
  );
  
  // Summary
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                        TEST SUMMARY                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`Total tests: ${passCount + failCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
  
  process.exit(failCount > 0 ? 1 : 0);
}

runEdgeCaseTests();