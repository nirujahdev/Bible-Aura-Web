// Secure Script to Index Bible Cross-References into Pinecone
// Enhanced with security features, progress tracking, and error handling
// Run: npm run index-cross-refs:secure

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// SECURITY: Environment Variable Loading
// ============================================================================

/**
 * Securely load environment variables from .env.local
 * Never exposes sensitive values in logs
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

/**
 * Securely validate API keys without exposing them in logs
 */
function validateAPIKeys(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate Pinecone API Key
  const pineconeKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
  if (!pineconeKey || pineconeKey.trim() === '') {
    errors.push('PINECONE_API_KEY is not set');
  } else if (pineconeKey.length < 20) {
    errors.push('PINECONE_API_KEY appears to be invalid (too short)');
  } else if (!pineconeKey.startsWith('pcsk_') && !pineconeKey.startsWith('pc-')) {
    errors.push('PINECONE_API_KEY format appears invalid (should start with pcsk_ or pc-)');
  }

  // Validate OpenAI API Key
  const openaiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!openaiKey || openaiKey.trim() === '') {
    errors.push('OPENAI_API_KEY is not set');
  } else if (openaiKey.length < 20) {
    errors.push('OPENAI_API_KEY appears to be invalid (too short)');
  } else if (!openaiKey.startsWith('sk-') && !openaiKey.startsWith('sk-proj-')) {
    errors.push('OPENAI_API_KEY format appears invalid (should start with sk- or sk-proj-)');
  }

  if (errors.length > 0) {
    console.error('❌ API Key Validation Failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    return { valid: false, errors };
  }

  // Log validation success without exposing keys
  const pineconeKeyHash = crypto.createHash('sha256').update(pineconeKey!).digest('hex').substring(0, 8);
  const openaiKeyHash = crypto.createHash('sha256').update(openaiKey!).digest('hex').substring(0, 8);
  console.log('✅ API Keys validated successfully');
  console.log(`   Pinecone Key: ...${pineconeKeyHash}`);
  console.log(`   OpenAI Key: ...${openaiKeyHash}`);

  return { valid: true, errors: [] };
}

// ============================================================================
// Progress Tracking
// ============================================================================

interface ProgressState {
  lastProcessedFile: string;
  lastProcessedVerseId: string;
  totalProcessed: number;
  totalUploaded: number;
  startTime: number;
  errors: Array<{ file: string; verseId: string; error: string }>;
}

const PROGRESS_FILE = path.join(__dirname, '..', '.cross-ref-progress.json');

function loadProgress(): ProgressState | null {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('⚠️  Could not load progress file, starting fresh');
  }
  return null;
}

function saveProgress(state: ProgressState): void {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.warn('⚠️  Could not save progress file:', error);
  }
}

function clearProgress(): void {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch (error) {
    // Ignore
  }
}

// ============================================================================
// Imports
// ============================================================================

import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import { generateBatchOpenAIEmbeddings } from '../src/lib/bible-rag/openai-embeddings.js';

// ============================================================================
// Data Structures
// ============================================================================

const ABBREVIATION_TO_BOOK: Record<string, string> = {
  'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers', 'DEU': 'Deuteronomy',
  'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Kings', '2KI': '2 Kings', '1CH': '1 Chronicles', '2CH': '2 Chronicles',
  'EZR': 'Ezra', 'NEH': 'Nehemiah', 'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms',
  'PRO': 'Proverbs', 'ECC': 'Ecclesiastes', 'SOS': 'Song of Songs', 'ISA': 'Isaiah',
  'JER': 'Jeremiah', 'LAM': 'Lamentations', 'EZE': 'Ezekiel', 'DAN': 'Daniel',
  'HOS': 'Hosea', 'JOE': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah', 'JON': 'Jonah',
  'MIC': 'Micah', 'NAH': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah',
  'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi', 'MAT': 'Matthew',
  'MAR': 'Mark', 'LUK': 'Luke', 'JOH': 'John', 'ACT': 'Acts', 'ROM': 'Romans',
  '1CO': '1 Corinthians', '2CO': '2 Corinthians', 'GAL': 'Galatians', 'EPH': 'Ephesians',
  'PHP': 'Philippians', 'COL': 'Colossians', '1TH': '1 Thessalonians', '2TH': '2 Thessalonians',
  '1TI': '1 Timothy', '2TI': '2 Timothy', 'TIT': 'Titus', 'PHM': 'Philemon',
  'HEB': 'Hebrews', 'JAM': 'James', '1PE': '1 Peter', '2PE': '2 Peter',
  '1JO': '1 John', '2JO': '2 John', '3JO': '3 John', 'JDE': 'Jude', 'REV': 'Revelation'
};

