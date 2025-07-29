// Bible Verse Explanation Utility
import { getVerse, BibleVerse, getAllBooks } from './local-bible';

export interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
  isValid: boolean;
}

export interface VerseExplanation {
  verse: string;
  reference: string;
  historicalBackground: string;
  theology: string;
  explanation: string;
  language: string;
}

// Language configuration
export type SupportedLanguage = 'english' | 'tamil' | 'sinhala';

export const LANGUAGE_NAMES = {
  english: 'English',
  tamil: 'Tamil',
  sinhala: 'Sinhala'
};

// Common Bible book name variations and their standard names
const BOOK_ALIASES: Record<string, string> = {
  // Old Testament
  'gen': 'Genesis', 'genesis': 'Genesis',
  'exo': 'Exodus', 'exodus': 'Exodus', 'ex': 'Exodus',
  'lev': 'Leviticus', 'leviticus': 'Leviticus',
  'num': 'Numbers', 'numbers': 'Numbers',
  'deut': 'Deuteronomy', 'deuteronomy': 'Deuteronomy', 'dt': 'Deuteronomy',
  'josh': 'Joshua', 'joshua': 'Joshua',
  'judg': 'Judges', 'judges': 'Judges',
  'ruth': 'Ruth',
  '1sam': '1 Samuel', '1 sam': '1 Samuel', '1 samuel': '1 Samuel',
  '2sam': '2 Samuel', '2 sam': '2 Samuel', '2 samuel': '2 Samuel',
  '1kings': '1 Kings', '1 kings': '1 Kings', '1 ki': '1 Kings',
  '2kings': '2 Kings', '2 kings': '2 Kings', '2 ki': '2 Kings',
  '1chr': '1 Chronicles', '1 chronicles': '1 Chronicles', '1 ch': '1 Chronicles',
  '2chr': '2 Chronicles', '2 chronicles': '2 Chronicles', '2 ch': '2 Chronicles',
  'ezra': 'Ezra',
  'neh': 'Nehemiah', 'nehemiah': 'Nehemiah',
  'esth': 'Esther', 'esther': 'Esther',
  'job': 'Job',
  'ps': 'Psalms', 'psalm': 'Psalms', 'psalms': 'Psalms',
  'prov': 'Proverbs', 'proverbs': 'Proverbs',
  'eccl': 'Ecclesiastes', 'ecclesiastes': 'Ecclesiastes', 'ecc': 'Ecclesiastes',
  'song': 'Song of Songs', 'songs': 'Song of Songs', 'song of solomon': 'Song of Songs',
  'isa': 'Isaiah', 'isaiah': 'Isaiah',
  'jer': 'Jeremiah', 'jeremiah': 'Jeremiah',
  'lam': 'Lamentations', 'lamentations': 'Lamentations',
  'ezek': 'Ezekiel', 'ezekiel': 'Ezekiel', 'eze': 'Ezekiel',
  'dan': 'Daniel', 'daniel': 'Daniel',
  'hos': 'Hosea', 'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obad': 'Obadiah', 'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'mic': 'Micah', 'micah': 'Micah',
  'nah': 'Nahum', 'nahum': 'Nahum',
  'hab': 'Habakkuk', 'habakkuk': 'Habakkuk',
  'zeph': 'Zephaniah', 'zephaniah': 'Zephaniah',
  'hag': 'Haggai', 'haggai': 'Haggai',
  'zech': 'Zechariah', 'zechariah': 'Zechariah',
  'mal': 'Malachi', 'malachi': 'Malachi',
  
  // New Testament
  'matt': 'Matthew', 'matthew': 'Matthew', 'mt': 'Matthew',
  'mark': 'Mark', 'mk': 'Mark',
  'luke': 'Luke', 'lk': 'Luke',
  'john': 'John', 'jn': 'John',
  'acts': 'Acts',
  'rom': 'Romans', 'romans': 'Romans',
  '1cor': '1 Corinthians', '1 corinthians': '1 Corinthians', '1 cor': '1 Corinthians',
  '2cor': '2 Corinthians', '2 corinthians': '2 Corinthians', '2 cor': '2 Corinthians',
  'gal': 'Galatians', 'galatians': 'Galatians',
  'eph': 'Ephesians', 'ephesians': 'Ephesians',
  'phil': 'Philippians', 'philippians': 'Philippians',
  'col': 'Colossians', 'colossians': 'Colossians',
  '1thess': '1 Thessalonians', '1 thessalonians': '1 Thessalonians', '1 thes': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2 thessalonians': '2 Thessalonians', '2 thes': '2 Thessalonians',
  '1tim': '1 Timothy', '1 timothy': '1 Timothy', '1 ti': '1 Timothy',
  '2tim': '2 Timothy', '2 timothy': '2 Timothy', '2 ti': '2 Timothy',
  'titus': 'Titus',
  'philem': 'Philemon', 'philemon': 'Philemon',
  'heb': 'Hebrews', 'hebrews': 'Hebrews',
  'james': 'James', 'jas': 'James',
  '1pet': '1 Peter', '1 peter': '1 Peter', '1 pe': '1 Peter',
  '2pet': '2 Peter', '2 peter': '2 Peter', '2 pe': '2 Peter',
  '1john': '1 John', '1 john': '1 John', '1 jn': '1 John',
  '2john': '2 John', '2 john': '2 John', '2 jn': '2 John',
  '3john': '3 John', '3 john': '3 John', '3 jn': '3 John',
  'jude': 'Jude',
  'rev': 'Revelation', 'revelation': 'Revelation', 'revelations': 'Revelation'
};

