import { supabase } from '@/integrations/supabase/client';

// Types for Bible verse data
export interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

// User Favorites interface
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

// User Bookmarks interface
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
      console.log('🔍 Fetching favorites for user:', userId);
      
      const { data, error } = await supabase
        .from('user_bible_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching favorites:', error);
        throw error;
      }

      console.log('✅ Favorites fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getUserFavorites:', error);
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }
  }

  static async addToFavorites(userId: string, verse: BibleVerse, translation: string = 'KJV', notes?: string): Promise<UserFavorite | null> {
    try {
      console.log('🔍 Adding to favorites:', { userId, verse, translation });
      
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

      console.log('📝 Inserting favorite data:', favoriteData);

      const { data, error } = await supabase
        .from('user_bible_favorites')
        .upsert(favoriteData, {
          onConflict: 'user_id,verse_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding favorite:', error);
        throw error;
      }
      
      console.log('✅ Favorite added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in addToFavorites:', error);
      throw new Error(`Failed to add verse to favorites: ${error.message}`);
    }
  }

  static async removeFromFavorites(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { error } = await supabase
        .from('user_bible_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('verse_id', verseId);

      if (error) {
        console.error('❌ Error removing favorite:', error);
        throw error;
      }

      console.log('✅ Favorite removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in removeFromFavorites:', error);
      throw new Error(`Failed to remove verse from favorites: ${error.message}`);
    }
  }

  static async isFavorited(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { data, error } = await supabase
        .from('user_bible_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('verse_id', verseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error checking if favorited:', error);
      return false;
    }
  }
}


// BOOKMARKS OPERATIONS
export class BookmarksService {
  static async getUserBookmarks(userId: string): Promise<UserBookmark[]> {
    try {
      console.log('🔍 Fetching bookmarks for user:', userId);
      
      const { data, error } = await supabase
        .from('user_bible_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bookmarks:', error);
        throw error;
      }

      console.log('✅ Bookmarks fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getUserBookmarks:', error);
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
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
      console.log('🔍 Adding to bookmarks:', { userId, verse, category, highlightColor, translation });
      
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

      console.log('📝 Inserting bookmark data:', bookmarkData);

      const { data, error } = await supabase
        .from('user_bible_bookmarks')
        .upsert(bookmarkData, {
          onConflict: 'user_id,verse_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding bookmark:', error);
        throw error;
      }
      
      console.log('✅ Bookmark added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in addToBookmarks:', error);
      throw new Error(`Failed to add verse to bookmarks: ${error.message}`);
    }
  }

  static async removeFromBookmarks(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { error } = await supabase
        .from('user_bible_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('verse_id', verseId);

      if (error) {
        console.error('❌ Error removing bookmark:', error);
        throw error;
      }

      console.log('✅ Bookmark removed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in removeFromBookmarks:', error);
      throw new Error(`Failed to remove verse from bookmarks: ${error.message}`);
    }
  }

  static async isBookmarked(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      const { data, error } = await supabase
        .from('user_bible_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('verse_id', verseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error checking if bookmarked:', error);
      return false;
    }
  }
}


// COMBINED OPERATIONS
export class BibleVerseService {
  static async getVerseStatus(userId: string, verse: BibleVerse) {
    try {
      const [isBookmarked, isFavorited] = await Promise.all([
        BookmarksService.isBookmarked(userId, verse),
        FavoritesService.isFavorited(userId, verse)
      ]);

      return {
        isBookmarked,
        isFavorited
      };
    } catch (error) {
      console.error('❌ Error getting verse status:', error);
      return {
        isBookmarked: false,
        isFavorited: false
      };
    }
  }

  static async toggleFavorite(userId: string, verse: BibleVerse, translation: string = 'KJV') {
    try {
      const isFavorited = await FavoritesService.isFavorited(userId, verse);
      
      if (isFavorited) {
        await FavoritesService.removeFromFavorites(userId, verse);
        return { action: 'removed', isFavorited: false };
      } else {
        await FavoritesService.addToFavorites(userId, verse, translation);
        return { action: 'added', isFavorited: true };
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }

  static async toggleBookmark(
    userId: string, 
    verse: BibleVerse, 
    category: UserBookmark['category'] = 'study',
    highlightColor: UserBookmark['highlight_color'] = 'yellow',
    translation: string = 'KJV'
  ) {
    try {
      const isBookmarked = await BookmarksService.isBookmarked(userId, verse);
      
      if (isBookmarked) {
        await BookmarksService.removeFromBookmarks(userId, verse);
        return { action: 'removed', isBookmarked: false };
      } else {
        await BookmarksService.addToBookmarks(userId, verse, category, highlightColor, translation);
        return { action: 'added', isBookmarked: true };
      }
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      throw error;
    }
  }
} 