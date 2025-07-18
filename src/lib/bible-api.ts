// Bible API types and constants
export interface BibleVerse {
  id: string;
  orgId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  nameLong: string;
  chapters: number;
  testament: 'Old' | 'New';
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
    description: 'The classic English translation from 1611',
    apiId: 'kjv'
  },
  { 
    id: 'niv', 
    name: 'New International Version', 
    abbreviation: 'NIV',
    language: 'English', 
    languageCode: 'en',
    description: 'Contemporary English translation balancing accuracy and readability',
    apiId: 'niv'
  },
  { 
    id: 'esv', 
    name: 'English Standard Version', 
    abbreviation: 'ESV',
    language: 'English', 
    languageCode: 'en',
    description: 'Word-for-word translation emphasizing accuracy and literary excellence',
    apiId: 'esv'
  },
  { 
    id: 'nlt', 
    name: 'New Living Translation', 
    abbreviation: 'NLT',
    language: 'English', 
    languageCode: 'en',
    description: 'Thought-for-thought translation for clarity and readability',
    apiId: 'nlt'
  },
  { 
    id: 'nasb', 
    name: 'New American Standard Bible', 
    abbreviation: 'NASB',
    language: 'English', 
    languageCode: 'en',
    description: 'Literal translation known for accuracy to original texts',
    apiId: 'nasb'
  },
  { 
    id: 'csb', 
    name: 'Christian Standard Bible', 
    abbreviation: 'CSB',
    language: 'English', 
    languageCode: 'en',
    description: 'Balance of accuracy and readability for modern readers',
    apiId: 'csb'
  },
  { 
    id: 'amp', 
    name: 'Amplified Bible', 
    abbreviation: 'AMP',
    language: 'English', 
    languageCode: 'en',
    description: 'Expanded translation with additional meanings and implications',
    apiId: 'amp'
  },
  { 
    id: 'msg', 
    name: 'The Message', 
    abbreviation: 'MSG',
    language: 'English', 
    languageCode: 'en',
    description: 'Contemporary paraphrase in modern American English',
    apiId: 'msg'
  },
  { 
    id: 'nkjv', 
    name: 'New King James Version', 
    abbreviation: 'NKJV',
    language: 'English', 
    languageCode: 'en',
    description: 'Modern language update of the King James Version',
    apiId: 'nkjv'
  },
  { 
    id: 'rsv', 
    name: 'Revised Standard Version', 
    abbreviation: 'RSV',
    language: 'English', 
    languageCode: 'en',
    description: 'Mid-20th century revision of the American Standard Version',
    apiId: 'rsv'
  },
  { 
    id: 'nrsv', 
    name: 'New Revised Standard Version', 
    abbreviation: 'NRSV',
    language: 'English', 
    languageCode: 'en',
    description: 'Updated version of RSV with inclusive language',
    apiId: 'nrsv'
  },
  { 
    id: 'cev', 
    name: 'Contemporary English Version', 
    abbreviation: 'CEV',
    language: 'English', 
    languageCode: 'en',
    description: 'Simple, clear English for all reading levels',
    apiId: 'cev'
  },
  { 
    id: 'gnt', 
    name: 'Good News Translation', 
    abbreviation: 'GNT',
    language: 'English', 
    languageCode: 'en',
    description: 'Dynamic equivalence translation for clarity',
    apiId: 'gnt'
  },
  { 
    id: 'net', 
    name: 'New English Translation', 
    abbreviation: 'NET',
    language: 'English', 
    languageCode: 'en',
    description: 'Modern translation with extensive translator notes',
    apiId: 'net'
  }
];

// Bible API endpoints with improved error handling
const BIBLE_API_BASE = 'https://api.bible.berinaniesh.xyz';
const FALLBACK_API_BASE = 'https://bible-api.com';

interface ApiBook {
  id: number;
  name: string;
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

// Fallback data to prevent crashes
const FALLBACK_BOOKS: BibleBook[] = [
  { id: '1', name: 'Genesis', nameLong: 'Genesis', chapters: 50, testament: 'Old' },
  { id: '2', name: 'Exodus', nameLong: 'Exodus', chapters: 40, testament: 'Old' },
  { id: '40', name: 'Matthew', nameLong: 'Matthew', chapters: 28, testament: 'New' },
  { id: '41', name: 'Mark', nameLong: 'Mark', chapters: 16, testament: 'New' },
  { id: '42', name: 'Luke', nameLong: 'Luke', chapters: 24, testament: 'New' },
  { id: '43', name: 'John', nameLong: 'John', chapters: 21, testament: 'New' }
];

const FALLBACK_VERSE: BibleVerse = {
  id: 'john.3.16',
  orgId: '1',
  book: '43',
  chapter: 3,
  verse: 16,
  text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  reference: 'John 3:16'
};

class BibleApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private maxRetries = 3;
  private retryDelay = 1000;

