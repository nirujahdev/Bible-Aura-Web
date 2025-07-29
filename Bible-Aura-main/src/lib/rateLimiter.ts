interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) { // 5 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(identifier: string): { allowed: boolean; resetTime?: number; remainingRequests?: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    // Clean up expired entries
    this.cleanup(now);

    if (!entry || now > entry.resetTime) {
      // First request or expired window
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { 
        allowed: true, 
        remainingRequests: this.maxRequests - 1,
        resetTime: now + this.windowMs 
      };
    }

    if (entry.count >= this.maxRequests) {
      return { 
        allowed: false, 
        resetTime: entry.resetTime,
        remainingRequests: 0 
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(identifier, entry);

    return { 
      allowed: true, 
      remainingRequests: this.maxRequests - entry.count,
      resetTime: entry.resetTime 
    };
  }

  private cleanup(now: number) {
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  getRemainingTime(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry) return 0;
    
    const now = Date.now();
    return Math.max(0, entry.resetTime - now);
  }
}

// Create global rate limiter instances
export const aiChatRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
export const guestRateLimiter = new RateLimiter(1, 300000); // 1 request per 5 minutes for guests

export function getUserIdentifier(userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // For guests, try to create a session-based identifier
  let sessionId = localStorage.getItem('bible-aura-session');
  if (!sessionId) {
    sessionId = `session:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bible-aura-session', sessionId);
  }
  
  return sessionId;
} 