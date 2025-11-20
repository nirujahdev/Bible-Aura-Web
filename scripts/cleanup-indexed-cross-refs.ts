// Cleanup Script to Remove Already-Indexed Cross-References from Local JSON Files
// Removes entries that are already in Pinecone, keeping only unindexed entries
// Run: npm run cleanup-indexed-cross-refs

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Environment Variable Loading
// ============================================================================

/**
 * Load environment variables from .env.local
 */
async function loadEnvironmentVariables(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  let envLoaded = false;

  // Try dotenv package first
  try {
    const dotenv = await import('dotenv');
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath, override: true });
      if (!result.error) {
        envLoaded = true;
        console.log('✅ Environment variables loaded securely');
      }
    }
  } catch (e) {
    // dotenv not available, use manual parsing
  }

  // Manual parsing fallback
  if (!envLoaded) {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      let loadedCount = 0;
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const equalIndex = trimmed.indexOf('=');
          if (equalIndex > 0) {
            const key = trimmed.substring(0, equalIndex).trim();
            let value = trimmed.substring(equalIndex + 1).trim();
            value = value.replace(/^["']|["']$/g, '');
            if (value) {
              process.env[key] = value;
              loadedCount++;
              // Also set non-VITE versions
              if (key === 'VITE_PINECONE_API_KEY' && !process.env.PINECONE_API_KEY) {
                process.env.PINECONE_API_KEY = value;
              }
              if (key === 'VITE_OPENAI_API_KEY' && !process.env.OPENAI_API_KEY) {
                process.env.OPENAI_API_KEY = value;
              }
            }
          }
        }
      });
      if (loadedCount > 0) {
        console.log(`✅ Loaded ${loadedCount} environment variables securely`);
      }
    }
  }

  return { success: true, errors };
}

// ============================================================================
// Data Structures
// ============================================================================

interface CrossReferenceData {
  [verseId: string]: {
    v: string;
    r?: {
      [refId: string]: string;
    };
  };
}

interface CleanupReport {
  totalFiles: number;
  fullyIndexedFiles: string[];
  partiallyIndexedFiles: string[];
  unindexedFiles: string[];
  entriesRemoved: number;
  entriesKept: number;
  filesRemoved: number;
  filesKept: number;
  indexedVectorCount: number;
  timestamp: string;
}

// ============================================================================
// Pinecone Query Functions
// ============================================================================

/**
 * Get all indexed vector IDs from Pinecone
 * Uses metadata filter to get cross-reference vectors
 */
