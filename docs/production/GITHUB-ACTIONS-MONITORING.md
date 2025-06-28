# GitHub Actions Test Monitoring Guide

## 1. Actions Tab Overview
When you click on the Actions tab, you'll see:
- List of workflow runs (newest first)
- Each run shows:
  - Commit message
  - Branch name
  - Who triggered it
  - Status (queued/in progress/completed)
  - Duration

## 2. Click on Your Workflow Run
You'll see a matrix of 9 jobs:
```
Test (ubuntu-latest, 18.x)  ✅
Test (ubuntu-latest, 20.x)  ✅
Test (ubuntu-latest, 22.x)  ✅
Test (windows-latest, 18.x) 🟡 (Running)
Test (windows-latest, 20.x) ⏸️ (Queued)
Test (windows-latest, 22.x) ⏸️ (Queued)
Test (macos-latest, 18.x)   ✅
Test (macos-latest, 20.x)   ✅
Test (macos-latest, 22.x)   ✅
```

## 3. Click on Windows Job to See Details
Example: Click "Test (windows-latest, 22.x)" to see:
- Set up job
- Checkout code
- Use Node.js 22.x
- Install dependencies (npm ci)
- Build (npm run build)
- Run tests (npm test)
- Test vibe_terminal directly
- Upload test results (if failed)

## 4. Expand Steps to See Output
Click the ">" arrow next to any step to see:
- Command output
- Error messages
- Test results
- Performance timing

## 5. Common Windows-Specific Things to Watch For:
- PowerShell commands working correctly
- Path handling (backslashes)
- Line ending differences
- Environment variable syntax

## 6. If Tests Fail:
- Red X next to the step that failed
- Error output will be visible
- "Upload test results" will capture logs
- You can re-run failed jobs

## 7. Success Indicators:
- All 9 jobs show green checkmarks
- Total workflow time (usually 3-5 minutes)
- No error artifacts uploaded

## 8. Add Status Badge (Optional)
Once tests pass, add to your README.md:
```markdown
![CI/CD](https://github.com/ehukaimedia/vibe-dev/actions/workflows/cross-platform-test.yml/badge.svg)
```

## Real-Time Updates:
- Page auto-refreshes every 10 seconds while running
- You can manually refresh anytime
- Email notifications if tests fail (check GitHub settings)