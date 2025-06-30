#!/usr/bin/env node

import { rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function clean() {
  const dirsToClean = ['dist', 'coverage', '.tsbuildinfo'];
  
  console.log('🧹 Cleaning build artifacts...');
  
  for (const dir of dirsToClean) {
    try {
      await rm(join(projectRoot, dir), { recursive: true, force: true });
      console.log(`  ✓ Removed ${dir}`);
    } catch (error) {
      // Ignore errors for non-existent directories
    }
  }
  
  console.log('✨ Clean complete');
}

clean().catch(console.error);