// Push Cross-References to Pinecone using MCP
// Run: node scripts/push-to-pinecone-mcp.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ABBREVIATION_TO_BOOK = {
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

function convertFromCrossRefFormat(ref) {
  const parts = ref.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const [abbrev, chapter, verse] = parts;
  const bookName = ABBREVIATION_TO_BOOK[abbrev];
  if (!bookName) return null;
  return `${bookName} ${chapter}:${verse}`;
}

function processCrossReferences() {
  const crossRefDir = path.join(__dirname, '..', 'bible-cross-reference-json');
  const files = fs.readdirSync(crossRefDir)
    .filter(f => f.endsWith('.json') && f !== 'LICENSE')
    .sort((a, b) => parseInt(a.replace('.json', '')) - parseInt(b.replace('.json', '')));

  const records = [];
  let total = 0;

  console.log(`\n📂 Processing ${files.length} files...\n`);

  for (const file of files) {
    try {
      const filePath = path.join(crossRefDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      for (const [verseId, verseData] of Object.entries(data)) {
        const sourceVerseRef = verseData.v;
        const sourceVerseReadable = convertFromCrossRefFormat(sourceVerseRef);
        
        if (!sourceVerseReadable || !verseData.r) continue;
        
        for (const [refId, targetVerseRef] of Object.entries(verseData.r)) {
          const targetVerseReadable = convertFromCrossRefFormat(targetVerseRef);
          if (!targetVerseReadable) continue;

          const text = `${sourceVerseReadable} is cross-referenced with ${targetVerseReadable}. These verses are thematically related and provide additional biblical context.`;
          const recordId = `crossref:${verseId}:${refId}`.replace(/[^a-zA-Z0-9:_-]/g, '_');
          
          records.push({
            id: recordId,
            text: text,
            source_verse: sourceVerseReadable,
            target_verse: targetVerseReadable,
            source_verse_id: sourceVerseRef,
            target_verse_id: targetVerseRef,
          });

          total++;
        }
      }

      console.log(`  ✅ ${file}: ${total} relationships`);
    } catch (error) {
      console.error(`  ❌ ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Total: ${records.length} records ready\n`);
  return records;
}

// Process and save
const records = processCrossReferences();
const batches = [];
for (let i = 0; i < records.length; i += 100) {
  batches.push(records.slice(i, i + 100));
}

const output = {
  batches,
  total: records.length,
  index: 'cross-references',
  namespace: ''
};

fs.writeFileSync(
  path.join(__dirname, '..', '.mcp-upload-ready.json'),
  JSON.stringify(output, null, 2)
);

console.log(`📝 Saved ${batches.length} batches to .mcp-upload-ready.json`);
console.log(`   Ready for MCP upload!\n`);

