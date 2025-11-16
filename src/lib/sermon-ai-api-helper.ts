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

    console.log('[Sermon AI] ===== Starting API Call =====');
    console.log('[Sermon AI] API URL:', apiUrl);
    console.log('[Sermon AI] Request payload:', {
      promptLength: prompt?.length || 0,
      systemPrompt: systemPrompt?.substring(0, 50) + '...',
      messagesCount: messages?.length || 0,
      maxTokens,
      temperature
    });

    const startTime = Date.now();
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

    const duration = Date.now() - startTime;
    console.log('[Sermon AI] Response received:', {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });

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
    console.log('[Sermon AI] Response data:', {
      hasContent: !!data.content,
      contentLength: data.content?.length || 0,
      model: data.model,
      usage: data.usage
    });
    
    if (!data.content) {
      console.error('[Sermon AI] Invalid response data:', data);
      throw new Error('❌ Invalid response from Sermon AI. Please try again.');
    }

    console.log('[Sermon AI] ===== API Call Success =====');
    return data.content;
  } catch (error: any) {
    console.error('[Sermon AI] ===== API Call Failed =====');
    console.error('[Sermon AI] Error type:', error?.constructor?.name);
    console.error('[Sermon AI] Error name:', error?.name);
    console.error('[Sermon AI] Error message:', error?.message);
    console.error('[Sermon AI] Error stack:', error?.stack);
    console.error('[Sermon AI] Full error object:', error);
    
    // Network errors
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const networkError = new Error('🔧 Failed to connect to Sermon AI service. The API route may not be accessible. Please check:\n1. The API route is deployed correctly\n2. Your internet connection\n3. Vercel deployment status');
      console.error('[Sermon AI] Network error detected');
      throw networkError;
    }
    
    // CORS errors
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      const corsError = new Error('🔧 CORS error: The API route may not be configured correctly for cross-origin requests.');
      console.error('[Sermon AI] CORS error detected');
      throw corsError;
    }
    
    if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('Sermon_AI_API')) {
      console.error('[Sermon AI] API key error detected');
      throw error; // Re-throw API key errors as-is
    }
    
    console.error('[Sermon AI] Generic error, re-throwing with message');
    throw new Error(error?.message || 'Failed to connect to Sermon AI service. Please try again.');
  }
}

