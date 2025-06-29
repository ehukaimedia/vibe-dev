# OS-Specific Terminal Implementation - Production Plan

## Overview

Split vibe_terminal into platform-specific implementations to fix the command echo bug and optimize for each platform. This maintains backward compatibility while enabling platform-specific optimizations.

## Architecture

### File Structure
```
src/
├── os-detector.ts           # Platform detection logic
├── vibe-terminal-base.ts    # Abstract base class with shared logic
├── vibe-terminal-mac.ts     # Mac/Linux specific implementation
├── vibe-terminal-pc.ts      # Windows specific implementation
├── vibe-terminal.ts         # Factory pattern (maintains API)
├── vibe-recap.ts           # Unchanged - already cross-platform
└── types.ts                # Shared types
```

### Class Hierarchy
```
VibeTerminalBase (abstract)
├── VibeTerminalMac (extends base)
└── VibeTerminalPC (extends base)

Factory (vibe-terminal.ts)
└── createVibeTerminal() → returns platform-specific instance
```

## Implementation Details

### 1. os-detector.ts
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
    default: return Platform.LINUX; // Default to Unix-like
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

### 2. vibe-terminal-base.ts
Extract common functionality from current vibe-terminal.ts:
- Session management
- Command history tracking
- PTY lifecycle management
- Abstract methods for platform-specific operations

```typescript
export abstract class VibeTerminalBase {
  protected sessionId: string;
  protected output: string = '';
  protected commandHistory: CommandRecord[] = [];
  protected currentWorkingDirectory: string;
  protected startTime: Date;
  protected shellType: SessionState['shellType'];
  protected promptTimeout: number;
  protected isExecuting: boolean = false;
  
  // Abstract methods for platform-specific implementation
  abstract getDefaultShell(): string;
  abstract detectShellType(shellPath: string): SessionState['shellType'];
  abstract cleanOutput(rawOutput: string): string;
  abstract normalizePath(path: string): string;
  
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

### 3. vibe-terminal-mac.ts
```typescript
export class VibeTerminalMac extends VibeTerminalBase {
  getDefaultShell(): string {
    if (process.env.SHELL) {
      return process.env.SHELL;
    }
    return '/bin/bash';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    if (shellPath.includes('bash')) return 'bash';
    if (shellPath.includes('zsh')) return 'zsh';
    if (shellPath.includes('fish')) return 'fish';
    if (shellPath.includes('/sh')) return 'sh';
    return 'unknown';
  }
  
  cleanOutput(rawOutput: string): string {
    // Mac doesn't have the echo bug
    return rawOutput;
  }
  
  normalizePath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', process.env.HOME || '');
    }
    return path;
  }
}
```

### 4. vibe-terminal-pc.ts
```typescript
export class VibeTerminalPC extends VibeTerminalBase {
  private readonly ECHO_PATTERN = /^.\x08/; // Backspace character pattern
  
  getDefaultShell(): string {
    return 'powershell.exe';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    if (shellPath.includes('powershell')) return 'powershell';
    if (shellPath.includes('cmd')) return 'cmd';
    return 'unknown';
  }
  
  cleanOutput(rawOutput: string): string {
    // Fix the command echo bug
    let cleaned = rawOutput;
    
    // Remove the echo pattern (e.g., "eecho" becomes "echo")
    if (this.ECHO_PATTERN.test(cleaned)) {
      cleaned = cleaned.replace(this.ECHO_PATTERN, '');
    }
    
    // Remove PowerShell prompt if present
    cleaned = cleaned.replace(/^PS [A-Z]:\\[^>]*>\s*/, '');
    
    return cleaned;
  }
  
  normalizePath(path: string): string {
    // Windows paths don't use ~ expansion
    return path;
  }
}
```

### 5. vibe-terminal.ts (Factory)
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
  constructor(config?: TerminalConfig) {
    // This maintains the old API but delegates to platform-specific
    const instance = createVibeTerminal(config);
    Object.setPrototypeOf(this, instance);
    Object.assign(this, instance);
  }
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

## Testing Strategy

### Test Organization
```
test/
├── mac/               # Mac-specific tests (only run on Mac)
├── pc/                # PC-specific tests (only run on Windows)
└── unit/              # Cross-platform tests (run everywhere)
```

### Jest Configuration
```javascript
// jest.config.js
export default {
  testMatch: [
    // Cross-platform tests always run
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts',
    '<rootDir>/test/performance/**/*.test.ts',
    
    // Platform-specific tests
    ...(process.platform === 'darwin' ? ['<rootDir>/test/mac/**/*.test.ts'] : []),
    ...(process.platform === 'win32' ? ['<rootDir>/test/pc/**/*.test.ts'] : []),
    ...(process.platform === 'linux' ? ['<rootDir>/test/mac/**/*.test.ts'] : []),
  ],
};
```

### NPM Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:mac": "jest test/mac test/unit",
    "test:pc": "jest test/pc test/unit",
    "test:unit": "jest test/unit"
  }
}
```

## Migration Plan

### Phase 1: Foundation (Mac - Claude Code)
1. Create os-detector.ts with platform detection
2. Extract VibeTerminalBase from current implementation
3. Create VibeTerminalMac with current Mac logic
4. Create VibeTerminalPC stub with TODOs
5. Update vibe-terminal.ts to use factory pattern
6. Ensure all existing tests pass

### Phase 2: Windows Implementation (PC)
1. Pull foundation code
2. Write PC-specific tests for command echo bug
3. Implement cleanOutput() in VibeTerminalPC
4. Test PowerShell-specific features
5. Push implementation

### Phase 3: Verification
1. Run full test suite on both platforms
2. Verify command echo bug is fixed on Windows
3. Ensure no regression on Mac
4. Update documentation

## Success Metrics

### Functional
- ✅ Command echo bug fixed on Windows
- ✅ All existing tests pass
- ✅ Platform-specific tests pass on their platforms
- ✅ Backward compatibility maintained

### Performance
- Response time: <20ms average (current baseline)
- No performance degradation from factory pattern
- Platform-specific optimizations possible

### Code Quality
- Clean separation of concerns
- Easy to add platform-specific features
- Reduced complexity in main terminal class

## Rollback Plan

If issues arise:
1. Keep current vibe-terminal.ts backed up
2. Can revert to single-file implementation
3. Git tags before and after migration

## Future Enhancements

With platform separation in place:
1. Windows: Better PowerShell integration
2. Mac: Terminal.app specific features
3. Linux: Distribution-specific optimizations
4. WSL: Special handling for Windows Subsystem for Linux

## Timeline

- **Day 1**: Mac creates foundation (4 hours)
- **Day 2**: PC implements Windows version (2 hours)
- **Day 3**: Integration testing and fixes (2 hours)
- **Total**: 8 hours of development

## Risk Assessment

### Low Risk
- Backward compatibility maintained through factory
- Incremental implementation possible
- Each platform tested independently

### Mitigations
- Extensive test coverage before changes
- Platform-specific tests prove functionality
- CI/CD runs on all platforms

---

**Status**: Ready for implementation
**Next Step**: Mac creates foundation files
