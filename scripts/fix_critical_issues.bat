@echo off
echo ========================================
echo BIBLE AURA - CRITICAL ISSUES FIX SCRIPT
echo ========================================
echo.

echo [1/5] Updating vulnerable dependencies with force fixes...
npm audit fix --force
echo.

echo [2/5] Updating specific vulnerable packages...
npm update react-quill@latest
npm update esbuild@latest
echo.

echo [3/5] Installing security patches...
npm install lodash@latest
npm install cookie@latest
echo.

echo [4/5] Checking final security status...
npm audit
echo.

echo [5/5] Building project to verify fixes...
npm run build
echo.

echo ========================================
echo CRITICAL FIXES COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Run database migration: database/fix_bible_bookmarks_complete.sql
echo 2. Test all AI chat features
echo 3. Verify bookmark/favorites functionality
echo 4. Deploy to production
echo.
pause 