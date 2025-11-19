// Script to index Bible content (KJV & Tamil) into Pinecone
// Run: npm run index-bible

import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import { generateBatchOpenAIEmbeddings, chunkBibleText } from '../src/lib/bible-rag/openai-embeddings.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 100; // Pinecone batch limit
const CHUNK_SIZE = 500; // tokens per chunk
const OVERLAP = 50; // token overlap

interface BibleMetadata {
  content_type: 'bible';
  language: 'en' | 'ta';
  book: string;
  chapter: number;
  verse: number;
  verse_reference: string;
  chunk_index: number;
  translation: string;
  verse_text: string; // Store verse text in metadata
}

/**
 * Index KJV Bible (English)
 */
async function indexKJVBible() {
  console.log('\n📖 Indexing KJV Bible (English)...');
  
  const kjvPath = path.join(__dirname, '..', 'public', 'Bible', 'KJV_bible.json');
  
  if (!fs.existsSync(kjvPath)) {
    throw new Error(`KJV Bible file not found: ${kjvPath}`);
  }
  
  const kjvData = JSON.parse(fs.readFileSync(kjvPath, 'utf-8'));
  
  // Use separate index for Bible if configured (1536 dimensions for OpenAI)
  const client = getPineconeClient();
  const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
  const index = client.index(bibleIndexName);
  const vectors: any[] = [];
  let totalVerses = 0;
  let totalChunks = 0;

  // Process each book
  for (const [bookName, bookData] of Object.entries(kjvData)) {
    if (bookName === 'Info') continue; // Skip metadata
    
    console.log(`  Processing ${bookName}...`);
    
    // Process each chapter
    for (const [chapterNum, chapterData] of Object.entries(bookData as Record<string, any>)) {
      const chapter = parseInt(chapterNum);
      if (isNaN(chapter)) continue;
      
      // Process each verse
      for (const [verseNum, verseText] of Object.entries(chapterData as Record<string, any>)) {
        const verse = parseInt(verseNum);
        if (isNaN(verse) || !verseText || typeof verseText !== 'string') continue;
        
        totalVerses++;
        const verseReference = `${bookName} ${chapter}:${verse}`;
        
        // Create verse text with context
        const verseContent = `${verseReference}: ${verseText}`;
        
        // Chunk the verse if it's long
        const chunks = chunkBibleText(verseContent, CHUNK_SIZE, OVERLAP);
        
        // Create vectors for each chunk
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];
          
          // Generate vector ID
          const vectorId = `bible:en:${bookName}:${chapter}:${verse}:${chunkIndex}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
          
          // Metadata
          const metadata: BibleMetadata = {
            content_type: 'bible',
            language: 'en',
            book: bookName,
            chapter: chapter,
            verse: verse,
            verse_reference: verseReference,
            chunk_index: chunkIndex,
            translation: 'KJV',
            verse_text: verseText, // Store original verse text
          };
          
          vectors.push({
            id: vectorId,
            values: null, // Will be filled after embedding generation
            metadata: metadata as any,
            chunkText: chunk, // Store for embedding
          });
          
          totalChunks++;
        }
      }
    }
  }

  console.log(`  ✅ Processed ${totalVerses} verses, ${totalChunks} chunks`);
  console.log(`  🔄 Generating embeddings with OpenAI...`);

  // Generate embeddings in batches
  const batches: any[][] = [];
  for (let i = 0; i < vectors.length; i += 50) {
    batches.push(vectors.slice(i, i + 50));
  }

  let processedBatches = 0;
  for (const batch of batches) {
    const texts = batch.map(v => v.chunkText);
    try {
      const embeddings = await generateBatchOpenAIEmbeddings(texts);
      
      // Assign embeddings to vectors
      batch.forEach((vector, idx) => {
        vector.values = embeddings[idx];
        delete vector.chunkText; // Remove temporary field
      });
      
      processedBatches++;
      if (processedBatches % 10 === 0) {
        console.log(`    Progress: ${processedBatches}/${batches.length} batches (${Math.round((processedBatches / batches.length) * 100)}%)`);
      }
      
      // Rate limiting: small delay between batches
      if (processedBatches < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }
    } catch (error: any) {
      console.error(`    ⚠️  Error in batch ${processedBatches + 1}:`, error.message);
      // Mark vectors as failed (will be filtered out)
      batch.forEach((vector) => {
        vector.values = null;
      });
      // Continue with next batch
    }
  }

  console.log(`  📤 Uploading ${vectors.length} vectors to Pinecone...`);

  // Upload to Pinecone in batches with retry logic
  let uploaded = 0;
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE).filter(v => v.values !== null);
    
    if (batch.length > 0) {
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          await index.upsert(batch);
          uploaded += batch.length;
          success = true;
          
          if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= vectors.length) {
            console.log(`    Uploaded ${uploaded}/${vectors.length} vectors`);
          }
        } catch (error: any) {
          retries++;
          if (retries < maxRetries) {
            console.warn(`    Retry ${retries}/${maxRetries} for batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          } else {
            console.error(`    ❌ Failed to upload batch ${Math.floor(i / BATCH_SIZE) + 1} after ${maxRetries} retries:`, error.message);
          }
        }
      }
    }
  }

  console.log(`  ✅ Successfully indexed ${uploaded} vectors for KJV Bible`);
  return { verses: totalVerses, chunks: totalChunks, vectors: uploaded };
}

