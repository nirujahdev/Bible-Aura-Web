// Local Bible Service - Load Bible data from local JSON files
import { supabase } from '@/integrations/supabase/client';

// Available Bible translations - 9 Most Popular English + Tamil
export const BIBLE_TRANSLATIONS = [
  { code: 'KJV', name: 'King James Version', language: 'english', file: '/Bible/KJV_bible.json', public_domain: true },
  { code: 'NIV', name: 'New International Version', language: 'english', file: '/Bible/translations/NIV_bible.json', public_domain: false },
  { code: 'ESV', name: 'English Standard Version', language: 'english', file: '/Bible/translations/ESV_bible.json', public_domain: false },
  { code: 'NLT', name: 'New Living Translation', language: 'english', file: '/Bible/translations/NLT_bible.json', public_domain: false },
  { code: 'NASB', name: 'New American Standard Bible', language: 'english', file: '/Bible/translations/NASB_bible.json', public_domain: false },
  { code: 'NKJV', name: 'New King James Version', language: 'english', file: '/Bible/translations/NKJV_bible.json', public_domain: false },
  { code: 'NET', name: 'New English Translation', language: 'english', file: '/Bible/translations/NET_bible.json', public_domain: false },
  { code: 'ASV', name: 'American Standard Version', language: 'english', file: '/Bible/translations/ASV_bible.json', public_domain: true },
  { code: 'WEB', name: 'World English Bible', language: 'english', file: '/Bible/translations/WEB_bible.json', public_domain: true },
  { code: 'TAMIL', name: 'Tamil Bible', language: 'tamil', file: '/Bible/Tamil bible/', public_domain: true }
];

export type TranslationCode = typeof BIBLE_TRANSLATIONS[number]['code'];

export interface BibleVerse {
  id: string;
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  language: 'english' | 'tamil';
  translation?: TranslationCode;
}

export interface BibleBook {
  id: string;
  name: string;
  tamil_name?: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

// Cache for loaded Bible data
let bibleCache: Record<TranslationCode, Record<string, any> | null> = {
  KJV: null,
  NIV: null,
  ESV: null,
  NLT: null,
  NASB: null,
  NKJV: null,
  NET: null,
  ASV: null,
  WEB: null,
  TAMIL: null
};
let tamilBooksCache: BibleBook[] | null = null;
let tamilBibleCache: Record<string, any> = {};

// Load specific Bible translation
export async function loadBibleTranslation(translationCode: TranslationCode): Promise<Record<string, any>> {
  if (bibleCache[translationCode]) {
    return bibleCache[translationCode]!;
  }

  const translation = BIBLE_TRANSLATIONS.find(t => t.code === translationCode);
  if (!translation) {
    throw new Error(`Translation ${translationCode} not found`);
  }

  try {
    if (translationCode === 'TAMIL') {
      // Handle Tamil separately as it has different structure
      return await loadTamilBible();
    }

    const response = await fetch(translation.file);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${translation.name}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The structure from BibleTranslations has book names as keys directly
    // We need to extract just the Bible content, skipping the "Info" section
    const bibleContent: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (key !== 'Info') {
        bibleContent[key] = data[key];
      }
    });
    
    bibleCache[translationCode] = bibleContent;
    return bibleContent;
  } catch (error) {
    console.error(`Error loading ${translation.name}:`, error);
    // Return empty cache to prevent repeated failures
    bibleCache[translationCode] = {};
    return bibleCache[translationCode]!;
  }
}

// Load English KJV Bible (backward compatibility)
export async function loadEnglishBible(): Promise<Record<string, any>> {
  return await loadBibleTranslation('KJV');
}

// Load Tamil Bible (existing function)
async function loadTamilBible(): Promise<Record<string, any>> {
  if (bibleCache.TAMIL) {
    return bibleCache.TAMIL;
  }

  try {
    // Load Tamil books first to get the structure
    const tamilBooks = await loadTamilBooks();
    const tamilBible: Record<string, any> = {};
    
    // Load each book
    for (const book of tamilBooks) {
      try {
        const bookData = await loadTamilBook(book.name);
        tamilBible[book.name] = bookData;
      } catch (error) {
        console.warn(`Failed to load Tamil book ${book.name}:`, error);
      }
    }
    
    bibleCache.TAMIL = tamilBible;
    return tamilBible;
  } catch (error) {
    console.error('Error loading Tamil Bible:', error);
    bibleCache.TAMIL = {};
    return bibleCache.TAMIL;
  }
}

