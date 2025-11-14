// Response Cache - In-memory caching for AI responses
// Reduces API calls and improves response speed

interface CachedResponse {
  text: string;
  mode: string;
  lang: string;
  sources?: Array<{
    id: string;
    filename: string;
    score: number;
    url?: string;
    snippet?: string;
  }>;
  crossReferences?: string[];
  timestamp: number;
}

// In-memory cache with TTL (Time To Live)
class ResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_SIZE = 100; // Max 100 cached responses

  /**
   * Generate cache key from message and options
   */
  private getCacheKey(message: string, mode?: string, language?: string): string {
    const normalizedMessage = message.trim().toLowerCase();
    return `${normalizedMessage}|${mode || 'default'}|${language || 'default'}`;
  }

  /**
   * Check if cached response exists and is still valid
   */
  get(message: string, mode?: string, language?: string): CachedResponse | null {
    const key = this.getCacheKey(message, mode, language);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    const now = Date.now();
    if (now - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Store response in cache
   */
  set(
    message: string,
    response: Omit<CachedResponse, 'timestamp'>,
    mode?: string,
    language?: string
  ): void {
    // Clean up old entries if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup();
    }
    
    const key = this.getCacheKey(message, mode, language);
    this.cache.set(key, {
      ...response,
      timestamp: Date.now()
    });
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // If still full, remove oldest entries
    if (this.cache.size >= this.MAX_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.MAX_SIZE - 50); // Keep 50 most recent
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE
    };
  }
}

// Export singleton instance
export const responseCache = new ResponseCache();

