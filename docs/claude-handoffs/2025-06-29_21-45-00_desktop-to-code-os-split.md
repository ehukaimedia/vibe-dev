# Vibe Terminal OS-Specific Split Implementation

## Project Context for Claude Code

**Vibe Dev** is a production-ready MCP server (97.5% test coverage) with two tools:
- **vibe_terminal** - Execute commands in persistent terminal sessions (needs OS split)
- **vibe_recap** - Analyze terminal activity (already cross-platform, no changes needed)

**Current Status**: Production-ready but has platform-specific command echo bug requiring OS-specific implementations.

**TDD Workflow**: We follow strict Test-Driven Development
- All tests in `test/` directory (NEVER in `src/`)
- Platform tests auto-selected: `test/mac/`, `test/pc/`, `test/unit/`
- Every change must keep tests passing
- Run `npm test` frequently

## Issue Details
**Current Behavior**:
- All platform logic mixed in one file
- Difficult to test platform-specific behavior
- Command echo bug possibly platform-specific

**Expected Behavior**:
- Separate files for Mac and PC implementations
- Clean OS detection
- Platform-specific optimizations

**Architecture Plan**: See detailed implementation below

## For Claude Code - IMPLEMENTATION INSTRUCTIONS

### Phase 1: Foundation Implementation on Mac

You need to split ONLY vibe-terminal into platform-specific implementations. vibe-recap stays unchanged as it's already cross-platform.

```bash
cd /path/to/vibe-dev
git pull origin main
git checkout -b feat/os-specific-terminals

# Step 1: Create os-detector.ts
# Create src/os-detector.ts with:
# - Platform detection using process.platform
# - Helper functions: isWindows(), isMac(), isLinux()
# - Platform configuration objects
# - Export Platform enum

# Step 2: Create vibe-terminal-base.ts
# Extract from current vibe-terminal.ts:
# - Session management
# - History tracking
# - Abstract methods for platform-specific ops
# - Common interfaces

# Step 3: Create vibe-terminal-mac.ts
# Move Mac-specific code:
# - Unix shell detection
# - Current PTY configuration
# - Signal handling
# - Extend VibeTerminalBase

# Step 4: Update vibe-terminal.ts
# Make it a factory that:
# - Uses os-detector
# - Returns appropriate implementation
# - Maintains same external API

# Step 5: Write tests
npm test  # Ensure nothing breaks

# Create new tests:
# - test/unit/os-detector.test.ts
# - test/unit/vibe-terminal-base.test.ts
# - test/mac/vibe-terminal-mac.test.ts

# Step 6: Create PC stub
# Create src/vibe-terminal-pc.ts with:
# - Basic structure extending base
# - TODO comments for PC implementation
# - Stub methods that throw "Not implemented"

# Verify all tests pass
npm test

# Commit and push
git add .
git commit -m "feat: split terminal into OS-specific implementations

- Add os-detector for platform detection
- Extract base class for shared logic  
- Create mac-specific implementation
- Add stub for PC implementation
- Maintain backward compatibility"

git push origin feat/os-specific-terminals
```

## Implementation Notes

1. **Preserve existing API** - vibe-terminal.ts should work exactly the same
2. **Move incrementally** - Start with obvious platform code
3. **Keep tests green** - Each step should maintain passing tests
4. **Document TODOs** - Mark where PC will need different implementation

## Key Files to Create

### src/os-detector.ts
```typescript
export enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows', 
  LINUX = 'linux'
}

export function detectPlatform(): Platform {
  switch (process.platform) {
    case 'darwin': return Platform.MAC;
    case 'win32': return Platform.WINDOWS;
    case 'linux': return Platform.LINUX;
    default: return Platform.LINUX;
  }
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMac(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}
```

### src/vibe-terminal-base.ts
```typescript
export abstract class VibeTerminalBase {
  // Common implementation
  protected sessionId: string;
  protected output: string = '';
  protected commandHistory: CommandRecord[] = [];
  protected currentWorkingDirectory: string;
  protected startTime: Date;
  protected shellType: SessionState['shellType'];
  protected promptTimeout: number;
  protected isExecuting: boolean = false;
  
  // Abstract methods for platform-specific
  abstract detectShell(): ShellType;
  abstract normalizePath(path: string): string;
  abstract cleanOutput(output: string): string;
  abstract getDefaultShell(): string;
  
  // Common methods stay in base
  async execute(command: string): Promise<TerminalResult> {
    // Implementation stays mostly the same
    // But calls this.cleanOutput() for platform-specific cleaning
  }
  
  getSessionState(): SessionState {
    // Common implementation
  }
  
  getHistory(): CommandRecord[] {
    // Common implementation
  }
}
```

