# Scripts Directory Organization

This directory contains **production build and utility scripts** organized by platform.

## Directory Structure

```
scripts/
├── windows/          # Windows-specific scripts (.bat, .ps1)
│   ├── build.bat              # Quick build script for Windows
│   ├── build-verbose.bat      # Verbose build with detailed output
│   ├── gemini-debug-analysis.ps1  # PowerShell script for Gemini AI analysis
│   └── run-gemini-analysis.bat    # Batch wrapper for Gemini
│
├── mac/              # Mac/Linux-specific scripts (.sh)
│   ├── setup-utm-windows.sh   # Setup Windows VM in UTM for testing
│   └── verify-build.sh        # Build verification script
│
└── common/           # Cross-platform scripts (.js)
    └── check-env.js          # Environment checking utility
```

## Usage

### Windows Scripts
Run from PowerShell or Command Prompt:
```powershell
# Build the project
.\scripts\windows\build.bat

# Build with verbose output
.\scripts\windows\build-verbose.bat

# Run Gemini analysis
.\scripts\windows\gemini-debug-analysis.ps1
```

### Mac/Linux Scripts
Run from Terminal:
```bash
# Verify build
./scripts/mac/verify-build.sh

# Setup Windows VM for testing
./scripts/mac/setup-utm-windows.sh
```

### Cross-Platform Scripts
Run with Node.js on any platform:
```bash
# Check environment
node scripts/common/check-env.js
```

## Notes

- This directory contains **production scripts only**
- Windows scripts use `.bat` for cmd.exe or `.ps1` for PowerShell
- Mac/Linux scripts use `.sh` with bash shebang
- Cross-platform scripts are written in JavaScript
- All test and debug utilities are in `test/utilities/`
