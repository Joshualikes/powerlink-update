#!/bin/bash

echo "🔧 Fixing Next.js routing conflict..."

# Remove pages directory if it exists
if [ -d "pages" ]; then
    echo "📁 Removing pages directory..."
    rm -rf pages
    echo "✅ Pages directory removed"
else
    echo "📁 No pages directory found"
fi

# Remove specific conflicting files
if [ -f "pages/index.js" ]; then
    rm pages/index.js
    echo "✅ Removed pages/index.js"
fi

if [ -f "pages/index.tsx" ]; then
    rm pages/index.tsx
    echo "✅ Removed pages/index.tsx"
fi

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

# Clear npm cache
npm cache clean --force

echo "✅ Build conflict resolved!"
echo "🚀 Now run: npm install && npm run build"
