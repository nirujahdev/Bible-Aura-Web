// ChatKit Client Setup for Bible Aura
// Auto-detecting workflow/direct API with fallback support

// Helper to safely read environment variables
const getEnv = (key: string, fallback = ''): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
};

// Workflow configuration constants sourced from environment variables
const workflowId = getEnv('VITE_CHATKIT_WORKFLOW_ID');
const workflowVersion = getEnv('VITE_CHATKIT_WORKFLOW_VERSION', '1');
const apiEndpoint = getEnv('VITE_CHATKIT_API_ENDPOINT', '/api/bibleaura-chat');

if (import.meta.env.DEV && (!workflowId || workflowId === 'your_workflow_id')) {
  console.warn(
    '[Bible Aura] ChatKit workflow ID is not configured. Please set VITE_CHATKIT_WORKFLOW_ID in your environment variables.'
  );
}

export const CHATKIT_CONFIG = Object.freeze({
  workflowId,
  version: workflowVersion,
  apiEndpoint,
});

// Response type from ChatKit API
export interface ChatKitResponse {
  text: string;
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';
  lang: 'en' | 'ta';
}

// Request type for ChatKit API
export interface ChatKitRequest {
  message: string;
}

/**
 * Send a message to Bible Aura AI
 * Auto-detects and uses the best available method (workflow or direct API)
 * @param message - The user's message to send
 * @returns Promise with the ChatKit response containing text, mode, and language
 */
export async function sendBibleAuraMessage(message: string): Promise<ChatKitResponse> {
  // Validate input
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message is required and must be a non-empty string');
  }

  console.log('[Bible Aura AI] Processing message...');

  // Try workflow API first (if available)
  try {
    // Use the same origin to avoid CORS issues
    const apiUrl = `${window.location.origin}${CHATKIT_CONFIG.apiEndpoint}`;

    console.log('[Bible Aura AI] Trying workflow API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() } as ChatKitRequest),
    });

    if (response.ok) {
      const data: ChatKitResponse = await response.json();
      if (data.text && typeof data.text === 'string') {
        console.log('[Bible Aura AI] ✓ Workflow API success');
        return data;
      }
    }

    console.log('[Bible Aura AI] Workflow API failed, using direct OpenAI...');
  } catch (workflowError) {
    console.log('[Bible Aura AI] Workflow error, using fallback...');
  }

  // Fallback: Direct OpenAI API
  return await callDirectOpenAI(message);
}

/**
 * Direct OpenAI API call (fallback)
 */
async function callDirectOpenAI(message: string): Promise<ChatKitResponse> {
  const apiKey = getEnv('VITE_OPENAI_API_KEY');
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      '❌ OpenAI API key not configured.\n\n' +
      'Please add to your .env.local file:\n' +
      'VITE_OPENAI_API_KEY=sk-your-key-here\n\n' +
      'Get your key from: https://platform.openai.com/api-keys'
    );
  }

  console.log('[Bible Aura AI] Calling OpenAI directly...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are ✦Bible Aura AI, a knowledgeable biblical assistant.

Provide accurate biblical interpretation, analysis, and guidance.
Include relevant scripture references.
Be respectful, clear, and encouraging.
Use bold text (**text**) for emphasis instead of headers.
Do NOT use # symbols or markdown headers in your response.`
        },
        { role: 'user', content: message.trim() }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('❌ Invalid API key');
    if (response.status === 429) throw new Error('⏰ Rate limit reached. Try again soon.');
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  let text = data.choices[0]?.message?.content || '';

  if (!text) throw new Error('No response from AI');

  // Remove markdown headers (# symbols) from response
  text = text
    .replace(/^#{1,6}\s+/gm, '') // Remove # at start of lines
    .replace(/\n#{1,6}\s+/g, '\n') // Remove # after newlines
    .trim();

  console.log('[Bible Aura AI] ✓ Direct API success');

  // Auto-detect mode
  const lower = message.toLowerCase();
  let mode: ChatKitResponse['mode'] = 'chat';
  if (lower.includes('verse') || lower.match(/\d+:\d+/)) mode = 'verse';
  else if (lower.includes('parable')) mode = 'parable';
  else if (lower.match(/who (was|is)/)) mode = 'character';
  else if (lower.includes('what does the bible say')) mode = 'topical';
  else if (lower.match(/^(what|who|when|where|why|how)\s/i)) mode = 'qa';

  const lang: 'en' | 'ta' = message.match(/[\u0B80-\u0BFF]/) ? 'ta' : 'en';

  return { text, mode, lang };
}

/**
 * Check if ChatKit API is available
 * @returns Promise that resolves to true if API is available, false otherwise
 */
export async function checkChatKitAvailability(): Promise<boolean> {
  try {
    const testMessage = 'test';
    await sendBibleAuraMessage(testMessage);
    return true;
  } catch {
    return false;
  }
}