### src/vibe-terminal-mac.ts
```typescript
export class VibeTerminalMac extends VibeTerminalBase {
  getDefaultShell(): string {
    if (process.env.SHELL) {
      return process.env.SHELL;
    }
    return '/bin/bash';
  }
  
  detectShell(): ShellType {
    const shellPath = this.getDefaultShell();
    if (shellPath.includes('bash')) return 'bash';
    if (shellPath.includes('zsh')) return 'zsh';
    if (shellPath.includes('fish')) return 'fish';
    if (shellPath.includes('/sh')) return 'sh';
    return 'unknown';
  }
  
  cleanOutput(output: string): string {
    // Mac doesn't have the echo bug
    return output;
  }
  
  normalizePath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', process.env.HOME || '');
    }
    return path;
  }
}
```

### src/vibe-terminal-pc.ts (stub)
```typescript
export class VibeTerminalPC extends VibeTerminalBase {
  // TODO: Implement on Windows
  getDefaultShell(): string {
    return 'powershell.exe';
  }
  
  detectShell(): ShellType {
    // TODO: Implement Windows shell detection
    throw new Error('PC implementation pending');
  }
  
  normalizePath(path: string): string {
    // TODO: Implement Windows path normalization
    throw new Error('PC implementation pending');
  }
  
  cleanOutput(output: string): string {
    // TODO: Fix command echo bug here
    throw new Error('PC implementation pending');
  }
}
```

### src/vibe-terminal.ts (Factory)
```typescript
import { VibeTerminalBase } from './vibe-terminal-base.js';
import { VibeTerminalMac } from './vibe-terminal-mac.js';
import { VibeTerminalPC } from './vibe-terminal-pc.js';
import { detectPlatform, Platform } from './os-detector.js';

// Factory function
export function createVibeTerminal(config?: TerminalConfig): VibeTerminalBase {
  const platform = detectPlatform();
  
  switch (platform) {
    case Platform.WINDOWS:
      return new VibeTerminalPC(config);
    case Platform.MAC:
    case Platform.LINUX:
      return new VibeTerminalMac(config);
    default:
      return new VibeTerminalMac(config); // Default to Unix-like
  }
}

// Maintain backward compatibility
export class VibeTerminal extends VibeTerminalBase {
  private implementation: VibeTerminalBase;
  
  constructor(config?: TerminalConfig) {
    super();
    this.implementation = createVibeTerminal(config);
    // Delegate all calls to implementation
  }
  
  // Implement all abstract methods by delegating
  detectShell(): ShellType {
    return this.implementation.detectShell();
  }
  
  // ... delegate other methods
}

// Singleton management stays the same
let terminalInstance: VibeTerminalBase | null = null;

export function getTerminal(): VibeTerminalBase {
  if (!terminalInstance) {
    terminalInstance = createVibeTerminal();
  }
  return terminalInstance;
}
```

## Test Structure

### test/unit/os-detector.test.ts
```typescript
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
    }
  });
});
```

### test/mac/vibe-terminal-mac.test.ts
```typescript
// This file ONLY runs on Mac
import { VibeTerminalMac } from '../../src/vibe-terminal-mac';

describe('Mac Terminal', () => {
  test('detects shell correctly', () => {
    const terminal = new VibeTerminalMac();
    const shell = terminal.detectShell();
    expect(['bash', 'zsh', 'fish', 'sh']).toContain(shell);
  });
  
  test('normalizes paths correctly', () => {
    const terminal = new VibeTerminalMac();
    const normalized = terminal.normalizePath('~/test');
    expect(normalized).toMatch(/^\/Users/);
  });
});
```

## Success Criteria
- [ ] All existing tests pass
- [ ] OS detection works correctly
- [ ] Mac implementation separated
- [ ] PC stub ready for Windows development
- [ ] No breaking changes to external API
- [ ] Factory pattern maintains compatibility

## Next Steps
After this implementation:
1. Push to repository on feature branch
2. PC developer pulls and implements vibe-terminal-pc.ts
3. Fix command echo bug in appropriate platform file
4. Test cross-platform compatibility
5. Merge to main when both platforms working

## Important Notes
- **DO NOT** modify vibe-recap.ts - it's already cross-platform
- **DO NOT** implement Windows-specific logic - just create stubs
- **MAINTAIN** backward compatibility - external API must not change
- **TEST** frequently - run npm test after each major change
- **FOCUS** on extracting Mac functionality from current implementation