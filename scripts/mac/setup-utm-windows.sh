#!/bin/bash
# UTM Windows 11 Setup Script for Vibe Dev Testing

echo "🚀 UTM Windows 11 Setup for Vibe Dev Testing"
echo "============================================"
echo ""

# Step 1: Install UTM
echo "Step 1: Installing UTM..."
if ! command -v utm &> /dev/null; then
    brew install --cask utm
    echo "✅ UTM installed successfully"
else
    echo "✅ UTM already installed"
fi
echo ""

# Step 2: Download Windows 11 ARM
echo "Step 2: Download Windows 11 ARM"
echo "Please download Windows 11 ARM from one of these sources:"
echo ""
echo "Option A: Windows Insider Preview (Free, requires Microsoft account)"
echo "https://www.microsoft.com/en-us/software-download/windowsinsiderpreviewARM64"
echo ""
echo "Option B: Direct from Microsoft (if you have a license)"
echo "https://www.microsoft.com/software-download/windows11"
echo ""
echo "Save the .VHDX file to your Downloads folder"
echo ""
read -p "Press Enter when download is complete..."
echo ""

# Step 3: Create VM Configuration
echo "Step 3: Creating optimal VM configuration for development..."
cat > ~/Desktop/utm-windows-config.md << 'EOF'
# UTM Windows 11 Configuration for Vibe Dev

## VM Settings:
1. Open UTM
2. Click "Create a New Virtual Machine"
3. Select "Virtualize" (not Emulate)
4. Choose "Windows"
5. Import the downloaded .VHDX file

## Recommended Settings:
- **Memory**: 8GB minimum (16GB if you have 32GB+ Mac)
- **CPU Cores**: 4-6 cores
- **Storage**: 64GB minimum
- **Display**: Retina mode enabled
- **Shared Folders**: Enable to share code with Mac

## After Windows Setup:
1. Install Node.js 22.x: https://nodejs.org
2. Install Git: https://git-scm.com
3. Install VS Code (optional): https://code.visualstudio.com
4. Clone vibe-dev and run test-windows.bat

## Performance Tips:
- Disable Windows animations for better performance
- Use Windows Terminal instead of default PowerShell
- Enable Developer Mode in Windows Settings
EOF

echo "✅ Configuration guide saved to ~/Desktop/utm-windows-config.md"
echo ""

# Step 4: Quick test script
echo "Step 4: Creating quick test script..."
cat > ~/Desktop/test-vibe-dev-windows.ps1 << 'EOF'
# PowerShell script to test vibe-dev on Windows
Write-Host "Testing Vibe Dev on Windows..." -ForegroundColor Green

# Check Node.js
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
node --version

# Clone and test vibe-dev
Write-Host "`nCloning vibe-dev..." -ForegroundColor Yellow
git clone https://github.com/[your-username]/vibe-dev.git
cd vibe-dev

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm ci

Write-Host "`nBuilding project..." -ForegroundColor Yellow
npm run build

Write-Host "`nRunning Windows tests..." -ForegroundColor Yellow
node dist/src/test/windows-compatibility-test.js

Write-Host "`nAll tests complete!" -ForegroundColor Green
EOF

echo "✅ Test script saved to ~/Desktop/test-vibe-dev-windows.ps1"
echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Open UTM and create a new Windows 11 VM"
echo "2. Follow the configuration guide on your Desktop"
echo "3. Run the PowerShell test script inside Windows"
echo ""
