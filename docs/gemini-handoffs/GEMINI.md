# Vibe Dev - Gemini CLI Collaboration Guidelines

## Working with Claude for Production Readiness

**🚨 CRITICAL: READ-ONLY COLLABORATION PROTOCOL 🚨**

Gemini CLI collaborates with Claude to make Vibe Dev production-ready, but with **strict boundaries**:

### Gemini CLI Responsibilities (Windows Testing Only)
- **Test Windows functionality** using the provided test suites
- **Report test results** and identify failing cases
- **Validate fixes** after Claude implements them
- **Provide feedback** on Windows-specific issues
- **NEVER modify production source code files**

### Claude's Responsibilities (All Development Work)
- **Fix all production issues** on both Mac and Windows
- **Implement all code changes** in `src/` directory
- **Create and maintain tests** in `test/` directory
- **Handle all architectural decisions**
- **Commit and push changes**

## Testing Protocol for Gemini CLI

### Cross-Platform Testing Approach
Gemini CLI can run tests on BOTH Mac and PC platforms:
- **On Windows**: Run tests AND update GEMINI_REPORTS.md with results
- **On Mac**: Run tests for verification only (do NOT update reports)

### Running Tests (SAFE OPERATIONS on Both Platforms)
```bash
# Install dependencies (safe - no source code changes)
npm install

# Build the project (safe - creates dist/ files only)
npm run build

# Verify build completed successfully (safe)
npm run test:build

# Run cross-platform test (works on both Mac and PC)
node test/integration/cross-platform/gemini-test.mjs

# Platform-specific tests
npm run test:windows    # Windows-specific test
npm run test:mac        # Mac-specific test (for verification only)

# Check TypeScript compilation (safe)
npm run typecheck

# Report results back to Claude for fixes (Windows results only)
```

### Test Files for Gemini CLI
- `test/integration/cross-platform/gemini-test.mjs` - Cross-platform test (run on both Mac/PC)
- `test/integration/windows/windows.test.mjs` - Windows-specific functionality test
- `test/integration/mac/production.test.mjs` - Mac test (for verification only)
- Build verification through `npm run build` and `npm run test:build`

### Expected Test Results (After Claude's Fixes)
Gemini CLI should now see major improvements:
- **Significantly reduced timeout rate** (from previous 100% failure)
- **Proper exit codes** (0 for success, not -1 timeouts)
- **Cleaner output** with less PowerShell banner noise
- **Better command echo handling** 
- **Improved working directory tracking**

**Note**: Some issues may remain - report any timeouts, slow performance, or output quality problems

### Reporting Requirements for Gemini CLI

**IMPORTANT**: All test results and analysis must be saved to:
📁 `/docs/gemini-handoffs/GEMINI_REPORTS.md`

**Replace the old June 29th report** with your current findings using this template:

```markdown
# Gemini CLI Test Report - [Current Date]

## Environment Details
- **Platform**: Windows [Version] (e.g., Windows 11 22H2)
- **Node.js**: [Version] (from `node --version`)
- **Shell**: [PowerShell/CMD version]
- **Terminal**: [Windows Terminal/CMD/PowerShell/Other]

## Build Verification Results

### TypeScript Compilation
```bash
npm run build
```
**Result**: [✅ Success / ❌ Failed]
**Output**: [Any errors or warnings]

### Type Checking
```bash
npm run typecheck  
```
**Result**: [✅ Success / ❌ Failed]
**Output**: [Any type errors]

## Windows Functionality Testing

### Test Execution Results
```bash
npm run test:windows
```

**Copy all console output here, especially lines starting with "GEMINI REPORT:"**

### Key Metrics Observed
- **Average Command Duration**: [X]ms (Target: <2000ms)
- **Timeout Rate**: [X]% (Target: 0%)
- **Commands with Exit Code -1**: [X] (Target: 0)
- **Successful Commands**: [X]

### Specific Test Results

#### Echo Command Test
- **Expected**: Clean output "test", exit code 0, <2000ms duration
- **Actual**: [What you observed]
- **Status**: [✅ Pass / ❌ Fail / ⚠️ Partial]

#### Working Directory Test  
- **Expected**: Directory changes persist across commands
- **Actual**: [What you observed]
- **Status**: [✅ Pass / ❌ Fail / ⚠️ Partial]

#### Shell Detection Test
- **Expected**: Correct shell type detection
- **Actual**: [What shell type was detected]
- **Status**: [✅ Pass / ❌ Fail / ⚠️ Partial]

## Issues Identified

### Critical Issues (Block Production)
1. [Issue description]
   - **Impact**: [How it affects functionality]
   - **Evidence**: [Console output/error messages]

### Performance Issues
1. [Issue description]
   - **Measured**: [Actual performance]
   - **Target**: [Expected performance]

### Output Quality Issues
1. [Issue description]
   - **Expected**: [Clean output without artifacts]
   - **Actual**: [What was observed]

## Comparison with Previous Status

### Improvements Since Last Report
- [List any improvements over the June 29th report]

### Remaining Issues
- [Issues that still need Claude's attention]

## Recommendations for Claude

### High Priority Fixes Needed
1. [Specific issue requiring immediate attention]
2. [Another critical issue]

### Performance Optimizations
1. [Performance improvement suggestions]

### Overall Assessment
**Production Readiness**: [Ready/Needs Work/Not Ready]
**Confidence Level**: [High/Medium/Low]
**Recommendation**: [Deploy/Fix Issues First/Major Rework Needed]

---
**Report Generated**: [Date and Time]
**Next Test Date**: [When you plan to test again]
```

