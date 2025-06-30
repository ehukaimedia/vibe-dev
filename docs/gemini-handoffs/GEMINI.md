# Vibe Dev - Gemini CLI Collaboration Guidelines

## Leveraging Gemini CLI's Unique Strengths

**🎯 PURPOSE: Windows Expertise & Cross-Platform Intelligence 🎯**

While Claude Desktop is limited to Mac testing, Gemini CLI provides critical Windows insights and cross-platform perspective that Claude cannot access.

### Gemini CLI's Unique Value
- **Windows System Expert**: Deep understanding of PowerShell, CMD, ConPTY, Windows paths
- **Cross-Platform Tester**: Can run identical tests on Mac AND Windows to spot differences
- **Fresh Architecture Perspective**: Independent code review and design feedback
- **Real-World Windows Scenarios**: Testing across different Windows configurations
- **Security & Performance Analyst**: Windows-specific vulnerabilities and bottlenecks

### Claude Desktop's Limitations
- **Mac-only testing**: Cannot verify Windows behavior
- **No Windows environment access**: Can't see PowerShell versions, Windows paths, etc.
- **Single perspective**: May miss Windows-specific edge cases
- **Limited system variety**: Only tests on one configuration

## Collaboration Model 2.0

### 🔍 Gemini CLI as Windows Expert & Analyst

#### 1. Windows-Specific Investigation
```bash
# Don't just run tests - investigate Windows behavior
Get-Command npm | Select-Object -Property *  # Why is PATH not working?
$env:Path -split ';' | Where-Object {$_ -like "*npm*"}  # Is npm in PATH?
[System.Environment]::GetEnvironmentVariable("Path", "Machine")  # System PATH
[System.Environment]::GetEnvironmentVariable("Path", "User")     # User PATH

# Test different shells
powershell.exe -Command "echo $PSVersionTable"
pwsh.exe -Command "echo $PSVersionTable"  # PowerShell Core
cmd.exe /c "echo %PATH%"
```

#### 2. Cross-Platform Comparison Testing
```bash
# Run on BOTH Mac and Windows, then compare:
npm run test:gemini

# Document differences:
# - Timing differences (Mac: 15ms, Windows: 200ms - why?)
# - Output formatting variations
# - Error message differences
# - Path handling discrepancies
```

#### 3. Windows Edge Case Discovery
- Test with non-admin users
- Long path names (>260 chars)
- UNC paths (`\\server\share`)
- Special characters in paths
- Different Windows versions (10, 11, Server)
- Various terminals (Windows Terminal, ConEmu, default console)

#### 4. Architecture & Design Feedback
- Review code from Windows perspective
- Suggest Windows-optimized approaches
- Identify potential Windows security issues
- Propose alternative implementations

### 📊 Enhanced Reporting Structure

Instead of just test results, provide **analytical insights**:

```markdown
# Gemini CLI Analysis Report - [Date]

## Executive Summary
- **Key Finding**: PATH inheritance fails because [root cause analysis]
- **Platform Differences**: [Specific behavioral differences discovered]
- **Security Concerns**: [Windows-specific vulnerabilities identified]
- **Performance Analysis**: [Why Windows is slower, with evidence]

## Windows-Specific Investigation

### PATH Inheritance Root Cause
```powershell
# Commands used to investigate
[Environment]::GetEnvironmentVariable("Path", "Process")
# Result: [What you found]
```
**Analysis**: The issue occurs because...
**Recommendation**: Consider using...

### PowerShell vs CMD Behavior
[Detailed comparison of how commands behave differently]

### ConPTY vs Legacy Console
[Performance and compatibility differences observed]

## Cross-Platform Comparison

| Aspect | Mac Result | Windows Result | Analysis |
|--------|------------|----------------|----------|
| Command Echo | Clean | Has artifacts | Windows because... |
| Performance | 15ms | 200ms | Slower due to... |
| Path Handling | Unix-style | Drive letters | Causes issues when... |

## Architecture Feedback

### Current Approach Issues
1. **Problem**: Using X approach doesn't work well on Windows because...
2. **Evidence**: [Specific examples]
3. **Alternative**: Consider Y approach which would...

### Security Considerations
1. **Windows-specific vulnerability**: [Description]
2. **Attack vector**: [How it could be exploited]
3. **Mitigation**: [Recommended fix]

## Recommendations for Claude

### High Priority Windows Fixes
1. **PATH Inheritance**: 
   - Root cause: [Your investigation findings]
   - Suggested fix: [Specific implementation approach]
   - Code example: [Pseudocode or pattern]

2. **Performance Optimization**:
   - Bottleneck identified: [Where and why]
   - Windows-specific solution: [What would work better]

### Design Improvements
[Architectural changes that would benefit Windows]

## Test Results (Supporting Evidence)

[Include actual test outputs that support your analysis]
```

## Investigation Areas for Gemini CLI

### 1. PATH Environment Mystery
```powershell
# Why isn't PATH inherited? Investigate:
$env:Path
Get-Process -Id $PID | Select-Object -ExpandProperty Path
Get-Command node-pty | Select-Object -ExpandProperty Source

# Test with explicit PATH
$env:Path = "C:\Program Files\nodejs;$env:Path"
node -v  # Does this work now?
```

