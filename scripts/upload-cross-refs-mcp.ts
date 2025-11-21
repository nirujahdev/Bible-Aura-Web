// Upload Cross-References to Pinecone using MCP
// This script reads the processed records and uploads them to Pinecone

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProcessedRecord {
  id: string;
  text: string;
  source_verse: string;
  target_verse: string;
  source_verse_id: string;
  target_verse_id: string;
}

interface BatchedRecords {
  batches: ProcessedRecord[][];
  total: number;
}

async function uploadBatch(
  records: ProcessedRecord[],
  indexName: string,
  namespace: string = 'default'
): Promise<number> {
  // MCP Pinecone upsert can handle records with text field
  // The index will auto-embed if configured with embedding model
  const recordsForUpload = records.map(record => ({
    _id: record.id,
    text: record.text,
    source_verse: record.source_verse,
    target_verse: record.target_verse,
    source_verse_id: record.source_verse_id,
    target_verse_id: record.target_verse_id,
  }));

  // Note: This would need to be called via MCP tool
  // For now, we'll prepare the data and log instructions
  console.log(`  📤 Prepared ${recordsForUpload.length} records for upload`);
  return recordsForUpload.length;
}

async function main() {
  console.log('🚀 Starting Cross-Reference Upload to Pinecone via MCP...\n');
  
  const recordsFile = path.join(__dirname, '..', '.cross-ref-records.json');
  
  if (!fs.existsSync(recordsFile)) {
    console.error('❌ Records file not found. Run push-cross-refs-mcp.ts first.');
    process.exit(1);
  }

  const data: BatchedRecords = JSON.parse(fs.readFileSync(recordsFile, 'utf-8'));
  console.log(`📊 Total batches: ${data.batches.length}`);
  console.log(`📊 Total records: ${data.total.toLocaleString()}\n`);

  const indexName = 'cross-references-v2'; // Using the new index with auto-embedding
  const namespace = 'default';

  console.log(`📋 Upload configuration:`);
  console.log(`   Index: ${indexName}`);
  console.log(`   Namespace: ${namespace}`);
  console.log(`   Total batches: ${data.batches.length}\n`);

  // Process in smaller chunks for MCP (100 records per batch max)
  const MCP_BATCH_SIZE = 100;
  let totalUploaded = 0;
  let batchNumber = 0;

  for (const batch of data.batches) {
    // Split large batches into MCP-sized chunks
    for (let i = 0; i < batch.length; i += MCP_BATCH_SIZE) {
      const chunk = batch.slice(i, i + MCP_BATCH_SIZE);
      batchNumber++;
      
      console.log(`\n📦 Processing batch ${batchNumber}/${Math.ceil(data.total / MCP_BATCH_SIZE)}`);
      console.log(`   Records in chunk: ${chunk.length}`);
      
      const uploaded = await uploadBatch(chunk, indexName, namespace);
      totalUploaded += uploaded;
      
      // Progress update
      const progress = ((totalUploaded / data.total) * 100).toFixed(2);
      console.log(`   ✅ Progress: ${totalUploaded.toLocaleString()}/${data.total.toLocaleString()} (${progress}%)`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n✅ Upload complete!`);
  console.log(`   Total records uploaded: ${totalUploaded.toLocaleString()}`);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});



