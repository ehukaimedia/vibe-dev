#!/usr/bin/env node

import { createVibeTerminal } from '../dist/vibe-terminal.js';
import { detectPlatform } from '../dist/os-detector.js';

async function testTerminal() {
  console.log('\n🧪 Testing Vibe Terminal...\n');
  
  // Platform detection
  const platform = detectPlatform();
  console.log(`✓ Platform detected: ${platform}`);
  
  // Create terminal
  const terminal = createVibeTerminal();
  console.log('✓ Terminal created');
  
  // Test basic commands
  const tests = [
    { cmd: 'echo "Hello from Vibe Dev"', desc: 'Basic echo' },
    { cmd: 'pwd', desc: 'Current directory' },
    { cmd: process.platform === 'win32' ? 'echo %USERNAME%' : 'echo $USER', desc: 'Environment variable' }
  ];
  
  for (const test of tests) {
    console.log(`\n📝 Testing: ${test.desc}`);
    console.log(`   Command: ${test.cmd}`);
    
    try {
      const result = await terminal.execute(test.cmd);
      console.log(`   ✓ Exit code: ${result.exitCode}`);
      console.log(`   ✓ Output: ${result.output.trim()}`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Cleanup
  terminal.kill();
  console.log('\n✅ Terminal tests complete!\n');
}

testTerminal().catch(console.error);