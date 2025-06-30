#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Ensure the main entry point has the proper shebang
const mainFile = join(projectRoot, 'dist', 'index.js');
if (existsSync(mainFile)) {
  const content = readFileSync(mainFile, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    writeFileSync(mainFile, '#!/usr/bin/env node\n' + content);
    console.log('✓ Added shebang to dist/index.js');
  }
  // Only log if we did something
}