/**
 * Index Tamil Bible
 */
async function indexTamilBible() {
  console.log('\n📖 Indexing Tamil Bible...');
  
  const tamilDir = path.join(__dirname, '..', 'public', 'Bible', 'Tamil bible');
  
  if (!fs.existsSync(tamilDir)) {
    console.warn('⚠️  Tamil Bible directory not found, skipping...');
    return { verses: 0, chunks: 0, vectors: 0 };
  }
  
  const tamilFiles = fs.readdirSync(tamilDir).filter(f => f.endsWith('.json') && f !== 'Books.json' && f !== 'LICENSE');
  
  // Use separate index for Bible if configured (1536 dimensions for OpenAI)
  const client = getPineconeClient();
  const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
  const index = client.index(bibleIndexName);
  const vectors: any[] = [];
  let totalVerses = 0;
  let totalChunks = 0;

  // Process each book file
  for (const file of tamilFiles) {
    const filePath = path.join(tamilDir, file);
    const bookData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    const bookName = bookData.book?.english || bookData.book?.tamil || file.replace('.json', '');
    console.log(`  Processing ${bookName}...`);
    
    // Tamil Bible structure: { book: {...}, chapters: [{ chapter: "1", verses: [{ verse: "1", text: "..." }] }] }
    if (!bookData.chapters || !Array.isArray(bookData.chapters)) {
      console.warn(`    ⚠️  Skipping ${file}: invalid structure`);
      continue;
    }
    
    // Process each chapter
    for (const chapterData of bookData.chapters) {
      const chapter = parseInt(chapterData.chapter);
      if (isNaN(chapter)) continue;
      
      if (!chapterData.verses || !Array.isArray(chapterData.verses)) continue;
      
      // Process each verse
      for (const verseData of chapterData.verses) {
        const verse = parseInt(verseData.verse);
        const verseText = verseData.text;
        
        if (isNaN(verse) || !verseText || typeof verseText !== 'string') continue;
        
        totalVerses++;
        const verseReference = `${bookName} ${chapter}:${verse}`;
        
        // Create verse text with context
        const verseContent = `${verseReference}: ${verseText}`;
        
        // Chunk the verse if it's long
        const chunks = chunkBibleText(verseContent, CHUNK_SIZE, OVERLAP);
        
        // Create vectors for each chunk
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];
          
          // Generate vector ID
          const vectorId = `bible:ta:${bookName}:${chapter}:${verse}:${chunkIndex}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
          
          // Metadata
          const metadata: BibleMetadata = {
            content_type: 'bible',
            language: 'ta',
            book: bookName,
            chapter: chapter,
            verse: verse,
            verse_reference: verseReference,
            chunk_index: chunkIndex,
            translation: 'TAMIL',
            verse_text: verseText, // Store original verse text
          };
          
          vectors.push({
            id: vectorId,
            values: null, // Will be filled after embedding generation
            metadata: metadata as any,
            chunkText: chunk, // Store for embedding
          });
          
          totalChunks++;
        }
      }
    }
  }

  console.log(`  ✅ Processed ${totalVerses} verses, ${totalChunks} chunks`);
  console.log(`  🔄 Generating embeddings with OpenAI...`);

  // Generate embeddings in batches
  const batches: any[][] = [];
  for (let i = 0; i < vectors.length; i += 50) {
    batches.push(vectors.slice(i, i + 50));
  }

  let processedBatches = 0;
  for (const batch of batches) {
    const texts = batch.map(v => v.chunkText);
    try {
      const embeddings = await generateBatchOpenAIEmbeddings(texts);
      
      // Assign embeddings to vectors
      batch.forEach((vector, idx) => {
        vector.values = embeddings[idx];
        delete vector.chunkText; // Remove temporary field
      });
      
      processedBatches++;
      if (processedBatches % 10 === 0) {
        console.log(`    Progress: ${processedBatches}/${batches.length} batches (${Math.round((processedBatches / batches.length) * 100)}%)`);
      }
      
      // Rate limiting: small delay between batches
      if (processedBatches < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
      }
    } catch (error: any) {
      console.error(`    ⚠️  Error in batch ${processedBatches + 1}:`, error.message);
      // Mark vectors as failed (will be filtered out)
      batch.forEach((vector) => {
        vector.values = null;
      });
      // Continue with next batch
    }
  }

  console.log(`  📤 Uploading ${vectors.length} vectors to Pinecone...`);

  // Upload to Pinecone in batches with retry logic
  let uploaded = 0;
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE).filter(v => v.values !== null);
    
    if (batch.length > 0) {
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          await index.upsert(batch);
          uploaded += batch.length;
          success = true;
          
          if ((i + BATCH_SIZE) % 1000 === 0 || i + BATCH_SIZE >= vectors.length) {
            console.log(`    Uploaded ${uploaded}/${vectors.length} vectors`);
          }
        } catch (error: any) {
          retries++;
          if (retries < maxRetries) {
            console.warn(`    Retry ${retries}/${maxRetries} for batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          } else {
            console.error(`    ❌ Failed to upload batch ${Math.floor(i / BATCH_SIZE) + 1} after ${maxRetries} retries:`, error.message);
          }
        }
      }
    }
  }

  console.log(`  ✅ Successfully indexed ${uploaded} vectors for Tamil Bible`);
  return { verses: totalVerses, chunks: totalChunks, vectors: uploaded };
}

async function main() {
  console.log('🚀 Starting Bible indexing to Pinecone...\n');
  console.log('⚠️  Make sure you have set:');
  console.log('   - PINECONE_API_KEY');
  console.log('   - PINECONE_INDEX_NAME_BIBLE (default: bible-aura-bible)');
  console.log('   - OPENAI_API_KEY\n');
  
  try {
    // Test Pinecone connection
    const client = getPineconeClient();
    const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
    const index = client.index(bibleIndexName);
    console.log(`✅ Pinecone connection established (index: ${bibleIndexName})\n`);
    
    // Index English Bible (KJV)
    const kjvStats = await indexKJVBible();
    
    // Index Tamil Bible
    const tamilStats = await indexTamilBible();
    
    console.log('\n📊 Summary:');
    console.log(`   KJV Bible: ${kjvStats.verses} verses → ${kjvStats.vectors} vectors`);
    console.log(`   Tamil Bible: ${tamilStats.verses} verses → ${tamilStats.vectors} vectors`);
    console.log(`   Total: ${kjvStats.verses + tamilStats.verses} verses → ${kjvStats.vectors + tamilStats.vectors} vectors`);
    console.log('\n✅ Bible indexing completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error indexing Bible:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

