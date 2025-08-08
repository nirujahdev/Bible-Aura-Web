import { supabase } from '@/integrations/supabase/client';

export interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  id?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  verse_id: string;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  verse_reference: string;
  translation: string;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  verse_id: string;
  book_name: string;
  chapter: number;
  verse_number: number;
  verse_text: string;
  verse_reference: string;
  translation: string;
  category: 'study' | 'prayer' | 'inspiration' | 'memorization';
  highlight_color: 'yellow' | 'green' | 'blue' | 'purple' | 'red' | 'orange';
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Generate verse ID in consistent format
export function generateVerseId(verse: BibleVerse): string {
  return `${verse.book_name.replace(/\s+/g, '-')}-${verse.chapter}-${verse.verse}`;
}

// Generate verse reference string
export function generateVerseReference(verse: BibleVerse): string {
  return `${verse.book_name} ${verse.chapter}:${verse.verse}`;
}

// FAVORITES OPERATIONS
export class FavoritesService {
  static async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return [];
    }
  }

  static async addToFavorites(
    userId: string, 
    verse: BibleVerse, 
    translation: string = 'KJV',
    notes?: string
  ): Promise<UserFavorite | null> {
    try {
      const verseId = generateVerseId(verse);
      const verseReference = generateVerseReference(verse);

      const favoriteData = {
        user_id: userId,
        verse_id: verseId,
        book_name: verse.book_name,
        chapter: verse.chapter,
        verse_number: verse.verse,
        verse_text: verse.text,
        verse_reference: verseReference,
        translation: translation,
        notes: notes || null,
        tags: []
      };

      const { data, error } = await supabase
        .from('user_favorites')
        .upsert(favoriteData, {
          onConflict: 'user_id,verse_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add verse to favorites');
    }
  }

  static async removeFromFavorites(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('verse_id', verseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Failed to remove verse from favorites');
    }
  }

  static async isFavorited(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('verse_id', verseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}

// BOOKMARKS OPERATIONS
export class BookmarksService {
  static async getUserBookmarks(userId: string): Promise<UserBookmark[]> {
    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  static async addToBookmarks(
    userId: string, 
    verse: BibleVerse, 
    category: UserBookmark['category'] = 'study',
    highlightColor: UserBookmark['highlight_color'] = 'yellow',
    translation: string = 'KJV',
    notes?: string
  ): Promise<UserBookmark | null> {
    try {
      const verseId = generateVerseId(verse);
      const verseReference = generateVerseReference(verse);

      const bookmarkData = {
        user_id: userId,
        verse_id: verseId,
        book_name: verse.book_name,
        chapter: verse.chapter,
        verse_number: verse.verse,
        verse_text: verse.text,
        verse_reference: verseReference,
        translation: translation,
        category: category,
        highlight_color: highlightColor,
        notes: notes || null,
        tags: []
      };

      const { data, error } = await supabase
        .from('user_bookmarks')
        .upsert(bookmarkData, {
          onConflict: 'user_id,verse_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to bookmarks:', error);
      throw new Error('Failed to add verse to bookmarks');
    }
  }

  static async removeFromBookmarks(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('verse_id', verseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from bookmarks:', error);
      throw new Error('Failed to remove verse from bookmarks');
    }
  }

  static async isBookmarked(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('verse_id', verseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  static async updateBookmarkNotes(
    userId: string, 
    verse: BibleVerse, 
    notes: string
  ): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { error } = await supabase
        .from('user_bookmarks')
        .update({ 
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('verse_id', verseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating bookmark notes:', error);
      return false;
    }
  }
}

// COMBINED OPERATIONS
export class BibleVerseService {
  static async getVerseStatus(userId: string, verse: BibleVerse) {
    const [isFavorited, isBookmarked] = await Promise.all([
      FavoritesService.isFavorited(userId, verse),
      BookmarksService.isBookmarked(userId, verse)
    ]);

    return {
      isFavorited,
      isBookmarked,
      verseId: generateVerseId(verse),
      verseReference: generateVerseReference(verse)
    };
  }

  static async toggleFavorite(userId: string, verse: BibleVerse, translation: string = 'KJV') {
    const isFavorited = await FavoritesService.isFavorited(userId, verse);
    
    if (isFavorited) {
      await FavoritesService.removeFromFavorites(userId, verse);
      return { action: 'removed', isFavorited: false };
    } else {
      await FavoritesService.addToFavorites(userId, verse, translation);
      return { action: 'added', isFavorited: true };
    }
  }

  static async toggleBookmark(
    userId: string, 
    verse: BibleVerse, 
    category: UserBookmark['category'] = 'study',
    highlightColor: UserBookmark['highlight_color'] = 'yellow',
    translation: string = 'KJV'
  ) {
    const isBookmarked = await BookmarksService.isBookmarked(userId, verse);
    
    if (isBookmarked) {
      await BookmarksService.removeFromBookmarks(userId, verse);
      return { action: 'removed', isBookmarked: false };
    } else {
      await BookmarksService.addToBookmarks(userId, verse, category, highlightColor, translation);
      return { action: 'added', isBookmarked: true };
    }
  }
} 