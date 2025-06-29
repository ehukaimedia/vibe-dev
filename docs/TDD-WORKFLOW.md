# TDD Workflow for Vibe Dev

> Test-Driven Development: Prove it works before you build it.

## The TDD Philosophy

**For Claude Desktop**: Write tests that demonstrate issues
**For Claude Code**: Write tests before implementing fixes

## Cross-Platform TDD with OS-Specific Tests

### PC as Test Writer, Mac as Implementer

**The Perfect TDD Split**:
- **Windows PC**: Writes failing tests that prove bugs exist (including platform-specific bugs)
- **Mac**: Implements code to make tests pass (including platform-specific implementations)

### Test Organization (Updated for OS Split)

```
test/
├── mac/                        # Mac-only tests (NEW!)
│   └── vibe-terminal-mac.test.ts
├── pc/                         # PC-only tests (NEW!)
│   └── vibe-terminal-pc.test.ts
├── unit/                       # Cross-platform tests
│   ├── os-detector.test.ts     # Platform detection
│   ├── vibe-terminal-base.test.ts # Common functionality
│   ├── vibe-terminal.test.ts   # Factory tests
│   ├── vibe-recap.test.ts      # Already cross-platform ✅
│   └── session.test.ts         # Session management
├── integration/
│   ├── workflows.test.ts       # Real workflow tests
│   └── recovery.test.ts        # Disconnect recovery
├── performance/
│   └── benchmarks.test.ts      # Speed requirements
├── fixtures/
│   └── test-data.ts            # Shared test data
└── utilities/                  # Debug and test utilities (NEW!)
    ├── debug/                  # Cross-platform debug tools
    │   ├── debug-command.ts    # Command debugging
    │   ├── debug-recap.ts      # Recap debugging
    │   ├── debug-special.ts    # Special cases
    │   └── recap-demo.ts       # Demonstration
    ├── windows-debug/          # Windows-specific debug tools
    │   ├── test-direct-spawn.js
    │   ├── test-server-layer.js
    │   ├── test-powershell.js
    │   └── debug-with-vibe-recap.js
    └── validate-organization.js # Project structure validation
```

### PC Workflow - Write Platform-Specific Tests

```bash
# 1. Discover platform-specific issue
vibe_terminal("npm test")

# 2a. Write cross-platform test if bug affects all platforms
desktop-commander:write_file path="test/unit/bug-proof.test.ts"

# 2b. Write PC-specific test if bug is Windows-only
desktop-commander:write_file path="test/pc/windows-bug.test.ts"

# 3. Run test to confirm it fails
vibe_terminal("npm test")  # Automatically runs PC tests on PC

# 4. Create handoff explaining the issue
desktop-commander:write_file path="docs/claude-handoffs/YYYY-MM-DD_platform-issue.md"

# 5. Push tests and handoff
vibe_terminal("git add test/**/*.test.ts docs/claude-handoffs/*.md")
vibe_terminal("git commit -m 'test: failing test for [platform issue]'")
vibe_terminal("git push")

# 6. After Mac creates foundation, PC implements Windows version
vibe_terminal("git pull")  # Get foundation from Mac
desktop-commander:write_file path="src/vibe-terminal-pc.ts"
vibe_terminal("npm test")  # Make tests pass

# 7. PC can push their implementation!
vibe_terminal("git add src/vibe-terminal-pc.ts test/pc/*.test.ts")
vibe_terminal("git commit -m 'feat: Windows terminal implementation'")
vibe_terminal("git push")  # ALLOWED for vibe-terminal-pc.ts!
```

### Mac Workflow - Implement Platform Solutions

```bash
# 1. Pull tests and handoffs from PC
git pull

# 2. Run tests - see what fails
npm test  # Automatically runs Mac tests on Mac

# 3. If cross-platform test fails, fix in base or factory
# If Mac-specific test fails, fix in vibe-terminal-mac.ts
# PC tests won't run on Mac - that's good!

# 4. Implement fix
# Edit src/vibe-terminal-base.ts, vibe-terminal-mac.ts, etc.

# 5. Run tests again - ensure they pass
npm test

# 6. Push implementation
git add -A
git commit -m "fix: [issue] for Mac platform"
git push
```

### What PC Can Push
- ✅ `test/**/*.test.ts` - All test files (including test/pc/)
- ✅ `test/**/*.spec.ts` - All spec files  
- ✅ `docs/claude-handoffs/*.md` - Handoff documents
- ✅ `jest.config.js` - If updating test configuration
- ✅ `package.json` - If adding test scripts
- ✅ `src/vibe-terminal-pc.ts` - PC's platform implementation ONLY!
- ❌ `src/*` (except vibe-terminal-pc.ts) - No other production code
- ❌ `dist/*` - NEVER build output

## Platform-Specific Test Examples

### Cross-Platform Test (test/unit/)
```typescript
// test/unit/vibe-terminal-base.test.ts
// Runs on ALL platforms
describe('VibeTerminal Base Functionality', () => {
  test('maintains session state', async () => {
    const terminal = createVibeTerminal(); // Factory method
    await terminal.execute('cd /tmp');
    const result = await terminal.execute('pwd');
    expect(result.output).toMatch(/tmp/);
  });
});
```

