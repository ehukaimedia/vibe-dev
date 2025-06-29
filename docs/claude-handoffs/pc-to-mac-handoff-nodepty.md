# PC to Mac Handoff - node-pty Build Blocker

## 🚨 Urgent: Windows Development Blocked

**Date**: 2025-01-06  
**From**: PC Developer  
**To**: Mac Developer (Claude Code)  
**Priority**: CRITICAL - Blocking all Windows development  

## The Problem

node-pty fails to build on Windows with Visual Studio 2022 Preview:
```
npm error C:\...\node-pty\src\win\winpty.cc(218,25): error C2362: initialization of 'marshal' is skipped by 'goto cleanup'
npm error C:\...\node-pty\src\win\winpty.cc(209,8): error C2362: initialization of 'spawnSuccess' is skipped by 'goto cleanup'
npm error C:\...\node-pty\src\win\winpty.cc(208,10): error C2362: initialization of 'handle' is skipped by 'goto cleanup'
```

This is a known issue (microsoft/node-pty#683) where VS2022's stricter C++ compliance catches goto statements jumping over variable initialization in winpty.cc.

## What I Need From You (Mac)

Please implement ONE of these solutions to unblock Windows development:

### Option A: Make node-pty Optional (Recommended)

1. **Update package.json**:
```json
{
  "dependencies": {
    // Remove node-pty from here
  },
  "optionalDependencies": {
    "node-pty": "^1.0.0"
  }
}
```

2. **Create PTY abstraction in src/pty-adapter.ts**:
```typescript
// src/pty-adapter.ts
import { spawn as nodeSpawn, ChildProcess } from 'child_process';
import { Readable, Writable } from 'stream';

export interface IPtyAdapter {
  onData(callback: (data: string) => void): void;
  write(data: string): void;
  kill(): void;
  resize(cols: number, rows: number): void;
  pid: number;
}

class NodePtyAdapter implements IPtyAdapter {
  private pty: any;
  
  constructor(shell: string, args: string[], options: any) {
    const ptyModule = require('node-pty');
    this.pty = ptyModule.spawn(shell, args, options);
  }
  
  onData(callback: (data: string) => void): void {
    this.pty.onData(callback);
  }
  
  write(data: string): void {
    this.pty.write(data);
  }
  
  kill(): void {
    this.pty.kill();
  }
  
  resize(cols: number, rows: number): void {
    this.pty.resize(cols, rows);
  }
  
  get pid(): number {
    return this.pty.pid;
  }
}

class ChildProcessAdapter implements IPtyAdapter {
  private process: ChildProcess;
  private stdout: Readable;
  private stdin: Writable;
  
  constructor(shell: string, args: string[], options: any) {
    this.process = nodeSpawn(shell, args, {
      shell: true,
      windowsHide: true,
      env: options.env,
      cwd: options.cwd,
    });
    
    this.stdout = this.process.stdout!;
    this.stdin = this.process.stdin!;
  }
  
  onData(callback: (data: string) => void): void {
    this.stdout.on('data', (chunk) => callback(chunk.toString()));
    this.process.stderr?.on('data', (chunk) => callback(chunk.toString()));
  }
  
  write(data: string): void {
    this.stdin.write(data);
  }
  
  kill(): void {
    this.process.kill();
  }
  
  resize(cols: number, rows: number): void {
    // Not supported in child_process, but won't break
  }
  
  get pid(): number {
    return this.process.pid || -1;
  }
}

export function createPtyAdapter(shell: string, args: string[], options: any): IPtyAdapter {
  try {
    // Try to load node-pty
    require.resolve('node-pty');
    return new NodePtyAdapter(shell, args, options);
  } catch (error) {
    console.warn('node-pty not available, falling back to child_process');
    return new ChildProcessAdapter(shell, args, options);
  }
}
```

3. **Update vibe-terminal-base.ts to use adapter**:
```typescript
// In vibe-terminal-base.ts
import { createPtyAdapter, IPtyAdapter } from './pty-adapter.js';

export abstract class VibeTerminalBase {
  protected ptyProcess: IPtyAdapter | null = null;
  
  protected spawnPty(shell: string, args: string[], options: any): void {
    this.ptyProcess = createPtyAdapter(shell, args, options);
    
    this.ptyProcess.onData((data: string) => {
      this.handleOutput(data);
    });
  }
  
  // Rest of implementation...
}
```

### Option B: Pre-built Binary Approach

1. **Add postinstall script to package.json**:
```json
{
  "scripts": {
    "postinstall": "node scripts/setup-node-pty.js"
  }
}
```

2. **Create scripts/setup-node-pty.js**:
```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.platform === 'win32') {
  console.log('Windows detected - checking for node-pty pre-built binaries...');
  
  try {
    // Try to download pre-built binary from GitHub releases
    const nodeVersion = process.version.match(/v(\d+)\./)[1];
    const arch = process.arch;
    const releaseUrl = `https://github.com/microsoft/node-pty/releases/download/v1.0.0/node-pty-v1.0.0-node-v${nodeVersion}-win32-${arch}.tar.gz`;
    
    console.log(`Attempting to download pre-built binary from ${releaseUrl}`);
    // Download and extract logic here
    
  } catch (error) {
    console.warn('Could not install pre-built node-pty, will use fallback');
  }
}
```

### Option C: Alternative Library (execa)

1. **Add execa to dependencies**:
```json
{
  "dependencies": {
    "execa": "^8.0.1"
  }
}
```

2. **Create Windows-specific implementation using execa**:
```typescript
// In vibe-terminal-pc.ts
import { execa, ExecaChildProcess } from 'execa';

