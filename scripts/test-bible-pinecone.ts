// Test script to verify Bible Pinecone setup
// Run: npx tsx scripts/test-bible-pinecone.ts

import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import { generateOpenAIEmbedding } from '../src/lib/bible-rag/openai-embeddings.js';

async function testBiblePinecone() {
  console.log('🧪 Testing Bible Pinecone Setup...\n');

  try {
    // 1. Test Pinecone connection
    console.log('1️⃣ Testing Pinecone connection...');
    const client = getPineconeClient();
    const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
    const index = client.index(bibleIndexName);
    console.log(`   ✅ Connected to index: ${bibleIndexName}\n`);

    // 2. Test OpenAI embedding generation
    console.log('2️⃣ Testing OpenAI embedding generation...');
    const testQuery = 'What does the Bible say about love?';
    const embedding = await generateOpenAIEmbedding(testQuery);
    console.log(`   ✅ Generated embedding: ${embedding.length} dimensions\n`);

    // 3. Test Pinecone query
    console.log('3️⃣ Testing Pinecone query...');
    const queryResponse = await index.query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        content_type: { $eq: 'bible' },
        language: { $eq: 'en' },
      } as any,
    });

    const results = queryResponse.matches || [];
    console.log(`   ✅ Found ${results.length} results\n`);

    if (results.length > 0) {
      console.log('4️⃣ Sample Results:');
      results.slice(0, 3).forEach((match: any, idx: number) => {
        const metadata = match.metadata;
        console.log(`   ${idx + 1}. ${metadata.verse_reference || 'Unknown'}`);
        console.log(`      Score: ${(match.score * 100).toFixed(2)}%`);
        console.log(`      Text: ${(metadata.verse_text || '').substring(0, 80)}...`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No results found. Make sure you have indexed the Bible first:');
      console.log('      Run: npm run index-bible\n');
    }

    // 4. Check index stats
    console.log('5️⃣ Checking index statistics...');
    try {
      const stats = await index.describeIndexStats();
      console.log(`   ✅ Index stats retrieved`);
      console.log(`      Total vectors: ${stats.totalRecordCount || 'N/A'}`);
      console.log(`      Namespaces: ${Object.keys(stats.namespaces || {}).length}`);
    } catch (error: any) {
      console.log(`   ⚠️  Could not get stats: ${error.message}`);
    }

    console.log('\n✅ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. If no results found, run: npm run index-bible');
    console.log('   2. Set PINECONE_INDEX_NAME_BIBLE=bible-aura-bible in .env');
    console.log('   3. Verify OPENAI_API_KEY is set');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check PINECONE_API_KEY is set');
    console.error('   2. Check OPENAI_API_KEY is set');
    console.error('   3. Verify index name: bible-aura-bible');
    console.error('   4. Ensure index has 1536 dimensions');
    process.exit(1);
  }
}

testBiblePinecone();

