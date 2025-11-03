# Quick Fix for Pages/App Router Conflict

If you're getting the error: `Conflicting app and page file was found, please remove the conflicting files to continue`

## Windows Users:
\`\`\`bash
# Run the batch file
fix-pages-conflict.bat
\`\`\`

## Mac/Linux Users:
\`\`\`bash
# Make script executable and run
chmod +x remove-pages-conflict.sh
./remove-pages-conflict.sh
\`\`\`

## Alternative (Cross-platform):
\`\`\`bash
# Use npm scripts
npm run fix-conflict
npm run fresh-build
\`\`\`

## Manual Steps:
1. Delete the `pages` folder if it exists
2. Run: `npm run clean`
3. Run: `npm cache clean --force`
4. Run: `npm install`
5. Run: `npm run build`

The project uses Next.js App Router (`app/` directory), not Pages Router (`pages/` directory).
