# PowerShell script to test Bible Pinecone setup
# Usage: .\scripts\test-bible-setup.ps1

# Set environment variables
# IMPORTANT: Set your API keys as environment variables before running:
# $env:PINECONE_API_KEY = "your-pinecone-api-key"
# $env:OPENAI_API_KEY = "your-openai-api-key"
$env:PINECONE_INDEX_NAME_BIBLE = "bible-aura-bible"

Write-Host "🧪 Testing Bible Pinecone Setup..." -ForegroundColor Cyan
Write-Host ""

# Run the test script
npm run test-bible-pinecone

