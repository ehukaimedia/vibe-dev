#!/usr/bin/env node
import { executeTerminalCommand, getTerminal } from '../vibe-terminal.js';

async function testForLoop() {
  console.log('Testing for loop output...\n');
  
  try {
    console.log('1. Testing simple for loop:');
    const result1 = await executeTerminalCommand('for i in 1 2 3; do echo "Number: $i"; done');
    console.log(`   Output: "${result1.output}"`);
    console.log(`   Exit code: ${result1.exitCode}`);
    console.log(`   Expected: Should show "Number: 1", "Number: 2", "Number: 3"\n`);
    
    console.log('2. Testing for loop with files:');
    const result2 = await executeTerminalCommand('for f in *.json; do echo "File: $f"; done | head -3');
    console.log(`   Output: "${result2.output}"`);
    console.log(`   Exit code: ${result2.exitCode}\n`);
    
    console.log('3. Testing bash-style for loop:');
    const result3 = await executeTerminalCommand('for ((i=1; i<=3; i++)); do echo "Count: $i"; done');
    console.log(`   Output: "${result3.output}"`);
    console.log(`   Exit code: ${result3.exitCode}\n`);
    
    console.log('4. Testing while loop:');
    const result4 = await executeTerminalCommand('i=1; while [ $i -le 3 ]; do echo "While: $i"; i=$((i+1)); done');
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