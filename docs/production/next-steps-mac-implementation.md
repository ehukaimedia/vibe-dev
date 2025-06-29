# Next Steps for Pure Mac OS Implementation

## Current Analysis

After reviewing `vibe-terminal-mac.ts`, most of the current implementation is generic Unix code that would work on Linux as well. We need to make it truly Mac-specific.

## Action Plan

### 1. Create Mac-Specific Tests First (TDD)

Create new test file for Mac-specific features:

```typescript
// test/mac/macos-features.test.ts
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';
import { execSync } from 'child_process';

describe('macOS Specific Features', () => {
  let terminal: VibeTerminalMac;
  
  beforeEach(() => {
    terminal = new VibeTerminalMac();
  });
  
  afterEach(() => {
    terminal?.kill();
  });
  
  test('detects macOS version correctly', () => {
    const version = terminal.getMacOSVersion();
    expect(version).toMatch(/^\d+\.\d+$/); // e.g., "15.5"
    
    // Verify against actual system
    const systemVersion = execSync('sw_vers -productVersion').toString().trim();
    expect(version).toBe(systemVersion);
  });
  
  test('uses zsh as default on modern macOS', () => {
    const version = terminal.getMacOSVersion();
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 10 && parseInt(version.split('.')[1]) >= 15 || majorVersion > 10) {
      // Catalina (10.15) and later default to zsh
      expect(terminal.getDefaultShell()).toBe('/bin/zsh');
    }
  });
  
  test('detects Terminal.app vs iTerm2', () => {
    const terminalApp = terminal.getTerminalApp();
    expect(['Terminal.app', 'iTerm2', 'Unknown']).toContain(terminalApp);
  });
  
  test('handles Mac-specific paths', () => {
    // Test /Users path
    const home = terminal.normalizePath('~');
    expect(home).toMatch(/^\/Users\//);
    
    // Test iCloud Drive path
    const icloudPath = terminal.expandMacPath('~/Library/Mobile Documents/com~apple~CloudDocs');
    expect(icloudPath).toContain('/Users/');
    expect(icloudPath).toContain('Library/Mobile Documents');
  });
  
  test('detects Mac-specific shells at correct locations', () => {
    const shells = terminal.getAvailableMacShells();
    
    // Check standard Mac shell locations
    if (terminal.fileExists('/bin/zsh')) {
      expect(shells).toContain('/bin/zsh');
    }
    if (terminal.fileExists('/bin/bash')) {
      expect(shells).toContain('/bin/bash');
    }
    
    // Check Homebrew locations (Intel and Apple Silicon)
    const homebrewPaths = [
      '/usr/local/bin/fish',    // Intel Mac
      '/opt/homebrew/bin/fish'  // Apple Silicon
    ];
    
    for (const path of homebrewPaths) {
      if (terminal.fileExists(path)) {
        expect(shells).toContain(path);
      }
    }
  });
});
```

### 2. Implement Mac-Specific Features

