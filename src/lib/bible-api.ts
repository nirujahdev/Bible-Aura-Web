// Bible API Service for Multi-language Support
// Supports Tamil, Sinhala, English and other languages

export interface BibleBook {
  id: string;
  name: string;
  chapters: number;
  testament: 'Old' | 'New';
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleTranslation {
  id: string;
  name: string;
  language: string;
  languageCode: string;
}

// Available Bible translations
export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // English
  { id: 'KJV', name: 'King James Version', language: 'English', languageCode: 'en' },
  { id: 'NIV', name: 'New International Version', language: 'English', languageCode: 'en' },
  { id: 'ESV', name: 'English Standard Version', language: 'English', languageCode: 'en' },
  { id: 'NLT', name: 'New Living Translation', language: 'English', languageCode: 'en' },
  
  // Tamil
  { id: 'IRV', name: 'Indian Revised Version (Tamil)', language: 'Tamil', languageCode: 'ta' },
  { id: 'TBSI', name: 'Tamil Bible Society of India', language: 'Tamil', languageCode: 'ta' },
  
  // Sinhala  
  { id: 'SIOV', name: 'Sinhala Old Version', language: 'Sinhala', languageCode: 'si' },
  { id: 'SIRV', name: 'Sinhala Revised Version', language: 'Sinhala', languageCode: 'si' },
];

// Bible books data
const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { id: 'gen', name: 'Genesis', chapters: 50, testament: 'Old' },
  { id: 'exo', name: 'Exodus', chapters: 40, testament: 'Old' },
  { id: 'lev', name: 'Leviticus', chapters: 27, testament: 'Old' },
  { id: 'num', name: 'Numbers', chapters: 36, testament: 'Old' },
  { id: 'deu', name: 'Deuteronomy', chapters: 34, testament: 'Old' },
  { id: 'jos', name: 'Joshua', chapters: 24, testament: 'Old' },
  { id: 'jdg', name: 'Judges', chapters: 21, testament: 'Old' },
  { id: 'rut', name: 'Ruth', chapters: 4, testament: 'Old' },
  { id: '1sa', name: '1 Samuel', chapters: 31, testament: 'Old' },
  { id: '2sa', name: '2 Samuel', chapters: 24, testament: 'Old' },
  { id: '1ki', name: '1 Kings', chapters: 22, testament: 'Old' },
  { id: '2ki', name: '2 Kings', chapters: 25, testament: 'Old' },
  { id: '1ch', name: '1 Chronicles', chapters: 29, testament: 'Old' },
  { id: '2ch', name: '2 Chronicles', chapters: 36, testament: 'Old' },
  { id: 'ezr', name: 'Ezra', chapters: 10, testament: 'Old' },
  { id: 'neh', name: 'Nehemiah', chapters: 13, testament: 'Old' },
  { id: 'est', name: 'Esther', chapters: 10, testament: 'Old' },
  { id: 'job', name: 'Job', chapters: 42, testament: 'Old' },
  { id: 'psa', name: 'Psalms', chapters: 150, testament: 'Old' },
  { id: 'pro', name: 'Proverbs', chapters: 31, testament: 'Old' },
  { id: 'ecc', name: 'Ecclesiastes', chapters: 12, testament: 'Old' },
  { id: 'sng', name: 'Song of Songs', chapters: 8, testament: 'Old' },
  { id: 'isa', name: 'Isaiah', chapters: 66, testament: 'Old' },
  { id: 'jer', name: 'Jeremiah', chapters: 52, testament: 'Old' },
  { id: 'lam', name: 'Lamentations', chapters: 5, testament: 'Old' },
  { id: 'ezk', name: 'Ezekiel', chapters: 48, testament: 'Old' },
  { id: 'dan', name: 'Daniel', chapters: 12, testament: 'Old' },
  { id: 'hos', name: 'Hosea', chapters: 14, testament: 'Old' },
  { id: 'jol', name: 'Joel', chapters: 3, testament: 'Old' },
  { id: 'amo', name: 'Amos', chapters: 9, testament: 'Old' },
  { id: 'oba', name: 'Obadiah', chapters: 1, testament: 'Old' },
  { id: 'jon', name: 'Jonah', chapters: 4, testament: 'Old' },
  { id: 'mic', name: 'Micah', chapters: 7, testament: 'Old' },
  { id: 'nam', name: 'Nahum', chapters: 3, testament: 'Old' },
  { id: 'hab', name: 'Habakkuk', chapters: 3, testament: 'Old' },
  { id: 'zep', name: 'Zephaniah', chapters: 3, testament: 'Old' },
  { id: 'hag', name: 'Haggai', chapters: 2, testament: 'Old' },
  { id: 'zec', name: 'Zechariah', chapters: 14, testament: 'Old' },
  { id: 'mal', name: 'Malachi', chapters: 4, testament: 'Old' },
  
  // New Testament
  { id: 'mat', name: 'Matthew', chapters: 28, testament: 'New' },
  { id: 'mrk', name: 'Mark', chapters: 16, testament: 'New' },
  { id: 'luk', name: 'Luke', chapters: 24, testament: 'New' },
  { id: 'jhn', name: 'John', chapters: 21, testament: 'New' },
  { id: 'act', name: 'Acts', chapters: 28, testament: 'New' },
  { id: 'rom', name: 'Romans', chapters: 16, testament: 'New' },
  { id: '1co', name: '1 Corinthians', chapters: 16, testament: 'New' },
  { id: '2co', name: '2 Corinthians', chapters: 13, testament: 'New' },
  { id: 'gal', name: 'Galatians', chapters: 6, testament: 'New' },
  { id: 'eph', name: 'Ephesians', chapters: 6, testament: 'New' },
  { id: 'php', name: 'Philippians', chapters: 4, testament: 'New' },
  { id: 'col', name: 'Colossians', chapters: 4, testament: 'New' },
  { id: '1th', name: '1 Thessalonians', chapters: 5, testament: 'New' },
  { id: '2th', name: '2 Thessalonians', chapters: 3, testament: 'New' },
  { id: '1ti', name: '1 Timothy', chapters: 6, testament: 'New' },
  { id: '2ti', name: '2 Timothy', chapters: 4, testament: 'New' },
  { id: 'tit', name: 'Titus', chapters: 3, testament: 'New' },
  { id: 'phm', name: 'Philemon', chapters: 1, testament: 'New' },
  { id: 'heb', name: 'Hebrews', chapters: 13, testament: 'New' },
  { id: 'jas', name: 'James', chapters: 5, testament: 'New' },
  { id: '1pe', name: '1 Peter', chapters: 5, testament: 'New' },
  { id: '2pe', name: '2 Peter', chapters: 3, testament: 'New' },
  { id: '1jn', name: '1 John', chapters: 5, testament: 'New' },
  { id: '2jn', name: '2 John', chapters: 1, testament: 'New' },
  { id: '3jn', name: '3 John', chapters: 1, testament: 'New' },
  { id: 'jud', name: 'Jude', chapters: 1, testament: 'New' },
  { id: 'rev', name: 'Revelation', chapters: 22, testament: 'New' },
];