// Parse verse reference from text (e.g., "John 3:16", "Explain Romans 8:28")
export function parseVerseReference(text: string): VerseReference | null {
  // Remove common prefixes and suffixes
  const cleanText = text
    .replace(/^(explain|tell me about|what does|what is|show me)\s+/i, '')
    .replace(/\s+(mean\??|say\??|about\??|teach\??)$/i, '')
    .trim();

  // Patterns to match verse references
  const patterns = [
    // Standard format: "John 3:16"
    /^(\w+(?:\s+\w+)*)\s+(\d+):(\d+)$/i,
    // With chapter only: "John 3"
    /^(\w+(?:\s+\w+)*)\s+(\d+)$/i,
    // With numbers in book name: "1 John 3:16"
    /^(\d+\s+\w+(?:\s+\w+)*)\s+(\d+):(\d+)$/i,
    // With numbers in book name, chapter only: "1 John 3"
    /^(\d+\s+\w+(?:\s+\w+)*)\s+(\d+)$/i,
    // More flexible patterns with optional punctuation
    /(\w+(?:\s+\w+)*)\s+(\d+):(\d+)/i,
    /(\d+\s+\w+(?:\s+\w+)*)\s+(\d+):(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      const bookName = match[1].trim().toLowerCase();
      const chapter = parseInt(match[2]);
      const verse = match[3] ? parseInt(match[3]) : 1;

      // Normalize book name
      const standardBookName = BOOK_ALIASES[bookName] || 
        Object.keys(BOOK_ALIASES).find(key => 
          BOOK_ALIASES[key].toLowerCase() === bookName
        ) || 
        match[1].trim();

      return {
        book: standardBookName,
        chapter,
        verse,
        isValid: !isNaN(chapter) && !isNaN(verse) && chapter > 0 && verse > 0
      };
    }
  }

  return null;
}

// Check if text contains a verse reference
export function containsVerseReference(text: string): boolean {
  return parseVerseReference(text) !== null;
}

// Get verse text from local Bible
export async function getVerseText(
  reference: VerseReference, 
  language: 'english' | 'tamil' = 'english'
): Promise<BibleVerse | null> {
  if (!reference.isValid) {
    return null;
  }

  try {
    return await getVerse(reference.book, reference.chapter, reference.verse, language);
  } catch (error) {
    console.error('Error getting verse text:', error);
    return null;
  }
}

// Create structured Bible explanation prompt
export function createBibleExplanationPrompt(
  verse: BibleVerse,
  language: SupportedLanguage = 'english'
): string {
  const languageInstruction = language === 'english' ? 'English' :
                             language === 'tamil' ? 'Tamil' :
                             'Sinhala';

  return `You are a Bible study assistant and theological scholar.

Your task is to explain the Bible verse: ${verse.book_name} ${verse.chapter}:${verse.verse}

Verse Text: "${verse.text}"

Please provide a structured explanation following this exact format:

Verse:
${verse.book_name} ${verse.chapter}:${verse.verse} - "${verse.text}"

Historical Background:
[Provide 2-3 sentences about the historical context, time period, and circumstances when this verse was written]

Theology:
[Explain the key theological concepts, doctrines, and spiritual meaning in 2-3 sentences]

Explanation:
[Give a clear, practical explanation of what this verse means for believers today in 3-4 sentences]

Important guidelines:
- Write in ${languageInstruction} language
- Keep the total response under 300 words
- Use simple, clear language that anyone can understand
- Do not use special formatting symbols like *, #, or markdown
- Focus on practical application and spiritual insight
- Be respectful of all Christian denominations
- If the verse has multiple interpretations, mention the most widely accepted one

Respond with the structured explanation now.`;
}

// Parse AI response into structured explanation
export function parseAIExplanation(response: string, reference: VerseReference, language: SupportedLanguage): VerseExplanation {
  const sections = {
    verse: '',
    historicalBackground: '',
    theology: '',
    explanation: ''
  };

  // Split response into sections
  const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let currentSection = '';

  for (const line of lines) {
    if (line.toLowerCase().startsWith('verse:')) {
      currentSection = 'verse';
      sections.verse = line.replace(/^verse:\s*/i, '').trim();
    } else if (line.toLowerCase().startsWith('historical background:')) {
      currentSection = 'historicalBackground';
      continue;
    } else if (line.toLowerCase().startsWith('theology:')) {
      currentSection = 'theology';
      continue;
    } else if (line.toLowerCase().startsWith('explanation:')) {
      currentSection = 'explanation';
      continue;
    } else if (currentSection) {
      if (sections[currentSection as keyof typeof sections]) {
        sections[currentSection as keyof typeof sections] += ' ' + line;
      } else {
        sections[currentSection as keyof typeof sections] = line;
      }
    }
  }

  return {
    verse: sections.verse || `${reference.book} ${reference.chapter}:${reference.verse}`,
    reference: `${reference.book} ${reference.chapter}:${reference.verse}`,
    historicalBackground: sections.historicalBackground.trim(),
    theology: sections.theology.trim(),
    explanation: sections.explanation.trim(),
    language: LANGUAGE_NAMES[language]
  };
} 