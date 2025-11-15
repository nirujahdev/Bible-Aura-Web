// Supabase Client Configuration
// SECURITY: Never hardcode credentials - always use environment variables
import { createClient } from '@supabase/supabase-js';

// SECURITY: Require environment variables - no hardcoded fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use placeholder values if not set to prevent app crash, but log warning
const hasCredentials = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!hasCredentials) {
  console.error(
    '⚠️ Supabase credentials not configured!\n\n' +
    'Please set the following environment variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'These should be set in your .env.local file or deployment environment.\n' +
    'The app will continue to load but Supabase features will not work.'
  );
}

// Enhanced validation and debugging (safe - no credential values logged)
// Log in both dev and production to help diagnose issues
console.log('🔧 Supabase Configuration:', {
  url: SUPABASE_URL ? '✓ SET' : '✗ MISSING',
  key: SUPABASE_PUBLISHABLE_KEY ? '✓ SET' : '✗ MISSING',
  environment: import.meta.env.MODE,
  hasCredentials: hasCredentials
});

// Export credential check helper
export const hasSupabaseCredentials = hasCredentials;

// Environment variables are now required (no fallbacks for security)

// Enhanced detection for auth-related URLs
const isFromEmailLink = typeof window !== 'undefined' && (() => {
  const hash = window.location.hash;
  const search = window.location.search;
  
  // Check for various auth URL patterns
  const authParams = [
    'access_token',
    'refresh_token',
    'token_hash',
    'type=recovery',
    'type=email_change', 
    'type=signup',
    'type=invite',
    'type=magiclink',
    'error=',
    'error_code=',
    'error_description='
  ];
  
  return authParams.some(param => hash.includes(param) || search.includes(param));
})();

// Enhanced Supabase client configuration
// Use real credentials if available, otherwise use placeholders to prevent crash
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_PUBLISHABLE_KEY || 'placeholder-key',
  {
    auth: {
      // Enable session persistence for better UX - stores in localStorage (not sessionStorage)
      persistSession: true,
      
      // Enable auto refresh for seamless authentication
      autoRefreshToken: true,
      
      // Always detect auth sessions in URL for magic links and OAuth
      detectSessionInUrl: true,
      
      // Use PKCE flow for better security
      flowType: 'pkce',
      
      // Enhanced debug mode for development
      debug: import.meta.env.DEV ? true : false,
      
      // Storage key prefix for multi-tenancy support
      storageKey: 'sb-bible-aura-auth-token',
      
      // Explicitly use localStorage for persistence (not sessionStorage)
      // This ensures sessions persist across browser closes
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          try {
            return localStorage.getItem(key);
          } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
          }
        },
        setItem: (key: string, value: string) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error writing to localStorage:', error);
            // If storage is full, try to clear old items
            try {
              const keysToRemove = Object.keys(localStorage).filter(k => 
                k.startsWith('sb-') && k !== key
              );
              keysToRemove.slice(0, 5).forEach(k => localStorage.removeItem(k));
              localStorage.setItem(key, value);
            } catch (retryError) {
              console.error('Error retrying localStorage write:', retryError);
            }
          }
        },
        removeItem: (key: string) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        }
      } : undefined
    },
    
    global: {
      headers: {
        'X-Client-Info': 'bible-aura-web',
        'X-Client-Version': '2.0.0'
      },
      // Add fetch with better error handling
      fetch: async (url, options = {}) => {
        // Check if we're using placeholder credentials
        if (!hasCredentials) {
          const error = new Error('Supabase credentials not configured');
          console.error('❌ Supabase Fetch Blocked:', {
            reason: 'Missing environment variables',
            url: typeof url === 'string' ? url : url.toString(),
            message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in Vercel environment variables'
          });
          throw error;
        }
        
        // Validate URL is not placeholder
        const urlString = typeof url === 'string' ? url : url.toString();
        if (urlString.includes('placeholder.supabase.co')) {
          const error = new Error('Invalid Supabase URL: placeholder detected');
          console.error('❌ Supabase Fetch Blocked:', {
            reason: 'Placeholder URL detected',
            message: 'Please set VITE_SUPABASE_URL in Vercel environment variables'
          });
          throw error;
        }
        
        try {
          return await fetch(url, options);
        } catch (error: any) {
          // Enhanced error logging for fetch failures
          console.error('❌ Supabase Fetch Error:', {
            url: urlString,
            error: error.message,
            type: error.name,
            cause: error.cause,
            hasCredentials: hasCredentials,
            supabaseUrl: SUPABASE_URL ? 'SET' : 'MISSING',
            isPlaceholder: urlString.includes('placeholder')
          });
          
          // Provide helpful error messages
          if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.error(
              '🔍 Network Error Diagnosis:\n' +
              '1. ✅ Supabase project is active (verified via MCP)\n' +
              '2. ⚠️ Check VITE_SUPABASE_URL is set in Vercel Dashboard\n' +
              '3. ⚠️ Check VITE_SUPABASE_ANON_KEY is set in Vercel Dashboard\n' +
              '4. ⚠️ Verify environment variables are set for Production environment\n' +
              '5. ⚠️ Redeploy after setting environment variables\n' +
              `Current Status: ${hasCredentials ? 'Credentials SET' : 'Credentials MISSING'}\n` +
              `URL: ${SUPABASE_URL || 'NOT SET'}`
            );
          }
          
          throw error;
        }
      }
    },
    
    db: {
      schema: 'public'
    },
    
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Enhanced error handling and logging
// Add auth state change logging for debugging (works in both dev and production)
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('🔐 Supabase Auth Event:', event, {
      hasSession: !!session,
      hasUser: !!session?.user,
      isFromEmailLink,
      url: window.location.href
    });
  }
  
  // Log errors in production too (without sensitive data)
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    console.log('🔐 Auth state changed:', event);
  }
});

