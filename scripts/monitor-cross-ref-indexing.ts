// Script to monitor cross-reference indexing progress
// Run: tsx scripts/monitor-cross-ref-indexing.ts

import { getPineconeClient } from '../src/lib/research-lab/pinecone-client.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
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
}

async function checkProgress() {
  try {
    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    
    const stats = await index.describeIndexStats();
    const currentCount = stats.totalRecordCount || 0;
    const expectedCount = 30441; // From our earlier calculation
    
    const progress = ((currentCount / expectedCount) * 100).toFixed(1);
    const remaining = expectedCount - currentCount;
    
    console.log('\n📊 Cross-Reference Indexing Progress:');
    console.log(`   Current vectors: ${currentCount.toLocaleString()}`);
    console.log(`   Expected vectors: ${expectedCount.toLocaleString()}`);
    console.log(`   Remaining: ${remaining.toLocaleString()}`);
    console.log(`   Progress: ${progress}%`);
    
    if (currentCount >= expectedCount) {
      console.log('\n✅ Indexing complete! All cross-references are uploaded.');
    } else {
      console.log(`\n⏳ Still indexing... ${remaining.toLocaleString()} vectors remaining.`);
    }
    
    return { current: currentCount, expected: expectedCount, progress: parseFloat(progress) };
  } catch (error: any) {
    console.error('❌ Error checking progress:', error.message);
    return null;
  }
}

// Run check
checkProgress().then(result => {
  if (result) {
    process.exit(result.current >= result.expected ? 0 : 1);
  } else {
    process.exit(1);
  }
});

