// Research Lab Cache Utility
// Implements LRU cache and request deduplication for optimal performance

import { LRUCache } from 'lru-cache';
import { createClient } from '@supabase/supabase-js';

// Cache configuration
const CACHE_TTL = parseInt(process.env.RESEARCH_LAB_CACHE_TTL || '600000', 10); // 10 minutes default
const MAX_CACHE_SIZE = 1000;

// LRU Cache for sources
const sourcesCache = new LRUCache<string, any>({
  max: MAX_CACHE_SIZE,
  ttl: CACHE_TTL,
  updateAgeOnGet: true,
});

// Request deduplication: prevent multiple simultaneous requests for the same data
const inFlightRequests = new Map<string, Promise<any>>();

// Supabase client (shared instance)
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  // If auth token provided, create authenticated client
  if (authToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });
  }
  
  // Otherwise use shared client (for non-user operations)
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

/**
 * Request deduplication: if a request for the same key is in flight, return that promise
 */
function fetchOnce<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = fetchFn()
    .then(result => {
      inFlightRequests.delete(key);
      return result;
    })
    .catch(error => {
      inFlightRequests.delete(key);
      throw error;
    });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * Generate cache key for sources
 */
function getSourcesCacheKey(notebookId: string, userId: string, sourceIds?: string[]): string {
  if (sourceIds && sourceIds.length > 0) {
    const sortedIds = [...sourceIds].sort().join(',');
    return `sources:${notebookId}:${userId}:${sortedIds}`;
  }
  return `sources:${notebookId}:${userId}`;
}

/**
 * Get cached sources or fetch from database
 * Implements caching + request deduplication + optimized field selection
 */
export async function getCachedSources(
  notebookId: string,
  userId: string,
  fields: string[] = ['id', 'title', 'processed_content', 'source_type'],
  sourceIds?: string[],
  authToken?: string
): Promise<{ data: any[] | null; error: any }> {
  const cacheKey = getSourcesCacheKey(notebookId, userId, sourceIds);

  // Check cache first
  const cached = sourcesCache.get(cacheKey);
  if (cached) {
    console.log(`[Cache] Hit for ${cacheKey}`);
    return { data: cached, error: null };
  }

  // Use request deduplication
  return fetchOnce(cacheKey, async () => {
    try {
      const supabase = getSupabaseClient(authToken);
      const startTime = performance.now();

      let query = supabase
        .from('research_sources')
        .select(fields.join(', '))
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .eq('is_included', true);

      if (sourceIds && sourceIds.length > 0) {
        query = query.in('id', sourceIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      const queryTime = performance.now() - startTime;
      console.log(`[Cache] Database query took ${queryTime.toFixed(2)}ms for ${cacheKey}`);

      if (error) {
        const errorMessage = error.message || String(error);
        
        // Check for missing table
        if (
          (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
          errorMessage.includes('PGRST116') ||
          error.code === 'PGRST116'
        ) {
          console.error('[Cache] Table not found error:', error);
          return {
            data: null,
            error: {
              message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
              code: 'TABLE_NOT_FOUND',
              hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql'
            }
          };
        }

        // Check for RLS errors
        if (error.code === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
          console.error('[Cache] RLS error:', error);
          return {
            data: null,
            error: {
              message: 'Permission denied. Please check Row Level Security policies.',
              code: 'RLS_ERROR',
              hint: 'The RLS policies may not be set up correctly. Please verify the migration was run completely.',
              originalError: error
            }
          };
        }

        console.error('[Cache] Database error:', error);
        return { data: null, error };
      }

      // Cache the result
      if (data) {
        sourcesCache.set(cacheKey, data);
        console.log(`[Cache] Cached ${data.length} sources for ${cacheKey}`);
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('[Cache] Fetch error:', err);
      
      // Handle JSON parsing errors (when Supabase returns HTML)
      if (err.message?.includes('JSON') || err.message?.includes('DOCTYPE')) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql',
            originalError: err.message
          }
        };
      }

      return {
        data: null,
        error: err
      };
    }
  });
}

/**
 * Invalidate cache for a notebook's sources
 */
export function invalidateSourcesCache(notebookId: string, userId: string): void {
  // Invalidate base cache key
  const baseKey = getSourcesCacheKey(notebookId, userId);
  sourcesCache.delete(baseKey);
  
  // Also invalidate any filtered cache keys (pattern matching)
  for (const key of sourcesCache.keys()) {
    if (key.startsWith(`sources:${notebookId}:${userId}:`)) {
      sourcesCache.delete(key);
    }
  }
  
  console.log(`[Cache] Invalidated cache for notebook ${notebookId}`);
}

/**
 * Clear all cache (useful for testing or manual invalidation)
 */
export function clearAllCache(): void {
  sourcesCache.clear();
  console.log('[Cache] Cleared all cache');
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats(): { size: number; maxSize: number; ttl: number } {
  return {
    size: sourcesCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttl: CACHE_TTL,
  };
}