export class VibeTerminalPC extends VibeTerminalBase {
  private process: ExecaChildProcess | null = null;
  private outputBuffer: string = '';
  
  async execute(command: string): Promise<{ output: string; exitCode: number }> {
    try {
      const shell = this.getDefaultShell();
      const { stdout, stderr, exitCode } = await execa(shell, ['/c', command], {
        shell: false,
        windowsVerbatimArguments: true,
        env: this.sessionState.env,
        cwd: this.sessionState.cwd,
      });
      
      const output = this.cleanOutput(stdout + stderr, command);
      return { output, exitCode: exitCode || 0 };
    } catch (error: any) {
      return { 
        output: error.stderr || error.message, 
        exitCode: error.exitCode || 1 
      };
    }
  }
}
```

## Implementation Steps for Mac

1. **Create branch from main** (PC hasn't pushed anything - they're blocked):
   ```bash
   git checkout main
   git checkout -b fix/windows-node-pty-blocker
   ```

2. **Implement Option A** (recommended):
   - Move node-pty to optionalDependencies
   - Create pty-adapter.ts
   - Update vibe-terminal-base.ts to use adapter
   - Test that Mac still works with node-pty
   - Test that it gracefully falls back when node-pty is missing

3. **Update tests**:
   ```typescript
   // In test setup
   jest.mock('./pty-adapter', () => ({
     createPtyAdapter: jest.fn().mockImplementation(() => ({
       onData: jest.fn(),
       write: jest.fn(),
       kill: jest.fn(),
       resize: jest.fn(),
       pid: 1234
     }))
   }));
   ```

4. **Commit and push**:
   ```bash
   git add -A
   git commit -m "fix: make node-pty optional for Windows compatibility"
   git push origin fix/windows-node-pty-blocker
   ```

5. **Create response handoff** letting PC know they can now:
   - Pull the fix branch
   - Run `npm install` (should succeed without node-pty)
   - Implement vibe-terminal-pc.ts using the fallback

## What PC Needs After Mac Fixes This

Once Mac implements the above, PC can:

1. **Pull Mac's fix branch**:
   ```bash
   git fetch origin
   git checkout fix/windows-node-pty-blocker
   npm install  # Should work now!
   ```

2. **Implement vibe-terminal-pc.ts** with these methods:
   - `isAtPrompt()` - Detect Windows prompts
   - `cleanOutput()` - Clean Windows-specific output
   - `detectShellType()` - Identify CMD/PowerShell/Git Bash
   - Handle the child_process fallback gracefully

3. **Write Windows-specific tests** in `test/pc/`

## Success Criteria

- [ ] Mac tests still pass with node-pty
- [ ] npm install works on Windows without errors
- [ ] Fallback to child_process works when node-pty unavailable
- [ ] API remains consistent between platforms
- [ ] PC can continue development

## Additional Context

The PC developer has already researched:
- The C++ compilation error is in winpty.cc with goto/initialization
- Visual Studio 2022 Preview has stricter C++ compliance
- ConPTY is preferred over WinPTY on modern Windows
- Execa is a viable alternative without compilation requirements

Please prioritize Option A as it maintains the best compatibility while unblocking Windows development immediately.

---

**Time Estimate**: 30-45 minutes to implement and test Option A