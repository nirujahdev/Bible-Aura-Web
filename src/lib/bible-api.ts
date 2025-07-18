// Real Bible API Service with actual API calls
// Supports Tamil, English, and multiple translations through berinaniesh API

export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: number;
  testament: 'Old' | 'New';
}

export interface BibleVerse {
  id: string;
  orgId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  languageCode: string;
  description: string;
  apiId: string;
}

// Real translations available through berinaniesh API
export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // English Translations
  { 
    id: 'kjv', 
    name: 'King James Version', 
    abbreviation: 'KJV',
    language: 'English', 
    languageCode: 'en',
    description: 'The classic 1611 King James Bible',
    apiId: 'kjv'
  },
  { 
    id: 'asv', 
    name: 'American Standard Version', 
    abbreviation: 'ASV',
    language: 'English', 
    languageCode: 'en',
    description: 'American Standard Version 1901',
    apiId: 'asv'
  },
  { 
    id: 'web', 
    name: 'World English Bible', 
    abbreviation: 'WEB',
    language: 'English', 
    languageCode: 'en',
    description: 'World English Bible 2020',
    apiId: 'web'
  },
  { 
    id: 'webu', 
    name: 'World English Bible Updated', 
    abbreviation: 'WEBU',
    language: 'English', 
    languageCode: 'en',
    description: 'World English Bible Updated 2020',
    apiId: 'webu'
  },

  // Tamil Translation
  { 
    id: 'tamil-ov', 
    name: 'Tamil Old Version Bible', 
    abbreviation: 'TOVBSI',
    language: 'Tamil', 
    languageCode: 'ta',
    description: 'தமிழ் பழைய வேத வாசன் வேதம் (1957)',
    apiId: 'tovbsi'
  },

  // Other Indian Languages
  { 
    id: 'malayalam', 
    name: 'Malayalam Sathya Veda Pusthakam', 
    abbreviation: 'MLSVP',
    language: 'Malayalam', 
    languageCode: 'ml',
    description: 'Malayalam Bible 1910',
    apiId: 'mlsvp'
  },
  { 
    id: 'gujarati', 
    name: 'Gujarati Old Version Bible', 
    abbreviation: 'GOVBSI',
    language: 'Gujarati', 
    languageCode: 'gu',
    description: 'Gujarati Bible 1908',
    apiId: 'govbsi'
  },
  { 
    id: 'odia', 
    name: 'Odia Old Version Bible', 
    abbreviation: 'OOVBSI',
    language: 'Odia', 
    languageCode: 'or',
    description: 'Odia Bible 1958',
    apiId: 'oovbsi'
  },

  // Sinhala Translation
  { 
    id: 'sinhala', 
    name: 'Sinhala Bible', 
    abbreviation: 'SIN',
    language: 'Sinhala', 
    languageCode: 'si',
    description: 'සිංහල බයිබලය',
    apiId: 'sinhala'
  }
];

// Bible API endpoints
const BIBLE_API_BASE = 'https://api.bible.berinaniesh.xyz';
const FALLBACK_API_BASE = 'https://bible-api.com';

interface ApiBook {
  id: number;
  name: string;
  translation_id: string;
  total_chapters: number;
  testament: string;
}

interface ApiVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  translation_id: string;
}

interface ApiChapterResponse {
  verses: ApiVerse[];
  book_name: string;
  chapter: number;
  translation: string;
}