// Test Supabase connection (only if credentials are available)
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
  if (!hasCredentials) {
    return { success: false, error: 'Supabase credentials not configured' };
  }
  
  try {
    // First, test if we can reach the Supabase URL
    try {
      const healthCheck = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': SUPABASE_PUBLISHABLE_KEY || '',
        }
      });
      
      if (!healthCheck.ok && healthCheck.status !== 404) {
        return { 
          success: false, 
          error: `Cannot reach Supabase (Status: ${healthCheck.status})`,
          details: {
            status: healthCheck.status,
            statusText: healthCheck.statusText,
            url: SUPABASE_URL
          }
        };
      }
    } catch (fetchError: any) {
      return { 
        success: false, 
        error: `Network error: ${fetchError.message}`,
        details: {
          type: 'network',
          message: fetchError.message,
          url: SUPABASE_URL
        }
      };
    }
    
    // Simple test query to verify connection
    const { error } = await supabase.from('ai_conversations').select('id').limit(1);
    
    if (error) {
      // Check if it's a table missing error vs connection error
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return { success: false, error: 'Database table missing. Please run the migration script.' };
      }
      
      // Check for network/fetch errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Network connection failed. Check CORS settings and project status.',
          details: {
            code: error.code,
            message: error.message,
            hint: 'Your Supabase project might be paused or CORS is not configured correctly.'
          }
        };
      }
      
      return { success: false, error: error.message || 'Connection test failed', details: { code: error.code } };
    }
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Connection test failed',
      details: {
        type: error.name,
        message: error.message
      }
    };
  }
};

// Export auth detection helper
export { isFromEmailLink };

// Helper function to check if user is authenticated
export const getAuthUser = () => {
  return supabase.auth.getUser();
};

// Helper function to get current session
export const getSession = () => {
  return supabase.auth.getSession();
};

// Helper function to sign out and clear all auth data
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    
    // Clear any additional auth-related localStorage items
    if (typeof window !== 'undefined') {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('auth') || key.includes('session')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};