// Script to verify if cross-references are loaded in Pinecone
// Run: npm run verify-cross-refs or: tsx scripts/verify-cross-references-pinecone.ts

// CRITICAL: Load environment variables BEFORE any imports that use them
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local file BEFORE importing modules that need env vars
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  let loadedCount = 0;
  const lines = envContent.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        if (value) {
          // Force set (override existing) to ensure values are loaded
          process.env[key] = value;
          loadedCount++;
          
          // Also set non-VITE versions if VITE versions exist
          if (key === 'VITE_PINECONE_API_KEY' && !process.env.PINECONE_API_KEY) {
            process.env.PINECONE_API_KEY = value;
          }
          if (key === 'VITE_OPENAI_API_KEY' && !process.env.OPENAI_API_KEY) {
            process.env.OPENAI_API_KEY = value;
          }
        }
      }
    }
  }
  
  console.log(`✅ Loaded ${loadedCount} environment variables from .env.local`);
  
  // Verify critical variables are loaded (check after setting)
  const pineconeKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const hasPinecone = !!pineconeKey && pineconeKey.length > 0;
  const hasOpenAI = !!openAIKey && openAIKey.length > 0;
  
  if (!hasPinecone || !hasOpenAI) {
    console.warn('⚠️  Warning: Some required API keys may be missing');
    console.warn(`   PINECONE_API_KEY: ${hasPinecone ? `✅ (${pineconeKey.length} chars)` : '❌'}`);
    console.warn(`   OPENAI_API_KEY: ${hasOpenAI ? `✅ (${openAIKey.length} chars)` : '❌'}`);
  } else {
    console.log(`   ✅ API keys verified (Pinecone: ${pineconeKey.length} chars, OpenAI: ${openAIKey.length} chars)`);
  }
} else {
  console.warn('⚠️  .env.local file not found');
}

// NOW import modules that depend on environment variables
import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import { generateOpenAIEmbedding } from '../src/lib/bible-rag/openai-embeddings.js';

async function verifyCrossReferences() {
  console.log('\n🔍 Verifying Cross-References in Pinecone...\n');

  try {
    // 1. Test Pinecone connection
    console.log('1️⃣ Testing Pinecone connection...');
    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    console.log(`   ✅ Connected to index: ${crossRefIndexName}\n`);

    // 2. Check index stats
    console.log('2️⃣ Checking index statistics...');
    try {
      const stats = await index.describeIndexStats();
      const totalVectors = stats.totalRecordCount || 0;
      console.log(`   ✅ Index stats retrieved`);
      console.log(`      Total vectors: ${totalVectors.toLocaleString()}`);
      console.log(`      Namespaces: ${Object.keys(stats.namespaces || {}).length}`);
      
      if (totalVectors === 0) {
        console.log('\n   ⚠️  WARNING: No vectors found in cross-references index!');
        console.log('   📝 Run: npm run index-cross-refs to index cross-references\n');
        return;
      }
    } catch (error: any) {
      console.log(`   ⚠️  Could not get stats: ${error.message}`);
    }

    // 3. Test query with a known verse
    console.log('\n3️⃣ Testing cross-reference query...');
    const testVerse = 'Genesis 1:1';
    const queryText = `Cross-references for ${testVerse}. Related Bible verses that provide additional context and thematic connections.`;
    
    try {
      const queryEmbedding = await generateOpenAIEmbedding(queryText);
      
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
      });

      const results = queryResponse.matches || [];
      console.log(`   ✅ Found ${results.length} cross-reference results\n`);

      if (results.length > 0) {
        console.log('4️⃣ Sample Cross-Reference Results:');
        results.slice(0, 5).forEach((match: any, idx: number) => {
          const metadata = match.metadata;
          console.log(`   ${idx + 1}. ${metadata.source_verse || 'Unknown'} → ${metadata.target_verse || 'Unknown'}`);
          console.log(`      Score: ${((match.score || 0) * 100).toFixed(2)}%`);
          console.log(`      Type: ${metadata.relationship_type || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('   ⚠️  No cross-reference results found.');
        console.log('   📝 This might indicate the index is empty or needs re-indexing.\n');
      }
    } catch (error: any) {
      console.error(`   ❌ Query failed: ${error.message}`);
    }

    // 4. Try to query by metadata filter
    console.log('5️⃣ Testing metadata filter query...');
    try {
      // Use a dummy vector to query with metadata filter
      const dummyVector = new Array(1536).fill(0);
      const filterResponse = await index.query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
        filter: {
          content_type: { $eq: 'cross_reference' },
        } as any,
      });

      const filterResults = filterResponse.matches || [];
      console.log(`   ✅ Found ${filterResults.length} results with cross_reference content_type\n`);
      
      if (filterResults.length === 0) {
        console.log('   ⚠️  WARNING: No vectors with content_type="cross_reference" found!');
        console.log('   📝 The index may be empty or use different metadata.\n');
      }
    } catch (error: any) {
      console.log(`   ⚠️  Filter query failed: ${error.message}`);
    }

    console.log('\n✅ Verification completed!');
    console.log('\n📝 Summary:');
    console.log('   - If you see vectors and results above, cross-references are loaded ✅');
    console.log('   - If you see 0 vectors or no results, run: npm run index-cross-refs');

  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check PINECONE_API_KEY is set');
    console.error('   2. Check OPENAI_API_KEY is set');
    console.error('   3. Verify index name: cross-references (or PINECONE_INDEX_NAME_CROSS_REFERENCES)');
    console.error('   4. Ensure index has 1536 dimensions');
    console.error('   5. Run: npm run index-cross-refs to index cross-references');
    process.exit(1);
  }
}

verifyCrossReferences();
