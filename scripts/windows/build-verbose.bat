@echo off
cd /d C:\Users\arsen\Desktop\AI-Applications\Node\vibe-dev
echo Building TypeScript...
call npx tsc
echo Build complete
echo Exit code: %ERRORLEVEL%