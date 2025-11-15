/**
 * Auth Session Cache Utility (Simplified)
 * Minimal helpers for compatibility - Supabase handles session persistence natively
 */

// These functions are kept for backward compatibility but rely on Supabase's native localStorage persistence

export function getCachedSession(): any | null {
  // Supabase handles session caching in localStorage automatically
  // Return null to let Supabase manage it
  return null;
}

export function setCachedSession(session: any | null): void {
  // Supabase handles session caching in localStorage automatically
  // No need to cache manually
}

export function clearCachedSession(): void {
  // Supabase handles session clearing automatically on signOut
  // Only clear custom flags if needed
  if (typeof window !== 'undefined') {
    try {
      // Clear any custom auth-related flags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_modal_seen_')) {
          // Keep profile modal flags - they're user-specific
        }
      });
    } catch (error) {
      // Ignore errors
    }
  }
}

export function shouldUseCachedSession(): boolean {
  // Always let Supabase handle session management
  return false;
}

export function isSessionValid(session: any | null): boolean {
  if (!session) return false;
  if (!session.access_token || !session.user) return false;
  return true;
}

export function isCachedSessionValid(cached: any | null): boolean {
  // Always return false to let Supabase manage sessions
  return false;
}
