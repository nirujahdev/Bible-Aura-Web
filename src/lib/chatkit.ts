// ChatKit Client Setup for Bible Aura
// Centralized configuration for OpenAI ChatKit workflow integration

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
 * Send a message to Bible Aura ChatKit workflow
 * @param message - The user's message to send to the workflow
 * @returns Promise with the ChatKit response containing text, mode, and language
 */
export async function sendBibleAuraMessage(message: string): Promise<ChatKitResponse> {
  // Validate input
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new Error('Message is required and must be a non-empty string');
  }

  try {
    // Determine API endpoint
    // In development, use production API URL since serverless functions only work on Vercel
    // In production, use the configured app URL
    const apiUrl = import.meta.env.PROD
      ? `${import.meta.env.VITE_APP_URL || 'https://bibleaura.xyz'}${CHATKIT_CONFIG.apiEndpoint}`
      : `https://bibleaura.xyz${CHATKIT_CONFIG.apiEndpoint}`; // Use production API in development

    // Make API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.trim(),
      } as ChatKitRequest),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.error || 
        `API request failed with status ${response.status}`
      );
    }

    // Parse and return response
    const data: ChatKitResponse = await response.json();
    
    // Validate response structure
    if (!data.text || typeof data.text !== 'string') {
      throw new Error('Invalid response format: missing or invalid text field');
    }

    return data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('🔌 Network error: Please check your internet connection and try again.');
    }
    
    if (error.message.includes('API key')) {
      throw new Error('🔑 API configuration error: Please contact support.');
    }

    // Re-throw with original message
    throw new Error(error.message || 'Failed to send message to Bible Aura ChatKit');
  }
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

