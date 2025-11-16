// AI Message Logs Service
// Handles logging of all user messages for advanced analysis and analytics

import { supabase } from '@/integrations/supabase/client';

export interface MessageLogData {
  user_id: string;
  conversation_id?: string | null;
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: string;
  language?: string;
  translation?: string;
  message_timestamp: string;
  ai_mode?: string;
  has_sources?: boolean;
  sources_count?: number;
  has_cross_references?: boolean;
  cross_references_count?: number;
  has_validated_verses?: boolean;
  validated_verses_count?: number;
  message_length?: number;
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

export interface MessagePairLogData {
  user_id: string;
  conversation_id?: string | null;
  pair_id: string; // Unique ID linking user and assistant messages
  user_message_id: string;
  assistant_message_id: string;
  user_message_content: string;
  assistant_message_content: string;
  user_message_timestamp: string;
  assistant_message_timestamp: string;
  mode?: string;
  language?: string;
  translation?: string;
  turn_number?: number;
  ai_mode?: string;
  has_sources?: boolean;
  sources_count?: number;
  has_cross_references?: boolean;
  cross_references_count?: number;
  has_validated_verses?: boolean;
  validated_verses_count?: number;
  response_time_ms?: number;
  metadata?: Record<string, any>;
}

/**
 * Log a message to the ai_message_logs table for analytics
 * Legacy function - kept for backward compatibility
 */
export async function logMessage(data: MessageLogData): Promise<void> {
  try {
    const logEntry = {
      user_id: data.user_id,
      conversation_id: data.conversation_id || null,
      message_id: data.message_id,
      role: data.role,
      content: data.content,
      mode: data.mode || 'chat-clean',
      language: data.language || 'english',
      translation: data.translation || 'KJV',
      message_timestamp: data.message_timestamp,
      ai_mode: data.ai_mode || null,
      has_sources: data.has_sources || false,
      sources_count: data.sources_count || 0,
      has_cross_references: data.has_cross_references || false,
      cross_references_count: data.cross_references_count || 0,
      has_validated_verses: data.has_validated_verses || false,
      validated_verses_count: data.validated_verses_count || 0,
      message_length: data.content.length,
      response_time_ms: data.response_time_ms || null,
      metadata: data.metadata || {}
    };

    const { error } = await supabase
      .from('ai_message_logs')
      .insert(logEntry);

    if (error) {
      console.error('Error logging message:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  } catch (error) {
    console.error('Error in logMessage:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Log message pair (user message + AI response) in same row
 * This is the preferred method for new logging
 */
export async function logMessagePair(data: MessagePairLogData): Promise<void> {
  try {
    // Use provided turn number, or calculate if not provided
    let turnNumber = data.turn_number;
    if (!turnNumber) {
      // Get max turn number for this conversation
      const { data: existingLogs } = await supabase
        .from('ai_message_logs')
        .select('turn_number')
        .eq('user_id', data.user_id)
        .not('turn_number', 'is', null)
        .order('turn_number', { ascending: false })
        .limit(1);
      
      turnNumber = existingLogs && existingLogs.length > 0 && existingLogs[0].turn_number 
        ? existingLogs[0].turn_number + 1 
        : 1;
    }

    const logEntry = {
      user_id: data.user_id,
      conversation_id: data.conversation_id || null,
      pair_id: data.pair_id,
      user_message_id: data.user_message_id,
      assistant_message_id: data.assistant_message_id,
      user_message_content: data.user_message_content,
      assistant_message_content: data.assistant_message_content,
      message_id: data.pair_id, // Use pair_id as primary message_id for this row
      role: 'assistant', // Primary role is assistant since it's the response
      content: data.assistant_message_content, // Keep content field for backward compatibility
      message_timestamp: data.user_message_timestamp, // User message timestamp (when question was asked)
      mode: data.mode || 'chat-clean',
      language: data.language || 'english',
      translation: data.translation || 'KJV',
      turn_number: turnNumber,
      ai_mode: data.ai_mode || null,
      has_sources: data.has_sources || false,
      sources_count: data.sources_count || 0,
      has_cross_references: data.has_cross_references || false,
      cross_references_count: data.cross_references_count || 0,
      has_validated_verses: data.has_validated_verses || false,
      validated_verses_count: data.validated_verses_count || 0,
      message_length: data.user_message_content.length,
      response_time_ms: data.response_time_ms || null,
      metadata: {
        ...data.metadata,
        assistant_timestamp: data.assistant_message_timestamp,
        user_message_length: data.user_message_content.length,
        assistant_message_length: data.assistant_message_content.length
      }
    };

    const { error } = await supabase
      .from('ai_message_logs')
      .insert(logEntry);

    if (error) {
      console.error('Error logging message pair:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  } catch (error) {
    console.error('Error in logMessagePair:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Update feedback for a message in the logs
 * Works with both pair_id (new format) and message_id (legacy format)
 */
export async function updateMessageFeedback(
  userId: string,
  messageId: string,
  feedback: 'positive' | 'negative'
): Promise<void> {
  try {
    // Try to find by pair_id or assistant_message_id first (new format)
    const { error: pairError } = await supabase
      .from('ai_message_logs')
      .update({
        feedback,
        feedback_timestamp: new Date().toISOString()
      })
      .eq('user_id', userId)
      .or(`pair_id.eq.${messageId},assistant_message_id.eq.${messageId},message_id.eq.${messageId}`);

    if (pairError) {
      console.error('Error updating message feedback:', pairError);
    }
  } catch (error) {
    console.error('Error in updateMessageFeedback:', error);
  }
}

/**
 * Update report information for a message in the logs
 * Works with both pair_id (new format) and message_id (legacy format)
 */
export async function updateMessageReport(
  userId: string,
  messageId: string,
  reportReason: string,
  reportCategory: string
): Promise<void> {
  try {
    // Try to find by pair_id or assistant_message_id first (new format)
    const { error } = await supabase
      .from('ai_message_logs')
      .update({
        is_reported: true,
        report_reason: reportReason,
        report_category: reportCategory,
        report_timestamp: new Date().toISOString()
      })
      .eq('user_id', userId)
      .or(`pair_id.eq.${messageId},assistant_message_id.eq.${messageId},message_id.eq.${messageId}`);

    if (error) {
      console.error('Error updating message report:', error);
    }
  } catch (error) {
    console.error('Error in updateMessageReport:', error);
  }
}

/**
 * Soft delete messages for a user (mark as user_deleted)
 * This hides messages from user view but keeps them for admin analysis
 */
export async function softDeleteUserMessages(
  userId: string,
  conversationId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_message_logs')
      .update({
        user_deleted: true,
        user_deleted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('conversation_id', conversationId);

    if (error) {
      console.error('Error soft deleting user messages:', error);
    }
  } catch (error) {
    console.error('Error in softDeleteUserMessages:', error);
  }
}

/**
 * Soft delete a specific message for a user
 */
export async function softDeleteUserMessage(
  userId: string,
  messageId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_message_logs')
      .update({
        user_deleted: true,
        user_deleted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('message_id', messageId);

    if (error) {
      console.error('Error soft deleting user message:', error);
    }
  } catch (error) {
    console.error('Error in softDeleteUserMessage:', error);
  }
}

