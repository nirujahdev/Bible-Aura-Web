# Setup and Index Cross-References to Pinecone
# This script creates .env.local and runs the secure indexing

$ErrorActionPreference = "Stop"

Write-Host "🔒 Secure Cross-Reference Indexing Setup" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Using existing .env.local" -ForegroundColor Green
    } else {
        Remove-Item ".env.local" -Force
    }
}

# Create .env.local with API keys (prompt user securely)
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Cyan
    Write-Host "   Please enter your API keys securely:" -ForegroundColor Yellow
    Write-Host ""
    
    # Prompt for Pinecone API Key
    $pineconeKey = Read-Host "Enter Pinecone API Key" -AsSecureString
    $pineconeKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($pineconeKey))
    
    # Prompt for OpenAI API Key
    $openaiKey = Read-Host "Enter OpenAI API Key" -AsSecureString
    $openaiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey))
    
    # Create .env.local content
    $envContent = @"
# Pinecone Configuration
PINECONE_API_KEY=$pineconeKeyPlain
VITE_PINECONE_API_KEY=$pineconeKeyPlain

# OpenAI Configuration
OPENAI_API_KEY=$openaiKeyPlain
VITE_OPENAI_API_KEY=$openaiKeyPlain

# Pinecone Index Names
PINECONE_INDEX_NAME_CROSS_REFERENCES=cross-references
PINECONE_INDEX_NAME_BIBLE=bible-aura-bible
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
    
    # Secure file permissions (Windows: restrict to current user only)
    try {
        $acl = Get-Acl ".env.local"
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME,
            "FullControl",
            "Allow"
        )
        $acl.SetAccessRule($accessRule)
        # Remove inherited permissions
        $acl.SetAccessRuleProtection($true, $false)
        Set-Acl ".env.local" $acl
        Write-Host "✅ .env.local created with restricted permissions" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  .env.local created but could not set permissions" -ForegroundColor Yellow
        Write-Host "   Please ensure only you have access to this file" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Clear sensitive variables from memory
    $pineconeKeyPlain = $null
    $openaiKeyPlain = $null
    [GC]::Collect()
}

# Load environment variables
Write-Host "🔧 Loading environment variables..." -ForegroundColor Cyan
$envFile = Get-Content ".env.local" -ErrorAction Stop
$loadedCount = 0

foreach ($line in $envFile) {
    if ($line -match '^([^=]+)=(.*)$' -and -not $line.StartsWith("#")) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        if ($key -and $value) {
            Set-Item -Path "env:$key" -Value $value
            $loadedCount++
            if ($key -eq 'VITE_PINECONE_API_KEY' -and -not $env:PINECONE_API_KEY) {
                Set-Item -Path "env:PINECONE_API_KEY" -Value $value
            }
            if ($key -eq 'VITE_OPENAI_API_KEY' -and -not $env:OPENAI_API_KEY) {
                Set-Item -Path "env:OPENAI_API_KEY" -Value $value
            }
        }
    }
}

Write-Host "✅ Loaded $loadedCount environment variables" -ForegroundColor Green
Write-Host ""

# Verify API keys (without exposing full values)
if ($env:PINECONE_API_KEY) {
    $keyLength = $env:PINECONE_API_KEY.Length
    $keyPrefix = $env:PINECONE_API_KEY.Substring(0, [Math]::Min(10, $keyLength))
    Write-Host "✅ PINECONE_API_KEY: $keyPrefix... (length: $keyLength)" -ForegroundColor Green
} else {
    Write-Host "❌ PINECONE_API_KEY not set" -ForegroundColor Red
    exit 1
}

if ($env:OPENAI_API_KEY) {
    $keyLength = $env:OPENAI_API_KEY.Length
    $keyPrefix = $env:OPENAI_API_KEY.Substring(0, [Math]::Min(10, $keyLength))
    Write-Host "✅ OPENAI_API_KEY: $keyPrefix... (length: $keyLength)" -ForegroundColor Green
} else {
    Write-Host "❌ OPENAI_API_KEY not set" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting secure cross-reference indexing..." -ForegroundColor Cyan
Write-Host "   This will push all cross-references to Pinecone vector database" -ForegroundColor Yellow
Write-Host "   Estimated time: 5-10 minutes" -ForegroundColor Yellow
Write-Host ""

# Set Node options for large memory
$env:NODE_OPTIONS = '--max-old-space-size=8192'

# Run the secure indexing script
npm run index-cross-refs:secure:win

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Cross-reference indexing completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify indexing: npm run verify-cross-refs" -ForegroundColor White
    Write-Host "   2. Monitor progress: npm run monitor-cross-refs" -ForegroundColor White
    Write-Host "   3. The RAG pipeline is already configured to use these cross-references" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Indexing failed. Check the error messages above." -ForegroundColor Red
    Write-Host "💡 You can resume with: npm run index-cross-refs:resume" -ForegroundColor Yellow
    exit 1
}

