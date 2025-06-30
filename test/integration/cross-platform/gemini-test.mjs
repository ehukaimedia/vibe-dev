// Cross-platform test for Gemini CLI - READ ONLY
// GEMINI CLI: Run this test on BOTH Mac and PC to validate cross-platform functionality
// When on PC, update GEMINI_REPORTS.md with PC-specific results
// When on Mac, use for verification only (don't update reports)

import { createVibeTerminal } from '../../../dist/vibe-terminal.js';

console.log('🧪 GEMINI CLI - Cross-Platform Test (READ-ONLY)...\n');

async function testCrossPlatformForGemini() {
  const platform = process.platform === 'darwin' ? 'Mac' : 'Windows';
  const isWindows = process.platform === 'win32';
  const terminal = createVibeTerminal({ promptTimeout: 3000 });
  
  try {
    console.log(`=== GEMINI CLI TEST REPORT - ${platform} ===\n`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Test Time: ${new Date().toISOString()}`);
    console.log(`Should Update Report: ${isWindows ? 'YES - Update GEMINI_REPORTS.md' : 'NO - Mac test for verification only'}\n`);
    
    // Test 1: Basic echo command
    console.log('1. Testing basic echo command...');
    const startTime = Date.now();
    const echoResult = await terminal.execute('echo "test"');
    const duration = Date.now() - startTime;
    
    console.log(`GEMINI REPORT: Platform: ${platform}`);
    console.log(`GEMINI REPORT: Command Duration: ${duration}ms`);
    console.log(`GEMINI REPORT: Exit Code: ${echoResult.exitCode}`);
    console.log(`GEMINI REPORT: Output: "${echoResult.output}"`);
    console.log(`GEMINI REPORT: Output Length: ${echoResult.output.length} chars`);
    
    if (echoResult.exitCode === -1) {
      console.log('GEMINI REPORT: ❌ TIMEOUT DETECTED - Command timed out');
    } else if (echoResult.exitCode === 0) {
      console.log('GEMINI REPORT: ✅ Command completed successfully');
    } else {
      console.log(`GEMINI REPORT: ⚠️ Unexpected exit code: ${echoResult.exitCode}`);
    }
    
    if (duration > 2000) {
      console.log('GEMINI REPORT: ❌ PERFORMANCE ISSUE - Command too slow');
    } else {
      console.log('GEMINI REPORT: ✅ Performance within target');
    }
    
    // Test 2: Directory operations
    console.log('\n2. Testing directory operations...');
    const dirCommand = platform === 'Mac' ? 'pwd' : 'cd';
    const dirResult = await terminal.execute(dirCommand);
    console.log(`GEMINI REPORT: ${dirCommand} Exit Code: ${dirResult.exitCode}`);
    console.log(`GEMINI REPORT: ${dirCommand} Output: "${dirResult.output.trim()}"`);
    
    // Test 3: Session state
    console.log('\n3. Testing session state...');
    const sessionState = terminal.getSessionState();
    console.log(`GEMINI REPORT: Session ID: ${sessionState.sessionId}`);
    console.log(`GEMINI REPORT: Shell Type: ${sessionState.shellType}`);
    console.log(`GEMINI REPORT: Working Directory: ${terminal.getCurrentWorkingDirectory()}`);
    
    // Test 4: Environment variables
    console.log('\n4. Testing environment variables...');
    const envCommand = platform === 'Mac' ? 'echo $HOME' : 'echo %USERPROFILE%';
    const envResult = await terminal.execute(envCommand);
    console.log(`GEMINI REPORT: Env Var Exit Code: ${envResult.exitCode}`);
    console.log(`GEMINI REPORT: Env Var Output: "${envResult.output.trim()}"`);
    
    // Test 5: Command chaining
    console.log('\n5. Testing command chaining...');
    const chainCommand = platform === 'Mac' 
      ? 'echo "first" && echo "second"' 
      : 'echo first && echo second';
    const chainResult = await terminal.execute(chainCommand);
    console.log(`GEMINI REPORT: Chain Exit Code: ${chainResult.exitCode}`);
    console.log(`GEMINI REPORT: Chain Output: "${chainResult.output}"`);
    
    // Summary
    console.log('\n=== GEMINI CLI SUMMARY ===');
    console.log(`Platform Tested: ${platform}`);
    console.log('Key Metrics:');
    console.log(`- Echo Command Duration: ${duration}ms`);
    console.log(`- Echo Exit Code: ${echoResult.exitCode}`);
    console.log(`- Clean Output: ${echoResult.output.trim() === 'test' ? 'Yes' : 'No'}`);
    console.log(`- Shell Detection: ${sessionState.shellType}`);
    
    if (platform === 'Windows') {
      console.log('\n⚠️  IMPORTANT: Update GEMINI_REPORTS.md with these Windows results!');
      console.log('📁 File: /docs/gemini-handoffs/GEMINI_REPORTS.md');
    } else {
      console.log('\n✅ Mac test completed - For verification only, no report update needed');
    }
    
  } catch (error) {
    console.log(`GEMINI REPORT: ❌ CRITICAL ERROR on ${platform}:`, error.message);
    console.log('Stack trace:', error.stack);
  } finally {
    terminal.destroy();
  }
}

testCrossPlatformForGemini().catch(error => {
  console.log('GEMINI REPORT: ❌ TEST SUITE FAILED:', error.message);
  process.exit(1);
});