#!/bin/bash
echo "Fixing Next.js routing conflict..."

# Remove build cache and node modules cache
echo "Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel

# Ensure no pages directory exists
if [ -d "pages" ]; then
    echo "Removing conflicting pages directory..."
    rm -rf pages
fi

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Try building again
echo "Building project..."
npm run build

echo "Build error fix complete!"