interface ApiResponse {
  verses: ApiVerse[];
}

interface ApiVerse {
  verse: number;
  text: string;
}

class BibleApiService {
  private baseUrl = 'https://bible-api.com';
  private fallbackUrl = 'https://api.scripture.api.bible/v1';

  // Get all available books
  getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  }

  // Get available translations
  getTranslations(): BibleTranslation[] {
    return BIBLE_TRANSLATIONS;
  }

  // Fetch chapter verses
  async fetchChapter(bookId: string, chapter: number, translation: string = 'KJV'): Promise<BibleVerse[]> {
    try {
      // For Tamil and Sinhala, we'll use a different approach
      if (translation === 'IRV' || translation === 'TBSI') {
        return await this.fetchTamilChapter(bookId, chapter, translation);
      } else if (translation === 'SIOV' || translation === 'SIRV') {
        return await this.fetchSinhalaChapter(bookId, chapter, translation);
      } else {
        return await this.fetchEnglishChapter(bookId, chapter, translation);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      throw new Error('Failed to fetch Bible chapter');
    }
  }

  // Fetch English translations
  private async fetchEnglishChapter(bookId: string, chapter: number, translation: string): Promise<BibleVerse[]> {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');

    try {
      // Using Bible API for English translations
      const response = await fetch(`${this.baseUrl}/${book.name.toLowerCase()}${chapter}?translation=${translation.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Bible API');
      }

      const data = await response.json();
      
      // Parse the response and return verses
      return this.parseEnglishApiResponse(data, book.name, chapter);
    } catch (error) {
      // Fallback to sample data if API fails
      return this.getSampleEnglishVerses(book.name, chapter);
    }
  }

  // Fetch Tamil Bible chapters
  private async fetchTamilChapter(bookId: string, chapter: number, translation: string): Promise<BibleVerse[]> {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');

    // For now, return sample Tamil verses (you can integrate with Tamil Bible API)
    return this.getSampleTamilVerses(book.name, chapter);
  }

  // Fetch Sinhala Bible chapters
  private async fetchSinhalaChapter(bookId: string, chapter: number, translation: string): Promise<BibleVerse[]> {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');

    // For now, return sample Sinhala verses (you can integrate with Sinhala Bible API)
    return this.getSampleSinhalaVerses(book.name, chapter);
  }

  // Parse English API response
  private parseEnglishApiResponse(data: ApiResponse, bookName: string, chapter: number): BibleVerse[] {
    if (!data || !data.verses) {
      throw new Error('Invalid API response');
    }

    return data.verses.map((verse: ApiVerse) => ({
      book: bookName,
      chapter: chapter,
      verse: verse.verse,
      text: verse.text
    }));
  }

  // Sample English verses (fallback)
  private getSampleEnglishVerses(bookName: string, chapter: number): BibleVerse[] {
    if (bookName === 'John' && chapter === 3) {
      return [
        { book: bookName, chapter, verse: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
        { book: bookName, chapter, verse: 17, text: "For God did not send his Son into the world to condemn the world, but to save the world through him." }
      ];
    }
    
    // Default sample verses
    return [
      { book: bookName, chapter, verse: 1, text: `This is verse 1 of ${bookName} chapter ${chapter}.` },
      { book: bookName, chapter, verse: 2, text: `This is verse 2 of ${bookName} chapter ${chapter}.` }
    ];
  }

  // Sample Tamil verses
  private getSampleTamilVerses(bookName: string, chapter: number): BibleVerse[] {
    if (bookName === 'John' && chapter === 3) {
      return [
        { book: bookName, chapter, verse: 16, text: "ஏனென்றால் தேவன் உலகத்தில் அன்பு வைத்து, தம்முடைய ஒரே பிறந்த குமாரனைக் கொடுத்தார்; அவர்மேல் விசுவாசமுள்ள எவனும் கெட்டுப்போகாமல் நித்திய ஜீவனை அடையும்படிக்கு." },
        { book: bookName, chapter, verse: 17, text: "ஏனென்றால் தேவன் உலகத்தைக் கண்டிக்கும்படிக்குத் தம்முடைய குமாரனை உலகத்தில் அனுப்பாமல், உலகம் அவர் மூலமாய் இரட்சிக்கப்படும்படிக்கே அவரை அனுப்பினார்." }
      ];
    }

    return [
      { book: bookName, chapter, verse: 1, text: `இது ${bookName} அதிகாரம் ${chapter} வசனம் 1 ஆகும்.` },
      { book: bookName, chapter, verse: 2, text: `இது ${bookName} அதிகாரம் ${chapter} வசனம் 2 ஆகும்.` }
    ];
  }

  // Sample Sinhala verses
  private getSampleSinhalaVerses(bookName: string, chapter: number): BibleVerse[] {
    if (bookName === 'John' && chapter === 3) {
      return [
        { book: bookName, chapter, verse: 16, text: "දෙවියන් වහන්සේ ලෝකය මෙතරම් ප්‍රේම කළ සේක, ඔහුගේ එකම පුත්‍රයාව දුන් සේක. ඔහු මත විශ්වාස කරන සෑම කෙනෙකුම විනාශ නොවී සදාකාල ජීවය ලබන පිණිස ය." },
        { book: bookName, chapter, verse: 17, text: "දෙවියන් වහන්සේ තම පුත්‍රයාව ලෝකයට යැව්වේ ලෝකය නිරූපණය කරන්නට නොව, ලෝකය ඔහු මගින් ගැලවීමට ය." }
      ];
    }

    return [
      { book: bookName, chapter, verse: 1, text: `මෙය ${bookName} පරිච්ඡේදය ${chapter} පදය 1 වේ.` },
      { book: bookName, chapter, verse: 2, text: `මෙය ${bookName} පරිච්ඡේදය ${chapter} පදය 2 වේ.` }
    ];
  }

  // Search verses across translations
  async searchVerses(query: string, translation: string = 'KJV'): Promise<BibleVerse[]> {
    // Implement search functionality here
    // For now, return empty array
    return [];
  }
}

// Export singleton instance
export const bibleApi = new BibleApiService();
export default bibleApi;