// AI Streaming Support - Stream AI responses for faster perceived performance
// Allows users to see responses as they're generated instead of waiting for complete response

export interface StreamingOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  abortSignal?: AbortSignal;
}

/**
 * Stream OpenAI API response for faster perceived performance
 */
export async function streamOpenAIResponse(
  prompt: string,
  options: {
    systemPrompt?: string;
    messages?: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
    model?: string;
    apiKey?: string;
  },
  streamingOptions: StreamingOptions = {}
): Promise<string> {
  const {
    systemPrompt = 'You are a helpful AI assistant for Bible study and biblical content.',
    messages = [],
    maxTokens = 1000,
    temperature = 0.7,
    model = 'gpt-4.1-mini',
    apiKey = import.meta.env.VITE_OPENAI_API_KEY
  } = options;

  const { onChunk, onComplete, onError, abortSignal } = streamingOptions;

  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    const error = new Error('OpenAI API key not configured');
    onError?.(error);
    throw error;
  }

  try {
    // Build messages array
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
        model,
        messages: messageArray,
        max_tokens: maxTokens,
        temperature,
        stream: true // Enable streaming
      }),
      signal: abortSignal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      
      let error: Error;
      if (response.status === 401) {
        error = new Error('🔐 OpenAI API authentication failed. Please check your API key is correct.');
      } else if (response.status === 429) {
        error = new Error('⏳ Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        error = new Error('🔧 OpenAI service is temporarily unavailable. Please try again later.');
      } else {
        error = new Error(`❌ OpenAI API error: ${errorMessage}`);
      }
      
      onError?.(error);
      throw error;
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete?.(fullText);
              return fullText;
            }

            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || '';
              
              if (content) {
                fullText += content;
                onChunk?.(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6);
        if (data !== '[DONE]') {
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk?.(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      onComplete?.(fullText);
      return fullText;
    } finally {
      reader.releaseLock();
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const abortError = new Error('⏰ Request was cancelled');
      onError?.(abortError);
      throw abortError;
    }
    
    console.error('Streaming Error:', error);
    onError?.(error);
    throw error;
  }
}

/**
 * Check if streaming is supported (for fallback to regular API call)
 */
export function isStreamingSupported(): boolean {
  return typeof ReadableStream !== 'undefined' && typeof TextDecoder !== 'undefined';
}