```typescript
// src/vibe-terminal-mac.ts - Enhanced Mac-specific implementation

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';

export class VibeTerminalMac extends VibeTerminalBase {
  private macOSVersion: string | null = null;
  
  constructor(config: TerminalConfig = {}) {
    super(config);
  }
  
  /**
   * Get macOS version (e.g., "15.5" for Sequoia)
   */
  getMacOSVersion(): string {
    if (!this.macOSVersion) {
      try {
        this.macOSVersion = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
      } catch {
        this.macOSVersion = '10.15'; // Default to Catalina
      }
    }
    return this.macOSVersion;
  }
  
  /**
   * Get macOS code name (e.g., "Sequoia", "Sonoma")
   */
  getMacOSCodeName(): string {
    const version = this.getMacOSVersion();
    const major = parseInt(version.split('.')[0]);
    const minor = parseInt(version.split('.')[1] || '0');
    
    // macOS version mapping
    if (major >= 15) return 'Sequoia';
    if (major >= 14) return 'Sonoma';
    if (major >= 13) return 'Ventura';
    if (major >= 12) return 'Monterey';
    if (major >= 11) return 'Big Sur';
    if (major === 10) {
      if (minor >= 15) return 'Catalina';
      if (minor >= 14) return 'Mojave';
    }
    return 'Unknown';
  }
  
  /**
   * Mac-specific shell detection
   */
  getDefaultShell(): string {
    // Check if we're on Catalina or later
    const version = this.getMacOSVersion();
    const [major, minor] = version.split('.').map(n => parseInt(n));
    
    // macOS 10.15+ defaults to zsh
    if (major > 10 || (major === 10 && minor >= 15)) {
      return process.env.SHELL || '/bin/zsh';
    }
    
    // Older macOS defaults to bash
    return process.env.SHELL || '/bin/bash';
  }
  
  /**
   * Detect shell type with Mac-specific paths
   */
  detectShellType(shellPath: string): SessionState['shellType'] {
    // Mac-specific shell locations
    const macShells: Record<string, SessionState['shellType']> = {
      '/bin/bash': 'bash',
      '/bin/zsh': 'zsh',
      '/bin/sh': 'sh',
      '/usr/local/bin/fish': 'fish',      // Intel Mac Homebrew
      '/opt/homebrew/bin/fish': 'fish',   // Apple Silicon Homebrew
      '/usr/local/bin/bash': 'bash',      // Homebrew bash
      '/opt/homebrew/bin/bash': 'bash',   // Apple Silicon
    };
    
    // Check exact path first
    if (macShells[shellPath]) {
      return macShells[shellPath];
    }
    
    // Fallback to name detection
    const shellName = shellPath.split('/').pop() || '';
    if (shellName.includes('bash')) return 'bash';
    if (shellName.includes('zsh')) return 'zsh';
    if (shellName.includes('fish')) return 'fish';
    if (shellName === 'sh') return 'sh';
    
    return 'unknown';
  }
  
  /**
   * Detect which terminal app is being used
   */
  getTerminalApp(): string {
    // Check environment variables that terminals set
    if (process.env.TERM_PROGRAM === 'Apple_Terminal') {
      return 'Terminal.app';
    }
    if (process.env.TERM_PROGRAM === 'iTerm.app') {
      return 'iTerm2';
    }
    if (process.env.TERM_PROGRAM === 'vscode') {
      return 'VS Code';
    }
    return 'Unknown';
  }
  
  /**
   * Get available shells on Mac
   */
  getAvailableMacShells(): string[] {
    const shells: string[] = [];
    
    // Standard macOS shells
    const standardShells = ['/bin/bash', '/bin/zsh', '/bin/sh'];
    
    // Homebrew paths (both Intel and Apple Silicon)
    const homebrewShells = [
      '/usr/local/bin/bash',
      '/usr/local/bin/zsh', 
      '/usr/local/bin/fish',
      '/opt/homebrew/bin/bash',
      '/opt/homebrew/bin/zsh',
      '/opt/homebrew/bin/fish'
    ];
    
    // Check all possible shells
    [...standardShells, ...homebrewShells].forEach(shell => {
      if (this.fileExists(shell)) {
        shells.push(shell);
      }
    });
    
    return shells;
  }
  
  /**
   * Check if file exists (helper method)
   */
  fileExists(path: string): boolean {
    try {
      return existsSync(path);
    } catch {
      return false;
    }
  }
  
  /**
   * Expand Mac-specific paths
   */
  expandMacPath(path: string): string {
    // Handle ~ expansion
    if (path.startsWith('~')) {
      path = path.replace('~', process.env.HOME || '/Users/' + process.env.USER);
    }
    
    // Handle iCloud Drive shortcuts
    path = path.replace('~/iCloud', '~/Library/Mobile Documents/com~apple~CloudDocs');
    
    return path;
  }
  
  /**
   * Mac-specific path normalization
   */
  normalizePath(path: string): string {
    // Use Mac-specific expansion
    return this.expandMacPath(path);
  }
  
  // ... rest of the methods remain the same for now
}
```

### 3. Update TDD Workflow

Add to `docs/TDD-WORKFLOW.md`:

```markdown
## Platform-Specific Development

### Mac-Specific Features
When developing for Mac, ensure features are truly Mac-specific:

1. **macOS Version Detection**: Use `sw_vers` for accurate version info
2. **Shell Defaults**: Respect macOS version defaults (zsh for 10.15+)
3. **Path Locations**: Use Mac-specific paths (/Users, /Applications)
4. **Terminal Detection**: Identify Terminal.app vs iTerm2
5. **Homebrew Support**: Check both Intel and Apple Silicon paths

### Test Organization for Platform Features
```
test/mac/
├── vibe-terminal-mac.test.ts      # Basic Mac functionality
├── macos-features.test.ts         # Mac-specific features
├── mac-shell-integration.test.ts  # Shell integration
└── terminal-app-detection.test.ts # Terminal app detection
```

### Platform Feature Checklist
Before marking a feature as "Mac-specific":
- [ ] Does it use macOS-only APIs or commands?
- [ ] Would it fail or behave differently on Linux?
- [ ] Is it tied to macOS file system structure?
- [ ] Does it depend on macOS version?
```

## Next Immediate Steps

1. **Create the new test file** `test/mac/macos-features.test.ts`
2. **Run tests** - they should fail (TDD)
3. **Implement Mac-specific methods** in `vibe-terminal-mac.ts`
4. **Make tests pass**
5. **Verify no regression** in existing tests
6. **Document the pattern** for PC to follow

This establishes a clear pattern of truly platform-specific code that PC can follow for Windows implementation.
