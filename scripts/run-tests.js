#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testDir = join(__dirname, '..', 'dist', 'src', 'test');

try {
  const testFiles = readdirSync(testDir)
    .filter(file => file.endsWith('-test.js'))
    .map(file => join(testDir, file));

  if (testFiles.length === 0) {
    console.error('No test files found in', testDir);
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test files`);

  const args = ['--test'];
  
  // Add timeout if in CI or passed via command line
  if (process.env.CI || process.argv.includes('--timeout')) {
    args.push('--test-timeout=30000');
  }
  
  // Add force exit in CI
  if (process.env.CI) {
    args.push('--test-force-exit');
  }
  
  args.push(...testFiles);
  
  const child = spawn(process.execPath, args, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      CI: process.env.CI || 'false'
    }
  });

  child.on('close', (code) => {
    // Give a moment for cleanup
    setTimeout(() => {
      process.exit(code);
    }, 100);
  });
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}