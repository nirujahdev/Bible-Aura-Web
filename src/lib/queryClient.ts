import { QueryClient } from '@tanstack/react-query';

// Create a React Query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query defaults
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time (previously cacheTime)
          retry: (failureCount, error: any) => {
      // Only retry on network errors, not on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
      refetchOnReconnect: true, // Refetch when reconnecting to internet
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
    },
  },
});

// Query keys factory for better organization
export const queryKeys = {
  // User-related queries
  profile: (userId: string) => ['profile', userId],
  
  // Bible content queries
  dailyVerse: (userId: string, date: string) => ['dailyVerse', userId, date],
  bibleBooks: (translation: string) => ['bibleBooks', translation],
  bibleChapter: (bookId: string, chapter: number, translation: string) => 
    ['bibleChapter', bookId, chapter, translation],
  bibleSearch: (query: string, translation: string) => ['bibleSearch', query, translation],
  bookmarks: (userId: string) => ['bookmarks', userId],
  
  // AI-related queries
  conversations: (userId: string) => ['conversations', userId],
  conversation: (conversationId: string) => ['conversation', conversationId],
  
  // Journal queries
  journalEntries: (userId: string) => ['journalEntries', userId],
  journalEntry: (entryId: string) => ['journalEntry', entryId],
  
  // Prayer queries
  prayerRequests: (userId: string) => ['prayerRequests', userId],
  
  // Reading progress queries
  readingProgress: (userId: string) => ['readingProgress', userId],
  readingPlans: (userId: string) => ['readingPlans', userId],
  
  // Analytics queries
  analytics: (userId: string) => ['analytics', userId],
} as const;

// Cache invalidation helpers
export const invalidateQueries = {
  profile: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) }),
  bookmarks: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks(userId) }),
  conversations: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) }),
  journalEntries: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.journalEntries(userId) }),
  prayerRequests: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.prayerRequests(userId) }),
  analytics: (userId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.analytics(userId) }),
}; 