  // Enhanced error handling wrapper - now with silent error mode
  private async safeApiCall<T>(
    operation: () => Promise<T>, 
    fallback: T, 
    operationName: string,
    silent: boolean = true
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (!silent) {
          console.warn(`${operationName} attempt ${attempt} failed:`, error);
        }
        
        if (attempt === this.maxRetries) {
          if (!silent) {
            console.error(`${operationName} failed after ${this.maxRetries} attempts, using fallback`);
          }
          return fallback;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
    
    return fallback;
  }

  // Get cached data or fetch from API
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    try {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const data = await fetcher();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Cache operation failed:', error);
      return await fetcher();
    }
  }

  // Fetch books for a translation with comprehensive error handling
  async getBooks(translationId: string = 'kjv'): Promise<BibleBook[]> {
    const cacheKey = `books_${translationId}`;
    
    return this.getCachedData(cacheKey, async () => {
      return this.safeApiCall(
        async () => {
          const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
          const apiId = translation?.apiId || 'kjv';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          try {
            const response = await fetch(`${BIBLE_API_BASE}/books?translation=${apiId}`, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
            }

            const books: ApiBook[] = await response.json();
            
            if (!Array.isArray(books) || books.length === 0) {
              throw new Error('Invalid books data received');
            }
            
            return books.map(book => ({
              id: book.id.toString(),
              name: book.name,
              nameLong: book.name,
              chapters: book.total_chapters,
              testament: book.testament === 'ot' ? 'Old' : 'New'
            }));
          } finally {
            clearTimeout(timeoutId);
          }
        },
        FALLBACK_BOOKS,
        'getBooks',
        true // Silent mode
      );
    });
  }

  // Fetch chapter verses with enhanced error handling
  async fetchChapter(bookId: string, chapter: number, translationId: string = 'kjv'): Promise<BibleVerse[]> {
    const cacheKey = `chapter_${bookId}_${chapter}_${translationId}`;
    
    return this.getCachedData(cacheKey, async () => {
      return this.safeApiCall(
        async () => {
          const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
          const apiId = translation?.apiId || 'kjv';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
          
          try {
            const response = await fetch(`${BIBLE_API_BASE}/chapter?book_id=${bookId}&chapter=${chapter}&translation=${apiId}`, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
            }

            const data: ApiChapterResponse = await response.json();
            
            if (!data.verses || !Array.isArray(data.verses) || data.verses.length === 0) {
              throw new Error('Invalid chapter data received');
            }
            
            return data.verses.map(verse => ({
              id: `${bookId}.${chapter}.${verse.verse}`,
              orgId: verse.id.toString(),
              book: bookId,
              chapter: verse.chapter,
              verse: verse.verse,
              text: verse.text || '',
              reference: `${data.book_name} ${verse.chapter}:${verse.verse}`
            }));
          } finally {
            clearTimeout(timeoutId);
          }
        },
        [FALLBACK_VERSE],
        'fetchChapter',
        true // Silent mode
      );
    });
  }

  // Search verses with enhanced error handling
  async searchVerses(query: string, translationId: string = 'kjv', limit: number = 20): Promise<BibleVerse[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const cacheKey = `search_${query}_${translationId}_${limit}`;
    
    return this.getCachedData(cacheKey, async () => {
      return this.safeApiCall(
        async () => {
          const translation = BIBLE_TRANSLATIONS.find(t => t.id === translationId);
          const apiId = translation?.apiId || 'kjv';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for search
          
          try {
            const response = await fetch(`${BIBLE_API_BASE}/search?q=${encodeURIComponent(query)}&translation=${apiId}&limit=${limit}`, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`Search request failed: ${response.status} - ${response.statusText}`);
            }

            const verses: ApiVerse[] = await response.json();
            
            if (!Array.isArray(verses)) {
              throw new Error('Invalid search results received');
            }
            
            return verses.map(verse => ({
              id: `${verse.book_id}.${verse.chapter}.${verse.verse}`,
              orgId: verse.id.toString(),
              book: verse.book_id.toString(),
              chapter: verse.chapter,
              verse: verse.verse,
              text: verse.text || '',
              reference: `Book ${verse.book_id} ${verse.chapter}:${verse.verse}`
            }));
          } finally {
            clearTimeout(timeoutId);
          }
        },
        [],
        'searchVerses',
        true // Silent mode
      );
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

  // Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
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