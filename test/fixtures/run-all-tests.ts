#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';

const tests = [
  'edge-cases-test.js',
  'session-persistence-test.js',
  'output-isolation-test.js',
  'working-dir-tracking-test.js',
  'mcp-protocol-test.js',
  'mcp-tools-test.js',
  'pty-test.js',
  'recap-types-test.js'
];

async function runTest(testFile: string): Promise<{ name: string; passed: boolean; error?: string }> {
  return new Promise((resolve) => {
    const testPath = path.join('dist/src/test', testFile);
    const proc = spawn('node', ['--test', testPath], { stdio: 'pipe' });
    
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });
    
    proc.on('close', (code) => {
      const passed = code === 0;
      resolve({
        name: testFile,
        passed,
        error: !passed ? output.slice(-200) : undefined
      });
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      proc.kill();
      resolve({
        name: testFile,
        passed: false,
        error: 'Timeout after 30 seconds'
      });
    }, 30000);
  });
}

async function runAllTests() {
  console.log('Running all tests individually...\n');
  
  const results = [];
  for (const test of tests) {
    console.log(`Running ${test}...`);
    const result = await runTest(test);
    results.push(result);
    console.log(`  ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  console.log('\n=== TEST SUMMARY ===');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error?.split('\n')[0]}`);
    });
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();