class BibleApiService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // Get cached data or fetch from API
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Fetch books for a translation
  async getBooks(translationId: string = 'kjv'): Promise<BibleBook[]> {
    const cacheKey = `books_${translationId}`;
    
    return this.getCachedData(cacheKey, async () => {
      try {
        const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
        const apiId = translation?.apiId || 'kjv';
        
        const response = await fetch(`${BIBLE_API_BASE}/books?translation=${apiId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const books: ApiBook[] = await response.json();
        
        return books.map(book => ({
          id: book.id.toString(),
          name: book.name,
          nameLong: book.name,
          chapters: book.total_chapters,
          testament: book.testament === 'ot' ? 'Old' : 'New'
        }));
      } catch (error) {
        console.error('Error fetching books:', error);
        // Return fallback book list
        return this.getFallbackBooks();
      }
    });
  }

  // Fetch chapter verses
  async fetchChapter(bookId: string, chapter: number, translationId: string = 'kjv'): Promise<BibleVerse[]> {
    const cacheKey = `chapter_${bookId}_${chapter}_${translationId}`;
    
    return this.getCachedData(cacheKey, async () => {
      try {
        const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
        const apiId = translation?.apiId || 'kjv';
        
        const response = await fetch(`${BIBLE_API_BASE}/chapter?book_id=${bookId}&chapter=${chapter}&translation=${apiId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data: ApiChapterResponse = await response.json();
        
        return data.verses.map(verse => ({
          id: `${bookId}.${chapter}.${verse.verse}`,
          orgId: verse.id.toString(),
          book: bookId,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          reference: `${data.book_name} ${verse.chapter}:${verse.verse}`
        }));
      } catch (error) {
        console.error('Error fetching chapter:', error);
        // Try fallback API
        return this.fetchChapterFallback(bookId, chapter, translationId);
      }
    });
  }

  // Search verses
  async searchVerses(query: string, translationId: string = 'kjv', limit: number = 20): Promise<BibleVerse[]> {
    const cacheKey = `search_${query}_${translationId}_${limit}`;
    
    return this.getCachedData(cacheKey, async () => {
      try {
        const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
        const apiId = translation?.apiId || 'kjv';
        
        const response = await fetch(`${BIBLE_API_BASE}/search?q=${encodeURIComponent(query)}&translation=${apiId}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const verses: ApiVerse[] = await response.json();
        
        return verses.map(verse => ({
          id: `${verse.book_id}.${verse.chapter}.${verse.verse}`,
          orgId: verse.id.toString(),
          book: verse.book_id.toString(),
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          reference: `Book ${verse.book_id} ${verse.chapter}:${verse.verse}`
        }));
      } catch (error) {
        console.error('Error searching verses:', error);
        return [];
      }
    });
  }

  // Get verse by reference (e.g., "John 3:16")
  async getVerseByReference(reference: string, translationId: string = 'kjv'): Promise<BibleVerse | null> {
    try {
      // Parse reference like "John 3:16" or "JHN.3.16"
      const parsed = this.parseReference(reference);
      if (!parsed) return null;

      const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
      const apiId = translation?.apiId || 'kjv';
      
      const response = await fetch(`${BIBLE_API_BASE}/verse?book=${parsed.book}&chapter=${parsed.chapter}&verse=${parsed.verse}&translation=${apiId}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const verse: ApiVerse = await response.json();
      
      return {
        id: `${verse.book_id}.${verse.chapter}.${verse.verse}`,
        orgId: verse.id.toString(),
        book: verse.book_id.toString(),
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        reference: `${parsed.bookName} ${verse.chapter}:${verse.verse}`
      };
    } catch (error) {
      console.error('Error getting verse by reference:', error);
      return null;
    }
  }

  // Get daily verse
  async getDailyVerse(translationId: string = 'kjv'): Promise<BibleVerse | null> {
    try {
      const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
      const apiId = translation?.apiId || 'kjv';
      
      const response = await fetch(`${BIBLE_API_BASE}/daily?translation=${apiId}`);
      
      if (!response.ok) {
        // Fallback to a popular verse
        return this.getVerseByReference('John 3:16', translationId);
      }

      const verse: ApiVerse = await response.json();
      
      return {
        id: `${verse.book_id}.${verse.chapter}.${verse.verse}`,
        orgId: verse.id.toString(),
        book: verse.book_id.toString(),
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        reference: `Book ${verse.book_id} ${verse.chapter}:${verse.verse}`
      };
    } catch (error) {
      console.error('Error getting daily verse:', error);
      return this.getVerseByReference('John 3:16', translationId);
    }
  }

  // Fallback chapter fetch using bible-api.com
  private async fetchChapterFallback(bookId: string, chapter: number, translationId: string): Promise<BibleVerse[]> {
    try {
      // Use bible-api.com as fallback (only supports English)
      if (translationId !== 'kjv' && translationId !== 'web') {
        return [];
      }

      const bookName = this.getBookNameFromId(bookId);
      const response = await fetch(`${FALLBACK_API_BASE}/${bookName}+${chapter}`);
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      return data.verses.map((verse: { book: string; chapter: number; verse: number; text: string }, index: number) => ({
        id: `${bookId}.${chapter}.${index + 1}`,
        orgId: `${bookId}.${chapter}.${index + 1}`,
        book: bookId,
        chapter: chapter,
        verse: index + 1,
        text: verse.text,
        reference: `${data.reference} ${index + 1}`
      }));
    } catch (error) {
      console.error('Fallback API error:', error);
      return [];
    }
  }

  // Parse reference strings
  private parseReference(reference: string): { book: string, bookName: string, chapter: number, verse: number } | null {
    // Handle "John 3:16" format
    const match = reference.match(/(\w+)\s*(\d+):(\d+)/);
    if (match) {
      const [, bookName, chapter, verse] = match;
      return {
        book: this.getBookIdFromName(bookName),
        bookName: bookName,
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      };
    }

    // Handle "JHN.3.16" format
    const dotMatch = reference.match(/(\w+)\.(\d+)\.(\d+)/);
    if (dotMatch) {
      const [, bookId, chapter, verse] = dotMatch;
      return {
        book: bookId,
        bookName: this.getBookNameFromId(bookId),
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      };
    }

    return null;
  }

  // Book name mappings
  private getBookIdFromName(name: string): string {
    const mappings: Record<string, string> = {
      'genesis': '1', 'gen': '1',
      'exodus': '2', 'exo': '2', 'ex': '2',
      'leviticus': '3', 'lev': '3',
      'numbers': '4', 'num': '4',
      'deuteronomy': '5', 'deut': '5', 'deu': '5',
      'joshua': '6', 'josh': '6', 'jos': '6',
      'judges': '7', 'judg': '7', 'jdg': '7',
      'ruth': '8', 'rut': '8',
      'samuel': '9', '1samuel': '9', '1sam': '9', '1sa': '9',
      '2samuel': '10', '2sam': '10', '2sa': '10',
      'kings': '11', '1kings': '11', '1kgs': '11', '1ki': '11',
      '2kings': '12', '2kgs': '12', '2ki': '12',
      'chronicles': '13', '1chronicles': '13', '1chr': '13', '1ch': '13',
      '2chronicles': '14', '2chr': '14', '2ch': '14',
      'ezra': '15', 'ezr': '15',
      'nehemiah': '16', 'neh': '16',
      'esther': '17', 'est': '17',
      'job': '18',
      'psalms': '19', 'psalm': '19', 'psa': '19', 'ps': '19',
      'proverbs': '20', 'prov': '20', 'pro': '20',
      'ecclesiastes': '21', 'eccl': '21', 'ecc': '21',
      'song': '22', 'songs': '22', 'sng': '22',
      'isaiah': '23', 'isa': '23',
      'jeremiah': '24', 'jer': '24',
      'lamentations': '25', 'lam': '25',
      'ezekiel': '26', 'ezek': '26', 'ezk': '26',
      'daniel': '27', 'dan': '27',
      'hosea': '28', 'hos': '28',
      'joel': '29', 'joe': '29', 'jol': '29',
      'amos': '30', 'amo': '30',
      'obadiah': '31', 'obad': '31', 'oba': '31',
      'jonah': '32', 'jon': '32',
      'micah': '33', 'mic': '33',
      'nahum': '34', 'nah': '34', 'nam': '34',
      'habakkuk': '35', 'hab': '35',
      'zephaniah': '36', 'zeph': '36', 'zep': '36',
      'haggai': '37', 'hag': '37',
      'zechariah': '38', 'zech': '38', 'zec': '38',
      'malachi': '39', 'mal': '39',
      'matthew': '40', 'matt': '40', 'mat': '40',
      'mark': '41', 'mrk': '41',
      'luke': '42', 'luk': '42',
      'john': '43', 'jhn': '43',
      'acts': '44', 'act': '44',
      'romans': '45', 'rom': '45',
      'corinthians': '46', '1corinthians': '46', '1cor': '46', '1co': '46',
      '2corinthians': '47', '2cor': '47', '2co': '47',
      'galatians': '48', 'gal': '48',
      'ephesians': '49', 'eph': '49',
      'philippians': '50', 'phil': '50', 'php': '50',
      'colossians': '51', 'col': '51',
      'thessalonians': '52', '1thessalonians': '52', '1thess': '52', '1th': '52',
      '2thessalonians': '53', '2thess': '53', '2th': '53',
      'timothy': '54', '1timothy': '54', '1tim': '54', '1ti': '54',
      '2timothy': '55', '2tim': '55', '2ti': '55',
      'titus': '56', 'tit': '56',
      'philemon': '57', 'phlm': '57',
      'hebrews': '58', 'heb': '58',
      'james': '59', 'jas': '59', 'jam': '59',
      'peter': '60', '1peter': '60', '1pet': '60', '1pe': '60',
      '2peter': '61', '2pet': '61', '2pe': '61',
      'john1': '62', '1john': '62', '1jn': '62',
      'john2': '63', '2john': '63', '2jn': '63',
      'john3': '64', '3john': '64', '3jn': '64',
      'jude': '65', 'jud': '65',
      'revelation': '66', 'rev': '66'
    };
    
    return mappings[name.toLowerCase()] || '43'; // Default to John
  }

  private getBookNameFromId(id: string): string {
    const names: Record<string, string> = {
      '1': 'Genesis', '2': 'Exodus', '3': 'Leviticus', '4': 'Numbers', '5': 'Deuteronomy',
      '6': 'Joshua', '7': 'Judges', '8': 'Ruth', '9': '1 Samuel', '10': '2 Samuel',
      '11': '1 Kings', '12': '2 Kings', '13': '1 Chronicles', '14': '2 Chronicles', '15': 'Ezra',
      '16': 'Nehemiah', '17': 'Esther', '18': 'Job', '19': 'Psalms', '20': 'Proverbs',
      '21': 'Ecclesiastes', '22': 'Song of Songs', '23': 'Isaiah', '24': 'Jeremiah', '25': 'Lamentations',
      '26': 'Ezekiel', '27': 'Daniel', '28': 'Hosea', '29': 'Joel', '30': 'Amos',
      '31': 'Obadiah', '32': 'Jonah', '33': 'Micah', '34': 'Nahum', '35': 'Habakkuk',
      '36': 'Zephaniah', '37': 'Haggai', '38': 'Zechariah', '39': 'Malachi', '40': 'Matthew',
      '41': 'Mark', '42': 'Luke', '43': 'John', '44': 'Acts', '45': 'Romans',
      '46': '1 Corinthians', '47': '2 Corinthians', '48': 'Galatians', '49': 'Ephesians', '50': 'Philippians',
      '51': 'Colossians', '52': '1 Thessalonians', '53': '2 Thessalonians', '54': '1 Timothy', '55': '2 Timothy',
      '56': 'Titus', '57': 'Philemon', '58': 'Hebrews', '59': 'James', '60': '1 Peter',
      '61': '2 Peter', '62': '1 John', '63': '2 John', '64': '3 John', '65': 'Jude', '66': 'Revelation'
    };
    
    return names[id] || 'John';
  }

  // Fallback book list
  private getFallbackBooks(): BibleBook[] {
    return [
      { id: '40', name: 'Matthew', nameLong: 'The Gospel According to Matthew', chapters: 28, testament: 'New' },
      { id: '41', name: 'Mark', nameLong: 'The Gospel According to Mark', chapters: 16, testament: 'New' },
      { id: '42', name: 'Luke', nameLong: 'The Gospel According to Luke', chapters: 24, testament: 'New' },
      { id: '43', name: 'John', nameLong: 'The Gospel According to John', chapters: 21, testament: 'New' },
      { id: '44', name: 'Acts', nameLong: 'The Acts of the Apostles', chapters: 28, testament: 'New' },
      { id: '45', name: 'Romans', nameLong: 'The Epistle to the Romans', chapters: 16, testament: 'New' },
      { id: '46', name: '1 Corinthians', nameLong: 'The First Epistle to the Corinthians', chapters: 16, testament: 'New' },
      { id: '47', name: '2 Corinthians', nameLong: 'The Second Epistle to the Corinthians', chapters: 13, testament: 'New' },
      { id: '48', name: 'Galatians', nameLong: 'The Epistle to the Galatians', chapters: 6, testament: 'New' },
      { id: '49', name: 'Ephesians', nameLong: 'The Epistle to the Ephesians', chapters: 6, testament: 'New' },
      { id: '19', name: 'Psalms', nameLong: 'The Book of Psalms', chapters: 150, testament: 'Old' },
      { id: '20', name: 'Proverbs', nameLong: 'The Book of Proverbs', chapters: 31, testament: 'Old' },
      { id: '1', name: 'Genesis', nameLong: 'The Book of Genesis', chapters: 50, testament: 'Old' },
      { id: '23', name: 'Isaiah', nameLong: 'The Book of Isaiah', chapters: 66, testament: 'Old' }
    ];
  }
}

// Export singleton instance
export const bibleApi = new BibleApiService();
export default bibleApi;