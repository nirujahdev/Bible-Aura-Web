// Sermon AI API Helper - Separate API key and model for sermon AI operations
// Uses VITE_SERMON_AI_API_KEY environment variable and GPT-4.1 model

export interface SermonAIRequestOptions {
  systemPrompt?: string;
  messages?: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

/**
 * Call OpenAI API specifically for Sermon AI operations
 * Uses VITE_SERMON_AI_API_KEY and GPT-4.1 model
 */
export async function callSermonAIAPI(
  prompt: string,
  options: SermonAIRequestOptions = {}
): Promise<string> {
  const apiKey = import.meta.env.VITE_SERMON_AI_API_KEY;
  
  // Friendly error message for missing API key
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_sermon_ai_api_key_here' || apiKey.trim() === '') {
    const errorMsg = import.meta.env.DEV
      ? `🔑 Sermon AI API key not configured!\n\nPlease configure your Sermon AI API key:\n\n1. Create a .env.local file in your project root (if it doesn't exist)\n2. Add this line:\n   VITE_SERMON_AI_API_KEY=your_sermon_ai_api_key_here\n\n3. Get your API key from: https://platform.openai.com/api-keys\n4. Replace 'your_sermon_ai_api_key_here' with your actual key\n5. Restart your dev server (stop and run 'npm run dev' again)\n\nThank you for using Bible Aura! 🙏`
      : '🔑 Sermon AI API key not configured! Please contact support for assistance.';
    throw new Error(errorMsg);
  }

  const {
    systemPrompt = 'You are an expert sermon writing assistant. Provide helpful, natural sermon content.',
    messages = [],
    maxTokens = 1000,
    temperature = 0.7,
    stream = false,
    onChunk
  } = options;

  try {
    // Build messages array - if messages are provided, use them; otherwise use prompt
    const messageArray = messages.length > 0 
      ? [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      : [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: messageArray,
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('🔐 Sermon AI API authentication failed. Please check your API key is correct.');
      } else if (response.status === 429) {
        throw new Error('⏳ Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('🔧 OpenAI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`❌ Sermon AI API error: ${errorMessage}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('❌ Invalid response from Sermon AI. Please try again.');
    }

    return data.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Sermon AI API Error:', error);
    if (error.message.includes('API key')) {
      throw error; // Re-throw API key errors as-is
    }
    throw new Error(error?.message || 'Failed to connect to Sermon AI service. Please try again.');
  }
}

