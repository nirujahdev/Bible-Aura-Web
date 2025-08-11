@echo off
echo ========================================
echo Bible Aura Community Database Setup
echo ========================================
echo.

echo Checking for psql...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo psql not found. Please install PostgreSQL client tools.
    echo Download from: https://www.postgresql.org/download/windows/
    echo Or use Supabase Dashboard: https://app.supabase.com/project/foleepziqgrdgkljedux
    pause
    exit /b 1
)

echo Found psql! Connecting to Supabase...
echo.
echo Host: db.foleepziqgrdgkljedux.supabase.co
echo Port: 5432
echo Database: postgres
echo User: postgres
echo.

echo Running safe community migration...
psql -h db.foleepziqgrdgkljedux.supabase.co -p 5432 -d postgres -U postgres -f safe_community_migration.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo 🎉 Your community features should now work!
    echo.
    echo Test your setup at: http://localhost:5173/community
) else (
    echo.
    echo ❌ Migration failed. Please check the errors above.
    echo 💡 Try using Supabase Dashboard instead.
)

echo.
pause 