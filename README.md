# Vibe Dev

**🚀 In Production** - A minimalist MCP (Model Context Protocol) server that brings true intelligence to terminal operations. Two tools that understand your workflow and help you progress naturally.

## What is Vibe Dev?

**Production Status**: ✅ **Stable** - Actively used in production environments

Vibe Dev is an intelligent terminal emulator that understands what you're actually doing, not just what commands you type. It maintains persistent shell sessions and provides context-aware analysis of your development workflow.

Unlike traditional terminal tools that treat each command in isolation, Vibe Dev:
- **Maintains true session state** - Your directory changes, environment variables, and virtual environments persist across commands
- **Analyzes outcomes, not patterns** - Understands what actually happened, not just command syntax
- **Provides intelligent workflow insights** - Progressive development through smart analysis and suggestions
- **Recovers from disconnections** - Chronologically recalls everything you did, why you did it, and helps you resume exactly where you left off
- **Stays minimal** - Just two tools, no bloat

## Key Features

### 🚀 Persistent Terminal Sessions
```bash
# Traditional tools lose context between commands
$ cd /project      # ✓
$ npm install      # ✗ Back in original directory

# Vibe Dev maintains your session
vibe_terminal("cd /project")      # ✓
vibe_terminal("npm install")      # ✓ Still in /project
```

### 🛡️ Disconnect Recovery - Never Lose Your Context
```bash
# Server disconnected? Network dropped? Claude crashed?
# No problem. Vibe Dev remembers everything.

vibe_recap({ hours: 4 })

# Instant Context Recovery:
# ┌─────────────────────────────────────────────────────────────┐
# │ 🔴 DISCONNECTION DETECTED • 2:47 PM                         │
# │                                                             │
# │ 📍 LAST KNOWN STATE (Before Disconnect)                     │
# │ ├─ Working in: ~/projects/api/src/controllers              │
# │ ├─ Active branch: feature/user-auth                        │
# │ ├─ Virtual env: ./venv (active)                            │
# │ └─ Last command: npm test auth.spec.js (running...)        │
# │                                                             │
# │ 📜 CHRONOLOGICAL ACTIVITY (What You Did)                    │
# │ 2:15 PM - Started session in ~/projects/api                │
# │ 2:18 PM - Activated virtual environment                    │
# │ 2:20 PM - Created new branch: feature/user-auth            │
# │ 2:25 PM - Modified auth.controller.js (+45 lines)          │
# │ 2:32 PM - Fixed TypeScript error in line 127               │
# │ 2:38 PM - Added JWT validation middleware                  │
# │ 2:45 PM - Started running auth tests...                     │
# │ 2:47 PM - [DISCONNECTED]                                    │
# │                                                             │
# │ 🎯 WHY YOU WERE WORKING (Intent Analysis)                   │
# │ Primary Goal: Implement JWT authentication (95% confidence) │
# │ Evidence:                                                   │
# │ - Created auth-specific branch                              │
# │ - Modified authentication controller                        │
# │ - Added JWT middleware                                      │
# │ - Running auth-specific tests                               │
# │                                                             │
# │ 🚀 RESUME EXACTLY WHERE YOU LEFT OFF                        │
# │ cd ~/projects/api/src/controllers                          │
# │ source ../../../venv/bin/activate                          │
# │ git status  # Check test results                           │
# │ npm test auth.spec.js  # Re-run interrupted tests          │
# └─────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- **Zero Context Loss**: Every command, every state change, every file modification is preserved
- **Chronological Reconstruction**: See exactly what you did in order, making it easy to understand your progress
- **Intent Preservation**: Understand not just what you were doing, but why you were doing it
- **Instant Recovery**: Copy and paste commands to resume exactly where you left off

This is only possible because vibe_terminal maintains persistent sessions with complete state tracking.

### 🧠 Intelligent Analysis
```bash
# Get contextual insights about your work
vibe_recap({ hours: 2 })

