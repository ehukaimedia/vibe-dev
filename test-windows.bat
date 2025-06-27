@echo off
REM Windows Quick Test Script for Vibe Dev
REM Run this on Windows to verify basic functionality

echo ====================================
echo   Vibe Dev Windows Quick Test
echo ====================================
echo.

REM Check Node.js installation
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
node --version
echo.

REM Check npm installation
echo Checking npm installation...
npm --version
echo.

REM Navigate to project directory
echo Current directory: %CD%
echo.

REM Install dependencies
echo Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

REM Build the project
echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

REM Run specific tests
echo Running Windows compatibility tests...
echo.

echo Test 1: Basic terminal command
node dist/src/index.js terminal "echo Hello from Windows"
echo.

echo Test 2: PowerShell specific command
node dist/src/index.js terminal "Get-Date"
echo.

echo Test 3: Environment variable
node dist/src/index.js terminal "$env:TEST = 'Windows'; echo $env:TEST"
echo.

echo Test 4: Directory listing
node dist/src/index.js terminal "dir"
echo.

echo Test 5: Run full Windows compatibility test suite
node dist/src/test/windows-compatibility-test.js
echo.

echo Test 6: Run timeout test
node dist/src/test/test-timeout-fix.js
echo.

echo ====================================
echo   All tests completed!
echo   Check output above for any errors
echo ====================================
echo.

pause