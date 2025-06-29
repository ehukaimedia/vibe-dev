const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Check if node is available
try {
  const nodeVersion = execSync('node --version').toString();
  console.log('Node version:', nodeVersion);
} catch (e) {
  console.log('Node not found in PATH');
  console.log('Trying common Node locations...');
  
  // Common Node installation paths on Windows
  const nodePaths = [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    'C:\\nodejs\\node.exe',
    process.env.APPDATA + '\\npm\\node.exe'
  ];
  
  for (const nodePath of nodePaths) {
    if (fs.existsSync(nodePath)) {
      console.log('Found Node at:', nodePath);
      break;
    }
  }
}

// Check if TypeScript is available
try {
  const tscVersion = execSync('npx tsc --version').toString();
  console.log('TypeScript version:', tscVersion);
} catch (e) {
  console.log('TypeScript not accessible via npx');
}

// Check project directory
const projectDir = 'C:\\Users\\arsen\\Desktop\\AI-Applications\\Node\\vibe-dev';
console.log('Project exists:', fs.existsSync(projectDir));

// Check source file
const srcFile = path.join(projectDir, 'src', 'vibe-terminal-pc.ts');
console.log('Source file exists:', fs.existsSync(srcFile));

// Check if dist exists
const distDir = path.join(projectDir, 'dist');
console.log('Dist directory exists:', fs.existsSync(distDir));