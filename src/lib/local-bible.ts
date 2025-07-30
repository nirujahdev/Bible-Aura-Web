// Local Bible Service - Load Bible data from local JSON files
import { supabase } from '@/integrations/supabase/client';

export interface BibleVerse {
  id: string;
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  language: 'english' | 'tamil';
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
let englishBibleCache: Record<string, any> | null = null;
let tamilBooksCache: BibleBook[] | null = null;
let tamilBibleCache: Record<string, any> = {};

// Load English KJV Bible
export async function loadEnglishBible(): Promise<Record<string, any>> {
  if (englishBibleCache) {
    return englishBibleCache;
  }

  try {
    const response = await fetch('/Bible/KJV_bible.json');
    const data = await response.json();
    englishBibleCache = data;
    return data;
  } catch (error) {
    console.error('Error loading English Bible:', error);
    throw new Error('Failed to load English Bible');
  }
}

// Load Tamil Books list
export async function loadTamilBooks(): Promise<BibleBook[]> {
  if (tamilBooksCache) {
    return tamilBooksCache;
  }

  try {
    const response = await fetch('/Bible/Tamil bible/Books.json');
    const booksData = await response.json();
    
    tamilBooksCache = booksData.map((item: any, index: number) => ({
      id: (index + 1).toString(),
      name: item.book.english,
      tamil_name: item.book.tamil.trim(),
      testament: index < 39 ? 'old' as const : 'new' as const,
      chapters: 0 // Will be determined when loading individual books
    }));
    
    return tamilBooksCache;
  } catch (error) {
    console.error('Error loading Tamil books:', error);
    throw new Error('Failed to load Tamil books');
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
  const tamilBooks = await loadTamilBooks();
  const englishBible = await loadEnglishBible();
  
  // Create combined book list with chapter counts
  const books: BibleBook[] = tamilBooks.map((book, index) => {
    const englishBookData = englishBible[book.name];
    const chapterCount = englishBookData ? Object.keys(englishBookData).length : 0;
    
    return {
      ...book,
      chapters: chapterCount
    };
  });

  return books;
}

// Get verses for a specific chapter
export async function getChapterVerses(
  bookName: string, 
  chapter: number, 
  language: 'english' | 'tamil' = 'english'
): Promise<BibleVerse[]> {
  try {
    if (language === 'english') {
      const englishBible = await loadEnglishBible();
      const bookData = englishBible[bookName];
      
      if (!bookData || !bookData[chapter.toString()]) {
        return [];
      }

      const chapterData = bookData[chapter.toString()];
      return Object.entries(chapterData).map(([verseNum, text]) => ({
        id: `${bookName}-${chapter}-${verseNum}`,
        book_id: bookName,
        book_name: bookName,
        chapter,
        verse: parseInt(verseNum),
        text: text as string,
        language: 'english'
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
        id: `${bookName}-${chapter}-${verse.verse}`,
        book_id: bookName,
        book_name: tamilBookData.book.tamil || bookName,
        chapter,
        verse: parseInt(verse.verse),
        text: verse.text,
        language: 'tamil'
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
  bookFilter?: string
): Promise<BibleVerse[]> {
  const results: BibleVerse[] = [];
  const searchQuery = query.toLowerCase();

  try {
    if (language === 'english') {
      const englishBible = await loadEnglishBible();
      const booksToSearch = bookFilter ? [bookFilter] : Object.keys(englishBible);

      for (const bookName of booksToSearch) {
        const bookData = englishBible[bookName];
        if (!bookData) continue;

        for (const [chapterNum, chapterData] of Object.entries(bookData)) {
          for (const [verseNum, text] of Object.entries(chapterData as Record<string, string>)) {
            if (text.toLowerCase().includes(searchQuery)) {
              results.push({
                id: `${bookName}-${chapterNum}-${verseNum}`,
                book_id: bookName,
                book_name: bookName,
                chapter: parseInt(chapterNum),
                verse: parseInt(verseNum),
                text,
                language: 'english'
              });
            }
          }
        }
      }
    } else {
      // Tamil search
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
                  id: `${book.name}-${chapter.chapter}-${verse.verse}`,
                  book_id: book.name,
                  book_name: tamilBookData.book.tamil || book.name,
                  chapter: parseInt(chapter.chapter),
                  verse: parseInt(verse.verse),
                  text: verse.text,
                  language: 'tamil'
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
  language: 'english' | 'tamil' = 'english'
): Promise<BibleVerse | null> {
  try {
    const verses = await getChapterVerses(bookName, chapter, language);
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