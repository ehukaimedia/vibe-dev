# Mac-Only TDD Production Refactor - Vibe Dev

## For You (Human Coordinator)
- Current platform: macOS (Darwin)
- Windows testing: EXCLUDED - Will be done on PC later
- Goal: Achieve production-ready coverage on Mac using TDD
- Approach: Unix-focused tests, Windows compatibility deferred

## Platform Testing Strategy

### What We Test (Mac/Unix)
- Bash/Zsh/Fish shells
- Unix paths (`/home/user`, `/tmp`)
- Unix commands (`ls`, `grep`, `find`)
- POSIX signals and processes
- Unix file permissions

### What We Skip (Windows)
- PowerShell/CMD
- Windows paths (`C:\`, `\\`)
- Windows commands (`dir`, `findstr`)
- Windows-specific errors
- Windows file permissions

## For Claude Code - Mac-Focused TDD Implementation

### Phase 1: Shell Detection (Mac Only)

#### Step 1: RED - Test Unix Shells Only
```typescript
// test/unit/shell-detection.test.ts
describe('Unix Shell Detection', () => {
  it('should detect bash shell', () => {
    const terminal = new VibeTerminal({ shell: '/bin/bash' });
    expect(terminal.getSessionState().shellType).toBe('bash');
  });
  
  it('should detect zsh shell', () => {
    const terminal = new VibeTerminal({ shell: '/bin/zsh' });
    expect(terminal.getSessionState().shellType).toBe('zsh');
  });
  
  it('should detect fish shell', () => {
    const terminal = new VibeTerminal({ shell: '/usr/local/bin/fish' });
    expect(terminal.getSessionState().shellType).toBe('fish');
  });
  
  // NO WINDOWS TESTS!
  // No PowerShell, no CMD, no Windows paths
});
```

#### Step 2: GREEN - Unix Implementation Only
```typescript
// src/vibe-terminal.ts
private detectShellType(shellPath: string): string {
  // Mac/Unix only implementation
  if (shellPath.includes('bash')) return 'bash';
  if (shellPath.includes('zsh')) return 'zsh';
  if (shellPath.includes('fish')) return 'fish';
  if (shellPath.includes('sh')) return 'sh';
  return 'unknown';
  
  // NO Windows detection code
  // Will be added when testing on PC
}
```

### Phase 2: Path Handling (Unix Only)

#### Step 1: RED - Test Unix Paths
```typescript
// test/unit/path-handling.test.ts
describe('Unix Path Handling', () => {
  it('should handle home directory expansion', async () => {
    const terminal = new VibeTerminal();
    const result = await terminal.execute('cd ~');
    expect(terminal.getSessionState().workingDirectory).toContain('/Users/');
  });
  
  it('should handle absolute Unix paths', async () => {
    const terminal = new VibeTerminal();
    await terminal.execute('cd /tmp');
    expect(terminal.getSessionState().workingDirectory).toBe('/tmp');
  });
  
  // NO Windows path tests (C:\, UNC paths, etc.)
});
```

### Phase 3: Command Tests (Mac Commands)

#### Step 1: RED - Mac-Specific Commands
```typescript
// test/integration/mac-commands.test.ts
describe('Mac Command Execution', () => {
  it('should execute Mac-specific commands', async () => {
    const terminal = new VibeTerminal();
    
    // Test Mac commands only
    const result = await terminal.execute('sw_vers -productVersion');
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/\d+\.\d+/); // macOS version
  });
  
  it('should handle Mac package manager', async () => {
    const terminal = new VibeTerminal();
    
    // Test homebrew (Mac only)
    const result = await terminal.execute('which brew');
    // May or may not be installed, just test execution
    expect(result.exitCode).toBeGreaterThanOrEqual(0);
  });
  
  // NO Windows command tests (dir, powershell, etc.)
});
```

### Phase 4: File System Tests (Unix Permissions)

#### Step 1: RED - Unix File Permissions
```typescript
// test/unit/file-permissions.test.ts
describe('Unix File Permissions', () => {
  it('should handle chmod commands', async () => {
    const terminal = new VibeTerminal();
    
    // Create test file
    await terminal.execute('touch /tmp/test-file');
    
    // Change permissions (Unix only)
    const result = await terminal.execute('chmod 755 /tmp/test-file');
    expect(result.exitCode).toBe(0);
  });
  
  it('should detect permission denied errors', async () => {
    const terminal = new VibeTerminal();
    
    // Try to access protected file (Unix style)
    const result = await terminal.execute('cat /etc/sudoers');
    expect(result.exitCode).not.toBe(0);
    expect(result.output.toLowerCase()).toContain('permission denied');
  });
  
  // NO Windows ACL or permission tests
});
```

### Phase 5: Process Management (Unix Signals)

#### Step 1: RED - Unix Process Handling
```typescript
// test/unit/process-management.test.ts
describe('Unix Process Management', () => {
  it('should handle SIGTERM gracefully', async () => {
    const terminal = new VibeTerminal();
    
    // Start a background process
    await terminal.execute('sleep 30 &');
    const pid = await terminal.execute('echo $!');
    
    // Send Unix signal
    const result = await terminal.execute(`kill -TERM ${pid.output.trim()}`);
    expect(result.exitCode).toBe(0);
  });
  
  it('should handle Ctrl+C (SIGINT)', async () => {
    const terminal = new VibeTerminal();
    
    // This is Unix-specific behavior
    terminal.sendSignal('SIGINT');
    
    // Verify process interrupted
    const result = await terminal.execute('echo $?');
    expect(result.output.trim()).toBe('130'); // Unix SIGINT exit code
  });
  
  // NO Windows process management tests
});
```

### Test Configuration Updates

#### Update jest.config.js
```javascript
module.exports = {
  // ... existing config
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    // Ignore Windows-specific test files
    'windows.test.ts',
    'win32.test.ts',
    'powershell.test.ts'
  ],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: {
        // Ensure Mac/Unix types
        types: ['node', 'jest']
      }
    }
  }
};
```

#### Update test helpers
```typescript
// test/helpers/platform.ts
export const skipOnWindows = process.platform === 'win32' ? it.skip : it;
export const skipOnMac = process.platform === 'darwin' ? it.skip : it;

