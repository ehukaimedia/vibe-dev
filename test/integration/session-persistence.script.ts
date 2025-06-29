#!/usr/bin/env node
import { executeTerminalCommand } from '../../src/vibe-terminal.js';
import { platform, tmpdir } from 'os';

const isWindows = platform() === 'win32';
const tempDir = tmpdir();

console.log('Testing Vibe Terminal Session Persistence...\n');

async function runTests() {
  try {
    // Test 1: Directory persistence
    console.log('Test 1: Directory persistence');
    console.log(`Changing to ${tempDir} directory...`);
    const cd_result = await executeTerminalCommand(`cd "${tempDir}"`);
    console.log(`Output: ${cd_result.output}`);
    console.log(`Exit code: ${cd_result.exitCode}`);
    console.log(`Duration: ${cd_result.duration}ms\n`);
    
    console.log('Checking current directory with pwd...');
    const pwd_result = await executeTerminalCommand('pwd');
    console.log(`Output: ${pwd_result.output}`);
    console.log(`Exit code: ${pwd_result.exitCode}`);
    
    if (pwd_result.output.includes(tempDir) || pwd_result.output.includes(tempDir.split('/').pop() || tempDir)) {
      console.log('✅ SUCCESS: Directory persistence works!\n');
    } else {
      console.log(`❌ FAIL: Expected ${tempDir}, got: ${pwd_result.output}\n`);
    }
    
    // Test 2: Environment variable persistence
    console.log('Test 2: Environment variable persistence');
    console.log('Setting TEST_VAR...');
    const setVarCmd = isWindows 
      ? '$env:TEST_VAR = "Vibe Dev Works!"'
      : 'export TEST_VAR="Vibe Dev Works!"';
    const export_result = await executeTerminalCommand(setVarCmd);
    console.log(`Output: ${export_result.output}`);
    console.log(`Exit code: ${export_result.exitCode}\n`);
    
    console.log('Reading TEST_VAR...');
    const getVarCmd = isWindows 
      ? 'Write-Output $env:TEST_VAR'
      : 'echo $TEST_VAR';
    const echo_result = await executeTerminalCommand(getVarCmd);
    console.log(`Output: ${echo_result.output}`);
    console.log(`Exit code: ${echo_result.exitCode}`);
    
    if (echo_result.output.includes('Vibe Dev Works!')) {
      console.log('✅ SUCCESS: Environment variable persistence works!\n');
    } else {
      console.log(`❌ FAIL: Expected "Vibe Dev Works!", got: ${echo_result.output}\n`);
    }
    
    // Test 3: Multiple commands in sequence
    console.log('Test 3: Multiple commands in sequence');
    const commands = isWindows ? [
      'Write-Output "First command"',
      'Write-Output "Second command"',
      'Write-Output "Third command"'
    ] : [
      'echo "First command"',
      'echo "Second command"',
      'echo "Third command"'
    ];
    
    for (let i = 0; i < commands.length; i++) {
      console.log(`Running command ${i + 1}: ${commands[i]}`);
      const result = await executeTerminalCommand(commands[i]);
      console.log(`Output: ${result.output}`);
      console.log(`Exit code: ${result.exitCode}\n`);
    }
    
    // Test 4: Working directory is still the same
    console.log('Test 4: Working directory persistence after multiple commands');
    const final_pwd = await executeTerminalCommand('pwd');
    console.log(`Current directory: ${final_pwd.output}`);
    
    if (final_pwd.output.includes(tempDir) || final_pwd.output.includes(tempDir.split('/').pop() || tempDir)) {
      console.log('✅ SUCCESS: Working directory persisted!\n');
    } else {
      console.log(`❌ FAIL: Working directory changed to: ${final_pwd.output}\n`);
    }
    
    // Test 5: Create and list files
    console.log('Test 5: Create and list files');
    const filename = isWindows ? 'test_file.txt' : 'test_file.txt';
    const createCmd = isWindows 
      ? `Write-Output "Test content" > "${filename}"`
      : `echo "Test content" > ${filename}`;
    const create_result = await executeTerminalCommand(createCmd);
    console.log(`Created file: exit code ${create_result.exitCode}`);
    
    const listCmd = isWindows 
      ? `Get-ChildItem ${filename}`
      : `ls -la ${filename}`;
    const list_result = await executeTerminalCommand(listCmd);
    console.log(`List file: ${list_result.output}`);
    
    if (list_result.output.includes(filename) && list_result.exitCode === 0) {
      console.log('✅ SUCCESS: File operations work across commands!\n');
    } else {
      console.log('❌ FAIL: File not found or list failed\n');
    }
    
    // Cleanup
    const cleanupCmd = isWindows 
      ? `Remove-Item ${filename} -ErrorAction SilentlyContinue`
      : `rm -f ${filename}`;
    await executeTerminalCommand(cleanupCmd);
    
    console.log('All session persistence tests completed!');
    
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runTests();