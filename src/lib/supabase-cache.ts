// Supabase Query Cache - Improve data fetching speed by caching query results
// Reduces redundant database queries and improves response time

interface CachedQuery {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

type QueryKey = string;

class SupabaseQueryCache {
  private cache: Map<QueryKey, CachedQuery> = new Map();
  private pendingQueries: Map<QueryKey, Promise<any>> = new Map();
  
  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = 60 * 1000; // 1 minute
  private readonly SHORT_TTL = 30 * 1000; // 30 seconds
  private readonly LONG_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Max cache size
  private readonly MAX_SIZE = 200;

  /**
   * Generate cache key from query parameters
   */
  private getCacheKey(
    table: string,
    select: string = '*',
    filters: Record<string, any> = {},
    order?: { column: string; ascending: boolean },
    limit?: number
  ): QueryKey {
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');
    
    const orderStr = order ? `${order.column}:${order.ascending}` : '';
    const limitStr = limit ? `limit:${limit}` : '';
    
    return `${table}|${select}|${filterStr}|${orderStr}|${limitStr}`;
  }

  /**
   * Get cached query result if available and not expired
   */
  get(
    table: string,
    select: string = '*',
    filters: Record<string, any> = {},
    order?: { column: string; ascending: boolean },
    limit?: number
  ): any | null {
    const key = this.getCacheKey(table, select, filters, order, limit);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Store query result in cache
   */
  set(
    data: any,
    table: string,
    ttl?: number,
    select: string = '*',
    filters: Record<string, any> = {},
    order?: { column: string; ascending: boolean },
    limit?: number
  ): void {
    // Clean up if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup();
    }
    
    const key = this.getCacheKey(table, select, filters, order, limit);
    const actualTTL = ttl || this.getTTLForTable(table);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: actualTTL
    });
  }

  /**
   * Get appropriate TTL for table type
   */
  private getTTLForTable(table: string): number {
    // Static/rarely changing data gets longer TTL
    const staticTables = ['bible_verses', 'bible_books', 'topics', 'parables'];
    if (staticTables.includes(table)) {
      return this.LONG_TTL;
    }
    
    // User-specific frequently changing data gets shorter TTL
    const userTables = ['verse_highlights', 'user_bible_favorites', 'bookmarks', 'ai_conversations'];
    if (userTables.includes(table)) {
      return this.SHORT_TTL;
    }
    
    return this.DEFAULT_TTL;
  }

  /**
   * Invalidate cache for a specific table (useful when data changes)
   */
  invalidate(table: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${table}|`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate cache for a specific user's data
   */
  invalidateUserData(userId: string, table?: string): void {
    const keysToDelete: string[] = [];
    const tables = table ? [table] : ['verse_highlights', 'user_bible_favorites', 'bookmarks', 'ai_conversations'];
    
    for (const key of this.cache.keys()) {
      for (const t of tables) {
        if (key.includes(`${t}|`) && key.includes(`user_id:${userId}`)) {
          keysToDelete.push(key);
        }
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Check if a query is pending (deduplication)
   */
  getPendingQuery(
    table: string,
    select: string = '*',
    filters: Record<string, any> = {},
    order?: { column: string; ascending: boolean },
    limit?: number
  ): Promise<any> | null {
    const key = this.getCacheKey(table, select, filters, order, limit);
    return this.pendingQueries.get(key) || null;
  }

  /**
   * Store pending query promise for deduplication
   */
  setPendingQuery(
    promise: Promise<any>,
    table: string,
    select: string = '*',
    filters: Record<string, any> = {},
    order?: { column: string; ascending: boolean },
    limit?: number
  ): void {
    const key = this.getCacheKey(table, select, filters, order, limit);
    this.pendingQueries.set(key, promise);
    
    // Remove from pending when resolved/rejected
    promise
      .then(() => this.pendingQueries.delete(key))
      .catch(() => this.pendingQueries.delete(key));
  }

  /**
   * Clean up expired entries and old entries if cache is full
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // Remove expired entries
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // If still full, remove oldest entries
    if (this.cache.size >= this.MAX_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.MAX_SIZE - 100); // Keep 100 most recent
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingQueries.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; pendingQueries: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      pendingQueries: this.pendingQueries.size
    };
  }
}

// Export singleton instance
export const supabaseCache = new SupabaseQueryCache();

// Helper function to create optimized Supabase query with caching
export async function cachedQuery<T = any>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    table: string;
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending: boolean };
    limit?: number;
    ttl?: number;
    skipCache?: boolean;
  }
): Promise<{ data: T | null; error: any }> {
  const { table, select = '*', filters = {}, order, limit, ttl, skipCache = false } = options;
  
  // Check cache first
  if (!skipCache) {
    const cached = supabaseCache.get(table, select, filters, order, limit);
    if (cached !== null) {
      return { data: cached as T, error: null };
    }
    
    // Check for pending query (deduplication)
    const pending = supabaseCache.getPendingQuery(table, select, filters, order, limit);
    if (pending) {
      try {
        const result = await pending;
        return result;
      } catch (error) {
        // If pending query fails, continue with new query
      }
    }
  }
  
  // Execute query
  const queryPromise = queryFn();
  
  // Store as pending for deduplication
  if (!skipCache) {
    supabaseCache.setPendingQuery(queryPromise, table, select, filters, order, limit);
  }
  
  try {
    const result = await queryPromise;
    
    // Cache successful results
    if (!skipCache && result.data && !result.error) {
      supabaseCache.set(result.data, table, ttl, select, filters, order, limit);
    }
    
    return result;
  } catch (error) {
    return { data: null, error };
  }
}

