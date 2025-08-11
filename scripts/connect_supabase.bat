@echo off
echo Connecting to Supabase database...
echo.
echo If password prompt appears, enter: afHRHS@B!WR6LZL
echo.
set PGPASSWORD=afHRHS@B!WR6LZL
"C:\Program Files\PostgreSQL\17\pgAdmin 4\runtime\psql.exe" -h db.foleepziqgrdgkljedux.supabase.co -p 5432 -d postgres -U postgres
pause 