// Load Tamil Books list
export async function loadTamilBooks(): Promise<BibleBook[]> {
  if (tamilBooksCache) {
    return tamilBooksCache;
  }

  try {
    const response = await fetch('/Bible/Tamil bible/Books.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch Tamil books: ${response.status} ${response.statusText}`);
    }
    const booksData = await response.json();
    
    tamilBooksCache = booksData.map((item: any, index: number) => ({
      id: (index + 1).toString(),
      name: item.book?.english || `Book ${index + 1}`,
      tamil_name: item.book?.tamil?.trim() || '',
      testament: index < 39 ? 'old' as const : 'new' as const,
      chapters: 0 // Will be determined when loading individual books
    }));
    
    return tamilBooksCache;
  } catch (error) {
    console.error('Error loading Tamil books:', error);
    // Return a default empty list to prevent app crashes
    tamilBooksCache = [];
    return tamilBooksCache;
  }
}

// Load specific Tamil book
export async function loadTamilBook(bookName: string): Promise<any> {
  if (tamilBibleCache[bookName]) {
    return tamilBibleCache[bookName];
  }

  try {
    const response = await fetch(`/Bible/Tamil bible/${bookName}.json`);
    const data = await response.json();
    tamilBibleCache[bookName] = data;
    return data;
  } catch (error) {
    console.error(`Error loading Tamil book ${bookName}:`, error);
    throw new Error(`Failed to load Tamil book: ${bookName}`);
  }
}

// Get all available books
export async function getAllBooks(): Promise<BibleBook[]> {
  try {
    const tamilBooks = await loadTamilBooks();
    const englishBible = await loadEnglishBible();
    
    // If both failed to load, return a minimal set of Bible books
    if (tamilBooks.length === 0 && Object.keys(englishBible).length === 0) {
      console.warn('Bible files not available, returning default book list');
      return getDefaultBooks();
    }
    
    // Create combined book list with chapter counts
    const books: BibleBook[] = tamilBooks.length > 0 ? tamilBooks.map((book, index) => {
      const englishBookData = englishBible[book.name];
      const chapterCount = englishBookData ? Object.keys(englishBookData).length : 0;
      
      return {
        ...book,
        chapters: chapterCount
      };
    }) : getDefaultBooks();

    return books;
  } catch (error) {
    console.error('Error getting all books:', error);
    return getDefaultBooks();
  }
}

// Default book list as fallback
function getDefaultBooks(): BibleBook[] {
  return [
    { id: '1', name: 'Genesis', testament: 'old', chapters: 50 },
    { id: '2', name: 'Exodus', testament: 'old', chapters: 40 },
    { id: '3', name: 'Leviticus', testament: 'old', chapters: 27 },
    { id: '4', name: 'Numbers', testament: 'old', chapters: 36 },
    { id: '5', name: 'Deuteronomy', testament: 'old', chapters: 34 },
    { id: '40', name: 'Matthew', testament: 'new', chapters: 28 },
    { id: '41', name: 'Mark', testament: 'new', chapters: 16 },
    { id: '42', name: 'Luke', testament: 'new', chapters: 24 },
    { id: '43', name: 'John', testament: 'new', chapters: 21 },
    { id: '44', name: 'Acts', testament: 'new', chapters: 28 },
    { id: '45', name: 'Romans', testament: 'new', chapters: 16 },
    { id: '66', name: 'Revelation', testament: 'new', chapters: 22 }
  ];
}

// Get verses for a specific chapter
export async function getChapterVerses(
  bookName: string, 
  chapter: number, 
  language: 'english' | 'tamil' = 'english',
  translationCode: TranslationCode = 'KJV'
): Promise<BibleVerse[]> {
  try {
    if (language === 'english') {
      const bible = await loadBibleTranslation(translationCode);
      const bookData = bible[bookName];
      
      if (!bookData || !bookData[chapter.toString()]) {
        return [];
      }

      const chapterData = bookData[chapter.toString()];
      return Object.entries(chapterData).map(([verseNum, text]) => ({
        id: `${bookName}-${chapter}-${verseNum}-${translationCode}`,
        book_id: bookName,
        book_name: bookName,
        chapter,
        verse: parseInt(verseNum),
        text: text as string,
        language: 'english',
        translation: translationCode
      }));
    } else {
      // Tamil
      const tamilBookData = await loadTamilBook(bookName);
      const chapterData = tamilBookData.chapters.find((ch: any) => 
        parseInt(ch.chapter) === chapter
      );
      
      if (!chapterData) {
        return [];
      }

      return chapterData.verses.map((verse: any) => ({
        id: `${bookName}-${chapter}-${verse.verse}-TAMIL`,
        book_id: bookName,
        book_name: tamilBookData.book.tamil || bookName,
        chapter,
        verse: parseInt(verse.verse),
        text: verse.text,
        language: 'tamil',
        translation: 'TAMIL' as TranslationCode
      }));
    }
  } catch (error) {
    console.error('Error getting chapter verses:', error);
    return [];
  }
}

