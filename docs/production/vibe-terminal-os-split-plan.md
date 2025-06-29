# Vibe Terminal OS-Specific Implementation Plan - TDD First

## Overview
Split **ONLY vibe_terminal** into platform-specific implementations using the existing TDD workflow. **vibe_recap remains unchanged** as it's already cross-platform compatible.

### What We're Splitting
- ✅ **vibe-terminal.ts** → vibe-terminal-mac.ts + vibe-terminal-pc.ts
- ❌ **vibe-recap.ts** → No changes needed (already cross-platform)

### Why vibe-recap Doesn't Need Splitting
- No OS-specific code
- No path manipulation
- Just analyzes data from vibe-terminal
- Uses standard JavaScript functions only

## How This Fits Your TDD Workflow

### Current Cross-Platform TDD Process (From TDD-WORKFLOW.md)
- **Windows PC**: Writes failing tests that prove bugs exist
- **Mac/Linux**: Implements code to make tests pass
- **What PC Can Push**: Tests and handoffs only (never src/)

### Enhanced for OS-Specific Code
- **PC writes tests** that demonstrate platform differences
- **Mac implements** foundation and Mac-specific code  
- **PC pulls and implements** Windows-specific code to make their tests pass

## Architecture Design

```
src/
├── os-detector.ts           # Platform detection
├── vibe-terminal-base.ts    # Abstract base class
├── vibe-terminal-mac.ts     # Mac/Linux implementation
├── vibe-terminal-pc.ts      # Windows implementation
├── vibe-terminal.ts         # Factory (maintains current API)
├── vibe-recap.ts           # ✅ ALREADY CROSS-PLATFORM (no changes needed)
└── types.ts                # Shared types

test/
├── mac/                    # Mac-only tests
│   └── vibe-terminal-mac.test.ts
├── pc/                     # PC-only tests  
│   └── vibe-terminal-pc.test.ts
└── unit/                   # Cross-platform tests
    ├── os-detector.test.ts
    ├── vibe-terminal-base.test.ts
    ├── vibe-terminal.test.ts
    └── vibe-recap.test.ts  # ✅ Already cross-platform
```

## Jest Configuration Updates

Replace hardcoded ignore patterns with dynamic platform detection:

```javascript
// jest.config.js
export default {
  // ... existing config ...
  testMatch: [
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts',
    '<rootDir>/test/performance/**/*.test.ts',
    // Platform-specific tests based on current OS
    process.platform === 'darwin' ? '<rootDir>/test/mac/**/*.test.ts' : null,
    process.platform === 'win32' ? '<rootDir>/test/pc/**/*.test.ts' : null,
  ].filter(Boolean),
  // Remove testPathIgnorePatterns - we control this with testMatch now
}
```

