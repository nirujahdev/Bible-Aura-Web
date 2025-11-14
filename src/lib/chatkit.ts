// ChatKit Client Setup for Bible Aura
// REQUIRES OpenAI Workflow/Agents - No direct API fallback

// Helper to safely read environment variables
const getEnv = (key: string, fallback = ''): string => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
};

// Workflow configuration constants sourced from environment variables
const workflowId = getEnv('VITE_CHATKIT_WORKFLOW_ID');
const workflowVersion = getEnv('VITE_CHATKIT_WORKFLOW_VERSION', '2');
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
 * REQUIRES ChatKit Workflow - All requests go through OpenAI Workflow/Agents
 * @param message - The user's message to send
 * @returns Promise with the ChatKit response containing text, mode, and language
 */
export async function sendBibleAuraMessage(message: string): Promise<ChatKitResponse> {
  // Validate input
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message is required and must be a non-empty string');
  }

  if (import.meta.env.DEV) {
    console.log('[Bible Aura AI] Processing message through ChatKit Workflow...');
  }

  // Use the same origin to avoid CORS issues
  const apiUrl = `${window.location.origin}${CHATKIT_CONFIG.apiEndpoint}`;

  if (import.meta.env.DEV) {
    console.log('[Bible Aura AI] Calling ChatKit Workflow API:', apiUrl);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() } as ChatKitRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Workflow API error: ${response.status}`;
      
      console.error('[Bible Aura AI] ❌ Workflow API failed:', errorMessage);
      
      // Provide helpful error messages
      if (response.status === 500 && errorMessage.includes('workflow ID')) {
        throw new Error(
          '❌ ChatKit Workflow not configured.\n\n' +
          'Please ensure CHATKIT_WORKFLOW_ID is set in your Vercel environment variables.\n\n' +
          'Contact your administrator to configure the workflow.'
        );
      }
      
      if (response.status === 500 && errorMessage.includes('API key')) {
        throw new Error(
          '❌ OpenAI API key not configured on server.\n\n' +
          'Please ensure OPENAI_API_KEY is set in your Vercel environment variables.'
        );
      }
      
      throw new Error(`Workflow API error: ${errorMessage}`);
    }

    const data: ChatKitResponse = await response.json();
    
    if (!data || !data.text || typeof data.text !== 'string') {
      throw new Error('Invalid response from ChatKit Workflow. Expected text field in response.');
    }

    console.log('[Bible Aura AI] ✓ ChatKit Workflow success');
    return data;

  } catch (error: any) {
    console.error('[Bible Aura AI] ❌ ChatKit Workflow error:', error);
    
    // Re-throw with better error message if it's not already formatted
    if (error.message && !error.message.includes('❌')) {
      throw new Error(`ChatKit Workflow failed: ${error.message}`);
    }
    
    throw error;
  }
}

// Direct OpenAI API fallback has been removed
// All AI chat requests MUST go through ChatKit Workflow
// This ensures consistent behavior and proper workflow execution

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

