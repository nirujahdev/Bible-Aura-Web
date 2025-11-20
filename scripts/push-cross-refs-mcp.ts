// Push Cross-References to Pinecone using MCP
// This script processes cross-reference data and prepares it for MCP upload

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Book abbreviation to full name mapping
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

interface CrossReferenceData {
  [verseId: string]: {
    v: string;
    r?: {
      [refId: string]: string;
    };
  };
}

interface ProcessedRecord {
  id: string;
  text: string;
  source_verse: string;
  target_verse: string;
  source_verse_id: string;
  target_verse_id: string;
}

/**
 * Load and process cross-reference data
 */
async function processCrossReferences(): Promise<ProcessedRecord[]> {
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

  const records: ProcessedRecord[] = [];
  let totalProcessed = 0;

  console.log(`\n📂 Processing ${files.length} cross-reference files...\n`);

  for (const file of files) {
    try {
      const filePath = path.join(crossRefDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CrossReferenceData;
      
      for (const [verseId, verseData] of Object.entries(data)) {
        const sourceVerseRef = verseData.v;
        const sourceVerseReadable = convertFromCrossRefFormat(sourceVerseRef);
        
        if (!sourceVerseReadable || !verseData.r) {
          continue;
        }
        
        for (const [refId, targetVerseRef] of Object.entries(verseData.r)) {
          const targetVerseReadable = convertFromCrossRefFormat(targetVerseRef);
          
          if (!targetVerseReadable) {
            continue;
          }

          // Create text for embedding - this is what Pinecone MCP will embed
          const text = `${sourceVerseReadable} is cross-referenced with ${targetVerseReadable}. These verses are thematically related and provide additional biblical context.`;
          
          // Generate unique ID
          const recordId = `crossref:${verseId}:${refId}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
          
          records.push({
            id: recordId,
            text: text,
            source_verse: sourceVerseReadable,
            target_verse: targetVerseReadable,
            source_verse_id: sourceVerseRef,
            target_verse_id: targetVerseRef,
          });

          totalProcessed++;
        }
      }

      console.log(`  ✅ ${file}: ${totalProcessed} relationships processed`);
    } catch (error: any) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Total: ${records.length} cross-reference relationships ready for upload\n`);
  return records;
}

/**
 * Save processed records to JSON file for MCP upload
 */
async function saveRecordsForMCP(records: ProcessedRecord[]): Promise<string> {
  const outputFile = path.join(__dirname, '..', '.cross-ref-records.json');
  
  // Save in batches of 1000 for MCP processing
  const batches: ProcessedRecord[][] = [];
  for (let i = 0; i < records.length; i += 1000) {
    batches.push(records.slice(i, i + 1000));
  }

  fs.writeFileSync(outputFile, JSON.stringify({ batches, total: records.length }, null, 2));
  console.log(`📝 Saved ${batches.length} batches to ${outputFile}`);
  console.log(`   Ready for MCP upload to Pinecone\n`);
  
  return outputFile;
}

async function main() {
  console.log('🚀 Processing Cross-References for Pinecone MCP Upload...\n');
  
  try {
    const records = await processCrossReferences();
    const outputFile = await saveRecordsForMCP(records);
    
    console.log('✅ Processing complete!');
    console.log(`\n📋 Next step: Use Pinecone MCP to upload records from: ${outputFile}`);
    console.log(`   Total records: ${records.length}`);
    console.log(`   Index: cross-references`);
    console.log(`   Namespace: default (or specify)\n`);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