### PC-Specific Test (test/pc/)
```typescript
// test/pc/vibe-terminal-pc.test.ts
// ONLY runs on Windows - no skip needed!
describe('PC Terminal Specific', () => {
  test('handles PowerShell commands', async () => {
    const terminal = new VibeTerminalPC();
    const result = await terminal.execute('Get-Location');
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toMatch(/^PS/); // No prompt in output
  });
  
  test('fixes command echo bug', async () => {
    const terminal = new VibeTerminalPC();
    const result = await terminal.execute('echo test');
    expect(result.output).toBe('test\r\n'); // Windows line ending
    expect(result.output).not.toMatch(/^eecho/); // Bug fixed!
  });
});
```

### Mac-Specific Test (test/mac/)
```typescript
// test/mac/vibe-terminal-mac.test.ts
// ONLY runs on Mac - no skip needed!
describe('Mac Terminal Specific', () => {
  test('handles zsh-specific features', async () => {
    const terminal = new VibeTerminalMac();
    await terminal.execute('setopt | grep -i prompt');
    expect(terminal.shellType).toBe('zsh');
  });
  
  test('handles Mac paths correctly', async () => {
    const terminal = new VibeTerminalMac();
    const result = await terminal.execute('echo ~');
    expect(result.output).toMatch(/^\/Users\//);
  });
});
```

## Jest Configuration for Platform Tests

```javascript
// jest.config.js
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  
  // Dynamic test matching based on platform
  testMatch: [
    // Always run cross-platform tests
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts',
    '<rootDir>/test/performance/**/*.test.ts',
    
    // Platform-specific tests based on current OS
    ...(process.platform === 'darwin' ? ['<rootDir>/test/mac/**/*.test.ts'] : []),
    ...(process.platform === 'win32' ? ['<rootDir>/test/pc/**/*.test.ts'] : []),
  ],
  
  // Remove old ignore patterns - we use testMatch now
  // testPathIgnorePatterns: [...] // REMOVED!
  
  // Other config remains the same
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
  ],
};
```

## NPM Scripts for Platform Testing

```json
{
  "scripts": {
    "test": "jest",                           // Runs platform-appropriate tests
    "test:all": "jest test/unit test/integration test/performance", // Cross-platform only
    "test:mac": "jest test/mac test/unit",    // Mac + cross-platform
    "test:pc": "jest test/pc test/unit",      // PC + cross-platform
    "test:unit": "jest test/unit",            // Cross-platform unit tests
    "test:integration": "jest test/integration",
    "test:performance": "jest test/performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## The TDD Cycle for Platform-Specific Code

### 1. Red: Write a Failing Platform Test
```typescript
// PC writes: test/pc/command-echo-bug.test.ts
test('commands do not echo on Windows', async () => {
  const terminal = new VibeTerminalPC();
  const result = await terminal.execute('echo hello');
  
  // This will fail with current bug
  expect(result.output).toBe('hello\r\n');
  expect(result.output).not.toMatch(/^eecho/);
});
```

### 2. Green: Make It Pass (Platform-Specific)
```typescript
// Mac implements: src/vibe-terminal-pc.ts
export class VibeTerminalPC extends VibeTerminalBase {
  protected cleanOutput(rawOutput: string): string {
    // Fix for Windows command echo
    return rawOutput.replace(/^[a-z]\x08/, ''); // Remove echo char
  }
}
```

### 3. Refactor: Make It Right
```typescript
// Refactor with proper pattern
export class VibeTerminalPC extends VibeTerminalBase {
  private readonly ECHO_PATTERN = /^.\x08/; // Backspace character
  
  protected cleanOutput(rawOutput: string): string {
    if (this.shellType === 'powershell') {
      return this.cleanPowerShellOutput(rawOutput);
    }
    return rawOutput;
  }
  