## NPM Scripts for Platform Testing

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:mac": "jest test/mac test/unit",
    "test:pc": "jest test/pc test/unit",
    "test:unit": "jest test/unit",
    "test:all": "jest" // Runs platform-appropriate tests
  }
}
```

## TDD Implementation Steps

### Phase 1: PC Writes Platform Difference Tests

**On Windows PC - Prove Platform Differences Exist**:

```typescript
// test/unit/platform-differences.test.ts
describe('Platform-specific behavior', () => {
  test('command echo differs by platform', async () => {
    const result = await vibe_terminal('echo test');
    
    if (process.platform === 'win32') {
      // This might fail on current implementation, proving the bug
      expect(result.output).toBe('test\r\n'); // Windows line ending
      expect(result.output).not.toMatch(/^e/); // No echo bug
    } else {
      expect(result.output).toBe('test\n'); // Unix line ending
    }
  });
  
  test('shell detection differs by platform', async () => {
    const terminal = new VibeTerminal();
    
    if (process.platform === 'win32') {
      expect(['powershell', 'cmd']).toContain(terminal.shellType);
    } else {
      expect(['bash', 'zsh', 'fish']).toContain(terminal.shellType);
    }
  });
  
  test('path handling differs by platform', async () => {
    const result = await vibe_terminal('echo %CD%'); // Windows
    const result2 = await vibe_terminal('echo $PWD'); // Unix
    
    if (process.platform === 'win32') {
      expect(result.exitCode).toBe(0);
      expect(result2.output).toContain('$PWD'); // Literal
    } else {
      expect(result.exitCode).not.toBe(0); // %CD% fails
      expect(result2.output).toMatch(/^\//); // Path starts with /
    }
  });
});
```

**PC Creates Handoff**:
```markdown
# Platform Differences Tests

## Tests Created
`test/unit/platform-differences.test.ts`

## What They Prove
1. Command echo bug is platform-specific
2. Shell detection needs different logic per OS
3. Path handling differs between platforms

## Recommendation
Create os-detector.ts and platform-specific implementations
```

### Phase 2: Mac Creates Foundation (Following PC's Tests)

**Test for OS Detector**:
```typescript
// test/unit/os-detector.test.ts
import { detectPlatform, isWindows, isMac, Platform } from '../../src/os-detector';

describe('OS Detection', () => {
  test('detects current platform correctly', () => {
    const platform = detectPlatform();
    expect(['mac', 'windows', 'linux']).toContain(platform);
  });
  
  test('helper functions work correctly', () => {
    if (process.platform === 'darwin') {
      expect(isMac()).toBe(true);
      expect(isWindows()).toBe(false);
    } else if (process.platform === 'win32') {
      expect(isWindows()).toBe(true);
      expect(isMac()).toBe(false);
    }
  });
});
```

**Mac-Specific Tests (test/mac/)**:
```typescript
// test/mac/vibe-terminal-mac.test.ts
// This file ONLY runs on Mac, no skip needed!
describe('Mac Terminal', () => {
  test('detects zsh shell correctly', () => {
    process.env.SHELL = '/bin/zsh';
    const terminal = new VibeTerminalMac();
    expect(terminal.shellType).toBe('zsh');
  });
  
  test('handles Mac paths correctly', async () => {
    const terminal = new VibeTerminalMac();
    const normalized = terminal.normalizePath('~/Desktop');
    expect(normalized).toMatch(/^\/Users/);
  });
  
  test('no command echo bug on Mac', async () => {
    const terminal = new VibeTerminalMac();
    const result = await terminal.execute('echo test');
    expect(result.output).toBe('test\n');
    expect(result.output).not.toMatch(/^eecho/);
  });
});
```

### Phase 3: PC Writes Windows-Specific Tests

**On PC - Write Tests for Windows Behavior**:
```typescript
// test/pc/vibe-terminal-pc.test.ts
// This file ONLY runs on PC, no skip needed!
describe('PC Terminal', () => {
  test('detects PowerShell correctly', () => {
    const terminal = new VibeTerminalPC();
    expect(terminal.shellType).toBe('powershell');
  });
  
  test('handles Windows paths correctly', async () => {
    const terminal = new VibeTerminalPC();
    const normalized = terminal.normalizePath('C:\\Users\\test');
    expect(normalized).toBe('C:\\Users\\test');
  });
  
  test('fixes command echo bug', async () => {
    const terminal = new VibeTerminalPC();
    const result = await terminal.execute('echo test');
    
    // This should pass after implementation
    expect(result.output).toBe('test\r\n');
    expect(result.output).not.toMatch(/^eecho/);
  });
  
  test('handles PowerShell prompts correctly', async () => {
    const terminal = new VibeTerminalPC();
    const result = await terminal.execute('Get-Location');
    
    // Should not include PS prompt in output
    expect(result.output).not.toMatch(/PS [C-Z]:\\/);
  });
});
```

### Phase 4: PC Implements Windows Version

Following your TDD workflow, PC can now:
1. Pull the foundation code from Mac
2. Run the Windows-specific tests (they fail)
3. Implement `vibe-terminal-pc.ts` to make them pass
4. **Push BOTH tests AND implementation** (PC is allowed to push vibe-terminal-pc.ts!)

**PC Git Permissions**:
- ✅ Can push `src/vibe-terminal-pc.ts` - Their platform file
- ✅ Can push `test/pc/*.test.ts` - Their platform tests
- ✅ Can push handoffs and documentation
- ❌ Cannot push other src/ files (Mac territory)

## Factory Pattern Tests

```typescript
// test/unit/vibe-terminal.test.ts
describe('VibeTerminal Factory', () => {
  test('returns correct implementation for platform', () => {
    const terminal = createVibeTerminal();
    
    if (process.platform === 'win32') {
      expect(terminal.constructor.name).toBe('VibeTerminalPC');
    } else if (process.platform === 'darwin') {
      expect(terminal.constructor.name).toBe('VibeTerminalMac');
    }
  });
  
  test('maintains backward compatibility', async () => {
    // Old API should still work
    const result = await vibe_terminal('echo test');
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('exitCode');
    expect(result).toHaveProperty('duration');
  });
});
```

## Implementation Guidelines

### For os-detector.ts
```typescript
export enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows',
  LINUX = 'linux'
}

export function detectPlatform(): Platform {
  // Write test first that expects correct detection
  // Then implement to make test pass
}
```

### For vibe-terminal-base.ts
```typescript
export abstract class VibeTerminalBase {
  // Test shared behavior first
  // Then extract common code from current implementation
  
  abstract detectShell(): ShellType;
  abstract normalizePath(path: string): string;
  abstract cleanOutput(output: string): string;
}
```

## Success Metrics (Following Your Standards)

From your TDD-WORKFLOW.md:
- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage
- **Performance**: No test over 5 seconds
- **New features**: Must include tests

Additional for OS Split:
- [ ] Platform detection tests pass on all OS
- [ ] Mac tests pass on Mac, skip on Windows
- [ ] PC tests pass on Windows, skip on Mac
- [ ] Factory returns correct implementation
- [ ] Backward compatibility maintained
- [ ] Command echo bug fixed on affected platform

## CI/CD Updates

Update your existing GitHub Actions to use the new test structure:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      # Jest config automatically runs platform-appropriate tests
```

No need for conditional test execution - the jest config handles it!

## Benefits of This Approach

1. **Clean Test Separation**: 
   - Mac never runs PC tests
   - PC never runs Mac tests
   - No skip patterns or conditionals needed

2. **Focused Implementation**:
   - Only split what needs splitting (vibe-terminal)
   - Keep cross-platform code together (vibe-recap)

3. **Follows Your TDD Workflow**:
   - PC writes tests proving platform differences
   - Mac implements foundation
   - PC implements Windows-specific code

4. **Simple Jest Config**:
   - Dynamic testMatch based on platform
   - No hardcoded ignore patterns
   - `npm test` just works on any platform

5. **Clear Directory Structure**:
   - `test/mac/` - Only on Mac
   - `test/pc/` - Only on PC  
   - `test/unit/` - All platforms
   - No confusion about what runs where

## Summary

We're on the right path! By splitting ONLY vibe-terminal (not vibe-recap), we:
- Fix the command echo bug in the right place
- Keep cross-platform code simple
- Make tests run correctly per platform
- Maintain your test-first philosophy

**Key Permission Update**: PC can push `src/vibe-terminal-pc.ts` because:
- They own the Windows implementation
- They're the only ones who can test it
- It can't break Mac functionality
- It follows TDD (tests first, then code)

The workflow is now:
1. PC writes Windows tests
2. Mac creates foundation (base, detector, Mac version)
3. PC implements Windows version and pushes it
4. Both platforms work independently

---

*Test first. Build second. Ship excellence.*