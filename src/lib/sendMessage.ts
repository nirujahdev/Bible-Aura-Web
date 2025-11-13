// Frontend Helper Function for Bible Aura ChatKit
// Simplified interface for sending messages to the ChatKit workflow
// Re-exports the main function from chatkit.ts for convenience

export { sendBibleAuraMessage, checkChatKitAvailability } from './chatkit';
export type { ChatKitResponse, ChatKitRequest } from './chatkit';

/**
 * Convenience function to send a message to Bible Aura ChatKit
 * This is a re-export of sendBibleAuraMessage for easier imports
 * 
 * @example
 * ```typescript
 * import { sendMessage } from '@/lib/sendMessage';
 * 
 * const response = await sendMessage('What does John 3:16 mean?');
 * console.log(response.text); // AI response
 * console.log(response.mode); // 'verse', 'chat', etc.
 * console.log(response.lang); // 'en' or 'ta'
 * ```
 */
export { sendBibleAuraMessage as sendMessage } from './chatkit';