function convertFromCrossRefFormat(ref: string): string | null {
  const parts = ref.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  
  const [abbrev, chapter, verse] = parts;
  const bookName = ABBREVIATION_TO_BOOK[abbrev];
  
  if (!bookName) return null;
  
  return `${bookName} ${chapter}:${verse}`;
}

const BATCH_SIZE = 100; // Pinecone batch limit
const EMBEDDING_BATCH_SIZE = 50; // OpenAI batch size
const PROCESS_CHUNK_SIZE = 500; // Process 500 relationships at a time

interface CrossReferenceMetadata {
  content_type: 'cross_reference';
  language: 'en';
  source_verse: string;
  target_verse: string;
  source_verse_id: string;
  target_verse_id: string;
  relationship_type: 'cross_reference';
}

interface CrossReferenceData {
  [verseId: string]: {
    v: string;
    r?: {
      [refId: string]: string;
    };
  };
}

// ============================================================================
// Data Validation
// ============================================================================

/**
 * Validate verse reference format
 */
function validateVerseReference(ref: string): boolean {
  const parts = ref.trim().split(/\s+/);
  if (parts.length !== 3) return false;
  const [abbrev, chapter, verse] = parts;
  return !!ABBREVIATION_TO_BOOK[abbrev] && 
         !isNaN(parseInt(chapter)) && 
         !isNaN(parseInt(verse));
}

/**
 * Validate cross-reference data before processing
 */