// Search verses by text
export async function searchVerses(
  query: string, 
  language: 'english' | 'tamil' = 'english',
  bookFilter?: string,
  translationCode: TranslationCode = 'KJV'
): Promise<BibleVerse[]> {
  const results: BibleVerse[] = [];
  const searchQuery = query.toLowerCase();

  try {
    if (language === 'english') {
      const bible = await loadBibleTranslation(translationCode);
      const booksToSearch = bookFilter ? [bookFilter] : Object.keys(bible);

      for (const bookName of booksToSearch) {
        const bookData = bible[bookName];
        if (!bookData) continue;

        for (const [chapterNum, chapterData] of Object.entries(bookData)) {
          for (const [verseNum, text] of Object.entries(chapterData as Record<string, string>)) {
            if (text.toLowerCase().includes(searchQuery)) {
              results.push({
                id: `${bookName}-${chapterNum}-${verseNum}-${translationCode}`,
                book_id: bookName,
                book_name: bookName,
                chapter: parseInt(chapterNum),
                verse: parseInt(verseNum),
                text,
                language: 'english',
                translation: translationCode
              });
            }
          }
        }
      }
    } else {
      // Tamil search (existing code)
      const books = await loadTamilBooks();
      const booksToSearch = bookFilter ? 
        books.filter(book => book.name === bookFilter) : books;

      for (const book of booksToSearch) {
        try {
          const tamilBookData = await loadTamilBook(book.name);
          
          for (const chapter of tamilBookData.chapters) {
            for (const verse of chapter.verses) {
              if (verse.text.includes(query)) { // Tamil text search (exact match better for Tamil)
                results.push({
                  id: `${book.name}-${chapter.chapter}-${verse.verse}-TAMIL`,
                  book_id: book.name,
                  book_name: tamilBookData.book.tamil || book.name,
                  chapter: parseInt(chapter.chapter),
                  verse: parseInt(verse.verse),
                  text: verse.text,
                  language: 'tamil',
                  translation: 'TAMIL' as TranslationCode
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Skipping book ${book.name} due to loading error`);
        }
      }
    }
  } catch (error) {
    console.error('Error searching verses:', error);
  }

  return results.slice(0, 50); // Limit results
}

// Get a specific verse
export async function getVerse(
  bookName: string, 
  chapter: number, 
  verse: number, 
  language: 'english' | 'tamil' = 'english',
  translationCode: TranslationCode = 'KJV'
): Promise<BibleVerse | null> {
  try {
    const verses = await getChapterVerses(bookName, chapter, language, translationCode);
    return verses.find(v => v.verse === verse) || null;
  } catch (error) {
    console.error('Error getting verse:', error);
    return null;
  }
}

// Save verse to favorites/bookmarks (using Supabase)
export async function saveBookmark(verse: BibleVerse, userId: string): Promise<boolean> {
  try {
    const verseId = `${verse.book_name}-${verse.chapter}-${verse.verse}`;
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: userId,
        verse_id: verseId,
        book_name: verse.book_name,
        chapter: verse.chapter,
        verse: verse.verse,
        verse_text: verse.text,
        verse_reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        created_at: new Date().toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return false;
  }
}

// Get user bookmarks
export async function getUserBookmarks(userId: string): Promise<BibleVerse[]> {
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(bookmark => ({
      id: bookmark.verse_id,
      book_id: bookmark.book_name,
      book_name: bookmark.book_name,
      chapter: bookmark.chapter,
      verse: bookmark.verse,
      text: bookmark.verse_text,
      language: 'english' as const // Default to English, can be enhanced later
    }));
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
} 