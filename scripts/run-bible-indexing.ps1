# PowerShell script to run Bible indexing with environment variables
# Usage: .\scripts\run-bible-indexing.ps1

# Set environment variables
# IMPORTANT: Set your API keys as environment variables before running:
# $env:PINECONE_API_KEY = "your-pinecone-api-key"
# $env:OPENAI_API_KEY = "your-openai-api-key"
$env:PINECONE_INDEX_NAME_BIBLE = "bible-aura-bible"

Write-Host "🚀 Starting Bible indexing to Pinecone..." -ForegroundColor Green
Write-Host "📋 Environment variables set:" -ForegroundColor Cyan
Write-Host "   - PINECONE_API_KEY: Set" -ForegroundColor Gray
Write-Host "   - OPENAI_API_KEY: Set" -ForegroundColor Gray
Write-Host ("   - PINECONE_INDEX_NAME_BIBLE: " + $env:PINECONE_INDEX_NAME_BIBLE) -ForegroundColor Gray
Write-Host ""

# Run the indexing script
npm run index-bible

