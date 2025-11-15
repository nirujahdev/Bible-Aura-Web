// OpenAI API Helper - Reusable function for all OpenAI API calls
import { streamOpenAIResponse, isStreamingSupported } from './ai-streaming';

export interface OpenAIRequestOptions {
  systemPrompt?: string;
  messages?: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  stream?: boolean; // Enable streaming for faster perceived performance
  onChunk?: (chunk: string) => void; // Callback for streaming chunks
}

/**
 * Call OpenAI API with proper error handling
 */
export async function callOpenAIAPI(
  prompt: string,
  options: OpenAIRequestOptions = {}
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Friendly error message for missing API key
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    const errorMsg = import.meta.env.DEV
      ? `🔑 OpenAI API key not configured!\n\nPlease configure your OpenAI API key:\n\n1. Create a .env.local file in your project root (if it doesn't exist)\n2. Add this line:\n   VITE_OPENAI_API_KEY=your_openai_api_key_here\n\n3. Get your API key from: https://platform.openai.com/api-keys\n4. Replace 'your_openai_api_key_here' with your actual key\n5. Restart your dev server (stop and run 'npm run dev' again)\n\nThank you for using Bible Aura! 🙏`
      : '🔑 OpenAI API key not configured! Please contact support for assistance.';
    throw new Error(errorMsg);
  }

  const {
    systemPrompt = 'You are a helpful AI assistant for Bible study and biblical content.',
    messages = [],
    maxTokens = 1000,
    temperature = 0.7,
    model = 'gpt-4o-mini',
    stream = false,
    onChunk
  } = options;

  // Use streaming if enabled and supported
  if (stream && isStreamingSupported() && onChunk) {
    try {
      return await streamOpenAIResponse(prompt, {
        systemPrompt,
        messages,
        maxTokens,
        temperature,
        model,
        apiKey
      }, {
        onChunk,
        onComplete: (fullText) => {
          // Optional: handle completion
        },
        onError: (error) => {
          throw error;
        }
      });
    } catch (error: any) {
      console.error('Streaming Error:', error);
      // Fall through to regular API call if streaming fails
    }
  }

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

    // Optimize maxTokens for faster responses (reduce for shorter, faster answers)
    const optimizedMaxTokens = Math.min(maxTokens, 800); // Cap at 800 for speed

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: messageArray,
        max_tokens: optimizedMaxTokens,
        temperature: Math.max(0.2, temperature), // Lower temperature = faster, more focused
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('🔐 OpenAI API authentication failed. Please check your API key is correct.');
      } else if (response.status === 429) {
        throw new Error('⏳ Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('🔧 OpenAI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`❌ OpenAI API error: ${errorMessage}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('❌ Invalid response from OpenAI. Please try again.');
    }

    return data.choices[0].message.content || '';
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    if (error.message.includes('API key')) {
      throw error; // Re-throw API key errors as-is
    }
    throw new Error(error?.message || 'Failed to connect to OpenAI service. Please try again.');
  }
}

