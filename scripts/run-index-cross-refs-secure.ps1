# PowerShell script to securely load environment variables and run cross-reference indexing
# Run: .\scripts\run-index-cross-refs-secure.ps1
# Resume: .\scripts\run-index-cross-refs-secure.ps1 -Resume

param(
    [switch]$Resume
)

$ErrorActionPreference = "Stop"

Write-Host "🔒 Secure Cross-Reference Indexing Script" -ForegroundColor Cyan
Write-Host ""

# Load environment variables from .env.local
Write-Host "🔧 Loading environment variables from .env.local..." -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "   Please create .env.local with your API keys:" -ForegroundColor Yellow
    Write-Host "   PINECONE_API_KEY=your_key_here" -ForegroundColor Yellow
    Write-Host "   OPENAI_API_KEY=your_key_here" -ForegroundColor Yellow
    exit 1
}

$envFile = Get-Content ".env.local" -ErrorAction Stop
$loadedCount = 0

foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$' -and -not $line.StartsWith('#')) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        if ($key -and $value) {
            Set-Item -Path "env:$key" -Value $value
            $loadedCount++
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

Write-Host "✅ Loaded $loadedCount environment variables securely" -ForegroundColor Green
Write-Host ""

# Verify critical variables (without exposing values)
if ($env:PINECONE_API_KEY) {
    $keyLength = $env:PINECONE_API_KEY.Length
    $keyPrefix = $env:PINECONE_API_KEY.Substring(0, [Math]::Min(5, $keyLength))
    Write-Host "✅ PINECONE_API_KEY is set (length: $keyLength, starts with: $keyPrefix...)" -ForegroundColor Green
} else {
    Write-Host "❌ PINECONE_API_KEY not set" -ForegroundColor Red
    exit 1
}

if ($env:OPENAI_API_KEY) {
    $keyLength = $env:OPENAI_API_KEY.Length
    $keyPrefix = $env:OPENAI_API_KEY.Substring(0, [Math]::Min(5, $keyLength))
    Write-Host "✅ OPENAI_API_KEY is set (length: $keyLength, starts with: $keyPrefix...)" -ForegroundColor Green
} else {
    Write-Host "❌ OPENAI_API_KEY not set" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting secure cross-reference indexing..." -ForegroundColor Cyan
if ($Resume) {
    Write-Host "📂 Resume mode enabled" -ForegroundColor Yellow
}
Write-Host ""

# Set Node options for large memory
$env:NODE_OPTIONS = '--max-old-space-size=8192'

# Run the indexing script
if ($Resume) {
    npm run index-cross-refs:resume
} else {
    npm run index-cross-refs:secure:win
}


