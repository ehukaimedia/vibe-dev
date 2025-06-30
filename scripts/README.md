# Build Scripts

Intuitive cross-platform build system for Vibe Dev.

## Core Scripts

### `build.js`
Main build orchestrator that runs the complete build pipeline:
1. Clean previous artifacts
2. Compile TypeScript
3. Add shebang to entry point
4. Verify the build

```bash
npm run build
```

### `clean.js`
Cross-platform cleaning of build artifacts (dist/, coverage/, etc.)

```bash
npm run clean
```

### `post-build.js`
Ensures the main entry point has proper shebang for global installation.

### `verify-build.js`
Comprehensive build verification:
- TypeScript compilation check
- Platform file verification
- Terminal emulation support check
- Platform detection test
- MCP server startup test

```bash
npm run verify
```

## Platform Support

All scripts automatically detect and adapt to:
- **macOS** (darwin) - Primary development platform
- **Windows** (win32) - Full ConPTY support on Windows 10+

The build system is designed to be:
- **Intuitive**: Single command builds everything
- **Reliable**: Comprehensive verification steps
- **Lightweight**: Minimal dependencies
- **Smart**: Auto-detects platform capabilities