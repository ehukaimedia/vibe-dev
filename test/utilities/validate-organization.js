#!/usr/bin/env node
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function findTestFiles(dir, files = []) {
  const items = readdirSync(dir);
  for (const item of items) {
    const path = join(dir, item);
    if (statSync(path).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTestFiles(path, files);
    } else if (item.endsWith('.test.ts') || item.endsWith('.spec.ts')) {
      files.push(path);
    }
  }
  return files;
}

const srcTests = findTestFiles('src');
if (srcTests.length > 0) {
  console.error('❌ Test files found in src directory:');
  srcTests.forEach(f => console.error(`   ${f}`));
  process.exit(1);
} else {
  console.log('✅ No test files in src directory');
}