# Revolutionary Intelligence Output:
# ┌─────────────────────────────────────────────────────────────┐
# │ 📊 WORKFLOW: React Component Development (98% confidence)    │
# │                                                             │
# │ 🎯 INTENT: Refactoring authentication flow                  │
# │ Evidence: Modified 3 auth files, all tests passing         │
# │                                                             │
# │ 📁 PROJECT CONTEXT                                          │
# │ ├─ Working in: ~/projects/dashboard                        │
# │ ├─ Branch: feature/auth-upgrade                            │
# │ └─ Environment: Node 20.11, npm 10.2.4                     │
# │                                                             │
# │ ⚡ COMMAND INTELLIGENCE                                      │
# │ ├─ npm test auth.spec.js → ✅ Passed (2.3s)               │
# │ ├─ git status → 📝 3 files modified, unstaged             │
# │ └─ npm run build → ⚠️ Warning: unused variable line 47     │
# │                                                             │
# │ 🔄 SESSION CONTINUITY                                       │
# │ ├─ Virtual env: ./venv (active, 47 packages)              │
# │ ├─ Env vars: API_KEY, DB_URL (masked)                     │
# │ └─ Working directory maintained: ~/projects/dashboard/src  │
# │                                                             │
# │ 💡 INTELLIGENT SUGGESTIONS                                   │
# │ 1. Stage auth changes: git add src/auth/*                  │
# │ 2. Fix unused variable before commit (line 47)             │
# │ 3. Run integration tests: npm run test:integration         │
# │ 4. Consider extracting AuthContext to reduce duplication   │
# │                                                             │
# │ 🎬 NEXT COMMAND PREDICTION                                  │
# │ Based on your workflow, you'll likely want to:             │
# │ > git add src/auth/* && git commit -m "refactor: improve auth flow"
# └─────────────────────────────────────────────────────────────┘
```

The intelligent recap system ensures your development is always progressive by:

**🔍 Complete Command Visibility**
- Tracks actual command output, not just what you typed
- Monitors exit codes to understand success/failure
- Captures warnings and errors for proactive guidance
- Times execution to identify performance bottlenecks

**🧩 True Session Intelligence**
- Maintains your exact environment state (variables, paths, virtual envs)
- Understands git context (branch, staged files, conflicts)
- Tracks package installations and dependency changes
- Preserves terminal state across all commands

**🎯 Outcome-Based Analysis**
- Knows which tests passed or failed, not just that you ran tests
- Understands build warnings and can suggest fixes
- Tracks file modifications with actual change context
- Correlates errors with recent code changes

**🚀 Predictive Workflow Assistance**
- Suggests next commands based on current state and patterns
- Warns about potential issues before they occur
- Offers optimization opportunities from execution data
- Learns from your command corrections and preferences

**🛡️ Bulletproof Disconnect Recovery**
- Chronologically reconstructs everything you did before disconnection
- Preserves your intent and context with confidence scoring
- Shows exactly why you were working on what you were working on
- Provides instant resume commands to continue where you left off

This is only possible because every command flows through `vibe_terminal`, giving us complete control and first-hand data about your development workflow.

### 🌟 Intuitive by Design
- Understands your development patterns
- Suggests next steps based on context
- Gracefully handles errors with helpful guidance
- Progressive workflows that evolve with your project

## Why Vibe Dev?

Vibe Dev brings intelligence and intuition to terminal operations. We focus on quality of life improvements that make development feel natural:

- **Context That Persists**: Your environment, directory, and state are maintained across commands
- **Intelligence That Helps**: Our recap system doesn't just log - it understands and suggests
- **Workflows That Progress**: Every session builds on the last, creating a continuous development experience
- **Disconnect Recovery**: Never lose your work context - recover chronologically from any disconnection
- **Tools That Get Out of Your Way**: Just two commands that do exactly what you need

This is the better app because it understands what you're trying to accomplish and helps you get there naturally, even when things go wrong.

## The Vibe Dev Advantage

**🎯 First-Hand Intelligence vs. Log Parsing**

Traditional tools parse logs after execution, missing crucial context. Vibe Dev captures everything in real-time:

```bash
# Traditional tools see: "npm test"
# Vibe Dev sees:
# - Command: npm test
# - Output: 23 passed, 2 failed
# - Failed: auth.spec.js:47 - "TypeError: Cannot read property 'token' of undefined"
# - Duration: 12.3s
# - Exit code: 1
# - Next suggestion: "Check auth.spec.js line 47 for undefined token access"
```

**🔄 True Session Persistence**

Your entire development context moves with you:

```bash
vibe_terminal("cd backend && source venv/bin/activate")
vibe_terminal("pip install django")  # Still in backend/, venv still active!
vibe_terminal("echo $VIRTUAL_ENV")   # Shows: /path/to/backend/venv
```

**🧩 Outcome-Based Learning**

We don't just track commands - we understand results:

```bash
# After seeing: git push → "error: failed to push some refs"
# Vibe Dev suggests: "git pull --rebase origin main"

# After seeing: npm start → "Error: Cannot find module 'express'"  
# Vibe Dev suggests: "npm install express"

# After seeing multiple slow test runs
# Vibe Dev suggests: "npm test -- --watch for faster feedback"
```

## Installation

Vibe Dev is production-ready and available for immediate use.

### Requirements
- Node.js 20+ (Mac & Windows)
- Claude Desktop or compatible MCP client

### Global Installation (Recommended)

Install the production version of vibe-dev globally with one command:

```bash
# Install globally (Mac & Windows)
npm install -g vibe-dev

# Or use the GitHub repository directly
npm install -g git+https://github.com/ehukaimedia/vibe-dev.git
```

After installation, restart Claude Desktop to use the vibe-dev tools.

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/[your-username]/vibe-dev.git
cd vibe-dev

# Install dependencies
npm install

# Build the project
npm run build
```

### Configure Claude Desktop

