# PowerShell script to load environment variables and run cross-reference indexing
# Run: .\scripts\run-index-cross-refs.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔧 Loading environment variables from .env.local..." -ForegroundColor Cyan

# Load environment variables from .env.local
$envFile = Get-Content ".env.local" -ErrorAction Stop
foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$' -and -not $line.StartsWith('#')) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        if ($key -and $value) {
            Set-Item -Path "env:$key" -Value $value
            # Also set non-VITE versions
            if ($key -eq 'VITE_PINECONE_API_KEY') {
                Set-Item -Path "env:PINECONE_API_KEY" -Value $value
            }
            if ($key -eq 'VITE_OPENAI_API_KEY') {
                Set-Item -Path "env:OPENAI_API_KEY" -Value $value
            }
        }
    }
}

# Verify critical variables
if ($env:PINECONE_API_KEY) {
    Write-Host "✅ PINECONE_API_KEY is set (length: $($env:PINECONE_API_KEY.Length))" -ForegroundColor Green
} else {
    Write-Host "❌ PINECONE_API_KEY not set" -ForegroundColor Red
    exit 1
}

if ($env:OPENAI_API_KEY) {
    Write-Host "✅ OPENAI_API_KEY is set (length: $($env:OPENAI_API_KEY.Length))" -ForegroundColor Green
} else {
    Write-Host "❌ OPENAI_API_KEY not set" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting cross-reference indexing..." -ForegroundColor Cyan
Write-Host ""

# Set Node options for large memory
$env:NODE_OPTIONS = '--max-old-space-size=8192'

# Run the indexing script
npm run index-cross-refs

