# Test Directory Organization

This directory contains all tests and test-related utilities for the Vibe Dev project.

## Directory Structure

```
test/
├── mac/              # Mac-specific tests (.test.ts)
│   └── vibe-terminal-mac.test.ts
│
├── pc/               # Windows-specific tests (.test.ts)
│   ├── timeout-contamination-bug.test.ts
│   ├── vibe-terminal-pc.test.ts
│   └── windows-timeout-bug.test.ts
│
├── unit/             # Cross-platform unit tests
│   ├── os-detector.test.ts
│   ├── vibe-terminal-base.test.ts
│   ├── vibe-terminal.test.ts
│   ├── vibe-recap.test.ts
│   └── session.test.ts
│
├── integration/      # Integration tests
│   ├── workflows.test.ts
│   └── recovery.test.ts
│
├── performance/      # Performance benchmarks
│   └── benchmarks.test.ts
│
├── fixtures/         # Test data and helpers
│   └── test-data.ts
│
└── utilities/        # Debug tools and test utilities
    ├── debug/                    # Cross-platform debug tools
    │   ├── debug-command.ts      # Command debugging
    │   ├── debug-recap.ts        # Recap debugging
    │   ├── debug-special.ts      # Special cases debugging
    │   └── recap-demo.ts         # Recap demonstration
    │
    ├── windows-debug/            # Windows-specific debug tools
    │   ├── debug-with-vibe-recap.js   # Guide for using vibe_recap
    │   ├── test-direct-spawn.js       # Test PowerShell spawn directly
    │   ├── test-powershell.js         # PowerShell specific tests
    │   ├── test-server-layer.js       # Test MCP server layer
    │   └── test-terminal-direct.js    # Direct terminal testing
    │
    └── validate-organization.js  # Validates project structure
```

## Test Files vs Utilities

### Test Files (.test.ts)
- Actual test suites that run with Jest
- Follow naming convention: `*.test.ts` or `*.spec.ts`
- Located in platform-specific or cross-platform directories
- Run automatically with `npm test`

### Utilities (in utilities/)
- Debug tools and helper scripts
- Not executed by Jest during test runs
- Used for debugging, validation, and demonstrations
- Run manually when needed

## Running Tests

```bash
# Run all tests (platform-appropriate)
npm test

# Run specific platform tests
npm run test:pc    # Windows tests only
npm run test:mac   # Mac tests only

# Run cross-platform tests
npm run test:unit
npm run test:integration
npm run test:performance
```

## Using Debug Utilities

### Windows Debug Tools
```bash
# From project root:
node test/utilities/windows-debug/test-direct-spawn.js
node test/utilities/windows-debug/test-server-layer.js
node test/utilities/windows-debug/debug-with-vibe-recap.js
```

### Cross-Platform Debug Tools
```bash
# Compile and run TypeScript debug tools
npx ts-node test/utilities/debug/debug-command.ts
npx ts-node test/utilities/debug/debug-recap.ts
```

### Validation
```bash
# Validate project organization
node test/utilities/validate-organization.js
```

## Important Notes

1. **Test files only** in main directories (mac/, pc/, unit/, etc.)
2. **All utilities** go in utilities/ subdirectory
3. **No production code** in test directory
4. **Platform detection** handled automatically by Jest config
