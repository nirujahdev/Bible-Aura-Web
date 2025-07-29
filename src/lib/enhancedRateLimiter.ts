interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequestTime: number;
  violations: number;
  lastViolationTime?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstLimit?: number; // Allow short bursts
  priority?: 'low' | 'normal' | 'high';
  errorMessage?: string;
}

interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remainingRequests?: number;
  retryAfterMs?: number;
  violations?: number;
  errorMessage?: string;
}

export class EnhancedRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly configs: Map<string, RateLimitConfig>;
  private readonly defaultConfig: RateLimitConfig;

  constructor(defaultConfig: RateLimitConfig) {
    this.defaultConfig = defaultConfig;
    this.configs = new Map();
    
    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  // Set different rate limits for different endpoints/users
  setConfig(identifier: string, config: RateLimitConfig): void {
    this.configs.set(identifier, config);
  }

  // Get config for specific identifier, fallback to default
  private getConfig(identifier: string): RateLimitConfig {
    return this.configs.get(identifier) || this.defaultConfig;
  }

  checkLimit(identifier: string, endpoint?: string): RateLimitResult {
    const now = Date.now();
    const configKey = endpoint ? `${identifier}:${endpoint}` : identifier;
    const config = this.getConfig(configKey);
    const entry = this.limits.get(configKey);

    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to trigger cleanup
      this.cleanup(now);
    }

    if (!entry || now > entry.resetTime) {
      // First request or expired window
      this.limits.set(configKey, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequestTime: now,
        violations: 0
      });
      
      return { 
        allowed: true, 
        remainingRequests: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        violations: 0
      };
    }

    // Check for burst limit if configured
    if (config.burstLimit) {
      const timeSinceFirst = now - entry.firstRequestTime;
      if (timeSinceFirst < 5000 && entry.count >= config.burstLimit) { // 5 second burst window
        entry.violations++;
        entry.lastViolationTime = now;
        this.limits.set(configKey, entry);
        
        return { 
          allowed: false, 
          resetTime: entry.resetTime,
          remainingRequests: 0,
          retryAfterMs: 5000 - timeSinceFirst,
          violations: entry.violations,
          errorMessage: config.errorMessage || 'Too many requests in a short time. Please wait a moment.'
        };
      }
    }

    if (entry.count >= config.maxRequests) {
      entry.violations++;
      entry.lastViolationTime = now;
      this.limits.set(configKey, entry);
      
      return { 
        allowed: false, 
        resetTime: entry.resetTime,
        remainingRequests: 0,
        retryAfterMs: entry.resetTime - now,
        violations: entry.violations,
        errorMessage: config.errorMessage || 'Rate limit exceeded. Please try again later.'
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(configKey, entry);

    return { 
      allowed: true, 
      remainingRequests: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      violations: entry.violations
    };
  }

  // Reset limits for a specific identifier (useful for premium users or testing)
  resetLimit(identifier: string, endpoint?: string): void {
    const configKey = endpoint ? `${identifier}:${endpoint}` : identifier;
    this.limits.delete(configKey);
  }

  // Get current usage stats
  getUsageStats(identifier: string, endpoint?: string): {
    currentCount: number;
    maxRequests: number;
    resetTime: number;
    violations: number;
    timeUntilReset: number;
  } {
    const configKey = endpoint ? `${identifier}:${endpoint}` : identifier;
    const config = this.getConfig(configKey);
    const entry = this.limits.get(configKey);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return {
        currentCount: 0,
        maxRequests: config.maxRequests,
        resetTime: now + config.windowMs,
        violations: 0,
        timeUntilReset: config.windowMs
      };
    }

    return {
      currentCount: entry.count,
      maxRequests: config.maxRequests,
      resetTime: entry.resetTime,
      violations: entry.violations,
      timeUntilReset: Math.max(0, entry.resetTime - now)
    };
  }

  private cleanup(now: number = Date.now()) {
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Get all current limits (useful for debugging)
  getAllLimits(): Array<{
    key: string;
    count: number;
    resetTime: number;
    violations: number;
    timeRemaining: number;
  }> {
    const now = Date.now();
    return Array.from(this.limits.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime,
      violations: entry.violations,
      timeRemaining: Math.max(0, entry.resetTime - now)
    }));
  }
}

