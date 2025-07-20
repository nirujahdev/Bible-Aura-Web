// ✦ Bible Aura - API.Bible Service Integration
// Comprehensive Bible API with Tamil, Sinhala, and English support

// API.Bible Configuration
const API_BASE_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = 'e234b1bfbc9f6acc1fa4a2ee7bb1e618';

// Enhanced Bible API types
export interface BibleVerse {
  id: string;
  orgId: string;
  book: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  bibleId: string;
}

export interface BibleBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters: BibleChapterSummary[];
}

export interface BibleChapterSummary {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  reference: string;
}

export interface BibleChapter {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  reference: string;
  verseCount: number;
  content: string;
  verses: BibleVerse[];
}

export interface BibleSummary {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
  }>;
  type: string;
  updatedAt: string;
  audioBibles?: Array<{
    id: string;
    name: string;
  }>;
}

export interface BibleTranslation {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  languageCode: string;
  description: string;
  script?: string;
  scriptDirection?: string;
  country?: string;
}

export interface SearchResult {
  query: string;
  limit: number;
  offset: number;
  total: number;
  verseCount: number;
  verses: Array<{
    id: string;
    orgId: string;
    bookId: string;
    chapterId: string;
    text: string;
    reference: string;
  }>;
}

// Supported Bible translations with their API.Bible IDs
export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // English Translations
  { 
    id: 'de4e12af7f28f599-02', 
    name: 'King James Version', 
    abbreviation: 'KJV',
    language: 'English', 
    languageCode: 'en',
    description: 'The classic English translation from 1611',
    script: 'Latin',
    scriptDirection: 'ltr',
    country: 'US'
  },
  { 
    id: '71c6eab17ae5b667-01', 
    name: 'New International Version', 
    abbreviation: 'NIV',
    language: 'English', 
    languageCode: 'en',
    description: 'Contemporary English translation balancing accuracy and readability',
    script: 'Latin',
    scriptDirection: 'ltr',
    country: 'US'
  },
  { 
    id: '06125adad2d5898a-01', 
    name: 'New Revised Standard Version', 
    abbreviation: 'NRSV',
    language: 'English', 
    languageCode: 'en',
    description: 'Academic translation with inclusive language',
    script: 'Latin',
    scriptDirection: 'ltr',
    country: 'US'
  },
  { 
    id: '592420522e16049f-01', 
    name: 'English Standard Version', 
    abbreviation: 'ESV',
    language: 'English', 
    languageCode: 'en',
    description: 'Literal translation maintaining readability',
    script: 'Latin',
    scriptDirection: 'ltr',
    country: 'US'
  },
  
  // Tamil Translations
  { 
    id: 'b61f396c3554d5c7-01', 
    name: 'Tamil Bible (Indian Revised Version)', 
    abbreviation: 'IRV-TAM',
    language: 'Tamil', 
    languageCode: 'ta',
    description: 'Indian Revised Version in Tamil',
    script: 'Tamil',
    scriptDirection: 'ltr',
    country: 'IN'
  },
  { 
    id: 'a5fd40d2b1119ba0-01', 
    name: 'Tamil Common Language Bible', 
    abbreviation: 'TACLB',
    language: 'Tamil', 
    languageCode: 'ta',
    description: 'Contemporary Tamil translation',
    script: 'Tamil',
    scriptDirection: 'ltr',
    country: 'IN'
  },
  
  // Sinhala Translations
  { 
    id: '1a80f9d8f2a5b8ec-01', 
    name: 'Sinhala Bible', 
    abbreviation: 'SIN',
    language: 'Sinhala', 
    languageCode: 'si',
    description: 'Standard Sinhala Bible translation',
    script: 'Sinhala',
    scriptDirection: 'ltr',
    country: 'LK'
  },
  { 
    id: '7fbe2ff5d2b6bd67-01', 
    name: 'Sinhala Revised Bible', 
    abbreviation: 'SIN-REV',
    language: 'Sinhala', 
    languageCode: 'si',
    description: 'Revised Sinhala Bible translation',
    script: 'Sinhala',
    scriptDirection: 'ltr',
    country: 'LK'
  }
];

