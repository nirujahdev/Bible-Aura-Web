// Sermon AI API Helper - Secure server-side API calls
// Uses server-side API route to keep API key secure (not exposed to client)
// Uses GPT-4.1 model

export interface SermonAIRequestOptions {
  systemPrompt?: string;
  messages?: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

/**
 * Call Sermon AI API through secure server-side route
 * API key is kept secure on server (Sermon_AI_API in Vercel env)
 * Uses GPT-4.1 model
 */
export async function callSermonAIAPI(
  prompt: string,
  options: SermonAIRequestOptions = {}
): Promise<string> {
  const {
    systemPrompt = 'You are an expert sermon writing assistant. Provide helpful, natural sermon content.',
    messages = [],
    maxTokens = 1000,
    temperature = 0.7,
    stream = false,
    onChunk
  } = options;

  try {
    // Call server-side API route (keeps API key secure)
    const apiUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/sermon-ai`
      : '/api/sermon-ai';

    console.log('[Sermon AI] Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        messages,
        maxTokens,
        temperature
      })
    });

    console.log('[Sermon AI] Response status:', response.status);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If JSON parsing fails, try to get text
        const text = await response.text().catch(() => '');
        errorData = { message: text || `HTTP ${response.status}` };
      }
      
      const errorMessage = errorData.message || errorData.error || `API error: ${response.status}`;
      
      console.error('[Sermon AI] API Error:', {
        status: response.status,
        error: errorMessage,
        data: errorData
      });
      
      if (response.status === 401) {
        throw new Error('🔐 Sermon AI API authentication failed. Please check your Sermon_AI_API key is set in Vercel environment variables.');
      } else if (response.status === 404) {
        throw new Error('🔧 Sermon AI API route not found. Please ensure the API route is deployed correctly.');
      } else if (response.status === 429) {
        throw new Error('⏳ Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('🔧 Sermon AI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`❌ Sermon AI API error: ${errorMessage}`);
      }
    }

    const data = await response.json();
    
    if (!data.content) {
      console.error('[Sermon AI] Invalid response data:', data);
      throw new Error('❌ Invalid response from Sermon AI. Please try again.');
    }

    return data.content;
  } catch (error: any) {
    console.error('[Sermon AI] Full Error:', error);
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('🔧 Failed to connect to Sermon AI service. Please check your internet connection and ensure the API route is accessible.');
    }
    
    if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('Sermon_AI_API')) {
      throw error; // Re-throw API key errors as-is
    }
    
    throw new Error(error?.message || 'Failed to connect to Sermon AI service. Please try again.');
  }
}

