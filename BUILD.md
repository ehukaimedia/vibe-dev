# Vibe Dev Build System

A streamlined, intuitive build system designed exclusively for Mac and Windows platforms.

## Architecture Overview

The build system follows these principles:
- **Single source of truth**: One TypeScript configuration
- **Platform intelligence**: Automatic detection and adaptation
- **Zero configuration**: Works out of the box on Mac and Windows
- **Lightweight**: Minimal dependencies, maximum compatibility

## Quick Start

```bash
# Standard build (incremental, fast)
npm run build

# Clean build (removes artifacts first)
npm run build:clean

# Full build with verification
npm run build:full

# Development mode (watch with incremental)
npm run dev

# Just TypeScript compilation
npm run build:quick

# Verify build integrity
npm run verify
```

## Build Pipeline

The build system is now intelligent and efficient:

### Standard Build (`npm run build`)
1. **Incremental Compilation** - Only compiles changed files
2. **Post-process** - Ensures shebang is present
3. **No verification** - Fastest build for development

### Clean Build (`npm run build:clean`)
1. **Clean** - Removes all artifacts (dist/, .tsbuildinfo)
2. **Full Compilation** - Rebuilds everything from scratch
3. **Post-process** - Adds shebang for global installation
4. **Verification** - Comprehensive build validation

### Incremental Builds
- TypeScript creates a `.tsbuildinfo` file to track changes
- Subsequent builds only compile modified files
- Dramatically faster build times (seconds vs minutes)
- Automatic detection - no configuration needed

## Platform Support

### macOS
- Primary development platform
- Full PTY support via node-pty
- Automatic shell detection (zsh/bash)
- Tested on macOS 10.15+ (Catalina and newer)

### Windows
- Full ConPTY support on Windows 10 build 18309+
- PowerShell 7, Windows PowerShell, and CMD support
- Automatic fallback for older Windows versions
- Intelligent path normalization

## Terminal Emulation

Vibe Dev uses a smart adapter pattern:

```
┌─────────────────┐
│   Vibe Terminal │
├─────────────────┤
│   PTY Adapter   │ ← Intelligent selection
├─────────────────┤
│ node-pty │ spawn│ ← Platform-specific
└─────────────────┘
```

- **With node-pty**: Full terminal emulation (colors, progress bars, interactivity)
- **Without node-pty**: Graceful fallback using child_process
- **Automatic detection**: The system chooses the best available option

## TypeScript Configuration

Single, unified configuration optimized for:
- ES2024 target for modern Node.js
- NodeNext module resolution
- Strict type checking with practical relaxations
- Source maps for debugging
- Declaration files for TypeScript consumers

## Scripts Reference

### Core Scripts

- `build.js` - Main build orchestrator
- `clean.js` - Cross-platform cleanup
- `post-build.js` - Binary preparation
- `verify-build.js` - Build validation
- `test-terminal.js` - Terminal functionality testing

### NPM Commands

- `npm run build` - Full production build
- `npm run build:quick` - TypeScript only (no verification)
- `npm run dev` - Watch mode for development
- `npm run typecheck` - Type checking without emit
- `npm start` - Run the MCP server

## Troubleshooting

### Build Failures

1. **TypeScript errors**: Run `npm run typecheck` for detailed errors
2. **Missing dependencies**: Run `npm install`
3. **Permission issues**: Check file permissions on scripts/

### Terminal Issues

1. **No colors/formatting**: Install node-pty: `npm install node-pty`
2. **Windows compatibility**: Ensure Windows 10 build 18309 or newer
3. **Shell not found**: Check PATH environment variable

### Platform Detection

Run the test script to verify:
```bash
node scripts/test-terminal.js
```

## Development Workflow

1. Make changes to TypeScript source in `src/`
2. Run `npm run dev` for watch mode
3. Test changes with `node scripts/test-terminal.js`
4. Build for production with `npm run build`
5. Verify with `npm run verify`

## Best Practices

- Always run `npm run build` before committing
- Use `npm run verify` to catch issues early
- Test on both Mac and Windows when possible
- Keep dependencies minimal and optional

The build system is designed to be intuitive - if something seems complicated, there's probably a simpler way.