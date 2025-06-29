# Windows Development Workflow - Production Guide

## Date: 2025-06-29
**Purpose**: Official Windows development workflow for Vibe Dev  
**Status**: PRODUCTION  
**Platform**: Windows (PC)

---

## 🎯 Windows Developer Mission

Develop and maintain Windows-specific terminal functionality while preserving cross-platform integrity.

**Core Principle**: Test-Driven Development with platform isolation.

---

## 📁 Windows Developer Domain

### ✅ Files You OWN and CAN Modify:
```
src/vibe-terminal-pc.ts        # Windows terminal implementation
test/pc/**/*.test.ts          # ALL Windows-specific tests
test/pc/windows_files/        # Windows scripts (.bat, .ps1, .cmd)
docs/claude-handoffs/*.md     # Implementation handoffs
docs/STATUS.md               # Session documentation (updates only)
```

### ❌ Files You CANNOT Modify (Mac Domain):
```
src/vibe-terminal-base.ts     # Base class - READ ONLY
src/vibe-terminal-mac.ts      # Mac implementation - READ ONLY
src/vibe-terminal.ts          # Factory pattern - READ ONLY
src/vibe-recap.ts            # Cross-platform - READ ONLY
src/os-detector.ts           # Platform detection - READ ONLY
src/types.ts                 # Shared types - READ ONLY
src/pty-adapter.ts           # PTY adapter - READ ONLY
src/index.ts                 # Entry point - READ ONLY
src/server.ts                # MCP server - READ ONLY
test/mac/**                  # Mac tests - READ ONLY
test/unit/**                 # Cross-platform tests - READ ONLY
```

---

## 🔧 Windows Development Workflow

### 1. Session Start Protocol
```powershell
# Navigate to project
cd C:\Users\[username]\Desktop\AI-Applications\Node\vibe-dev

# Verify branch
git status
git branch --show-current

# Pull latest changes (ALWAYS)
git pull origin [current-branch]

# Build project
npm run build

# Check recent commits
git log --oneline -10
```

### 2. TDD Workflow for Windows

#### Step 1: Write Failing Test (RED)
```typescript
// test/pc/windows-feature.test.ts
import { describe, test, expect } from '@jest/globals';
import { VibeTerminalPC } from '../../src/vibe-terminal-pc.js';

describe('Windows Terminal Feature', () => {
  test('handles PowerShell specific behavior', async () => {
    const terminal = new VibeTerminalPC();
    const result = await terminal.execute('Get-Location');
    
    // This should fail initially
    expect(result.output).not.toContain('PS ');
    expect(result.exitCode).toBe(0);
  });
});
```

#### Step 2: Implement in Windows File (GREEN)
```typescript
// src/vibe-terminal-pc.ts
export class VibeTerminalPC extends VibeTerminalBase {
  protected cleanOutput(rawOutput: string, command: string): string {
    let output = super.cleanOutput(rawOutput, command);
    
    // Windows-specific cleaning
    output = output.replace(/^PS [A-Z]:\\.*>\s*/gm, '');
    
    return output;
  }
}
```

#### Step 3: Refactor and Test
```powershell
# Run tests
npm test test/pc/

# If npm test fails on Windows, use:
npx jest test/pc/
# OR
"C:\Program Files\Git\bin\bash.exe" -c "npm test test/pc/"
```

### 3. Path Handling Rules

#### ❌ NEVER Hardcode Paths:
```javascript
// WRONG - Never do this
const configPath = "C:\\Users\\username\\Desktop\\vibe-dev\\config.json";
const nodePath = "C:\\Program Files\\nodejs\\node.exe";
const projectPath = "C:\\Users\\arsen\\Desktop\\AI-Applications\\Node\\vibe-dev";
```

#### ✅ ALWAYS Use Path Utilities:
```javascript
// CORRECT - Always do this
import * as path from 'path';
import * as os from 'os';

const configPath = path.join(process.cwd(), 'config.json');
const homeDir = os.homedir();
const desktopPath = path.join(homeDir, 'Desktop');
const projectPath = path.join(desktopPath, 'AI-Applications', 'Node', 'vibe-dev');

// For tilde expansion
if (inputPath.startsWith('~')) {
  inputPath = path.join(os.homedir(), inputPath.slice(1));
}
```

### 4. Windows-Specific Implementation Guidelines

#### Shell Detection:
```typescript
detectShellType(shellPath: string): SessionState['shellType'] {
  const lowerPath = shellPath.toLowerCase();
  if (lowerPath.includes('powershell')) return 'powershell';
  if (lowerPath.includes('pwsh')) return 'powershell';
  if (lowerPath.includes('cmd.exe')) return 'unknown'; // No 'cmd' type
  if (lowerPath.includes('bash')) return 'bash';
  if (lowerPath.includes('zsh')) return 'zsh';
  return 'unknown';
}
```

#### Prompt Detection:
```typescript
protected isAtPrompt(output: string): boolean {
  const lines = output.split(/\r?\n/);
  const lastLine = lines[lines.length - 1].trim();
  
  // PowerShell: PS C:\...>
  if (/^PS [A-Z]:\\.*>\s*$/.test(lastLine)) return true;
  
  // CMD: C:\...>
  if (/^[A-Z]:\\.*>\s*$/.test(lastLine)) return true;
  
  // Git Bash: $
  if (/\$\s*$/.test(lastLine)) return true;
  
  return false;
}
```

