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
  
  // Note: Node 18 doesn't support --test-timeout or --test-force-exit
  // Tests will run without timeout, but CI environment is properly set
  
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