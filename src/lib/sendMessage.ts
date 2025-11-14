// Frontend Helper Function for Bible Aura Agent SDK
// Simplified interface for sending messages to the Agent SDK API
// Re-exports the main function from agent-sdk.ts for convenience

export { sendBibleAuraMessage, checkAgentSDKAvailability } from './agent-sdk';
export type { AgentSDKResponse as ChatKitResponse, AgentSDKRequest as ChatKitRequest } from './agent-sdk';

/**
 * Convenience function to send a message to Bible Aura Agent SDK
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
 * console.log(response.sources); // Array of sources
 * console.log(response.crossReferences); // Array of cross-references
 * ```
 */
export { sendBibleAuraMessage as sendMessage } from './agent-sdk';
