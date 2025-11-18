// Offline Storage Utility - IndexedDB for favorites, bookmarks, and Bible data
// Provides offline-first data access with automatic sync when online

const DB_NAME = 'BibleAuraOffline';
const DB_VERSION = 1;

interface OfflineDB {
  favorites: IDBObjectStore;
  bookmarks: IDBObjectStore;
  bibleVerses: IDBObjectStore;
  highlights: IDBObjectStore;
  syncQueue: IDBObjectStore;
}

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
        favoritesStore.createIndex('userId', 'user_id', { unique: false });
        favoritesStore.createIndex('verseId', 'verse_id', { unique: false });
        favoritesStore.createIndex('createdAt', 'created_at', { unique: false });
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains('bookmarks')) {
        const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bookmarksStore.createIndex('userId', 'user_id', { unique: false });
        bookmarksStore.createIndex('verseId', 'verse_id', { unique: false });
        bookmarksStore.createIndex('createdAt', 'created_at', { unique: false });
      }

      // Bible verses cache store
      if (!db.objectStoreNames.contains('bibleVerses')) {
        const versesStore = db.createObjectStore('bibleVerses', { keyPath: 'key' });
        versesStore.createIndex('reference', 'reference', { unique: false });
      }

      // Highlights store
      if (!db.objectStoreNames.contains('highlights')) {
        const highlightsStore = db.createObjectStore('highlights', { keyPath: 'id' });
        highlightsStore.createIndex('userId', 'user_id', { unique: false });
        highlightsStore.createIndex('verseId', 'verse_id', { unique: false });
      }

      // Sync queue for offline operations
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('userId', 'user_id', { unique: false });
      }
    };
  });
}

// FAVORITES - Offline Operations
export async function saveFavoriteOffline(favorite: any): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    await store.put(favorite);
  } catch (error) {
    console.error('Error saving favorite offline:', error);
  }
}

export async function getFavoritesOffline(userId: string): Promise<any[]> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['favorites'], 'readonly');
    const store = transaction.objectStore('favorites');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting favorites offline:', error);
    return [];
  }
}

export async function removeFavoriteOffline(verseId: string, userId: string): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['favorites'], 'readwrite');
    const store = transaction.objectStore('favorites');
    const index = store.index('verseId');
    
    const request = index.openCursor(IDBKeyRange.only(verseId));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && cursor.value.user_id === userId) {
        cursor.delete();
      }
    };
  } catch (error) {
    console.error('Error removing favorite offline:', error);
  }
}

// BOOKMARKS - Offline Operations
export async function saveBookmarkOffline(bookmark: any): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bookmarks'], 'readwrite');
    const store = transaction.objectStore('bookmarks');
    await store.put(bookmark);
  } catch (error) {
    console.error('Error saving bookmark offline:', error);
  }
}

export async function getBookmarksOffline(userId: string): Promise<any[]> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bookmarks'], 'readonly');
    const store = transaction.objectStore('bookmarks');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting bookmarks offline:', error);
    return [];
  }
}

export async function removeBookmarkOffline(verseId: string, userId: string): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bookmarks'], 'readwrite');
    const store = transaction.objectStore('bookmarks');
    const index = store.index('verseId');
    
    const request = index.openCursor(IDBKeyRange.only(verseId));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && cursor.value.user_id === userId) {
        cursor.delete();
      }
    };
  } catch (error) {
    console.error('Error removing bookmark offline:', error);
  }
}

// BIBLE VERSES - Offline Cache
export async function cacheBibleVerse(
  reference: string,
  translation: string,
  verseData: any
): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bibleVerses'], 'readwrite');
    const store = transaction.objectStore('bibleVerses');
    
    const key = `${translation}_${reference}`;
    await store.put({
      key,
      reference,
      translation,
      data: verseData,
      cachedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error caching Bible verse:', error);
  }
}

export async function getCachedBibleVerse(
  reference: string,
  translation: string
): Promise<any | null> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bibleVerses'], 'readonly');
    const store = transaction.objectStore('bibleVerses');
    
    const key = `${translation}_${reference}`;
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached Bible verse:', error);
    return null;
  }
}

// Cache entire chapter
export async function cacheBibleChapter(
  book: string,
  chapter: number,
  translation: string,
  verses: any[]
): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bibleVerses'], 'readwrite');
    const store = transaction.objectStore('bibleVerses');
    
    const key = `${translation}_${book}_${chapter}`;
    await store.put({
      key,
      reference: `${book} ${chapter}`,
      translation,
      data: verses,
      cachedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error caching Bible chapter:', error);
  }
}

export async function getCachedBibleChapter(
  book: string,
  chapter: number,
  translation: string
): Promise<any[] | null> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['bibleVerses'], 'readonly');
    const store = transaction.objectStore('bibleVerses');
    
    const key = `${translation}_${book}_${chapter}`;
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached Bible chapter:', error);
    return null;
  }
}

// HIGHLIGHTS - Offline Operations
export async function saveHighlightOffline(highlight: any): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['highlights'], 'readwrite');
    const store = transaction.objectStore('highlights');
    await store.put(highlight);
  } catch (error) {
    console.error('Error saving highlight offline:', error);
  }
}

export async function getHighlightsOffline(userId: string): Promise<any[]> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['highlights'], 'readonly');
    const store = transaction.objectStore('highlights');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting highlights offline:', error);
    return [];
  }
}

// SYNC QUEUE - Track offline operations for sync
export async function addToSyncQueue(
  type: 'favorite' | 'bookmark' | 'highlight',
  action: 'add' | 'remove' | 'update',
  userId: string,
  data: any
): Promise<void> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    await store.add({
      type,
      action,
      user_id: userId,
      data,
      createdAt: new Date().toISOString(),
      synced: false
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
  }
}

export async function getSyncQueue(userId: string): Promise<any[]> {
  try {
    const db = await initOfflineDB();
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.filter((item: any) => !item.synced));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initOfflineDB().catch(console.error);
}

