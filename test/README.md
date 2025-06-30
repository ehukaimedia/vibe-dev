# Vibe Dev Test Suite

This directory contains all test files for the Vibe Dev application, organized according to the TDD workflow documented in `/docs/TDD-WORKFLOW.md`.

## Directory Structure

```
test/
├── unit/                           # Unit tests for core logic
│   ├── platform-detection.test.js  # (To be implemented)
│   ├── shell-detection.test.js     # (To be implemented)
│   ├── output-parser.test.js       # (To be implemented)
│   └── exit-code-extraction.test.js # (To be implemented)
├── integration/                    # Integration tests
│   ├── mac/                       # Mac-specific tests
│   │   ├── production.test.mjs    # Mac production readiness test
│   │   ├── basic-commands.test.js # (To be implemented)
│   │   ├── session-persistence.test.js # (To be implemented)
│   │   └── shell-compatibility.test.js # (To be implemented)
│   ├── windows/                   # Windows-specific tests
│   │   ├── windows.test.mjs       # Windows functionality test for Gemini CLI
│   │   ├── basic-commands.test.js # (To be implemented)
│   │   ├── powershell.test.js    # (To be implemented)
│   │   └── cmd-support.test.js   # (To be implemented)
│   └── cross-platform/           # Cross-platform tests
│       ├── gemini-test.mjs       # Cross-platform test for Gemini CLI
│       ├── recap-functionality.test.js # (To be implemented)
│       └── error-handling.test.js # (To be implemented)
└── fixtures/                      # Test data and mocks
    ├── sample-outputs/           # Sample terminal outputs
    └── mock-responses/           # Mock response data

```

## Running Tests

### All Tests
```bash
npm test                    # Run Mac production test
```

### Platform-Specific Tests
```bash
npm run test:mac           # Mac-specific tests (Claude runs these)
npm run test:windows       # Windows-specific tests (Gemini CLI runs these)
npm run test:cross         # Cross-platform tests (Gemini CLI runs on both Mac/PC)
npm run test:gemini        # Alias for cross-platform test
```

### Test Categories
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:production    # Production readiness tests
```

### Build Verification
```bash
npm run test:build         # Verify build process
```

## Test Implementation Status

✅ **Implemented**:
- Mac production readiness test (`integration/mac/production.test.mjs`)
- Windows functionality test (`integration/windows/windows.test.mjs`)
- Cross-platform test for Gemini CLI (`integration/cross-platform/gemini-test.mjs`)

🔄 **To Be Implemented** (as per TDD-WORKFLOW.md):
- Unit tests for core components
- Comprehensive integration tests
- Cross-platform compatibility tests
- Performance benchmarks
- Reliability stress tests

## Guidelines

1. **Mac Tests**: Run and maintained by Claude
2. **Windows Tests**: Run by Gemini CLI, maintained by Claude
3. **Cross-Platform Tests**: Run by Gemini CLI on both Mac and PC
   - On Windows: Run tests AND update GEMINI_REPORTS.md
   - On Mac: Run tests for verification only (don't update reports)
4. **Test Framework**: Currently using native Node.js ES modules
5. **Future**: Consider Jest or Vitest implementation for comprehensive testing

## Notes

- Tests use ES modules (`.mjs` extension) for compatibility with the project's module system
- Windows tests include "GEMINI REPORT:" prefixed console outputs for easy identification
- All test files should follow the naming convention: `*.test.js` or `*.test.mjs`