#### Output Cleaning:
```typescript
cleanOutput(rawOutput: string, command: string): string {
  // Convert Windows line endings
  let output = rawOutput.replace(/\r\n/g, '\n');
  
  // Remove command echo
  if (output.startsWith(command)) {
    output = output.substring(command.length).trimStart();
  }
  
  // Remove prompts
  output = output.replace(/^PS [A-Z]:\\.*>\s*/gm, '');
  output = output.replace(/^[A-Z]:\\.*>\s*/gm, '');
  
  return output.trim();
}
```

### 5. Cross-Platform Issue Protocol

If you encounter an issue that requires base class changes:

1. **Write a failing test** that demonstrates the issue
2. **Create detailed handoff** for Mac:
   ```markdown
   # Cross-Platform Issue: [Title]
   
   ## Problem
   [Description of issue on Windows]
   
   ## Test Case
   See: test/pc/[test-file].test.ts
   
   ## Expected Behavior
   [What should happen]
   
   ## Suggested Fix
   [If you have ideas for base class changes]
   ```
3. **Implement workaround** in `vibe-terminal-pc.ts` if possible
4. **Wait for Mac** to fix base class
5. **Pull and verify** fix works on Windows

### 6. Git Workflow

#### Safe Commit Process:
```powershell
# Check what you're about to commit
git status
git diff

# Add only your allowed files
git add src/vibe-terminal-pc.ts
git add test/pc/*.test.ts
git add docs/claude-handoffs/*.md

# Commit with descriptive message
git commit -m "feat(pc): implement Windows feature

- Added PowerShell prompt handling
- Fixed path normalization for Windows
- All PC tests passing"

# Push to current branch
git push origin [current-branch]
```

#### Branch Management:
```powershell
# Create feature branch
git checkout -b feat/windows-terminal-colors

# Switch branches
git checkout main
git checkout fix/windows-node-pty-blocker

# Update from remote
git fetch origin
git pull origin [branch-name]
```

### 7. Testing Guidelines

#### Running Tests on Windows:
```powershell
# Full test suite (may have issues)
npm test

# PC tests only
npx jest test/pc/

# With Git Bash
"C:\Program Files\Git\bin\bash.exe" -c "npm test test/pc/"

# Individual test file
npx jest test/pc/vibe-terminal-pc.test.ts

# With coverage
npx jest test/pc/ --coverage
```

#### Test Organization:
```
test/
├── pc/                        # Windows-specific tests
│   ├── vibe-terminal-pc.test.ts
│   ├── windows-prompts.test.ts
│   ├── powershell-commands.test.ts
│   └── windows_files/         # Test scripts
│       ├── test.bat
│       └── test.ps1
├── mac/                      # Mac tests (READ ONLY)
└── unit/                     # Cross-platform (READ ONLY)
```

### 8. Common Windows Issues and Solutions

#### Issue: Module Import Errors
```javascript
// Solution: Use .js extensions in imports
import { VibeTerminalBase } from './vibe-terminal-base.js';
// NOT: from './vibe-terminal-base'
```

#### Issue: Path Separators
```javascript
// Solution: Always use path.join()
const filePath = path.join('src', 'test', 'file.ts');
// NOT: 'src\\test\\file.ts' or 'src/test/file.ts'
```

#### Issue: Environment Variables
```javascript
// Solution: Handle both syntaxes
const expandedPath = inputPath
  .replace(/%([^%]+)%/g, (_, key) => process.env[key] || _)  // Windows
  .replace(/\$([A-Z_]+)/g, (_, key) => process.env[key] || _); // Unix
```

---

## 📋 Session Checklist

Before starting work:
- [ ] Pulled latest changes
- [ ] Build succeeds
- [ ] Understand current task
- [ ] Read recent handoffs

During development:
- [ ] Writing tests first (TDD)
- [ ] Only modifying allowed files
- [ ] No hardcoded paths
- [ ] Testing on Windows

Before committing:
- [ ] All PC tests pass
- [ ] No regression in functionality
- [ ] Code follows guidelines
- [ ] Clear commit message

End of session:
- [ ] Updated STATUS.md
- [ ] Created handoffs if needed
- [ ] Pushed all changes
- [ ] Documented next steps

---

## 🚀 Performance Guidelines

1. **Keep terminal sessions lightweight** - destroy when done
2. **Clean up resources** in afterEach blocks
3. **Use appropriate timeouts** for Windows commands
4. **Batch operations** when possible

---

## 🔴 Emergency Procedures

### Build Broken:
```powershell
# Clean and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Tests Failing:
```powershell
# Run with debugging
npx jest test/pc/ --verbose --no-cache
set DEBUG=* && npm test
```

### Git Issues:
```powershell
# Reset to clean state
git status
git stash
git pull origin [branch]
git stash pop  # If you want changes back
```

---

## 📚 Resources

- **Node.js Path Module**: https://nodejs.org/api/path.html
- **Jest Testing**: https://jestjs.io/docs/getting-started
- **Git Commands**: https://git-scm.com/docs
- **PowerShell**: https://docs.microsoft.com/powershell/

---

**Remember**: Excellence in Windows development means writing code that works perfectly on Windows while maintaining harmony with Mac/Linux implementations. Test thoroughly, document clearly, and always preserve cross-platform compatibility.