// Create enhanced rate limiter instances with biblical messaging
export const aiChatRateLimiter = new EnhancedRateLimiter({
  maxRequests: 15, // Generous for biblical study (15 per minute)
  windowMs: 60000, // 1 minute window
  burstLimit: 5, // Allow thoughtful follow-up questions
  errorMessage: '🕊️ Please slow down and take time to meditate on the previous biblical wisdom. "Be still, and know that I am God" (Psalm 46:10)'
});

export const bibleApiRateLimiter = new EnhancedRateLimiter({
  maxRequests: 100, // Higher limit for Bible verse lookups
  windowMs: 60000, // 1 minute
  burstLimit: 20, // Allow quick scripture browsing
  errorMessage: '📖 Too many scripture requests. Let God\'s Word speak to your heart before seeking more. "Man shall not live by bread alone, but by every word that comes from the mouth of God" (Matthew 4:4)'
});

export const dailyVerseRateLimiter = new EnhancedRateLimiter({
  maxRequests: 8, // Allow multiple daily verse requests
  windowMs: 300000, // 5 minutes
  burstLimit: 3,
  errorMessage: '✨ Daily verse limit reached. Use this time to reflect on God\'s goodness. "This is the day that the Lord has made; let us rejoice and be glad in it" (Psalm 118:24)'
});

export const guestRateLimiter = new EnhancedRateLimiter({
  maxRequests: 5, // More generous for guests to encourage engagement
  windowMs: 300000, // 5 minutes
  burstLimit: 2,
  errorMessage: '🙏 Guest usage limit reached. Sign in to unlock more biblical insights and continue your spiritual journey!'
});

// Premium user configurations with biblical encouragement
export const premiumConfigs = {
  aiChat: {
    maxRequests: 60, // Higher limit for deep biblical study
    windowMs: 60000,
    burstLimit: 15, // Allow extensive Q&A sessions
    priority: 'high' as const,
    errorMessage: '👑 Premium biblical wisdom limit reached. Take a moment to pray and reflect on God\'s Word. "Ask, and it will be given to you; seek, and you will find" (Matthew 7:7)'
  },
  bibleApi: {
    maxRequests: 300, // Generous scripture access
    windowMs: 60000,
    burstLimit: 75,
    priority: 'high' as const,
    errorMessage: '📚 Premium scripture access limit reached. "The grass withers, the flower fades, but the word of our God will stand forever" (Isaiah 40:8)'
  }
};

// Configure premium limits
export function configurePremiumUser(userId: string): void {
  aiChatRateLimiter.setConfig(`user:${userId}:ai-chat`, premiumConfigs.aiChat);
  bibleApiRateLimiter.setConfig(`user:${userId}:bible-api`, premiumConfigs.bibleApi);
}

export function getUserIdentifier(userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // For guests, try to create a session-based identifier
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('bible-aura-session');
    if (!sessionId) {
      sessionId = `guest:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('bible-aura-session', sessionId);
    }
    return sessionId;
  }
  
  // Fallback for server-side
  return `guest:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to check if user is likely abusing the system
export function detectAbusePattern(identifier: string): {
  isAbusive: boolean;
  reason?: string;
  suggestedAction?: string;
} {
  const aiStats = aiChatRateLimiter.getUsageStats(identifier, 'ai-chat');
  const bibleStats = bibleApiRateLimiter.getUsageStats(identifier, 'bible-api');
  
  // Check for excessive violations
  if (aiStats.violations > 5 || bibleStats.violations > 10) {
    return {
      isAbusive: true,
      reason: 'Excessive rate limit violations',
      suggestedAction: 'Temporarily restrict access'
    };
  }
  
  // Check for unusual usage patterns
  if (aiStats.currentCount > aiStats.maxRequests * 0.8 && bibleStats.currentCount > bibleStats.maxRequests * 0.8) {
    return {
      isAbusive: true,
      reason: 'Suspicious usage pattern across multiple endpoints',
      suggestedAction: 'Monitor closely'
    };
  }
  
  return { isAbusive: false };
}

// Export for backward compatibility
export { getUserIdentifier as getGuestIdentifier }; 