// ChatKit Client Setup for Bible Aura
// Centralized configuration for OpenAI ChatKit workflow integration

// Workflow configuration constants
export const CHATKIT_CONFIG = {
  workflowId: 'wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0',
  version: '1',
  domainKey: 'pk_69156df484148193bde4d23dd08c12fc0d90a851713b0413',
  apiEndpoint: '/api/bibleaura-chat',
} as const;

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
    // Determine API endpoint (use full URL in production, relative in development)
    const apiUrl = import.meta.env.PROD
      ? `${import.meta.env.VITE_APP_URL || 'https://bibleaura.xyz'}${CHATKIT_CONFIG.apiEndpoint}`
      : CHATKIT_CONFIG.apiEndpoint;

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