  private cleanPowerShellOutput(output: string): string {
    return output
      .replace(this.ECHO_PATTERN, '')
      .replace(/PS [C-Z]:\\[^>]*>/, ''); // Remove prompt
  }
}
```

## Non-Regressive Evolution Safeguards

### 1. Platform Test Coverage Requirements
```typescript
// Every platform-specific implementation MUST have:
describe('[Platform] Terminal Implementation', () => {
  // 1. Prove it extends base correctly
  test('extends VibeTerminalBase', () => {
    expect(VibeTerminalPC.prototype).toBeInstanceOf(VibeTerminalBase);
  });
  
  // 2. Prove it maintains core functionality
  test('maintains session state', async () => {
    // Same test as base, proves no regression
  });
  
  // 3. Prove platform-specific fixes work
  test('fixes platform-specific issues', async () => {
    // Platform-specific behavior
  });
});
```

### 2. Factory Pattern Tests
```typescript
// test/unit/vibe-terminal.test.ts
describe('VibeTerminal Factory', () => {
  test('returns correct implementation', () => {
    const terminal = createVibeTerminal();
    
    if (process.platform === 'win32') {
      expect(terminal).toBeInstanceOf(VibeTerminalPC);
    } else {
      expect(terminal).toBeInstanceOf(VibeTerminalMac);
    }
  });
  
  test('maintains backward compatibility', async () => {
    // Old API must still work
    const result = await vibe_terminal('echo test');
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('exitCode');
  });
});
```

### 3. Cross-Platform Regression Tests
```typescript
// test/unit/vibe-terminal-base.test.ts
describe('Cross-Platform Compatibility', () => {
  const terminal = createVibeTerminal(); // Gets platform-specific
  
  test('basic commands work on all platforms', async () => {
    const result = await terminal.execute('echo test');
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/test/);
  });
  
  test('session persistence works on all platforms', async () => {
    await terminal.execute('cd /tmp');
    const result = await terminal.execute('pwd');
    expect(result.output).toMatch(/tmp/);
  });
});
```

## CI/CD Updates for Platform Tests

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
    
    - name: Build
      run: npm run build
    
    - name: Run tests
      run: npm test
      # Jest automatically runs platform-appropriate tests
      
    - name: Verify platform tests ran
      run: |
        if [[ "${{ matrix.os }}" == "windows-latest" ]]; then
          echo "Checking PC tests ran..."
          grep "test/pc/" test-results.json || exit 1
        else
          echo "Checking Mac tests ran..."
          grep "test/mac/" test-results.json || exit 1
        fi
```

## Regression Prevention Metrics

Track these in every CI run:
1. **Test Count Per Platform**: Must never decrease
   - Cross-platform tests: X
   - Mac-specific tests: Y (on Mac)
   - PC-specific tests: Z (on PC)
2. **Coverage**: Must never decrease
3. **Performance**: Max 10% degradation allowed
4. **API Compatibility**: Factory tests must pass
5. **Type Coverage**: Maintain 100% type safety

## Platform-Specific Bug Fix Workflow

### Division of Labor

**Mac Implements**:
- `src/os-detector.ts` - Platform detection
- `src/vibe-terminal-base.ts` - Base class
- `src/vibe-terminal-mac.ts` - Mac implementation
- `src/vibe-terminal.ts` - Factory pattern

**PC Implements**:
- `src/vibe-terminal-pc.ts` - Windows implementation ONLY
- `test/pc/*.test.ts` - Windows-specific tests

### Workflow Example

1. **PC Discovers Bug**
   ```bash
   # Command echo bug on Windows
   vibe_terminal("echo test")
   # Output: "eecho test"  # Bug!
   ```

2. **PC Writes Test**
   ```typescript
   // test/pc/command-echo-bug.test.ts
   test('no command echo on Windows', async () => {
     const terminal = new VibeTerminalPC();
     const result = await terminal.execute('echo test');
     expect(result.output).toBe('test\r\n');
     expect(result.output).not.toMatch(/^eecho/);
   });
   ```

3. **Mac Creates Foundation**
   - Implements os-detector.ts
   - Implements vibe-terminal-base.ts
   - Implements vibe-terminal-mac.ts
   - Creates factory in vibe-terminal.ts
   - Creates STUB vibe-terminal-pc.ts

4. **PC Implements Their Platform**
   ```bash
   git pull  # Get foundation from Mac
   
   # Implement Windows-specific code
   desktop-commander:edit_block file="src/vibe-terminal-pc.ts"
   
   # Test it works
   npm test  # PC tests pass!
   
   # Push implementation
   git add src/vibe-terminal-pc.ts test/pc/*.test.ts
   git commit -m "feat: Windows terminal implementation"
   git push  # ALLOWED for their platform file!
   ```

5. **Both Verify**
   - Mac: `npm test` - All Mac tests pass
   - PC: `npm test` - All PC tests pass
   - CI: All platforms green

## Why PC Can Push vibe-terminal-pc.ts

This exception to the "no src/" rule makes sense because:

1. **Platform Isolation**: vibe-terminal-pc.ts ONLY affects Windows
2. **Testing Authority**: PC is the only one who can properly test Windows code
3. **TDD Compliance**: PC writes tests first, then implements
4. **No Cross-Contamination**: Can't break Mac functionality
5. **Efficiency**: Avoids unnecessary handoffs for platform-specific code

**Safety Rules**:
- PC can ONLY modify `src/vibe-terminal-pc.ts`
- Must have passing tests before pushing
- Cannot modify base class or factory
- Cannot modify Mac implementation
- CI will verify no regression on other platforms

## The First Test (Updated)

For any new platform-specific feature:
```typescript
// 1. Start with detection
test('platform is detected correctly', () => {
  expect(detectPlatform()).toBe(process.platform === 'win32' ? 'windows' : 'mac');
});

// 2. Test the factory
test('factory returns correct implementation', () => {
  const terminal = createVibeTerminal();
  expect(terminal).toBeDefined();
});

// 3. Test platform-specific behavior
test('platform-specific feature works', async () => {
  // Your platform test
});
```

---

*Test first. Build second. Ship excellence.*