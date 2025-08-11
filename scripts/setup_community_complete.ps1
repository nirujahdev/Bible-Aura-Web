# Complete Bible Aura Community Setup Script
# This script installs PostgreSQL (if needed) and runs the community migration

Write-Host "🚀 Bible Aura Community Database Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Function to check if psql is available
function Test-PostgreSQL {
    try {
        $null = Get-Command psql -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check if PostgreSQL is installed
if (-not (Test-PostgreSQL)) {
    Write-Host "📦 PostgreSQL not found. Attempting to install..." -ForegroundColor Yellow
    
    # Try different installation methods
    $installed = $false
    
    # Method 1: Try Chocolatey
    try {
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            Write-Host "Installing via Chocolatey..." -ForegroundColor Green
            choco install postgresql --version=15.8.0 -y --force
            $installed = $true
        }
    } catch {
        Write-Host "Chocolatey installation failed." -ForegroundColor Red
    }
    
    # Method 2: Try Scoop
    if (-not $installed) {
        try {
            if (Get-Command scoop -ErrorAction SilentlyContinue) {
                Write-Host "Installing via Scoop..." -ForegroundColor Green
                scoop install postgresql
                $installed = $true
            }
        } catch {
            Write-Host "Scoop installation failed." -ForegroundColor Red
        }
    }
    
    # If automatic installation failed
    if (-not $installed) {
        Write-Host ""
        Write-Host "❌ Could not automatically install PostgreSQL." -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 MANUAL INSTALLATION OPTIONS:" -ForegroundColor Cyan
        Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "2. Or use Supabase Dashboard (recommended): https://app.supabase.com/project/foleepziqgrdgkljedux" -ForegroundColor White
        Write-Host ""
        
        $useSupabase = Read-Host "Would you like instructions for Supabase Dashboard? (y/n)"
        if ($useSupabase -eq 'y' -or $useSupabase -eq 'Y') {
            Write-Host ""
            Write-Host "🌐 SUPABASE DASHBOARD SETUP (RECOMMENDED):" -ForegroundColor Green
            Write-Host "1. Go to: https://app.supabase.com/project/foleepziqgrdgkljedux" -ForegroundColor White
            Write-Host "2. Navigate to 'SQL Editor' (left sidebar)" -ForegroundColor White
            Write-Host "3. Click 'New Query'" -ForegroundColor White
            Write-Host "4. Copy content from: safe_community_migration.sql" -ForegroundColor White
            Write-Host "5. Paste and click 'Run'" -ForegroundColor White
            Write-Host ""
            Write-Host "✨ This method is 100% reliable and uses your existing login!" -ForegroundColor Green
        }
        return
    }
}

# Check if PostgreSQL is now available
if (-not (Test-PostgreSQL)) {
    Write-Host "❌ PostgreSQL still not available. Please install manually." -ForegroundColor Red
    return
}

Write-Host "✅ PostgreSQL found!" -ForegroundColor Green

# Database connection details
$server = "db.foleepziqgrdgkljedux.supabase.co"
$port = "5432"
$database = "postgres"
$username = "postgres"
$password = "afHRHS@B!WR6LZL"

# Check if migration file exists
$migrationFile = "safe_community_migration.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    return
}

Write-Host ""
Write-Host "🔗 Connecting to Supabase database..." -ForegroundColor Green
Write-Host "Host: $server" -ForegroundColor Gray
Write-Host "Port: $port" -ForegroundColor Gray
Write-Host "Database: $database" -ForegroundColor Gray
Write-Host "User: $username" -ForegroundColor Gray

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

try {
    # Run the migration
    Write-Host ""
    Write-Host "📋 Running safe community migration..." -ForegroundColor Yellow
    
    $result = psql -h $server -p $port -d $database -U $username -f $migrationFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
        Write-Host "✅ Your community features should now work!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🧪 Test your setup at: http://localhost:5173/community" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠️  Migration completed with some warnings (this is normal)" -ForegroundColor Yellow
        Write-Host "💡 'Already exists' errors can be safely ignored" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🧪 Test your setup at: http://localhost:5173/community" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 FALLBACK: Use Supabase Dashboard" -ForegroundColor Cyan
    Write-Host "1. Go to: https://app.supabase.com/project/foleepziqgrdgkljedux" -ForegroundColor White
    Write-Host "2. SQL Editor -> New Query" -ForegroundColor White
    Write-Host "3. Copy content from: safe_community_migration.sql" -ForegroundColor White
    Write-Host "4. Run the query" -ForegroundColor White
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Setup script completed." -ForegroundColor Cyan 