// Bible Books with enhanced metadata
export const BIBLE_BOOKS = [
  // Old Testament
  { id: 'GEN', name: 'Genesis', nameLong: 'Genesis', testament: 'Old', category: 'Pentateuch' },
  { id: 'EXO', name: 'Exodus', nameLong: 'Exodus', testament: 'Old', category: 'Pentateuch' },
  { id: 'LEV', name: 'Leviticus', nameLong: 'Leviticus', testament: 'Old', category: 'Pentateuch' },
  { id: 'NUM', name: 'Numbers', nameLong: 'Numbers', testament: 'Old', category: 'Pentateuch' },
  { id: 'DEU', name: 'Deuteronomy', nameLong: 'Deuteronomy', testament: 'Old', category: 'Pentateuch' },
  { id: 'JOS', name: 'Joshua', nameLong: 'Joshua', testament: 'Old', category: 'Historical' },
  { id: 'JDG', name: 'Judges', nameLong: 'Judges', testament: 'Old', category: 'Historical' },
  { id: 'RUT', name: 'Ruth', nameLong: 'Ruth', testament: 'Old', category: 'Historical' },
  { id: '1SA', name: '1 Samuel', nameLong: '1 Samuel', testament: 'Old', category: 'Historical' },
  { id: '2SA', name: '2 Samuel', nameLong: '2 Samuel', testament: 'Old', category: 'Historical' },
  { id: '1KI', name: '1 Kings', nameLong: '1 Kings', testament: 'Old', category: 'Historical' },
  { id: '2KI', name: '2 Kings', nameLong: '2 Kings', testament: 'Old', category: 'Historical' },
  { id: '1CH', name: '1 Chronicles', nameLong: '1 Chronicles', testament: 'Old', category: 'Historical' },
  { id: '2CH', name: '2 Chronicles', nameLong: '2 Chronicles', testament: 'Old', category: 'Historical' },
  { id: 'EZR', name: 'Ezra', nameLong: 'Ezra', testament: 'Old', category: 'Historical' },
  { id: 'NEH', name: 'Nehemiah', nameLong: 'Nehemiah', testament: 'Old', category: 'Historical' },
  { id: 'EST', name: 'Esther', nameLong: 'Esther', testament: 'Old', category: 'Historical' },
  { id: 'JOB', name: 'Job', nameLong: 'Job', testament: 'Old', category: 'Wisdom' },
  { id: 'PSA', name: 'Psalms', nameLong: 'Psalms', testament: 'Old', category: 'Wisdom' },
  { id: 'PRO', name: 'Proverbs', nameLong: 'Proverbs', testament: 'Old', category: 'Wisdom' },
  { id: 'ECC', name: 'Ecclesiastes', nameLong: 'Ecclesiastes', testament: 'Old', category: 'Wisdom' },
  { id: 'SNG', name: 'Song of Songs', nameLong: 'Song of Songs', testament: 'Old', category: 'Wisdom' },
  { id: 'ISA', name: 'Isaiah', nameLong: 'Isaiah', testament: 'Old', category: 'Major Prophets' },
  { id: 'JER', name: 'Jeremiah', nameLong: 'Jeremiah', testament: 'Old', category: 'Major Prophets' },
  { id: 'LAM', name: 'Lamentations', nameLong: 'Lamentations', testament: 'Old', category: 'Major Prophets' },
  { id: 'EZK', name: 'Ezekiel', nameLong: 'Ezekiel', testament: 'Old', category: 'Major Prophets' },
  { id: 'DAN', name: 'Daniel', nameLong: 'Daniel', testament: 'Old', category: 'Major Prophets' },
  { id: 'HOS', name: 'Hosea', nameLong: 'Hosea', testament: 'Old', category: 'Minor Prophets' },
  { id: 'JOL', name: 'Joel', nameLong: 'Joel', testament: 'Old', category: 'Minor Prophets' },
  { id: 'AMO', name: 'Amos', nameLong: 'Amos', testament: 'Old', category: 'Minor Prophets' },
  { id: 'OBA', name: 'Obadiah', nameLong: 'Obadiah', testament: 'Old', category: 'Minor Prophets' },
  { id: 'JON', name: 'Jonah', nameLong: 'Jonah', testament: 'Old', category: 'Minor Prophets' },
  { id: 'MIC', name: 'Micah', nameLong: 'Micah', testament: 'Old', category: 'Minor Prophets' },
  { id: 'NAM', name: 'Nahum', nameLong: 'Nahum', testament: 'Old', category: 'Minor Prophets' },
  { id: 'HAB', name: 'Habakkuk', nameLong: 'Habakkuk', testament: 'Old', category: 'Minor Prophets' },
  { id: 'ZEP', name: 'Zephaniah', nameLong: 'Zephaniah', testament: 'Old', category: 'Minor Prophets' },
  { id: 'HAG', name: 'Haggai', nameLong: 'Haggai', testament: 'Old', category: 'Minor Prophets' },
  { id: 'ZEC', name: 'Zechariah', nameLong: 'Zechariah', testament: 'Old', category: 'Minor Prophets' },
  { id: 'MAL', name: 'Malachi', nameLong: 'Malachi', testament: 'Old', category: 'Minor Prophets' },
  
  // New Testament
  { id: 'MAT', name: 'Matthew', nameLong: 'Matthew', testament: 'New', category: 'Gospels' },
  { id: 'MRK', name: 'Mark', nameLong: 'Mark', testament: 'New', category: 'Gospels' },
  { id: 'LUK', name: 'Luke', nameLong: 'Luke', testament: 'New', category: 'Gospels' },
  { id: 'JHN', name: 'John', nameLong: 'John', testament: 'New', category: 'Gospels' },
  { id: 'ACT', name: 'Acts', nameLong: 'Acts', testament: 'New', category: 'Historical' },
  { id: 'ROM', name: 'Romans', nameLong: 'Romans', testament: 'New', category: 'Pauline Epistles' },
  { id: '1CO', name: '1 Corinthians', nameLong: '1 Corinthians', testament: 'New', category: 'Pauline Epistles' },
  { id: '2CO', name: '2 Corinthians', nameLong: '2 Corinthians', testament: 'New', category: 'Pauline Epistles' },
  { id: 'GAL', name: 'Galatians', nameLong: 'Galatians', testament: 'New', category: 'Pauline Epistles' },
  { id: 'EPH', name: 'Ephesians', nameLong: 'Ephesians', testament: 'New', category: 'Pauline Epistles' },
  { id: 'PHP', name: 'Philippians', nameLong: 'Philippians', testament: 'New', category: 'Pauline Epistles' },
  { id: 'COL', name: 'Colossians', nameLong: 'Colossians', testament: 'New', category: 'Pauline Epistles' },
  { id: '1TH', name: '1 Thessalonians', nameLong: '1 Thessalonians', testament: 'New', category: 'Pauline Epistles' },
  { id: '2TH', name: '2 Thessalonians', nameLong: '2 Thessalonians', testament: 'New', category: 'Pauline Epistles' },
  { id: '1TI', name: '1 Timothy', nameLong: '1 Timothy', testament: 'New', category: 'Pastoral Epistles' },
  { id: '2TI', name: '2 Timothy', nameLong: '2 Timothy', testament: 'New', category: 'Pastoral Epistles' },
  { id: 'TIT', name: 'Titus', nameLong: 'Titus', testament: 'New', category: 'Pastoral Epistles' },
  { id: 'PHM', name: 'Philemon', nameLong: 'Philemon', testament: 'New', category: 'Pastoral Epistles' },
  { id: 'HEB', name: 'Hebrews', nameLong: 'Hebrews', testament: 'New', category: 'General Epistles' },
  { id: 'JAS', name: 'James', nameLong: 'James', testament: 'New', category: 'General Epistles' },
  { id: '1PE', name: '1 Peter', nameLong: '1 Peter', testament: 'New', category: 'General Epistles' },
  { id: '2PE', name: '2 Peter', nameLong: '2 Peter', testament: 'New', category: 'General Epistles' },
  { id: '1JN', name: '1 John', nameLong: '1 John', testament: 'New', category: 'General Epistles' },
  { id: '2JN', name: '2 John', nameLong: '2 John', testament: 'New', category: 'General Epistles' },
  { id: '3JN', name: '3 John', nameLong: '3 John', testament: 'New', category: 'General Epistles' },
  { id: 'JUD', name: 'Jude', nameLong: 'Jude', testament: 'New', category: 'General Epistles' },
  { id: 'REV', name: 'Revelation', nameLong: 'Revelation', testament: 'New', category: 'Apocalyptic' }
];

