// Bible Aura Agent SDK Client
// Replaces ChatKit with OpenAI Agents SDK

// Helper to safely read environment variables
const getEnv = (key: string, fallback = ''): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
};

// API endpoint configuration
const apiEndpoint = getEnv('VITE_CHATKIT_API_ENDPOINT', '/api/bibleaura-agent');

export const AGENT_SDK_CONFIG = Object.freeze({
  apiEndpoint,
});

// Response type from Agent SDK API
export interface AgentSDKResponse {
  text: string;
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';
  lang: 'en' | 'ta';
  sources?: Array<{
    id: string;
    filename: string;
    score: number;
    url?: string;
    snippet?: string;
  }>;
  crossReferences?: string[];
  validatedVerses?: Array<{
    reference: string;
    verseText: string;
    book: string;
    chapter: number;
    verse: number;
  }>;
}

// Request type for Agent SDK API
export interface AgentSDKRequest {
  message: string;
  mode?: string;
  language?: string;
}

/**
 * Send a message to Bible Aura AI using Agent SDK
 * @param message - The user's message to send
 * @param options - Optional mode and language preferences
 * @returns Promise with the Agent SDK response containing text, mode, language, sources, and cross-references
 */
export async function sendBibleAuraMessage(message: string, options?: { mode?: string; language?: string }): Promise<AgentSDKResponse> {
  // Validate input
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message is required and must be a non-empty string');
  }

  if (import.meta.env.DEV) {
    console.log('[Bible Aura AI] Processing message through Agent SDK...');
  }

  // Use the same origin to avoid CORS issues
  const apiUrl = `${window.location.origin}${AGENT_SDK_CONFIG.apiEndpoint}`;

  if (import.meta.env.DEV) {
    console.log('[Bible Aura AI] Calling Agent SDK API:', apiUrl);
  }

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: message.trim(),
              mode: options?.mode,
              language: options?.language
            } as AgentSDKRequest),
          });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `API error: ${response.status}`;
      
      console.error('[Bible Aura AI] ❌ Agent SDK API failed:', errorMessage);
      
      // Provide helpful error messages
      if (response.status === 500 && errorMessage.includes('API key')) {
        throw new Error(
          '❌ OpenAI API key not configured on server.\n\n' +
          'Please ensure OPENAI_API_KEY is set in your Vercel environment variables.'
        );
      }
      
      throw new Error(`Agent SDK API error: ${errorMessage}`);
    }

    const data: AgentSDKResponse = await response.json();
    
    if (!data || !data.text || typeof data.text !== 'string') {
      throw new Error('Invalid response from Agent SDK. Expected text field in response.');
    }

    if (import.meta.env.DEV) {
      console.log('[Bible Aura AI] ✓ Agent SDK success', {
        mode: data.mode,
        lang: data.lang,
        sourcesCount: data.sources?.length || 0,
        crossReferencesCount: data.crossReferences?.length || 0
      });
    }

    return data;

  } catch (error: any) {
    console.error('[Bible Aura AI] ❌ Agent SDK error:', error);
    
    // Re-throw with better error message if it's not already formatted
    if (error.message && !error.message.includes('❌')) {
      // Don't wrap if it's already a network error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(`Network error: Unable to connect to Agent SDK API. Please check your connection.`);
      }
      throw new Error(`Agent SDK failed: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Check if Agent SDK API is available
 * @returns Promise that resolves to true if API is available, false otherwise
 */
export async function checkAgentSDKAvailability(): Promise<boolean> {
  try {
    const testMessage = 'test';
    await sendBibleAuraMessage(testMessage);
    return true;
  } catch {
    return false;
  }
}

