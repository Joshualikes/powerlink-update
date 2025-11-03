# Troubleshooting Guide

## Build Error: Conflicting app and page files

If you encounter the error:
\`\`\`
"pages\index.tsx" - "app\page.tsx"
Conflicting app and page file was found, please remove the conflicting files to continue
\`\`\`

### Solution:

1. **Clean build cache:**
   \`\`\`bash
   npm run clean
   # or manually:
   rm -rf .next
   rm -rf node_modules/.cache
   \`\`\`

2. **Run the fix script:**
   \`\`\`bash
   chmod +x fix-build-error.sh
   ./fix-build-error.sh
   \`\`\`

3. **Manual steps if script doesn't work:**
   \`\`\`bash
   # Remove any pages directory if it exists
   rm -rf pages
   
   # Clean install
   rm -rf node_modules
   npm install
   
   # Build again
   npm run build
   \`\`\`

### Why this happens:
- Next.js doesn't allow both Pages Router (`pages/`) and App Router (`app/`) to coexist
- This project uses App Router (modern approach)
- Build cache might reference old Pages Router files

### If error persists:
1. Check for any `pages/` directory and remove it
2. Ensure you're using Node.js 18+ 
3. Try `npx next build` directly
4. Check for any `.next` or cache directories and remove them
