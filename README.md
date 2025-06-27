# Vibe Dev

> Two tools, infinite capability. The intelligent choice for efficient development.

## What is Vibe Dev?

Two MCP tools that understand developers:
- **vibe_terminal** - Execute ANY command with persistent session state
- **vibe_recap** - Get intelligent summaries of terminal activity

## Quick Start

```bash
# Clone the repository
git clone [your-repo-url]
cd vibe-dev

# Install dependencies (when ready)
npm install

# Build
npm run build

# Test
npm test
```

## The Eight Sacred Documents

1. **README.md** (this file) - Project overview
2. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design
3. **[docs/WORKFLOW.md](docs/WORKFLOW.md)** - Development workflow
4. **[docs/TDD-WORKFLOW.md](docs/TDD-WORKFLOW.md)** - Test-driven development
5. **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guide
6. **[docs/STATUS.md](docs/STATUS.md)** - Current status (updated every session)
7. **[docs/API.md](docs/API.md)** - Tool specifications
8. **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Version history

**NEVER add. NEVER rename. ONLY update.**

## Core Principles

- **Two Tools Only** - No feature creep
- **Real Sessions** - Not command wrappers
- **Instant Response** - <1s is the law
- **Intelligent Analysis** - Understand workflows

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
└── .git/                # Git repository (1 commit)
```

## Development Status

**Version**: 0.1.0 - Clean Slate MVP  
**Total Code**: 15 lines (stubs only)  
**Status**: Ready for Test-Driven Development  

All functionality is currently stubbed with "not implemented" errors. This is intentional - we build only what we can prove works through tests.

See [docs/STATUS.md](docs/STATUS.md) for detailed progress and next steps.

## Getting Started with Development

1. **Read the Sacred Documents** - Start with [docs/WORKFLOW.md](docs/WORKFLOW.md)
2. **Write Your First Test** - Follow [docs/TDD-WORKFLOW.md](docs/TDD-WORKFLOW.md)
3. **Make It Pass** - Implement only what the test requires
4. **Measure Performance** - Every feature must be <1s
5. **Update STATUS.md** - Document your progress

## Why Vibe Dev?

- **Persistent Sessions**: Never lose context between commands
- **Intelligent Analysis**: Understands what you're trying to do
- **Instant Response**: Because waiting breaks flow
- **Two Tools Only**: Simple to understand, powerful to use

## License

MIT

---

*From 15 lines of stubs, we build excellence through test-driven development.*