function validateCrossReferenceData(
  sourceVerseRef: string,
  targetVerseRef: string,
  verseId: string,
  refId: string
): { valid: boolean; error?: string } {
  if (!validateVerseReference(sourceVerseRef)) {
    return { valid: false, error: `Invalid source verse format: ${sourceVerseRef}` };
  }
  
  if (!validateVerseReference(targetVerseRef)) {
    return { valid: false, error: `Invalid target verse format: ${targetVerseRef}` };
  }

  if (sourceVerseRef === targetVerseRef) {
    return { valid: false, error: 'Source and target verses cannot be the same' };
  }

  if (!verseId || !refId) {
    return { valid: false, error: 'Missing verse ID or reference ID' };
  }

  return { valid: true };
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Load all cross-reference JSON files
 */
async function loadAllCrossReferences(): Promise<Map<string, CrossReferenceData>> {
  const crossRefDir = path.join(__dirname, '..', 'bible-cross-reference-json');
  
  if (!fs.existsSync(crossRefDir)) {
    throw new Error(`Cross-references directory not found: ${crossRefDir}`);
  }

  const files = fs.readdirSync(crossRefDir)
    .filter(f => f.endsWith('.json') && f !== 'LICENSE')
    .sort((a, b) => {
      const numA = parseInt(a.replace('.json', ''));
      const numB = parseInt(b.replace('.json', ''));
      return numA - numB;
    });
  
  const allData = new Map<string, CrossReferenceData>();
  
  for (const file of files) {
    try {
      const filePath = path.join(crossRefDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CrossReferenceData;
      allData.set(file, data);
      console.log(`  ✅ Loaded ${file}: ${Object.keys(data).length} verses`);
    } catch (error: any) {
      console.error(`  ❌ Error loading ${file}:`, error.message);
      throw error;
    }
  }
  
  return allData;
}

/**
 * Process and upload a chunk with retry logic and error handling
 */
async function processAndUploadChunk(
  chunk: any[],
  index: any,
  progressState: ProgressState
): Promise<number> {
  const maxRetries = 3;
  const retryDelay = 2000;
  
  // Generate embeddings in batches
  const embeddingBatches: any[][] = [];
  for (let i = 0; i < chunk.length; i += EMBEDDING_BATCH_SIZE) {
    embeddingBatches.push(chunk.slice(i, i + EMBEDDING_BATCH_SIZE));
  }
  
  // Generate embeddings for chunk
  for (const batch of embeddingBatches) {
    const texts = batch.map(v => v.relationshipText);
    try {
      const embeddings = await generateBatchOpenAIEmbeddings(texts);
      
      // Validate embeddings
      if (embeddings.length !== batch.length) {
        throw new Error(`Embedding count mismatch: expected ${batch.length}, got ${embeddings.length}`);
      }

      // Assign embeddings to vectors
      batch.forEach((vector, idx) => {
        if (embeddings[idx] && Array.isArray(embeddings[idx]) && embeddings[idx].length === 1536) {
          // Check if embedding is all zeros (invalid)
          const hasNonZero = embeddings[idx].some((val: number) => val !== 0);
          if (!hasNonZero) {
            console.warn(`⚠️  Zero-vector embedding detected for ${vector.id}, skipping`);
            vector.values = null;
          } else {
            vector.values = embeddings[idx];
            delete vector.relationshipText;
          }
        } else {
          console.warn(`⚠️  Invalid embedding for vector ${vector.id}, skipping`);
          vector.values = null;
        }
      });
      
      // Rate limiting: small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(`    ⚠️  Error generating embeddings for batch:`, error.message);
      // Mark vectors as failed
      batch.forEach((vector) => {
        vector.values = null;
      });
    }
  }
  
  // Upload to Pinecone in batches
  let uploaded = 0;
  const validVectors = chunk.filter(v => v.values !== null && Array.isArray(v.values));
  
  for (let i = 0; i < validVectors.length; i += BATCH_SIZE) {
    const batch = validVectors.slice(i, i + BATCH_SIZE);
    
    if (batch.length > 0) {
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          await index.upsert(batch);
          uploaded += batch.length;
          success = true;
        } catch (error: any) {
          retries++;
          const errorMsg = error.message || 'Unknown error';
          
          // Don't expose API keys in error messages
          const sanitizedError = errorMsg.replace(/pcsk_[^\s]+/g, 'pcsk_***')
                                         .replace(/sk-[^\s]+/g, 'sk-***');
          
          if (retries < maxRetries) {
            console.warn(`    ⚠️  Retry ${retries}/${maxRetries} for upload batch...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          } else {
            console.error(`    ❌ Failed to upload batch after ${maxRetries} retries: ${sanitizedError}`);
            // Log error details without exposing sensitive data
            progressState.errors.push({
              file: batch[0]?.metadata?.source_verse_id || 'unknown',
              verseId: batch[0]?.id || 'unknown',
              error: sanitizedError
            });
          }
        }
      }
    }
  }
  
  return uploaded;
}

/**
 * Index cross-references to Pinecone with progress tracking
 */
async function indexCrossReferences(resume: boolean = false): Promise<{
  relationships: number;
  vectors: number;
  errors: number;
}> {
  console.log('\n🔗 Indexing Bible Cross-References to Pinecone (Secure Mode)...');
  
  // Load progress if resuming
  let progressState: ProgressState | null = null;
  if (resume) {
    progressState = loadProgress();
    if (progressState) {
      console.log(`\n📂 Resuming from previous session:`);
      console.log(`   Last file: ${progressState.lastProcessedFile}`);
      console.log(`   Processed: ${progressState.totalProcessed.toLocaleString()} relationships`);
      console.log(`   Uploaded: ${progressState.totalUploaded.toLocaleString()} vectors`);
    }
  }

  if (!progressState) {
    progressState = {
      lastProcessedFile: '',
      lastProcessedVerseId: '',
      totalProcessed: 0,
      totalUploaded: 0,
      startTime: Date.now(),
      errors: []
    };
  }

  // Load all cross-reference data
  console.log('\n📂 Loading cross-reference files...');
  const allData = await loadAllCrossReferences();
  
  // Get Pinecone index
  const client = getPineconeClient();
  const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
  const index = client.index(crossRefIndexName);
  
  // Verify index exists and is ready
  try {
    const stats = await index.describeIndexStats();
    console.log(`✅ Connected to Pinecone index: ${crossRefIndexName}`);
    console.log(`   Current vectors: ${stats.totalRecordCount?.toLocaleString() || 0}`);
  } catch (error: any) {
    throw new Error(`Failed to connect to Pinecone index: ${error.message}`);
  }

  let currentChunk: any[] = [];
  let shouldResume = resume && progressState.lastProcessedFile !== '';
  let skipUntilFile = shouldResume ? progressState.lastProcessedFile : '';
  let skipUntilVerseId = shouldResume ? progressState.lastProcessedVerseId : '';

  // Process each file
  for (const [fileName, fileData] of allData.entries()) {
    // Skip files until we reach the resume point
    if (shouldResume && fileName !== skipUntilFile) {
      continue;
    }
    shouldResume = false; // Reset after first match

    console.log(`\n  📄 Processing ${fileName}...`);
    
    // Process each verse and its cross-references
    for (const [verseId, verseData] of Object.entries(fileData)) {
      // Skip verses until we reach the resume point
      if (skipUntilVerseId && verseId !== skipUntilVerseId) {
        continue;
      }
      skipUntilVerseId = ''; // Reset after first match

      const sourceVerseRef = verseData.v;
      const sourceVerseReadable = convertFromCrossRefFormat(sourceVerseRef);
      
      if (!sourceVerseReadable || !verseData.r) {
        continue;
      }
      
      // Process each cross-reference
      for (const [refId, targetVerseRef] of Object.entries(verseData.r)) {
        const targetVerseReadable = convertFromCrossRefFormat(targetVerseRef);
        
        if (!targetVerseReadable) {
          continue;
        }

        // Validate data before processing
        const validation = validateCrossReferenceData(
          sourceVerseRef,
          targetVerseRef,
          verseId,
          refId
        );

        if (!validation.valid) {
          progressState.errors.push({
            file: fileName,
            verseId: verseId,
            error: validation.error || 'Validation failed'
          });
          continue;
        }
        
        progressState.totalProcessed++;
        
        // Create text for embedding
        const relationshipText = `${sourceVerseReadable} is cross-referenced with ${targetVerseReadable}. These verses are thematically related and provide additional biblical context.`;
        
        // Generate vector ID (sanitized)
        const vectorId = `crossref:${verseId}:${refId}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
        
        // Metadata
        const metadata: CrossReferenceMetadata = {
          content_type: 'cross_reference',
          language: 'en',
          source_verse: sourceVerseReadable,
          target_verse: targetVerseReadable,
          source_verse_id: sourceVerseRef,
          target_verse_id: targetVerseRef,
          relationship_type: 'cross_reference',
        };
        
        currentChunk.push({
          id: vectorId,
          values: null,
          metadata: metadata as any,
          relationshipText: relationshipText,
        });
        
        // Process chunk when it reaches size limit
        if (currentChunk.length >= PROCESS_CHUNK_SIZE) {
          const uploaded = await processAndUploadChunk(currentChunk, index, progressState);
          progressState.totalUploaded += uploaded;
          progressState.lastProcessedFile = fileName;
          progressState.lastProcessedVerseId = verseId;
          
          // Save progress periodically
          saveProgress(progressState);
          
          currentChunk = [];
          
          // Progress update
          const elapsed = ((Date.now() - progressState.startTime) / 1000).toFixed(0);
          const rate = progressState.totalUploaded / (elapsed as any);
          console.log(`    📊 Progress: ${progressState.totalProcessed.toLocaleString()} processed, ${progressState.totalUploaded.toLocaleString()} uploaded (${rate.toFixed(1)}/s)`);
        }
      }
    }
  }
  
  // Process remaining chunk
  if (currentChunk.length > 0) {
    const uploaded = await processAndUploadChunk(currentChunk, index, progressState);
    progressState.totalUploaded += uploaded;
    currentChunk = [];
  }

  // Clear progress file on successful completion
  clearProgress();

  console.log(`\n  ✅ Processed ${progressState.totalProcessed.toLocaleString()} cross-reference relationships`);
  console.log(`  ✅ Successfully indexed ${progressState.totalUploaded.toLocaleString()} cross-reference vectors`);
  
  if (progressState.errors.length > 0) {
    console.log(`  ⚠️  Encountered ${progressState.errors.length} errors (see details above)`);
  }

  return {
    relationships: progressState.totalProcessed,
    vectors: progressState.totalUploaded,
    errors: progressState.errors.length
  };
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  console.log('🚀 Starting Secure Cross-Reference Indexing to Pinecone...\n');
  
  // Load environment variables
  const envResult = await loadEnvironmentVariables();
  if (!envResult.success) {
    console.error('❌ Failed to load environment variables');
    process.exit(1);
  }

  // Validate API keys
  const keyValidation = validateAPIKeys();
  if (!keyValidation.valid) {
    console.error('\n❌ API key validation failed. Please check your .env.local file.');
    process.exit(1);
  }

  console.log('\n⚠️  Required environment variables:');
  console.log('   ✅ PINECONE_API_KEY');
  console.log('   ✅ OPENAI_API_KEY');
  console.log('   ℹ️  PINECONE_INDEX_NAME_CROSS_REFERENCES (default: cross-references)\n');
  
  try {
    // Check for resume flag
    const resume = process.argv.includes('--resume');
    if (resume) {
      console.log('📂 Resume mode enabled - will continue from last checkpoint\n');
    }

    // Test Pinecone connection
    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    
    // Verify index is accessible
    try {
      await index.describeIndexStats();
      console.log(`✅ Pinecone connection established (index: ${crossRefIndexName})\n`);
    } catch (error: any) {
      throw new Error(`Cannot access Pinecone index: ${error.message}`);
    }
    
    // Index cross-references
    const stats = await indexCrossReferences(resume);
    
    console.log('\n📊 Final Summary:');
    console.log(`   Cross-References Processed: ${stats.relationships.toLocaleString()}`);
    console.log(`   Vectors Uploaded: ${stats.vectors.toLocaleString()}`);
    if (stats.errors > 0) {
      console.log(`   Errors: ${stats.errors}`);
    }
    console.log('\n✅ Cross-reference indexing completed successfully!');
    console.log('\n💡 These cross-references are now available in:');
    console.log('   - RAG pipeline queries');
    console.log('   - AI agent responses');
    console.log('   - Bible chat conversations');
    
  } catch (error: any) {
    console.error('\n❌ Error indexing cross-references:');
    
    // Sanitize error messages to avoid exposing API keys
    const errorMsg = error.message || String(error);
    const sanitized = errorMsg
      .replace(/pcsk_[^\s]+/g, 'pcsk_***')
      .replace(/sk-[^\s]+/g, 'sk-***')
      .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
    
    console.error(`   ${sanitized}`);
    
    if (error.stack) {
      const sanitizedStack = error.stack
        .replace(/pcsk_[^\s]+/g, 'pcsk_***')
        .replace(/sk-[^\s]+/g, 'sk-***')
        .replace(/sk-proj-[^\s]+/g, 'sk-proj-***');
      console.error('\nStack trace:');
      console.error(sanitizedStack);
    }
    
    console.error('\n💡 Tip: You can resume indexing with --resume flag');
    process.exit(1);
  }
}

main();