### How to Update the Report File

1. **Navigate to**: `/docs/gemini-handoffs/GEMINI_REPORTS.md`
2. **Replace entire contents** with your new report using the template above
3. **Include all console outputs** from your test runs
4. **Be specific** about what works vs. what doesn't
5. **Provide actionable feedback** for Claude to implement fixes

## Building and Testing Operations

### ✅ SAFE for Gemini CLI (Build & Test Operations)
These commands are **SAFE** - they don't modify source code:

```bash
npm install        # Install dependencies
npm run build      # Build the project (creates dist/ files)
npm run typecheck  # Type checking verification
npm run test:build # Build verification
npm test           # Run production tests
npm run test:windows # Windows-specific tests
```

### ❌ FORBIDDEN for Gemini CLI (Development Operations)
These commands modify source code and are **FORBIDDEN**:

```bash
# DO NOT RUN THESE - Source code modification
npm run dev        # Development mode with file watching
# Any editing of files in src/ directory
# Any git commits or pushes
```

## Current Project Status

### ✅ Completed (By Claude)
- Mac platform fully functional (no command echo, clean output, fast performance)
- Comprehensive test suite structure created
- TDD workflow documented
- Exit code detection improved
- Prompt detection enhanced
- Windows PTY integration fixes implemented

### 🔄 In Progress
- Windows testing and validation (Gemini CLI's role)

### 📋 Testing Framework

The project now uses **Jest** as its testing framework. Key conventions:

### Test Structure and Framework (For Reference Only)

- **Framework**: All tests use Jest (`describe`, `test`, `expect`)
- **File Location**: Tests are in `test/` directory with platform-specific subdirectories
- **Mac Tests**: `test/integration/mac/` (Claude maintains and runs)
- **Windows Tests**: `test/integration/windows/` (Gemini CLI runs, Claude maintains)
- **Unit Tests**: `test/unit/` (Claude maintains and runs)

### Mocking (For Reference Only)

- **ES Modules**: Mock with `jest.mock('module-name')`
- **Mock Functions**: Create with `jest.fn()`
- **Spying**: Use `jest.spyOn(object, 'methodName')`

### Commonly Tested Areas

- **Cross-platform compatibility**: Mac vs Windows behavior
- **Shell detection**: PowerShell, CMD, Bash variants
- **Command execution**: Echo, pwd, cd, environment variables
- **Session persistence**: Directory changes, environment variables
- **Output parsing**: Clean output without command echo or control characters
- **Performance**: Sub-second response times for basic commands

## Git Repo

The main branch for this project is called "main"

## TypeScript/JavaScript Guidelines

### Core Principles
- Use functional programming patterns over classes
- Prefer plain objects with TypeScript interfaces
- Leverage ES module syntax for encapsulation
- Avoid `any` types, prefer `unknown` when needed
- Use array operators (.map, .filter, .reduce) for immutable operations

### ES Module Encapsulation
```typescript
// Good: Clear public/private API through exports
export interface TerminalResult {
  output: string;
  exitCode: number;
}

// Private implementation details (not exported)
function parseOutput(raw: string): string {
  // Implementation details
}

// Public API
export function executeCommand(cmd: string): TerminalResult {
  // Uses private functions internally
}
```

### Type Safety
```typescript
// Good: Using unknown for type-safe handling
function processValue(value: unknown) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // Safe string operation
  }
}

// Avoid: Using any (loses type safety)
function processAny(value: any) {
  console.log(value.anything()); // No type checking
}
```

## Platform-Specific Implementation

### Architecture Overview
The project uses a factory pattern for platform-specific implementations:

```
src/
├── vibe-terminal-base.ts      # Shared logic
├── vibe-terminal-mac.ts       # Mac-specific implementation
├── vibe-terminal-pc.ts        # Windows-specific implementation
├── pty-adapter.ts             # PTY abstraction layer
└── intelligent-output-parser.ts # Cross-platform output cleaning
```

### Platform Detection
```typescript
// Factory creates appropriate platform instance
export function createVibeTerminal(config?: TerminalConfig): VibeTerminalBase {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    return new VibeTerminalMac(config);
  } else if (platform === 'win32') {
    return new VibeTerminalPC(config);
  }
  
  throw new Error(`Unsupported platform: ${platform}`);
}
```

## Testing Strategy

### Test Categories

1. **Unit Tests** (`test/unit/`)
   - Output parser logic
   - Path normalization
   - Shell detection
   - Exit code extraction

2. **Integration Tests** (`test/integration/`)
   - **Mac** (`mac/`) - Full terminal session tests
   - **Windows** (`windows/`) - Platform-specific tests (Gemini CLI focus)
   - **Cross-platform** (`cross-platform/`) - Shared behavior tests

3. **Performance Tests**
   - Command execution speed
   - Session persistence efficiency
   - Memory usage

### Complete Testing Workflow for Gemini CLI

**Step 1: Environment Setup**
```bash
npm install          # Install all dependencies
npm run build        # Build the project from TypeScript
npm run typecheck    # Verify TypeScript compilation
```

**Step 2: Build Verification**
```bash
npm run test:build   # Verify build completed successfully
```

**Step 3: Windows Functionality Testing**
```bash
npm run test:windows # Run comprehensive Windows tests
npm test            # Run cross-platform production tests
```

**Step 4: Report Results**
Use the reporting template below with all findings.

### Critical Test Areas to Verify

**Windows Command Execution:**
- Basic commands (echo, pwd, dir, cd)
- PowerShell vs CMD compatibility
- Session persistence across commands
- Environment variable handling

**Output Quality:**
- No command echo in output
- Clean removal of PowerShell banners
- Proper handling of Windows path formats
- Control character stripping

**Performance Benchmarks:**
- Commands complete within 2 seconds
- No timeouts (exit code should not be -1)
- Session state properly maintained

**Build System:**
- TypeScript compilation successful
- All distribution files created
- No build errors or warnings

## Error Handling

### Common Windows Issues to Test For
- ConPTY support detection
- PowerShell version compatibility
- Administrator privilege requirements
- Windows path handling (drive letters, UNC paths)
- Line ending normalization (CRLF vs LF)

### Exit Code Mapping
```typescript
// Windows-specific error patterns
const windowsErrorPatterns = [
  'is not recognized',           // CMD command not found
  'The system cannot find',      // File/path not found
  'Access is denied',            // Permission error
  'The process cannot access',   // File in use
];
```

## Memory and Performance

### Optimization Guidelines
- Use streaming for large output
- Clean up PTY processes properly
- Avoid memory leaks in event listeners
- Implement proper timeout handling

### Resource Management
```typescript
// Proper cleanup pattern
export class VibeTerminal {
  destroy(): void {
    if (this.ptyProcess) {
      this.ptyProcess.kill();
      this.ptyProcess = null;
    }
  }
}
```

## Security Considerations

### Input Validation
- Sanitize shell commands
- Prevent command injection
- Handle untrusted input safely
- Validate file paths

### Process Isolation
- Run with minimal privileges
- Avoid shell expansion of user input
- Use parameterized commands when possible

## Comments Policy

Only write high-value comments if at all. Avoid talking to the user through comments. Let the code and types speak for themselves.

---

## Quick Start for Gemini CLI

### Complete Testing Workflow
```bash
# 1. Setup (on both Mac and PC)
npm install
npm run build
npm run typecheck

# 2. Test (on both Mac and PC)
npm run test:gemini    # Cross-platform test - works on both platforms
npm run test:windows   # Windows-specific test (when on PC)
npm test              # Production test

# 3. Report (ONLY when testing on PC)
# Edit /docs/gemini-handoffs/GEMINI_REPORTS.md with Windows findings
# Mac tests are for verification only - don't update reports
```

### Report File Location
📁 **File to Update**: `/docs/gemini-handoffs/GEMINI_REPORTS.md`
- Replace the old June 29th content completely
- Use the markdown template provided above
- Include all console outputs and test results
- Save the file after completing your analysis

### What Claude Needs to Know
- **Build Status**: Did TypeScript compile successfully?
- **Test Results**: Which tests passed/failed and why?
- **Performance Data**: Actual vs. target command execution times
- **Console Outputs**: All "GEMINI REPORT:" messages from tests
- **Specific Issues**: Detailed descriptions of any problems found
- **Comparison**: How current results compare to June 29th report findings

### Report Quality Expectations
✅ **Good Report**:
- Complete console outputs pasted verbatim
- Specific performance numbers (e.g., "2347ms" not "slow")
- Clear pass/fail status for each test area
- Comparison to previous 100% timeout issues
- Actionable recommendations for Claude

❌ **Poor Report**:
- Vague descriptions ("didn't work well")
- Missing console outputs
- No performance measurements
- No comparison to previous issues
- Generic feedback without specifics

---

**🎯 Key Takeaway for Gemini CLI:**
Your role is to **test, measure, and report**, not to **fix or modify**. Run the Windows tests, measure performance, document findings in GEMINI_REPORTS.md, and provide detailed feedback to Claude. Claude handles all the actual development work to make the fixes.