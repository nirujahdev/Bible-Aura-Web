// Improved AI Usage Tracker with Conversation Linking
// Handles atomic usage tracking, conversation management, and message logging

import { supabase } from '@/integrations/supabase/client';
import { logMessagePair, MessagePairLogData } from './ai-message-logs';

export type UsageType = 'ai_message' | 'ai_sermon';

export interface UsageResult {
  allowed: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message: string;
  reservation_id?: string; // For rollback on failure
}

export interface UsageInfo {
  current_usage: number;
  limit: number;
  remaining: number;
  limit_reached: boolean;
}

export interface ConversationTrackingData {
  conversation_id?: string | null;
  mode: string;
  language: string;
  translation?: string;
}

/**
 * Improved usage tracking with reservation system
 * Reserves usage before API call, confirms after success, rolls back on failure
 */
export class AIUsageTracker {
  private static reservations = new Map<string, { timestamp: number; userId: string; usageType: UsageType }>();

  /**
   * Reserve usage before making API call
   * Returns reservation_id that must be confirmed or rolled back
   */
  static async reserveUsage(
    userId: string,
    usageType: UsageType,
    conversationId?: string | null
  ): Promise<UsageResult> {
    try {
      // Check current usage first
      const usageInfo = await this.getUsageInfo(userId, usageType);
      
      if (usageInfo.limit_reached) {
        return {
          allowed: false,
          current_usage: usageInfo.current_usage,
          limit: usageInfo.limit,
          remaining: 0,
          message: `You've reached your daily limit of ${usageInfo.limit} ${usageType === 'ai_message' ? 'AI messages' : 'AI sermons'}. Please try again tomorrow.`
        };
      }

      // Reserve usage (increment in database)
      const { data, error } = await supabase.rpc('check_and_increment_ai_usage', {
        p_user_id: userId,
        p_usage_type: usageType
      });

      if (error) {
        console.error('Error reserving AI usage:', error);
        return {
          allowed: false,
          current_usage: usageInfo.current_usage,
          limit: usageInfo.limit,
          remaining: usageInfo.remaining,
          message: 'Unable to reserve usage. Please try again.'
        };
      }

      const result = data as UsageResult;
      
      // Store reservation for potential rollback
      const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.reservations.set(reservationId, {
        timestamp: Date.now(),
        userId,
        usageType
      });

      // Clean up old reservations (older than 5 minutes)
      this.cleanupReservations();

      return {
        ...result,
        reservation_id: reservationId
      };
    } catch (error) {
      console.error('Exception reserving AI usage:', error);
      return {
        allowed: false,
        current_usage: 0,
        limit: 0,
        remaining: 0,
        message: 'Unable to reserve usage. Please try again.'
      };
    }
  }

  /**
   * Confirm usage after successful API call
   * Links conversation and logs message pair
   */
  static async confirmUsage(
    reservationId: string,
    userId: string,
    conversationData: ConversationTrackingData,
    messagePairData: Omit<MessagePairLogData, 'user_id' | 'conversation_id' | 'turn_number'>
  ): Promise<{ success: boolean; conversation_id?: string }> {
    try {
      // Verify reservation exists
      const reservation = this.reservations.get(reservationId);
      if (!reservation || reservation.userId !== userId) {
        console.warn('Invalid or expired reservation:', reservationId);
        // Don't rollback - usage was already incremented
        return { success: false };
      }

      // Ensure conversation exists or create it
      let conversationId = conversationData.conversation_id;
      
      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: userId,
            title: messagePairData.user_message_content.slice(0, 50) + '...',
            messages: [],
            mode: conversationData.mode,
            language: conversationData.language,
            translation: conversationData.translation || 'KJV'
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          // Don't rollback usage - conversation creation failure shouldn't affect usage
        } else {
          conversationId = newConv.id;
        }
      }

      // Log message pair with conversation_id
      if (conversationId) {
        const turnNumber = await this.getNextTurnNumber(userId, conversationId);
        
        await logMessagePair({
          ...messagePairData,
          user_id: userId,
          conversation_id: conversationId,
          turn_number: turnNumber
        }).catch(err => {
          console.error('Error logging message pair:', err);
          // Don't fail the whole operation if logging fails
        });
      }

      // Remove reservation (usage confirmed)
      this.reservations.delete(reservationId);

      return {
        success: true,
        conversation_id: conversationId || undefined
      };
    } catch (error) {
      console.error('Exception confirming usage:', error);
      return { success: false };
    }
  }

  /**
   * Rollback usage if API call fails
   * Decrements usage count
   */
  static async rollbackUsage(
    reservationId: string,
    userId: string,
    usageType: UsageType
  ): Promise<boolean> {
    try {
      const reservation = this.reservations.get(reservationId);
      if (!reservation || reservation.userId !== userId) {
        console.warn('Invalid reservation for rollback:', reservationId);
        return false;
      }

      // Decrement usage in database
      const { error } = await supabase.rpc('decrement_ai_usage', {
        p_user_id: userId,
        p_usage_type: usageType
      });

      if (error) {
        console.error('Error rolling back usage:', error);
        return false;
      }

      // Remove reservation
      this.reservations.delete(reservationId);
      return true;
    } catch (error) {
      console.error('Exception rolling back usage:', error);
      return false;
    }
  }

  /**
   * Get current usage without incrementing
   */
  static async getUsageInfo(
    userId: string,
    usageType: UsageType
  ): Promise<UsageInfo> {
    try {
      const { data, error } = await supabase.rpc('get_ai_usage', {
        p_user_id: userId,
        p_usage_type: usageType
      });

      if (error) {
        console.error('Error getting AI usage:', error);
        return {
          current_usage: 0,
          limit: 0,
          remaining: 0,
          limit_reached: false
        };
      }

      return data as UsageInfo;
    } catch (error) {
      console.error('Exception getting AI usage:', error);
      return {
        current_usage: 0,
        limit: 0,
        remaining: 0,
        limit_reached: false
      };
    }
  }

  /**
   * Get next turn number for a conversation
   */
  private static async getNextTurnNumber(
    userId: string,
    conversationId: string
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('ai_message_logs')
        .select('turn_number')
        .eq('user_id', userId)
        .eq('conversation_id', conversationId)
        .not('turn_number', 'is', null)
        .order('turn_number', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return 1;
      }

      return (data.turn_number || 0) + 1;
    } catch (error) {
      console.error('Error getting turn number:', error);
      return 1;
    }
  }

  /**
   * Clean up old reservations
   */
  private static cleanupReservations(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [id, reservation] of this.reservations.entries()) {
      if (now - reservation.timestamp > maxAge) {
        this.reservations.delete(id);
      }
    }
  }

  /**
   * Update conversation with new messages
   */
  static async updateConversation(
    conversationId: string,
    userId: string,
    messages: any[]
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating conversation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception updating conversation:', error);
      return false;
    }
  }
}

// Export convenience functions for backward compatibility
export async function checkAndIncrementUsage(
  userId: string,
  usageType: UsageType
): Promise<UsageResult> {
  return AIUsageTracker.reserveUsage(userId, usageType);
}

export async function getUsageInfo(
  userId: string,
  usageType: UsageType
): Promise<UsageInfo> {
  return AIUsageTracker.getUsageInfo(userId, usageType);
}

export async function isLimitReached(
  userId: string,
  usageType: UsageType
): Promise<boolean> {
  const usageInfo = await AIUsageTracker.getUsageInfo(userId, usageType);
  return usageInfo.limit_reached;
}

