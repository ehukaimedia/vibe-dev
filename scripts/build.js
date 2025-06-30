#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const isWindows = platform() === 'win32';

console.log(`\n🏗️  Building Vibe Dev for ${isWindows ? 'Windows' : 'macOS'}...\n`);

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
      cwd: projectRoot,
      ...options
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
      } else {
        resolve();
      }
    });
    
    child.on('error', reject);
  });
}

async function build() {
  try {
    // Check if this is a clean build request
    const args = process.argv.slice(2);
    const cleanBuild = args.includes('--clean');
    const skipVerify = args.includes('--no-verify');
    
    // Step 1: Clean (only if requested or no dist exists)
    const { existsSync } = await import('fs');
    const distExists = existsSync(join(projectRoot, 'dist'));
    if (cleanBuild || !distExists) {
      await runCommand('node', ['scripts/clean.js']);
    }
    
    // Step 2: TypeScript compilation (incremental by default)
    console.log('📦 Compiling TypeScript...');
    await runCommand('npx', ['tsc', '--incremental']);
    
    // Step 3: Post-build processing
    await runCommand('node', ['scripts/post-build.js']);
    
    // Step 4: Verify build (only if not skipped)
    if (!skipVerify) {
      console.log('📦 Verifying build...');
      await runCommand('node', ['scripts/verify-build.js']);
    }
    
    console.log('\n✅ Build completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
build();