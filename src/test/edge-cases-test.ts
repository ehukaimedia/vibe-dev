#!/usr/bin/env node
import { executeTerminalCommand, getTerminal } from '../vibe-terminal.js';
import { platform, tmpdir } from 'os';
import { join } from 'path';

const isWindows = platform() === 'win32';
const tempDir = tmpdir();

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
    isWindows 
      ? 'Write-Output "First"; Write-Output "Second"; Write-Output "Third"'
      : 'echo "First"; echo "Second"; echo "Third"',
    (result) => result.output.includes('First') && result.output.includes('Second') && result.output.includes('Third')
  );
  
  // Test 2: Command with pipes
  await test(
    'Command with pipes',
    isWindows
      ? 'Write-Output "Hello World" | Measure-Object -Word | Select-Object -ExpandProperty Words'
      : 'echo "Hello World" | wc -w',
    (result) => result.output.trim() === '2'
  );
  
  // Test 3: Command with redirects
  const testFile = join(tempDir, 'vibe-test.txt');
  await test(
    'Command with output redirect',
    isWindows
      ? `Write-Output "Test content" > "${testFile}"; Get-Content "${testFile}"`
      : `echo "Test content" > ${testFile} && cat ${testFile}`,
    (result) => result.output.includes('Test content')
  );
  
  // Test 4: Commands with && operator
  await test(
    'Commands with && operator',
    isWindows
      ? `cd "${tempDir}"; pwd`
      : `cd ${tempDir} && pwd`,
    (result) => result.output.includes(tempDir.split('/').pop() || tempDir)
  );
  
  // Test 5: Commands with || operator
  await test(
    'Commands with || operator',
    isWindows
      ? 'Get-Item NonExistent 2>$null; if (-not $?) { Write-Output "Fallback executed" }'
      : 'false || echo "Fallback executed"',
    (result) => result.output.includes('Fallback executed')
  );
  
  // Test 6: Command substitution with backticks
  await test(
    'Command substitution with backticks',
    isWindows
      ? 'Write-Output "Current directory is: $(pwd)"'
      : 'echo "Current directory is: `pwd`"',
    (result) => result.output.includes('Current directory is:')
  );
  
  // Test 7: Command substitution with $()
  await test(
    'Command substitution with $()',
    isWindows
      ? 'Write-Output "User is: $(whoami)"'
      : 'echo "User is: $(whoami)"',
    (result) => result.output.includes('User is:')
  );
  
  // Test 8: Multi-line command
  await test(
    'Multi-line command',
    isWindows
      ? 'Write-Output "This is a very long command that `\nspans multiple lines"'
      : 'echo "This is a very long command that \\\nspans multiple lines"',
    (result) => result.output.includes('This is a very long command')
  );
  
  // Test 9: Special characters
  await test(
    'Special characters',
    isWindows
      ? 'Write-Output "Test with special chars: $HOME | && > < \'\\" ``test``"'
      : 'echo "Test with special chars: $HOME | && > < \'\\" `test`"',
    (result) => result.output.includes('Test with special chars:')
  );
  
  // Test 10: Unicode characters
  await test(
    'Unicode characters',
    isWindows
      ? 'Write-Output "Hello 🌍 World 🚀"'
      : 'echo "Hello 🌍 World 🚀"',
    (result) => result.output.includes('Hello') && result.output.includes('World')
  );
  
  // Test 11: Environment variable expansion
  await test(
    'Environment variable expansion',
    isWindows
      ? 'Write-Output "Home is: $env:HOME"'
      : 'echo "Home is: $HOME"',
    (result) => result.output.includes('Home is:')
  );
  
  // Test 12: Create and execute script
  const scriptFile = isWindows 
    ? join(tempDir, 'test.ps1')
    : join(tempDir, 'test.sh');
  await test(
    'Create and execute script',
    isWindows
      ? `Write-Output 'Write-Output "Script executed"' > "${scriptFile}"; & "${scriptFile}"`
      : `echo "#!/bin/bash\\necho Script executed" > ${scriptFile} && chmod +x ${scriptFile} && ${scriptFile}`,
    (result) => result.output.includes('Script executed')
  );
  
  // Test 13: Nested quotes
  await test(
    'Nested quotes',
    isWindows
      ? 'Write-Output "He said \\"Hello\\""'
      : 'echo "He said \\"Hello\\""',
    (result) => result.output.includes('He said') && result.output.includes('Hello')
  );
  
  // Test 14: Command timeout handling
  await test(
    'Command timeout handling',
    isWindows
      ? 'Start-Sleep -Seconds 2; Write-Output "Done"'
      : 'sleep 2 && echo "Done"',
    (result) => result.output.includes('Done') && result.duration >= 2000
  );
  
  // Test 15: Command that fails
  await test(
    'Command that fails',
    isWindows
      ? 'Get-Item /nonexistent/directory/path 2>&1'
      : 'ls /nonexistent/directory/path',
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
  
  // Clean up and exit
  getTerminal().kill();
  process.exit(failCount > 0 ? 1 : 0);
}

runEdgeCaseTests();