For global installation, add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vibe-dev": {
      "command": "vibe-dev"
    }
  }
}
```

For manual/local installation:
```json
{
  "mcpServers": {
    "vibe-dev": {
      "command": "node",
      "args": ["/path/to/vibe-dev/dist/index.js"]
    }
  }
}
```

Configuration file locations:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## Usage

### vibe_terminal - Execute Commands

Run any terminal command with full session persistence:

```javascript
// Basic commands
vibe_terminal("pwd")
vibe_terminal("ls -la")

// Session persistence
vibe_terminal("cd ~/projects")
vibe_terminal("git status")  // Still in ~/projects

// Environment management
vibe_terminal("export API_KEY=secret123")
vibe_terminal("echo $API_KEY")  // Outputs: secret123

// Virtual environments
vibe_terminal("python -m venv myenv")
vibe_terminal("source myenv/bin/activate")
vibe_terminal("pip install requests")  // Installs in myenv```

### vibe_recap - Get Intelligent Summaries

Analyze your terminal activity with context-aware intelligence:

```javascript
// Quick status check
vibe_recap({ type: "status" })

// Full workflow analysis
vibe_recap({ hours: 4, type: "full" })

// JSON output for automation
vibe_recap({ format: "json" })
```

## API Reference

### vibe_terminal(command: string)

Executes a command in a persistent shell session.

**Parameters:**
- `command` (string, required): The command to execute

**Returns:**
```typescript
{
  output: string,    // Command output (ANSI stripped)
  exitCode: number   // Exit code (0 = success)}
```

### vibe_recap(options?: RecapOptions)

Provides intelligent analysis of terminal activity.

**Parameters:**
- `hours` (number, optional): Hours to analyze (default: 1)
- `type` (string, optional): Analysis type
  - `"full"`: Detailed analysis with recommendations
  - `"status"`: Quick status check  
  - `"summary"`: Brief overview
- `format` (string, optional): Output format
  - `"text"`: Human readable (default)
  - `"json"`: Structured data

**Returns:**
Contextual analysis based on actual command outcomes.

## Architecture

Vibe Dev follows a minimalist architecture designed for maximum intelligence gathering:

```
vibe-dev/
├── src/
│   ├── index.ts             # MCP server entry point
│   ├── vibe-intelligence.ts # Core intelligence engine
│   ├── vibe-terminal.ts     # Persistent terminal sessions
│   └── vibe-recap.ts        # Intelligence-driven analysis
```

### Why Our Architecture Enables Superior Intelligence

**🎯 Direct Data Pipeline**
All terminal operations flow through `vibe_terminal`, giving us:
- First-hand command output and exit codes
- Real-time execution timing and performance data
- Complete environment state tracking
- Actual error messages and warnings

**🧠 Contextual Understanding**
Unlike tools that parse logs after the fact, we:
- Maintain live session state across all commands
- Track environment variables and directory changes
- Preserve virtual environment activations
- Monitor git state and file modifications

**🚀 Predictive Capabilities**
With complete control over execution, we can:
- Predict likely next commands based on outcomes
- Warn about potential issues before they occur
- Suggest optimizations from actual performance data
- Learn from command patterns and corrections

### Design Principles

1. **Minimal Surface Area** - Just two tools, no complexity
2. **Real Intelligence** - Analyze outcomes, not patterns
3. **Developer Experience First** - Intuitive interactions that feel natural
4. **Progressive Workflows** - Each session builds on the last

## Development

### Running Tests
```bash
# All tests
npm test

# Specific test suites
npm run test:core        # Core functionality
npm run test:platform    # Cross-platform tests
npm run test:intelligence # Analysis accuracy

# Watch mode
npm run test:watch
```

### Quality Metrics
Every session must improve ONE aspect:
- 🧠 **Intelligence** - Better workflow understanding
- 🎨 **Intuitiveness** - More natural interactions
- 🛡️ **Reliability** - Graceful error handling and disconnect recovery
- 🎯 **Simplicity** - Less code, more capability

### Contributing

1. **Test First** - Write failing test before code
2. **Measure Impact** - Benchmark before/after
3. **Document Changes** - Update relevant docs
4. **One Improvement** - Each PR improves one thing

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| macOS    | ✅ Primary | Full support, primary dev platform |
| Windows  | ✅ Supported | PowerShell/cmd compatible |
| Linux    | ❌ Not Supported | Focus on Mac/Windows |

## Roadmap

### Immediate (This Week)
- [ ] Enhanced context detection in recap
- [ ] Smarter error suggestions
- [ ] Windows platform testing

### Short Term (This Month)  
- [ ] Workflow pattern recognition
- [ ] Intelligent command suggestions
- [ ] Project-aware analysis

### Long Term (This Quarter)
- [ ] Plugin architecture
- [ ] Custom analyzers
- [ ] Team workflow sharing

## The Vibe Dev Promise

> We analyze what actually happened, not what command you typed.  
> We maintain real sessions, not stateless execution.  
> We preserve your work through any disconnection, not just when things go smoothly.  
> We help you progress naturally through intelligent understanding.

Every commit makes Vibe Dev more intuitive, reliable, and helpful.

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for features
- **Documentation**: See `/docs` folder for detailed guides

---

*Built for developers who value intuitive tools that understand their workflow.*