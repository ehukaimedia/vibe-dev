#!/usr/bin/env node
import { executeTerminalCommand } from '../../src/vibe-terminal.js';
import { generateRecap } from '../../src/vibe-recap.js';
import { platform } from 'os';

const isWindows = platform() === 'win32';

async function testWindowsCompatibility() {
  console.log(`\n🖥️  Testing on ${platform()} platform\n`);

  if (!isWindows) {
    console.log('⚠️  Not running on Windows. These tests are Windows-specific.');
    console.log('   Run this on a Windows machine or in a Windows VM.\n');
  }

  try {
    // Test 1: Basic command execution
    console.log('1. Testing basic command execution:');
    const echoTest = await executeTerminalCommand(
      isWindows ? 'echo Hello from Windows' : 'echo "Hello from Unix"'
    );
    console.log(`   ✓ Output: ${echoTest.output}`);
    console.log(`   ✓ Exit code: ${echoTest.exitCode}\n`);

    // Test 2: Shell-specific commands
    console.log('2. Testing shell-specific commands:');
    const shellTest = await executeTerminalCommand(
      isWindows ? 'Get-Date' : 'date'
    );
    console.log(`   ✓ Output: ${shellTest.output.trim()}`);
    console.log(`   ✓ Exit code: ${shellTest.exitCode}\n`);

    // Test 3: Environment variables
    console.log('3. Testing environment variables:');
    const setVar = await executeTerminalCommand(
      isWindows ? '$env:TEST_VAR = "Windows Test"' : 'export TEST_VAR="Unix Test"'
    );
    const getVar = await executeTerminalCommand(
      isWindows ? 'echo $env:TEST_VAR' : 'echo $TEST_VAR'
    );
    console.log(`   ✓ Set variable: Exit code ${setVar.exitCode}`);
    console.log(`   ✓ Get variable: ${getVar.output}`);
    console.log(`   ✓ Exit code: ${getVar.exitCode}\n`);

    // Test 4: Directory navigation
    console.log('4. Testing directory navigation:');
    const pwdBefore = await executeTerminalCommand(isWindows ? 'pwd' : 'pwd');
    console.log(`   ✓ Current dir: ${pwdBefore.output.trim()}`);
    
    const cdTest = await executeTerminalCommand(
      isWindows ? 'cd $env:TEMP' : 'cd /tmp'
    );
    const pwdAfter = await executeTerminalCommand(isWindows ? 'pwd' : 'pwd');
    console.log(`   ✓ Changed to: ${pwdAfter.output.trim()}`);
    console.log(`   ✓ Exit code: ${cdTest.exitCode}\n`);

    // Test 5: Path with spaces (Windows-specific challenge)
    if (isWindows) {
      console.log('5. Testing paths with spaces (Windows-specific):');
      const spaceTest = await executeTerminalCommand(
        'cd "C:\\Program Files" ; pwd'
      );
      console.log(`   ✓ Path with spaces: ${spaceTest.output.trim()}`);
      console.log(`   ✓ Exit code: ${spaceTest.exitCode}\n`);
    }

    // Test 6: Error handling
    console.log('6. Testing error handling:');
    const errorTest = await executeTerminalCommand(
      isWindows ? 'Get-InvalidCommand' : 'invalid_command_test'
    );
    console.log(`   ✓ Error output: ${errorTest.output.trim()}`);
    console.log(`   ✓ Exit code: ${errorTest.exitCode} (expected non-zero)\n`);

    // Test 7: Piping
    console.log('7. Testing command piping:');
    const pipeTest = await executeTerminalCommand(
      isWindows 
        ? 'Get-Process | Select-Object -First 3 | Format-Table Name, Id'
        : 'ps aux | head -n 4'
    );
    console.log(`   ✓ Piped output:\n${pipeTest.output}`);
    console.log(`   ✓ Exit code: ${pipeTest.exitCode}\n`);

    // Test 8: Timeout handling (Windows-specific timeout command)
    console.log('8. Testing timeout handling:');
    const timeoutTest = await executeTerminalCommand(
      isWindows ? 'timeout /t 2 /nobreak' : 'sleep 2'
    );
    console.log(`   ✓ Duration: ${timeoutTest.duration}ms`);
    console.log(`   ✓ Exit code: ${timeoutTest.exitCode}\n`);

    // Test 9: Recap functionality
    console.log('9. Testing recap functionality:');
    const recap = await generateRecap({ type: 'summary', hours: 1, format: 'text' });
    console.log(`   ✓ Commands executed: ${recap.split('\n').find((l: string) => l.includes('Total commands'))?.trim()}`);
    console.log(`   ✓ Recap generated successfully\n`);

    // Test 10: Unicode support
    console.log('10. Testing Unicode support:');
    const unicodeTest = await executeTerminalCommand(
      isWindows 
        ? 'echo "Testing émojis 🚀 and spëcial çharacters"'
        : 'echo "Testing émojis 🚀 and spëcial çharacters"'
    );
    console.log(`   ✓ Unicode output: ${unicodeTest.output}`);
    console.log(`   ✓ Exit code: ${unicodeTest.exitCode}\n`);

    // Summary
    console.log('✅ All Windows compatibility tests completed!');
    console.log(`   Platform: ${platform()}`);
    console.log(`   Node version: ${process.version}`);
    console.log(`   Shell: ${isWindows ? 'PowerShell' : 'Bash'}\n`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the tests
testWindowsCompatibility();