async function getIndexedVectorIds(): Promise<Set<string>> {
  console.log('🔍 Querying Pinecone for indexed cross-references...\n');
  
  try {
    const { getPineconeClient } = await import('../src/lib/research-lab/pinecone-client.js');
    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    
    // Get index stats
    const stats = await index.describeIndexStats();
    const totalVectors = stats.totalRecordCount || 0;
    console.log(`   📊 Total vectors in index: ${totalVectors.toLocaleString()}`);
    
    if (totalVectors === 0) {
      console.log('   ⚠️  No vectors found in index. Nothing to clean up.\n');
      return new Set<string>();
    }
    
    const indexedIds = new Set<string>();
    
    // Query with metadata filter to get cross-reference vectors
    // Use a dummy vector and filter by content_type
    const dummyVector = new Array(1536).fill(0);
    
    // Query in batches (Pinecone allows up to 10,000 results per query)
    const BATCH_SIZE = 10000;
    let fetched = 0;
    let hasMore = true;
    let batchNumber = 0;
    
    while (hasMore && fetched < totalVectors) {
      batchNumber++;
      const querySize = Math.min(BATCH_SIZE, totalVectors - fetched);
      
      try {
        const queryResponse = await index.query({
          vector: dummyVector,
          topK: querySize,
          includeMetadata: true,
          filter: {
            content_type: { $eq: 'cross_reference' },
          } as any,
        });
        
        const matches = queryResponse.matches || [];
        matches.forEach((match: any) => {
          indexedIds.add(match.id);
        });
        
        fetched += matches.length;
        console.log(`   ✅ Batch ${batchNumber}: Fetched ${fetched.toLocaleString()}/${totalVectors.toLocaleString()} vector IDs...`);
        
        if (matches.length < querySize) {
          hasMore = false;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        // Sanitize error message to prevent API key leaks
        const errorMsg = error.message || 'Unknown error';
        const sanitizedError = errorMsg
          .replace(/pcsk_[^\s]+/g, 'pcsk_***')
          .replace(/pc-[^\s]+/g, 'pc-***')
          .replace(/sk-[^\s]+/g, 'sk-***')
          .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
        console.error(`   ⚠️  Error in batch ${batchNumber}: ${sanitizedError}`);
        // Continue with next batch
        hasMore = false;
      }
    }
    
    console.log(`\n   ✅ Found ${indexedIds.size.toLocaleString()} indexed cross-reference vectors\n`);
    
    return indexedIds;
    
  } catch (error: any) {
    // Sanitize error message to prevent API key leaks
    const errorMsg = error.message || 'Unknown error';
    const sanitizedError = errorMsg
      .replace(/pcsk_[^\s]+/g, 'pcsk_***')
      .replace(/pc-[^\s]+/g, 'pc-***')
      .replace(/sk-[^\s]+/g, 'sk-***')
      .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
    console.error(`   ❌ Error querying Pinecone: ${sanitizedError}`);
    console.log('   ⚠️  Will proceed with empty set (no entries will be removed)\n');
    return new Set<string>();
  }
}

// ============================================================================
// Vector ID Parsing
// ============================================================================

/**
 * Generate vector ID from verseId and refId (matching indexing script format)
 * Format: crossref:{verseId}:{refId} (sanitized)
 */
function generateVectorId(verseId: string, refId: string): string {
  return `crossref:${verseId}:${refId}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

/**
 * Check if a cross-reference entry is indexed
 */
function isEntryIndexed(
  verseId: string,
  refId: string,
  indexedIds: Set<string>
): boolean {
  const vectorId = generateVectorId(verseId, refId);
  return indexedIds.has(vectorId);
}

// ============================================================================
// File Processing
// ============================================================================

/**
 * Clean up a single JSON file
 */
function cleanupFile(
  filePath: string,
  fileName: string,
  indexedIds: Set<string>
): { removed: number; kept: number; isEmpty: boolean; error?: string } {
  try {
    // Read and parse JSON file with error handling
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    if (!fileContent.trim()) {
      return { removed: 0, kept: 0, isEmpty: true, error: 'File is empty' };
    }
    
    let data: CrossReferenceData;
    try {
      data = JSON.parse(fileContent);
    } catch (parseError: any) {
      return { removed: 0, kept: 0, isEmpty: false, error: `Invalid JSON: ${parseError.message}` };
    }
    
    const cleanedData: CrossReferenceData = {};
  
  let removed = 0;
  let kept = 0;
  
  // Process each verse
  for (const [verseId, verseData] of Object.entries(data)) {
    const cleanedVerse: any = {
      v: verseData.v,
      r: {},
    };
    
    let hasReferences = false;
    
    // Process each cross-reference
    if (verseData.r) {
      for (const [refId, targetRef] of Object.entries(verseData.r)) {
        if (isEntryIndexed(verseId, refId, indexedIds)) {
          // Entry is indexed - remove it
          removed++;
        } else {
          // Entry not indexed - keep in cleaned data
          cleanedVerse.r[refId] = targetRef;
          hasReferences = true;
          kept++;
        }
      }
    }
    
    // Keep verse if it has any unindexed references
    if (hasReferences) {
      cleanedData[verseId] = cleanedVerse;
    }
  }
  
    // Save cleaned file (only if it has data)
    if (Object.keys(cleanedData).length > 0) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2), 'utf-8');
      } catch (writeError: any) {
        return { removed, kept, isEmpty: false, error: `Write error: ${writeError.message}` };
      }
    }
    
    const isEmpty = Object.keys(cleanedData).length === 0;
    
    return { removed, kept, isEmpty };
  } catch (error: any) {
    // Handle file read errors
    return { removed: 0, kept: 0, isEmpty: false, error: `File error: ${error.message}` };
  }
}

// ============================================================================
// Main Cleanup Function
// ============================================================================

/**
 * Main cleanup function
 */
async function cleanupIndexedCrossReferences(): Promise<CleanupReport> {
  console.log('🧹 Starting Cross-Reference Cleanup...\n');
  console.log('   This will remove already-indexed entries from local JSON files\n');
  console.log('   Keeping only unindexed entries for faster processing\n');
  
  // Load environment variables
  const envResult = await loadEnvironmentVariables();
  if (!envResult.success) {
    console.error('❌ Failed to load environment variables');
    process.exit(1);
  }
  
  // Get indexed vector IDs from Pinecone
  const indexedIds = await getIndexedVectorIds();
  
  // Setup directories
  const crossRefDir = path.join(__dirname, '..', 'bible-cross-reference-json');
  
  if (!fs.existsSync(crossRefDir)) {
    console.error(`❌ Cross-references directory not found: ${crossRefDir}`);
    process.exit(1);
  }
  
  // Get all JSON files
  const files = fs.readdirSync(crossRefDir)
    .filter(f => f.endsWith('.json') && f !== 'LICENSE')
    .sort((a, b) => {
      const numA = parseInt(a.replace('.json', ''));
      const numB = parseInt(b.replace('.json', ''));
      return numA - numB;
    });
  
  console.log(`📄 Processing ${files.length} files...\n`);
  
  const report: CleanupReport = {
    totalFiles: files.length,
    fullyIndexedFiles: [],
    partiallyIndexedFiles: [],
    unindexedFiles: [],
    entriesRemoved: 0,
    entriesKept: 0,
    filesRemoved: 0,
    filesKept: 0,
    indexedVectorCount: indexedIds.size,
    timestamp: new Date().toISOString(),
  };
  
  // Process each file
  for (const fileName of files) {
    const filePath = path.join(crossRefDir, fileName);
    console.log(`   Processing ${fileName}...`);
    
    try {
      const result = cleanupFile(filePath, fileName, indexedIds);
      
      // Check for errors in cleanup
      if (result.error) {
        console.error(`      ❌ Error processing ${fileName}: ${result.error}`);
        continue;
      }
      
      report.entriesRemoved += result.removed;
      report.entriesKept += result.kept;
      
      if (result.isEmpty) {
        // File is now empty - all entries were indexed
        try {
          fs.unlinkSync(filePath);
          report.fullyIndexedFiles.push(fileName);
          report.filesRemoved++;
          console.log(`      ✅ Removed (fully indexed: ${result.removed} entries)`);
        } catch (unlinkError: any) {
          console.error(`      ⚠️  Could not delete empty file ${fileName}: ${unlinkError.message}`);
          report.partiallyIndexedFiles.push(fileName);
          report.filesKept++;
        }
      } else if (result.removed > 0) {
        // File has some indexed entries removed
        report.partiallyIndexedFiles.push(fileName);
        report.filesKept++;
        console.log(`      ✅ Cleaned (removed: ${result.removed}, kept: ${result.kept})`);
      } else {
        // File has no indexed entries
        report.unindexedFiles.push(fileName);
        report.filesKept++;
        console.log(`      ℹ️  No changes (all ${result.kept} entries unindexed)`);
      }
    } catch (error: any) {
      // Sanitize error message
      const errorMsg = error.message || 'Unknown error';
      const sanitizedError = errorMsg
        .replace(/pcsk_[^\s]+/g, 'pcsk_***')
        .replace(/pc-[^\s]+/g, 'pc-***')
        .replace(/sk-[^\s]+/g, 'sk-***')
        .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
      console.error(`      ❌ Error processing ${fileName}: ${sanitizedError}`);
    }
  }
  
  // Save cleanup report
  const reportPath = path.join(__dirname, '..', 'cross-reference-cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n✅ Cleanup complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total files: ${report.totalFiles}`);
  console.log(`   Fully indexed (removed): ${report.filesRemoved}`);
  console.log(`   Partially indexed (cleaned): ${report.partiallyIndexedFiles.length}`);
  console.log(`   Unindexed (unchanged): ${report.unindexedFiles.length}`);
  console.log(`   Entries removed: ${report.entriesRemoved.toLocaleString()}`);
  console.log(`   Entries kept: ${report.entriesKept.toLocaleString()}`);
  console.log(`   Indexed vectors found: ${report.indexedVectorCount.toLocaleString()}`);
  console.log(`\n   Report saved: ${reportPath}\n`);
  
  return report;
}

// ============================================================================
// Main Entry Point
// ============================================================================

cleanupIndexedCrossReferences().catch(error => {
  // Sanitize error message to prevent API key leaks
  const errorMsg = error?.message || String(error) || 'Unknown error';
  const sanitizedError = errorMsg
    .replace(/pcsk_[^\s]+/g, 'pcsk_***')
    .replace(/pc-[^\s]+/g, 'pc-***')
    .replace(/sk-[^\s]+/g, 'sk-***')
    .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
  console.error('\n❌ Cleanup failed:', sanitizedError);
  process.exit(1);
});