### 2. PowerShell Profile Loading
```powershell
# Is the profile affecting PATH?
Test-Path $PROFILE
Get-Content $PROFILE
powershell.exe -NoProfile -Command "echo $env:Path"
```

### 3. ConPTY Behavior Analysis
```powershell
# Check ConPTY support
[System.Environment]::OSVersion.Version
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name ReleaseId

# Test with different PTY settings
# Document behavior differences
```

### 4. Performance Profiling
- Why are Windows commands slower?
- Is it PTY overhead or shell startup?
- Profile specific bottlenecks
- Compare PowerShell vs CMD performance

## Gemini CLI Action Items

### Phase 1: Investigate (Don't Just Test)
1. **Root Cause Analysis**: Why is PATH not inherited?
2. **Performance Profiling**: Where is the 200ms going?
3. **Shell Comparison**: PowerShell vs CMD vs PowerShell Core
4. **Environment Analysis**: How Windows handles process inheritance

### Phase 2: Cross-Platform Intelligence
1. **Run identical tests** on Mac and Windows
2. **Document ALL differences**, not just pass/fail
3. **Analyze WHY** differences occur
4. **Propose platform-specific optimizations**

### Phase 3: Windows Expertise
1. **Test edge cases** Claude can't imagine on Mac
2. **Leverage Windows knowledge** for better solutions
3. **Suggest Windows-native approaches** where appropriate
4. **Identify security implications** specific to Windows

### Phase 4: Architectural Review
1. **Code review** from fresh perspective
2. **Design feedback** based on cross-platform experience
3. **Alternative approaches** that might work better
4. **Future-proofing** for Windows changes

## What Claude Needs From Gemini

### Not Just Test Results, But:
1. **Root cause analysis** of Windows issues
2. **Specific code changes** that would fix problems
3. **Performance bottleneck identification**
4. **Security vulnerability assessment**
5. **Architecture improvement suggestions**
6. **Windows-specific edge cases** to handle

### Example of High-Value Feedback:
```markdown
"The PATH issue occurs because node-pty on Windows creates a new 
process without inheriting the parent environment. Here's proof:
[PowerShell investigation commands and results]

Suggested fix: Pass explicit env to PTY spawn options:
```javascript
const env = {
  ...process.env,
  Path: process.env.Path || process.env.PATH,
  PATHEXT: process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD'
};
```

This would ensure PATH inheritance because..."
```

## Updated Collaboration Protocol

### Gemini CLI Can:
- ✅ **Investigate** Windows behavior deeply
- ✅ **Write test proposals** (not code) for Claude to implement
- ✅ **Suggest code fixes** as recommendations
- ✅ **Provide pseudocode** and architectural guidance
- ✅ **Document findings** in GEMINI_ANALYSIS.md
- ✅ **Compare platforms** to identify differences

### Gemini CLI Cannot:
- ❌ Modify source code in `src/`
- ❌ Create test files in `test/`
- ❌ Commit or push changes
- ❌ Make architectural decisions (only recommend)

### Claude Will:
- Implement all code changes based on Gemini's findings
- Create tests based on Gemini's test proposals
- Make final architectural decisions
- Handle all commits and deployment

## Quick Start for Windows Investigation

```bash
# 1. Clone and setup
git clone [repo]
npm install
npm run build

# 2. Investigate PATH issue
powershell
> $env:Path -split ';' | Select-String "node|npm|git"
> Get-Command npm -ErrorAction SilentlyContinue
> Get-Process -Id $PID | Select Path

# 3. Test in different shells
> powershell.exe -NoProfile -Command "npm -v"
> cmd.exe /c "npm -v"
> pwsh.exe -Command "npm -v"

# 4. Profile performance
> Measure-Command { node test/windows-parser-test.mjs }

# 5. Document findings in GEMINI_ANALYSIS.md
```

## Expected Deliverables from Gemini CLI

### 1. Root Cause Analysis Document
- Why PATH inheritance fails (with evidence)
- Performance bottleneck identification
- Platform behavioral differences
- Security considerations

### 2. Test Proposals (Not Implementations)
```markdown
Proposed Test: Windows PATH Inheritance
- Purpose: Verify PATH is properly inherited in PTY sessions
- Method: Spawn PTY, check if npm/git are accessible
- Expected: Commands should work
- Actual: Currently fail with "not recognized"
- Fix validation: After fix, commands should succeed
```

### 3. Architecture Recommendations
- Current approach limitations
- Windows-optimized alternatives
- Cross-platform compatibility considerations
- Future-proofing suggestions

### 4. Windows Edge Case Catalog
- Scenarios that need testing
- Windows-specific quirks to handle
- Version-specific behaviors
- Corporate environment considerations

---

**🎯 New Mission for Gemini CLI:**
Don't just run tests - be the Windows expert that helps Claude understand and solve Windows-specific challenges through investigation, analysis, and architectural guidance.