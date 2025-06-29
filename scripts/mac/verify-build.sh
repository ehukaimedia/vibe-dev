#\!/bin/bash
echo "Verifying Vibe Dev build..."
echo ""

echo "1. Checking entry point exists:"
if [ -f "dist/src/index.js" ]; then
    echo "✅ dist/src/index.js exists"
else
    echo "❌ dist/src/index.js NOT FOUND"
fi

echo ""
echo "2. Checking if entry point is executable:"
head -1 dist/src/index.js

echo ""
echo "3. Checking tool names in server.js:"
grep -o '"vibe_[^"]*"' dist/src/server.js | sort -u

echo ""
echo "4. Claude Desktop config should be:"
echo '{'
echo '  "mcpServers": {'
echo '    "vibe-dev": {'
echo '      "command": "node",'
echo '      "args": ["'$(pwd)'/dist/src/index.js"]'
echo '    }'
echo '  }'
echo '}'
