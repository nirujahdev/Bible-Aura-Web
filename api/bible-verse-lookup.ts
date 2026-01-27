// Server-side Bible verse text API endpoint
// Fetches exact verse text from Bible JSON files

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VerseLookupRequest {
  reference: string;
  language: 'en' | 'ta';
}

interface VerseLookupResponse {
  reference: string;
  verseText: string;
  book: string;
  chapter: number;
  verse: number;
}

// Book name normalization map
const BOOK_NAME_MAP: Record<string, string> = {
  'Gen': 'Genesis', 'Ex': 'Exodus', 'Lev': 'Leviticus', 'Num': 'Numbers', 'Deut': 'Deuteronomy',
  'Josh': 'Joshua', 'Judg': 'Judges', 'Ruth': 'Ruth', '1 Sam': '1 Samuel', '2 Sam': '2 Samuel',
  '1 Kings': '1 Kings', '2 Kings': '2 Kings', '1 Chron': '1 Chronicles', '2 Chron': '2 Chronicles',
  'Ezra': 'Ezra', 'Neh': 'Nehemiah', 'Esth': 'Esther', 'Job': 'Job', 'Ps': 'Psalms', 'Prov': 'Proverbs',
  'Eccl': 'Ecclesiastes', 'Song': 'Song of Solomon', 'Isa': 'Isaiah', 'Jer': 'Jeremiah',
  'Lam': 'Lamentations', 'Ezek': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea', 'Joel': 'Joel',
  'Amos': 'Amos', 'Obad': 'Obadiah', 'Jonah': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum',
  'Hab': 'Habakkuk', 'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi',
  'Matt': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John', 'Acts': 'Acts',
  'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians', 'Gal': 'Galatians',
  'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians', '1 Thess': '1 Thessalonians',
  '2 Thess': '2 Thessalonians', '1 Tim': '1 Timothy', '2 Tim': '2 Timothy', 'Titus': 'Titus',
  'Phlm': 'Philemon', 'Heb': 'Hebrews', 'James': 'James', '1 Pet': '1 Peter', '2 Pet': '2 Peter',
  '1 John': '1 John', '2 John': '2 John', '3 John': '3 John', 'Jude': 'Jude', 'Rev': 'Revelation'
};

function normalizeBookName(bookName: string): string {
  const trimmed = bookName.trim();
  return BOOK_NAME_MAP[trimmed] || trimmed;
}

function parseVerseReference(ref: string): { book: string; chapter: number; verse: number } | null {
  // Pattern: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
  const pattern = /^(\d*\s*[A-Za-z]+\.?\s*)\s*(\d+):(\d+)(?:-(\d+))?$/;
  const match = ref.match(pattern);
  
  if (!match) {
    return null;
  }

  const bookName = normalizeBookName(match[1].trim());
  const chapter = parseInt(match[2]);
  const verse = parseInt(match[3]);

  return { book: bookName, chapter, verse };
}

async function loadEnglishVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  try {
    const kjvPath = path.join(__dirname, '..', 'public', 'Bible', 'KJV_bible.json');
    
    if (!fs.existsSync(kjvPath)) {
      console.error(`KJV Bible file not found: ${kjvPath}`);
      return null;
    }

    const kjvData = JSON.parse(fs.readFileSync(kjvPath, 'utf-8'));
    const bookData = kjvData[book];
    
    if (!bookData) {
      return null;
    }

    const chapterData = bookData[chapter.toString()];
    if (!chapterData) {
      return null;
    }

    const verseText = chapterData[verse.toString()];
    return verseText || null;
  } catch (error) {
    console.error(`[Bible Lookup] Error loading English verse:`, error);
    return null;
  }
}

async function loadTamilVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  try {
    const tamilPath = path.join(__dirname, '..', 'public', 'Bible', 'Tamil bible', `${book}.json`);
    
    if (!fs.existsSync(tamilPath)) {
      console.error(`Tamil Bible file not found: ${tamilPath}`);
      return null;
    }

    const bookData = JSON.parse(fs.readFileSync(tamilPath, 'utf-8'));
    const chapterData = bookData[chapter.toString()];
    
    if (!chapterData) {
      return null;
    }

    const verseText = chapterData[verse.toString()];
    return verseText || null;
  } catch (error) {
    console.error(`[Bible Lookup] Error loading Tamil verse:`, error);
    return null;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { reference, language }: VerseLookupRequest = req.body;

    if (!reference || typeof reference !== 'string') {
      res.status(400).json({ error: 'Reference is required' });
      return;
    }

    if (!language || (language !== 'en' && language !== 'ta')) {
      res.status(400).json({ error: 'Language must be "en" or "ta"' });
      return;
    }

    // Parse verse reference
    const parsed = parseVerseReference(reference);
    if (!parsed) {
      res.status(400).json({ error: `Invalid verse reference format: ${reference}` });
      return;
    }

    // Load verse text
    const verseText = language === 'en' 
      ? await loadEnglishVerse(parsed.book, parsed.chapter, parsed.verse)
      : await loadTamilVerse(parsed.book, parsed.chapter, parsed.verse);

    if (!verseText) {
      res.status(404).json({ 
        error: `Verse not found: ${reference}`,
        book: parsed.book,
        chapter: parsed.chapter,
        verse: parsed.verse
      });
      return;
    }

    const response: VerseLookupResponse = {
      reference,
      verseText,
      book: parsed.book,
      chapter: parsed.chapter,
      verse: parsed.verse
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('[Bible Verse Lookup] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