class BibleApiService {
  private cache = new Map<string, { data: any; timestamp: number; expires: number }>();
  private readonly cacheTimeout = 30 * 60 * 1000; // 30 minutes
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  private getHeaders(): Record<string, string> {
    return {
      'X-API-Key': API_KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  private async makeRequest<T>(endpoint: string, retries = 0): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getHeaders(),
        method: 'GET'
      });

      if (!response.ok) {
        if (response.status === 429 && retries < this.maxRetries) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retries + 1)));
          return this.makeRequest(endpoint, retries + 1);
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (retries < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retries + 1)));
        return this.makeRequest(endpoint, retries + 1);
      }
      throw error;
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, customTimeout?: number): void {
    const timeout = customTimeout || this.cacheTimeout;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + timeout
    });
  }

  // Get all available Bibles
  async getBibles(): Promise<BibleSummary[]> {
    const cacheKey = 'bibles';
    const cached = this.getCachedData<BibleSummary[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleSummary[] }>('/bibles');
      const bibles = response.data || [];
      this.setCachedData(cacheKey, bibles, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return bibles;
    } catch (error) {
      console.error('Error fetching bibles:', error);
      return [];
    }
  }

  // Get specific Bible information
  async getBible(bibleId: string): Promise<BibleSummary | null> {
    const cacheKey = `bible_${bibleId}`;
    const cached = this.getCachedData<BibleSummary>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleSummary }>(`/bibles/${bibleId}`);
      const bible = response.data;
      this.setCachedData(cacheKey, bible, 24 * 60 * 60 * 1000);
      return bible;
    } catch (error) {
      console.error(`Error fetching bible ${bibleId}:`, error);
      return null;
    }
  }

  // Get books for a specific Bible
  async getBooks(bibleId: string): Promise<BibleBook[]> {
    const cacheKey = `books_${bibleId}`;
    const cached = this.getCachedData<BibleBook[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleBook[] }>(`/bibles/${bibleId}/books`);
      const books = response.data || [];
      this.setCachedData(cacheKey, books, 24 * 60 * 60 * 1000);
      return books;
    } catch (error) {
      console.error(`Error fetching books for bible ${bibleId}:`, error);
      return [];
    }
  }

  // Get specific book information
  async getBook(bibleId: string, bookId: string): Promise<BibleBook | null> {
    const cacheKey = `book_${bibleId}_${bookId}`;
    const cached = this.getCachedData<BibleBook>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleBook }>(`/bibles/${bibleId}/books/${bookId}`);
      const book = response.data;
      this.setCachedData(cacheKey, book, 24 * 60 * 60 * 1000);
      return book;
    } catch (error) {
      console.error(`Error fetching book ${bookId} for bible ${bibleId}:`, error);
      return null;
    }
  }

  // Get chapters for a specific book
  async getChapters(bibleId: string, bookId: string): Promise<BibleChapterSummary[]> {
    const cacheKey = `chapters_${bibleId}_${bookId}`;
    const cached = this.getCachedData<BibleChapterSummary[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleChapterSummary[] }>(`/bibles/${bibleId}/books/${bookId}/chapters`);
      const chapters = response.data || [];
      this.setCachedData(cacheKey, chapters, 24 * 60 * 60 * 1000);
      return chapters;
    } catch (error) {
      console.error(`Error fetching chapters for book ${bookId} in bible ${bibleId}:`, error);
      return [];
    }
  }

  // Get specific chapter with verses
  async getChapter(bibleId: string, chapterId: string, includeVerses = true): Promise<BibleChapter | null> {
    const cacheKey = `chapter_${bibleId}_${chapterId}_${includeVerses}`;
    const cached = this.getCachedData<BibleChapter>(cacheKey);
    if (cached) return cached;

    try {
      const params = includeVerses ? '?include-verse-spans=false&include-verse-notes=false' : '';
      const response = await this.makeRequest<{ data: BibleChapter }>(`/bibles/${bibleId}/chapters/${chapterId}${params}`);
      const chapter = response.data;
      
      if (includeVerses && chapter) {
        // Get verses separately if needed
        const verses = await this.getVerses(bibleId, chapterId);
        chapter.verses = verses;
      }
      
      this.setCachedData(cacheKey, chapter);
      return chapter;
    } catch (error) {
      console.error(`Error fetching chapter ${chapterId} for bible ${bibleId}:`, error);
      return null;
    }
  }

  // Get verses for a specific chapter
  async getVerses(bibleId: string, chapterId: string): Promise<BibleVerse[]> {
    const cacheKey = `verses_${bibleId}_${chapterId}`;
    const cached = this.getCachedData<BibleVerse[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleVerse[] }>(`/bibles/${bibleId}/chapters/${chapterId}/verses`);
      const verses = (response.data || []).map((verse: any) => ({
        id: verse.id,
        orgId: verse.orgId || verse.id,
        book: verse.bookId || chapterId.split('.')[0],
        bookId: verse.bookId || chapterId.split('.')[0],
        chapter: parseInt(chapterId.split('.')[1]) || 1,
        verse: parseInt(verse.id.split('.')[2]) || 1,
        text: this.cleanVerseText(verse.content || ''),
        reference: verse.reference || `${verse.bookId} ${chapterId.split('.')[1]}:${verse.id.split('.')[2]}`,
        bibleId
      }));
      
      this.setCachedData(cacheKey, verses);
      return verses;
    } catch (error) {
      console.error(`Error fetching verses for chapter ${chapterId} in bible ${bibleId}:`, error);
      return [];
    }
  }

  // Get specific verse
  async getVerse(bibleId: string, verseId: string): Promise<BibleVerse | null> {
    const cacheKey = `verse_${bibleId}_${verseId}`;
    const cached = this.getCachedData<BibleVerse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: BibleVerse }>(`/bibles/${bibleId}/verses/${verseId}`);
      const verse = response.data;
      
      if (verse) {
        const formattedVerse: BibleVerse = {
          id: verse.id,
          orgId: verse.orgId || verse.id,
          book: verse.bookId || verseId.split('.')[0],
          bookId: verse.bookId || verseId.split('.')[0],
          chapter: parseInt(verseId.split('.')[1]) || 1,
          verse: parseInt(verseId.split('.')[2]) || 1,
          text: this.cleanVerseText(verse.content || ''),
          reference: verse.reference || verseId,
          bibleId
        };
        
        this.setCachedData(cacheKey, formattedVerse);
        return formattedVerse;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching verse ${verseId} for bible ${bibleId}:`, error);
      return null;
    }
  }

  // Search verses
  async searchVerses(bibleId: string, query: string, limit = 20, offset = 0): Promise<SearchResult> {
    const cacheKey = `search_${bibleId}_${query}_${limit}_${offset}`;
    const cached = this.getCachedData<SearchResult>(cacheKey);
    if (cached) return cached;

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await this.makeRequest<{ data: SearchResult }>(`/bibles/${bibleId}/search?query=${encodedQuery}&limit=${limit}&offset=${offset}`);
      const result = response.data;
      
      this.setCachedData(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
      return result;
    } catch (error) {
      console.error(`Error searching verses in bible ${bibleId}:`, error);
      return {
        query,
        limit,
        offset,
        total: 0,
        verseCount: 0,
        verses: []
      };
    }
  }

  // Get passage (multiple verses)
  async getPassage(bibleId: string, passageId: string): Promise<{ content: string; reference: string; verses: BibleVerse[] } | null> {
    const cacheKey = `passage_${bibleId}_${passageId}`;
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<{ data: any }>(`/bibles/${bibleId}/passages/${passageId}`);
      const passage = response.data;
      
      if (passage) {
        const result = {
          content: this.cleanVerseText(passage.content || ''),
          reference: passage.reference || passageId,
          verses: [] // Would need additional parsing to extract individual verses
        };
        
        this.setCachedData(cacheKey, result);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching passage ${passageId} for bible ${bibleId}:`, error);
      return null;
    }
  }

  // Helper method to clean verse text (remove HTML tags, etc.)
  private cleanVerseText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Get supported languages
  getAvailableLanguages(): Array<{ code: string; name: string; nativeName: string; translations: BibleTranslation[] }> {
    const languages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        translations: BIBLE_TRANSLATIONS.filter(t => t.languageCode === 'en')
      },
      {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        translations: BIBLE_TRANSLATIONS.filter(t => t.languageCode === 'ta')
      },
      {
        code: 'si',
        name: 'Sinhala',
        nativeName: 'සිංහල',
        translations: BIBLE_TRANSLATIONS.filter(t => t.languageCode === 'si')
      }
    ];
    
    return languages.filter(lang => lang.translations.length > 0);
  }

  // Get translation by ID
  getTranslation(translationId: string): BibleTranslation | null {
    return BIBLE_TRANSLATIONS.find(t => t.id === translationId) || null;
  }

  // Get random verse for daily verse functionality
  async getRandomVerse(bibleId?: string): Promise<BibleVerse | null> {
    const defaultBibleId = bibleId || 'de4e12af7f28f599-02'; // Default to KJV
    
    try {
      // Get a random book
      const books = await this.getBooks(defaultBibleId);
      if (books.length === 0) return null;
      
      const randomBook = books[Math.floor(Math.random() * books.length)];
      
      // Get chapters for the book
      const chapters = await this.getChapters(defaultBibleId, randomBook.id);
      if (chapters.length === 0) return null;
      
      const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
      
      // Get verses for the chapter
      const verses = await this.getVerses(defaultBibleId, randomChapter.id);
      if (verses.length === 0) return null;
      
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      return randomVerse;
    } catch (error) {
      console.error('Error getting random verse:', error);
      return null;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const bibleApi = new BibleApiService();
export default bibleApi;