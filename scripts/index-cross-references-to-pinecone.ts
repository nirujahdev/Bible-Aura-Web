// Script to index Bible cross-references into Pinecone
// Run: npm run index-cross-refs
//
// This indexes cross-reference relationships so they can be retrieved
// semantically through Pinecone queries

// Load environment variables from .env.local if it exists
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env.local file - use dotenv if available, otherwise manual parsing
let envLoaded = false;
try {
  // Try dotenv package first
  const dotenv = await import('dotenv');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath, override: true });
    if (!result.error) {
      envLoaded = true;
      console.log('✅ Loaded environment variables using dotenv');
    }
  }
} catch (e) {
  // dotenv not available or failed, use manual parsing
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
          value = value.replace(/^["']|["']$/g, ''); // Remove quotes
          if (value) {
            process.env[key] = value; // Force set
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
    console.log(`✅ Loaded ${loadedCount} environment variables from .env.local`);
  }
}

import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import { generateBatchOpenAIEmbeddings } from '../src/lib/bible-rag/openai-embeddings.js';

// Book abbreviation to full name mapping (avoid importing from cross-references.ts which uses Vite)
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

interface CrossReferenceMetadata {
  content_type: 'cross_reference';
  language: 'en';
  source_verse: string; // "Genesis 1:1"
  target_verse: string; // "John 1:1"
  source_verse_id: string; // "GEN 1 1"
  target_verse_id: string; // "JOH 1 1"
  relationship_type: 'cross_reference';
}

interface CrossReferenceData {
  [verseId: string]: {
    v: string; // Verse reference in format "GEN 1 1"
    r?: {
      [refId: string]: string; // Cross-reference IDs mapped to verse references
    };
  };
}

/**
 * Load all cross-reference JSON files
 */
async function loadAllCrossReferences(): Promise<Map<string, CrossReferenceData>> {
  const crossRefDir = path.join(__dirname, '..', 'bible-cross-reference-json');
  const files = fs.readdirSync(crossRefDir).filter(f => f.endsWith('.json') && f !== 'LICENSE');
  
  const allData = new Map<string, CrossReferenceData>();
  
  for (const file of files) {
    const filePath = path.join(crossRefDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CrossReferenceData;
    allData.set(file, data);
    console.log(`  Loaded ${file}: ${Object.keys(data).length} verses`);
  }
  
  return allData;
}

/**
 * Index cross-references to Pinecone
 */
async function indexCrossReferences() {
  console.log('\n🔗 Indexing Bible Cross-References to Pinecone...');
  
  const crossRefDir = path.join(__dirname, '..', 'bible-cross-reference-json');
  
  if (!fs.existsSync(crossRefDir)) {
    throw new Error(`Cross-references directory not found: ${crossRefDir}`);
  }
  
  // Load all cross-reference data
  console.log('📂 Loading cross-reference files...');
  const allData = await loadAllCrossReferences();
  
  // Use dedicated cross-references index (1536 dimensions for OpenAI embeddings)
  const client = getPineconeClient();
  const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
  const index = client.index(crossRefIndexName);
  
  // Process and upload incrementally to avoid memory issues
  // Process in chunks: generate embeddings and upload immediately
  const PROCESS_CHUNK_SIZE = 500; // Process 500 relationships at a time
  let totalRelationships = 0;
  let totalUploaded = 0;
  let currentChunk: any[] = [];
  
  // Process each file
  for (const [fileName, fileData] of allData.entries()) {
    console.log(`\n  Processing ${fileName}...`);
    
    // Process each verse and its cross-references
    for (const [verseId, verseData] of Object.entries(fileData)) {
      const sourceVerseRef = verseData.v; // "GEN 1 1"
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
        
        totalRelationships++;
        
        // Create text for embedding - describe the relationship
        const relationshipText = `${sourceVerseReadable} is cross-referenced with ${targetVerseReadable}. These verses are thematically related and provide additional biblical context.`;
        
        // Generate vector ID
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
          values: null, // Will be filled after embedding generation
          metadata: metadata as any,
          relationshipText: relationshipText, // Store for embedding
        });
        
        // Process chunk when it reaches size limit
        if (currentChunk.length >= PROCESS_CHUNK_SIZE) {
          const uploaded = await processAndUploadChunk(currentChunk, index);
          totalUploaded += uploaded;
          currentChunk = []; // Clear chunk from memory
          
          if (totalRelationships % 1000 === 0) {
            console.log(`    Progress: ${totalRelationships} relationships processed, ${totalUploaded} uploaded`);
          }
        }
      }
    }
  }
  
  // Process remaining chunk
  if (currentChunk.length > 0) {
    const uploaded = await processAndUploadChunk(currentChunk, index);
    totalUploaded += uploaded;
    currentChunk = [];
  }
  
  console.log(`\n  ✅ Processed ${totalRelationships} cross-reference relationships`);
  console.log(`  ✅ Successfully indexed ${totalUploaded} cross-reference vectors`);
  return { relationships: totalRelationships, vectors: totalUploaded };
}

/**
 * Process a chunk: generate embeddings and upload to Pinecone
 * This function processes incrementally to avoid memory issues
 */
async function processAndUploadChunk(chunk: any[], index: any): Promise<number> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
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
      
      // Assign embeddings to vectors
      batch.forEach((vector, idx) => {
        vector.values = embeddings[idx];
        delete vector.relationshipText; // Remove temporary field
      });
      
      // Rate limiting: small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(`    ⚠️  Error generating embeddings for batch:`, error.message);
      // Mark vectors as failed (will be filtered out)
      batch.forEach((vector) => {
        vector.values = null;
      });
    }
  }
  
  // Upload to Pinecone in batches
  let uploaded = 0;
  const validVectors = chunk.filter(v => v.values !== null);
  
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
          if (retries < maxRetries) {
            console.warn(`    Retry ${retries}/${maxRetries} for upload batch...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          } else {
            console.error(`    ❌ Failed to upload batch after ${maxRetries} retries:`, error.message);
          }
        }
      }
    }
  }
  
  return uploaded;
}

async function main() {
  console.log('🚀 Starting Cross-Reference indexing to Pinecone...\n');
  console.log('⚠️  Make sure you have set:');
  console.log('   - PINECONE_API_KEY');
  console.log('   - PINECONE_INDEX_NAME_CROSS_REFERENCES (default: cross-references)');
  console.log('   - OPENAI_API_KEY\n');
  
  try {
    // Test Pinecone connection
    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    console.log(`✅ Pinecone connection established (index: ${crossRefIndexName})\n`);
    
    // Index cross-references
    const stats = await indexCrossReferences();
    
    console.log('\n📊 Summary:');
    console.log(`   Cross-References: ${stats.relationships} relationships → ${stats.vectors} vectors`);
    console.log('\n✅ Cross-reference indexing completed successfully!');
    console.log('\n💡 These cross-references will now be available in:');
    console.log('   - RAG pipeline queries');
    console.log('   - AI agent responses');
    console.log('   - Bible chat conversations');
    
  } catch (error: any) {
    console.error('\n❌ Error indexing cross-references:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

