#!/usr/bin/env node
import { executeTerminalCommand, getTerminal } from '../vibe-terminal.js';
import { platform } from 'os';

const isWindows = platform() === 'win32';

async function testForLoop() {
  console.log('Testing for loop output...\n');
  
  try {
    console.log('1. Testing simple for loop:');
    const cmd1 = isWindows 
      ? '1..3 | ForEach-Object { Write-Output "Number: $_" }'
      : 'for i in 1 2 3; do echo "Number: $i"; done';
    const result1 = await executeTerminalCommand(cmd1);
    console.log(`   Output: "${result1.output}"`);
    console.log(`   Exit code: ${result1.exitCode}`);
    console.log(`   Expected: Should show "Number: 1", "Number: 2", "Number: 3"\n`);
    
    console.log('2. Testing for loop with files:');
    const cmd2 = isWindows
      ? 'Get-ChildItem *.json | Select-Object -First 3 | ForEach-Object { Write-Output "File: $($_.Name)" }'
      : 'for f in *.json; do echo "File: $f"; done | head -3';
    const result2 = await executeTerminalCommand(cmd2);
    console.log(`   Output: "${result2.output}"`);
    console.log(`   Exit code: ${result2.exitCode}\n`);
    
    console.log('3. Testing bash-style for loop:');
    const cmd3 = isWindows
      ? 'for ($i=1; $i -le 3; $i++) { Write-Output "Count: $i" }'
      : 'for ((i=1; i<=3; i++)); do echo "Count: $i"; done';
    const result3 = await executeTerminalCommand(cmd3);
    console.log(`   Output: "${result3.output}"`);
    console.log(`   Exit code: ${result3.exitCode}\n`);
    
    console.log('4. Testing while loop:');
    const cmd4 = isWindows
      ? '$i=1; while ($i -le 3) { Write-Output "While: $i"; $i++ }'
      : 'i=1; while [ $i -le 3 ]; do echo "While: $i"; i=$((i+1)); done';
    const result4 = await executeTerminalCommand(cmd4);
    console.log(`   Output: "${result4.output}"`);
    console.log(`   Exit code: ${result4.exitCode}\n`);
    
    // Check if loops produce output
    if (result1.output.includes('Number:') && result1.exitCode === 0) {
      console.log('✅ SUCCESS: For loops produce expected output!');
    } else {
      console.log('❌ ISSUE: For loops may not be producing expected output');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
    getTerminal().kill();
    process.exit(1);
  }
  
  getTerminal().kill();
  process.exit(0);
}

testForLoop();