// Use in tests:
skipOnWindows('should handle Unix paths', async () => {
  // This test runs on Mac/Linux only
});
```

### Mock Configuration (Mac-Specific)

```typescript
// test/mocks/pty.mock.ts
export const createMockPty = () => ({
  pid: Math.floor(Math.random() * 10000),
  process: 'bash', // Always Unix shell for Mac tests
  write: jest.fn(),
  onData: jest.fn(),
  onExit: jest.fn(),
  kill: jest.fn(),
  
  // Mac-specific mock responses
  mockResponses: {
    'pwd': '/Users/testuser/project',
    'echo $SHELL': '/bin/zsh',
    'uname': 'Darwin',
    'sw_vers': 'macOS 13.0'
  }
});
```

### What NOT to Test on Mac

```typescript
// ❌ DON'T TEST THESE ON MAC:
// - PowerShell commands
// - Windows paths (C:\, \\server\share)
// - Windows line endings (\r\n specific handling)
// - Windows process management
// - Registry operations
// - Windows-specific errors

// ✅ DO TEST THESE ON MAC:
// - Bash/Zsh/Fish shells
// - Unix paths (/home, /usr, /tmp)
// - Unix line endings (\n)
// - Unix signals (SIGTERM, SIGINT, SIGHUP)
// - File permissions (chmod, chown)
// - Mac-specific commands (open, pbcopy, etc.)
```

### Platform-Aware Test Structure

```
test/
├── unit/
│   ├── terminal.test.ts        # Cross-platform basics
│   ├── shell-detection.test.ts # Mac shells only
│   └── file-permissions.test.ts # Unix permissions only
├── integration/
│   ├── mac-commands.test.ts    # Mac-specific commands
│   └── unix-workflows.test.ts  # Unix development workflows
└── helpers/
    ├── platform.ts             # Platform detection helpers
    └── mac-mocks.ts            # Mac-specific mocks
```

### Daily TDD Checklist (Mac Focus)

- [ ] Write failing test for Unix/Mac behavior
- [ ] Implement for Mac/Unix only
- [ ] Skip Windows edge cases
- [ ] Use Unix paths in examples
- [ ] Test with Mac shells (bash/zsh)
- [ ] Ignore Windows CI failures

### Success Metrics (Mac Only)

- [ ] 95%+ coverage on Mac
- [ ] All Unix shell types tested
- [ ] Mac command compatibility verified
- [ ] No Windows-specific code
- [ ] Tests pass on macOS CI

### Notes for PC Testing Later

When testing on Windows PC:
1. Run full test suite to identify failures
2. Create Windows-specific test files
3. Add PowerShell/CMD detection
4. Test Windows paths and commands
5. Handle Windows-specific errors
6. Update mocks for Windows behavior

### Remember

> "Make it work on Mac first, make it work on Windows later" - Cross-platform Development Wisdom

Focus on getting perfect Mac coverage now. Windows compatibility will be addressed when you have access to a PC for proper testing.