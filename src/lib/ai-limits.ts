// AI Limits Utility - Check and manage AI usage limits
import { supabase } from '@/integrations/supabase/client';

export type UsageType = 'ai_message' | 'ai_sermon';

export interface UsageResult {
  allowed: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message: string;
}

export interface UsageInfo {
  current_usage: number;
  limit: number;
  remaining: number;
  limit_reached: boolean;
}

/**
 * Check if user can use AI feature and increment usage if allowed
 * @param userId - User ID
 * @param usageType - Type of usage ('ai_message' or 'ai_sermon')
 * @returns Usage result with allowed status and usage info
 */
export async function checkAndIncrementUsage(
  userId: string,
  usageType: UsageType
): Promise<UsageResult> {
  try {
    const { data, error } = await supabase.rpc('check_and_increment_ai_usage', {
      p_user_id: userId,
      p_usage_type: usageType
    });

    if (error) {
      console.error('Error checking AI usage:', error);
      // On error, allow usage but log it
      return {
        allowed: true,
        current_usage: 0,
        limit: 0,
        remaining: 0,
        message: 'Unable to check limits. Usage allowed.'
      };
    }

    return data as UsageResult;
  } catch (error) {
    console.error('Exception checking AI usage:', error);
    return {
      allowed: true,
      current_usage: 0,
      limit: 0,
      remaining: 0,
      message: 'Unable to check limits. Usage allowed.'
    };
  }
}

/**
 * Get current AI usage without incrementing
 * @param userId - User ID
 * @param usageType - Type of usage ('ai_message' or 'ai_sermon')
 * @returns Usage info with current usage and limits
 */
export async function getUsageInfo(
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
 * Check if user has reached their limit (without incrementing)
 * @param userId - User ID
 * @param usageType - Type of usage ('ai_message' or 'ai_sermon')
 * @returns True if limit reached, false otherwise
 */
export async function isLimitReached(
  userId: string,
  usageType: UsageType
): Promise<boolean> {
  const usageInfo = await getUsageInfo(userId, usageType);
  return usageInfo.limit_reached;
}

