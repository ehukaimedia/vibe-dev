# Vibe Terminal OS-Specific Split Implementation

## For You (Human Coordinator)
- Current issue: Single vibe-terminal.ts handles all platforms, causing complexity
- Impact: Command echo bug, platform-specific quirks mixed together
- Priority: High - Architectural improvement
- Expected outcome: Clean separation of platform code, easier maintenance

## Issue Details
**Current Behavior**:
- All platform logic mixed in one file
- Difficult to test platform-specific behavior
- Command echo bug possibly platform-specific

**Expected Behavior**:
- Separate files for Mac and PC implementations
- Clean OS detection
- Platform-specific optimizations

**Architecture Plan**: See artifact "Vibe Terminal OS-Specific Implementation Plan"

## For Claude Code - COPY THIS ENTIRE SECTION

### Phase 1: Foundation Implementation on Mac

```bash
cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev
git pull
git status

# Create new branch for this feature
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
# - test/unit/vibe-terminal-mac.test.ts

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

export function detectPlatform(): Platform
export function isWindows(): boolean
export function isMac(): boolean
export function isLinux(): boolean
```

### src/vibe-terminal-base.ts
```typescript
export abstract class VibeTerminalBase {
  // Common implementation
  protected sessionId: string
  protected history: CommandHistory[]
  
  // Abstract methods for platform-specific
  abstract detectShell(): ShellType
  abstract normalizePath(path: string): string
  abstract cleanOutput(output: string): string
}
```

### src/vibe-terminal-mac.ts
```typescript
export class VibeTerminalMac extends VibeTerminalBase {
  // Mac/Linux specific implementation
}
```

### src/vibe-terminal-pc.ts (stub)
```typescript
export class VibeTerminalPC extends VibeTerminalBase {
  // TODO: Implement on Windows
  detectShell(): ShellType {
    throw new Error('PC implementation pending')
  }
}
```

## Success Criteria
- [ ] All existing tests pass
- [ ] OS detection works correctly
- [ ] Mac implementation separated
- [ ] PC stub ready for Windows development
- [ ] No breaking changes to external API

## Next Steps
After this implementation:
1. Push to repository
2. PC developer pulls and implements vibe-terminal-pc.ts
3. Fix command echo bug in appropriate platform file
4. Test cross-platform compatibility
