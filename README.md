# Vibe Dev: The Intelligent Choice for Efficient Development

**Project Directory**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev`

> Two tools, infinite capability. A minimalist MCP server that brings true intelligence to terminal operations.

## What is Vibe Dev?

Vibe Dev is an intelligent terminal emulator that understands what you're actually doing, not just what commands you type. It maintains persistent shell sessions and provides context-aware analysis of your development workflow.

Unlike traditional terminal tools that treat each command in isolation, Vibe Dev:
- **Maintains true session state** - Your directory changes, environment variables, and virtual environments persist across commands
- **Analyzes outcomes, not patterns** - Understands what actually happened, not just command syntax
- **Provides instant intelligence** - Real-time workflow detection and error analysis
- **Stays minimal** - Just two tools, no bloat

## The Vibe Dev Code

### The Eight Sacred Documents
1. README.md (root)
2. ARCHITECTURE.md
3. WORKFLOW.md
4. TDD-WORKFLOW.md
5. DEVELOPMENT.md
6. STATUS.md (update every session)
7. API.md
8. CHANGELOG.md

**NEVER add. NEVER rename. ONLY update.**

### The Two Tools
1. **vibe_terminal** - Execute ANY command with persistent session state
2. **vibe_recap** - Get intelligent summaries of terminal activity

**NEVER add a third tool. Every feature enhances these two.**

### The Three Critical Files
- `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/src/utils/trackTools.ts`
- `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/Recap-Fork.md`
- `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/`

**ALWAYS study these first. Never reinvent solved problems.**

### The Core Principles
- We analyze real output, not patterns
- We maintain real sessions, not simulations
- We deliver real speed, not "fast enough"
- We demonstrate excellence, not claim it

### The Only Rule
**Every session ships measurable improvement or it failed.**

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

### 🧠 Intelligent Analysis
```bash
# Get instant insights about your work
vibe_recap({ hours: 2 })

# Output:
# 📊 WORKFLOW: React Development
# - Created 5 components
# - Tests: 23 passed, 2 failed
# - Build time improved by 35%
# ⚠️ ACTION NEEDED: Fix failing auth tests
```

### ⚡ Performance Focused
- Current: 4-6s response time (unacceptable)
- Target: <1s response time
- Every commit must improve speed

## Installation

### Requirements
- Node.js 20+ (Mac & Windows)
- Claude Desktop or compatible MCP client

### Global Installation (Recommended)
```bash
# Install globally (Mac & Windows)
npm install -g vibe-dev

# Or use the GitHub repository directly
npm install -g git+https://github.com/ehukaimedia/vibe-dev.git
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

Configuration file locations:
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## Usage

### vibe_terminal - Execute Commands
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
vibe_terminal("pip install requests")  // Installs in myenv
```

### vibe_recap - Get Intelligent Summaries
```javascript
// Quick status check
vibe_recap({ type: "status" })

// Full workflow analysis
vibe_recap({ hours: 4, type: "full" })

// JSON output for automation
vibe_recap({ format: "json" })
```

## Development Status

**Version**: 0.1.0 - Clean Slate MVP  
**Total Code**: 15 lines (stubs only)  
**Status**: Ready for Test-Driven Development  

All functionality is currently stubbed with "not implemented" errors. This is intentional - we build only what we can prove works through tests.

See [docs/STATUS.md](docs/STATUS.md) for detailed progress and next steps.

## Project Structure

```
vibe-dev/
├── src/
│   ├── index.ts          # Entry point (5 lines)
│   ├── vibe-terminal.ts  # Command execution stub (5 lines)
│   └── vibe-recap.ts     # Intelligent analysis stub (5 lines)
├── test/                 # Test directory (empty - ready for TDD)
├── test-env/            # Test environment files
├── test-venv/           # Python virtual environment testing
├── docs/                # The Eight Sacred Documents
├── dist/                # Build output (empty)
└── .git/                # Git repository (clean)
```

## Development Workflow

### Every Session Must:
1. Study trackTools.ts and Recap-Fork.md first
2. Ship one measurable improvement
3. Update STATUS.md with progress
4. Commit with clear NEXT task
5. Answer: "Why is Vibe Dev better now?"

### Performance Benchmarks

| Operation | Current | Target | Status |
|-----------|---------|--------|--------|
| Simple echo | 4-6s | <0.5s | 🔴 |
| Directory change | 4-6s | <0.5s | 🔴 |
| Complex pipeline | 5-7s | <1s | 🔴 |
| Recap analysis | 1-2s | <0.5s | 🟡 |

## The Vibe Dev Promise

> We analyze what actually happened, not what command you typed.  
> We maintain real sessions, not stateless execution.  
> We respond instantly, not "fast enough".

Every commit makes Vibe Dev measurably better.

## License

MIT

---

*From 15 lines of stubs, we build excellence through test-driven development.*  
*Two tools. Infinite capability. Instant response.*
