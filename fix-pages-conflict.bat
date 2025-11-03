@echo off
echo 🔧 Fixing Next.js Pages/App Router conflict...

REM Remove pages directory and files
if exist "pages" (
    echo 📁 Removing pages directory...
    rmdir /s /q pages
    echo ✅ Pages directory removed
) else (
    echo 📁 No pages directory found
)

REM Remove specific conflicting files
if exist "pages\index.js" del "pages\index.js"
if exist "pages\index.tsx" del "pages\index.tsx"

REM Clean build artifacts
echo 🧹 Cleaning build cache...
if exist ".next" rmdir /s /q .next
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache
if exist "out" rmdir /s /q out

REM Clear npm cache
npm cache clean --force

echo ✅ Conflict resolved!
echo 🚀 Run: npm install && npm run build
pause
