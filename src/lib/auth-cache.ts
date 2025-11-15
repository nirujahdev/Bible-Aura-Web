/**
 * Auth Session Cache Utility
 * Provides session caching to avoid getSession() calls on every refresh
 */

const CACHE_KEY = 'bible-aura-session-cache';
const CACHE_VERSION = 1;
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedSession {
  session: any;
  timestamp: number;
  version: number;
}

/**
 * Check if a cached session is still valid
 */
export function isCachedSessionValid(cached: CachedSession | null): boolean {
  if (!cached) return false;
  
  // Check version
  if (cached.version !== CACHE_VERSION) {
    return false;
  }
  
  // Check age
  const age = Date.now() - cached.timestamp;
  if (age > MAX_CACHE_AGE) {
    return false;
  }
  
  // Check if session exists and has a valid access token
  if (!cached.session || !cached.session.access_token) {
    return false;
  }
  
  // Check if token is expired (token expiry is typically 1 hour, but we cache for 24h max)
  // Supabase will handle token refresh, so we just check basic structure
  try {
    const expiresAt = cached.session.expires_at;
    if (expiresAt && expiresAt * 1000 < Date.now()) {
      // Token is expired, but Supabase can refresh it
      // So we still consider it valid for cache purposes
      return true;
    }
  } catch (error) {
    // If we can't parse expiry, assume valid (Supabase will handle it)
    return true;
  }
  
  return true;
}

/**
 * Get cached session from localStorage
 */
export function getCachedSession(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }
    
    const parsed: CachedSession = JSON.parse(cached);
    
    if (isCachedSessionValid(parsed)) {
      return parsed.session;
    } else {
      // Invalid cache, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  } catch (error) {
    console.error('Error reading session cache:', error);
    // Remove corrupted cache
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // Ignore removal errors
    }
    return null;
  }
}

/**
 * Set cached session in localStorage
 */
export function setCachedSession(session: any | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    if (session) {
      const cached: CachedSession = {
        session,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } else {
      // Clear cache if session is null
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (error) {
    console.error('Error setting session cache:', error);
    // If storage is full or unavailable, silently fail
    // The app will still work, just without caching
  }
}

/**
 * Clear cached session
 */
export function clearCachedSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Check if we should use cached session (for optimization)
 * Returns true if cache exists and is valid
 */
export function shouldUseCachedSession(): boolean {
  const cached = getCachedSession();
  return cached !== null;
}

/**
 * Validate if a session is still valid (not expired and has required fields)
 */
export function isSessionValid(session: any | null): boolean {
  if (!session) return false;
  
  // Check if session has required fields
  if (!session.access_token || !session.user) {
    return false;
  }
  
  // Check if token is expired
  // Note: Supabase handles token refresh automatically, so we check if it's recently expired
  try {
    const expiresAt = session.expires_at;
    if (expiresAt) {
      // Allow 5 minutes grace period for token refresh
      const expiresAtMs = expiresAt * 1000;
      const now = Date.now();
      const gracePeriod = 5 * 60 * 1000; // 5 minutes
      
      // If token is expired beyond grace period, consider invalid
      if (expiresAtMs + gracePeriod < now) {
        return false;
      }
    }
  } catch (error) {
    // If we can't parse expiry, assume valid (Supabase will handle it)
    return true;
  }
  
  return true;
}

