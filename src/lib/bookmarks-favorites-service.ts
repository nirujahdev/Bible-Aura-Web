import { supabase } from '@/integrations/supabase/client';
import {
  saveFavoriteOffline,
  getFavoritesOffline,
  removeFavoriteOffline,
  saveBookmarkOffline,
  getBookmarksOffline,
  removeBookmarkOffline,
  isOnline,
  addToSyncQueue
} from './offline-storage';

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
      
      // Offline-first: Try to get from local storage first
      const offlineFavorites = await getFavoritesOffline(userId);
      
      if (!isOnline()) {
        console.log('📴 Offline mode - returning cached favorites');
        return offlineFavorites;
      }

      // Online: Fetch from server and sync
      try {
        const { data, error } = await supabase
          .from('user_bible_favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('⚠️ Error fetching from server, using offline data:', error);
          return offlineFavorites;
        }

        // Update offline storage with fresh data
        if (data) {
          for (const favorite of data) {
            await saveFavoriteOffline(favorite);
          }
        }

        console.log('✅ Favorites fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('⚠️ Network error, using offline data:', error);
        return offlineFavorites;
      }
    } catch (error) {
      console.error('❌ Error in getUserFavorites:', error);
      // Fallback to offline data
      return await getFavoritesOffline(userId);
    }
  }

  static async addToFavorites(userId: string, verse: BibleVerse, translation: string = 'KJV', notes?: string): Promise<UserFavorite | null> {
    try {
      console.log('🔍 Adding to favorites:', { userId, verse, translation });
      
      const verseId = generateVerseId(verse);
      const verseReference = generateVerseReference(verse);

      const favoriteData: any = {
        id: `temp_${Date.now()}_${verseId}`, // Temporary ID for offline
        user_id: userId,
        verse_id: verseId,
        book_name: verse.book_name,
        chapter: verse.chapter,
        verse_number: verse.verse,
        verse_text: verse.text,
        verse_reference: verseReference,
        translation: translation,
        notes: notes || null,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Always save to offline storage first
      await saveFavoriteOffline(favoriteData);

      if (!isOnline()) {
        // Queue for sync when online
        await addToSyncQueue('favorite', 'add', userId, favoriteData);
        console.log('📴 Offline mode - favorite saved locally, queued for sync');
        return favoriteData;
      }

      // Online: Try to sync with server
      try {
        const { data, error } = await supabase
          .from('user_bible_favorites')
          .upsert({
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
          }, {
            onConflict: 'user_id,verse_id'
          })
          .select()
          .single();

        if (error) {
          console.warn('⚠️ Error syncing to server, saved locally:', error);
          await addToSyncQueue('favorite', 'add', userId, favoriteData);
          return favoriteData;
        }

        // Update offline storage with server data (has real ID)
        if (data) {
          await saveFavoriteOffline(data);
        }
        
        console.log('✅ Favorite added successfully:', data);
        return data;
      } catch (error) {
        console.warn('⚠️ Network error, saved locally:', error);
        await addToSyncQueue('favorite', 'add', userId, favoriteData);
        return favoriteData;
      }
    } catch (error) {
      console.error('❌ Error in addToFavorites:', error);
      throw new Error(`Failed to add verse to favorites: ${error.message}`);
    }
  }

  static async removeFromFavorites(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      // Always remove from offline storage first
      await removeFavoriteOffline(verseId, userId);

      if (!isOnline()) {
        // Queue for sync when online
        await addToSyncQueue('favorite', 'remove', userId, { verse_id: verseId });
        console.log('📴 Offline mode - favorite removed locally, queued for sync');
        return true;
      }

      // Online: Try to sync with server
      try {
        const { error } = await supabase
          .from('user_bible_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('verse_id', verseId);

        if (error) {
          console.warn('⚠️ Error syncing removal to server, removed locally:', error);
          await addToSyncQueue('favorite', 'remove', userId, { verse_id: verseId });
        }

        console.log('✅ Favorite removed successfully');
        return true;
      } catch (error) {
        console.warn('⚠️ Network error, removed locally:', error);
        await addToSyncQueue('favorite', 'remove', userId, { verse_id: verseId });
        return true;
      }
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
      
      // Offline-first: Try to get from local storage first
      const offlineBookmarks = await getBookmarksOffline(userId);
      
      if (!isOnline()) {
        console.log('📴 Offline mode - returning cached bookmarks');
        return offlineBookmarks;
      }

      // Online: Fetch from server and sync
      try {
        const { data, error } = await supabase
          .from('user_bible_bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('⚠️ Error fetching from server, using offline data:', error);
          return offlineBookmarks;
        }

        // Update offline storage with fresh data
        if (data) {
          for (const bookmark of data) {
            await saveBookmarkOffline(bookmark);
          }
        }

        console.log('✅ Bookmarks fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.warn('⚠️ Network error, using offline data:', error);
        return offlineBookmarks;
      }
    } catch (error) {
      console.error('❌ Error in getUserBookmarks:', error);
      // Fallback to offline data
      return await getBookmarksOffline(userId);
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

      const bookmarkData: any = {
        id: `temp_${Date.now()}_${verseId}`, // Temporary ID for offline
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
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Always save to offline storage first
      await saveBookmarkOffline(bookmarkData);

      if (!isOnline()) {
        // Queue for sync when online
        await addToSyncQueue('bookmark', 'add', userId, bookmarkData);
        console.log('📴 Offline mode - bookmark saved locally, queued for sync');
        return bookmarkData;
      }

      // Online: Try to sync with server
      try {
        const { data, error } = await supabase
          .from('user_bible_bookmarks')
          .upsert({
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
          }, {
            onConflict: 'user_id,verse_id'
          })
          .select()
          .single();

        if (error) {
          console.warn('⚠️ Error syncing to server, saved locally:', error);
          await addToSyncQueue('bookmark', 'add', userId, bookmarkData);
          return bookmarkData;
        }

        // Update offline storage with server data (has real ID)
        if (data) {
          await saveBookmarkOffline(data);
        }
        
        console.log('✅ Bookmark added successfully:', data);
        return data;
      } catch (error) {
        console.warn('⚠️ Network error, saved locally:', error);
        await addToSyncQueue('bookmark', 'add', userId, bookmarkData);
        return bookmarkData;
      }
    } catch (error) {
      console.error('❌ Error in addToBookmarks:', error);
      throw new Error(`Failed to add verse to bookmarks: ${error.message}`);
    }
  }

  static async removeFromBookmarks(userId: string, verse: BibleVerse): Promise<boolean> {
    try {
      const verseId = generateVerseId(verse);
      
      // Always remove from offline storage first
      await removeBookmarkOffline(verseId, userId);

      if (!isOnline()) {
        // Queue for sync when online
        await addToSyncQueue('bookmark', 'remove', userId, { verse_id: verseId });
        console.log('📴 Offline mode - bookmark removed locally, queued for sync');
        return true;
      }

      // Online: Try to sync with server
      try {
        const { error } = await supabase
          .from('user_bible_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('verse_id', verseId);

        if (error) {
          console.warn('⚠️ Error syncing removal to server, removed locally:', error);
          await addToSyncQueue('bookmark', 'remove', userId, { verse_id: verseId });
        }

        console.log('✅ Bookmark removed successfully');
        return true;
      } catch (error) {
        console.warn('⚠️ Network error, removed locally:', error);
        await addToSyncQueue('bookmark', 'remove', userId, { verse_id: verseId });
        return true;
      }
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