// Windows testing for Gemini CLI - READ ONLY
// GEMINI CLI: Run this test and report results, DO NOT modify production code

import { VibeTerminalPC } from '../../../dist/vibe-terminal-pc.js';

console.log('🧪 GEMINI CLI - Testing Windows Functionality (READ-ONLY)...\n');

async function testWindowsForGemini() {
  const terminal = new VibeTerminalPC({ promptTimeout: 3000 });
  
  try {
    console.log('=== GEMINI CLI TEST REPORT ===\n');
    
    console.log('1. Testing basic echo command...');
    const startTime = Date.now();
    const echoResult = await terminal.execute('echo "test"');
    const duration = Date.now() - startTime;
    
    console.log(`GEMINI REPORT: Command Duration: ${duration}ms`);
    console.log(`GEMINI REPORT: Exit Code: ${echoResult.exitCode}`);
    console.log(`GEMINI REPORT: Output: "${echoResult.output}"`);
    
    if (echoResult.exitCode === -1) {
      console.log('GEMINI REPORT: ❌ TIMEOUT DETECTED - Command timed out');
    } else if (echoResult.exitCode === 0) {
      console.log('GEMINI REPORT: ✅ Command completed successfully');
    } else {
      console.log('GEMINI REPORT: ⚠️ Unexpected exit code');
    }
    
    if (duration > 2000) {
      console.log('GEMINI REPORT: ❌ PERFORMANCE ISSUE - Command too slow');
    } else {
      console.log('GEMINI REPORT: ✅ Performance within target');
    }
    
    console.log('\n2. Testing working directory tracking...');
    const initialDir = terminal.getCurrentWorkingDirectory();
    console.log(`GEMINI REPORT: Initial directory: ${initialDir}`);
    
    console.log('\n3. Testing shell detection...');
    const sessionState = terminal.getSessionState();
    console.log(`GEMINI REPORT: Detected shell: ${sessionState.shellType}`);
    
    console.log('\n=== GEMINI CLI SUMMARY ===');
    console.log('Please report these findings to Claude:');
    console.log('- Command execution status');
    console.log('- Performance measurements'); 
    console.log('- Any timeout issues (-1 exit codes)');
    console.log('- Shell detection results');
    console.log('- Output quality (clean vs. with artifacts)');
    
  } catch (error) {
    console.log('GEMINI REPORT: ❌ CRITICAL ERROR:', error.message);
  } finally {
    terminal.destroy();
  }
}

testWindowsForGemini().catch(error => {
  console.log('GEMINI REPORT: ❌ TEST SUITE FAILED:', error.message);
});