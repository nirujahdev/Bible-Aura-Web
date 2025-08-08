import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionPlan = 'free' | 'pro' | 'supporter' | 'partner';

export type ResourceType = 
  | 'ai_chat' 
  | 'biblical_qa' 
  | 'verse_analysis' 
  | 'character_explanations' 
  | 'parables_explanations' 
  | 'topical_study' 
  | 'journal_entries' 
  | 'study_notes' 
  | 'favorites' 
  | 'bookmarks' 
  | 'sermon_library' 
  | 'audio_sermons' 
  | 'sermon_creation';

export interface UsageInfo {
  canUse: boolean;
  currentUsage: number;
  limitAmount: number;
  resetDate: string;
}

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

class SubscriptionService {

  /**
   * Get user's current subscription plan
   */
  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan', { user_uuid: userId });

      if (error) {
        console.error('Error getting user plan:', error);
        return 'free';
      }

      return data || 'free';
    } catch (error) {
      console.error('Error in getUserPlan:', error);
      return 'free';
    }
  }

  /**
   * Get detailed subscription information
   */
  async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_uuid: userId });

      if (error) {
        console.error('Error getting subscription info:', error);
        return { plan: 'free', status: 'inactive' };
      }

      if (!data || data.length === 0) {
        return { plan: 'free', status: 'inactive' };
      }

      const subscription = data[0];
      return {
        plan: subscription.plan_id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Error in getSubscriptionInfo:', error);
      return { plan: 'free', status: 'inactive' };
    }
  }

  /**
   * Check if user can use a specific resource
   */
  async checkUsageLimit(userId: string, resource: ResourceType): Promise<UsageInfo> {
    try {
      const plan = await this.getUserPlan(userId);
      
      const { data, error } = await supabase
        .rpc('check_usage_limit', { 
          user_uuid: userId, 
          resource: resource,
          plan: plan 
        });

      if (error) {
        console.error('Error checking usage limit:', error);
        return {
          canUse: false,
          currentUsage: 0,
          limitAmount: 0,
          resetDate: new Date().toISOString()
        };
      }

      if (!data || data.length === 0) {
        return {
          canUse: false,
          currentUsage: 0,
          limitAmount: 0,
          resetDate: new Date().toISOString()
        };
      }

      const usage = data[0];
      return {
        canUse: usage.can_use,
        currentUsage: usage.current_usage,
        limitAmount: usage.limit_amount,
        resetDate: usage.reset_date
      };
    } catch (error) {
      console.error('Error in checkUsageLimit:', error);
      return {
        canUse: false,
        currentUsage: 0,
        limitAmount: 0,
        resetDate: new Date().toISOString()
      };
    }
  }

  /**
   * Increment usage for a resource
   */
  async incrementUsage(userId: string, resource: ResourceType): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('increment_usage', { 
          user_uuid: userId, 
          resource: resource 
        });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  }

    /**
   * Check if user can use a resource
   */
  async canUseFeature(
    userId: string, 
    resource: ResourceType
  ): Promise<{ canUse: boolean; message?: string }> {
    const usage = await this.checkUsageLimit(userId, resource);
    
    if (!usage.canUse) {
      const resetDate = new Date(usage.resetDate);
      const now = new Date();
      const isToday = resetDate.toDateString() === now.toDateString();
      const resetDateStr = isToday ? 'today' : resetDate.toLocaleDateString();

      let limitText = 'your limit';
      if (usage.limitAmount > 0) {
        limitText = `${usage.limitAmount} per month`;
      }

      return {
        canUse: false,
        message: `You've reached ${limitText} for ${resource}. Resets ${resetDateStr}. Upgrade for more access!`
      };
    }
    
    return { canUse: true };
  }

  /**
   * Use a feature (check limits and increment usage)
   */
  async useFeature(
    userId: string, 
    resource: ResourceType
  ): Promise<{ success: boolean; message?: string }> {
    // First check if they can use it
    const canUseResult = await this.canUseFeature(userId, resource);
    
    if (!canUseResult.canUse) {
      return { success: false, message: canUseResult.message };
    }

    // Increment usage
    const success = await this.incrementUsage(userId, resource);
    
    if (!success) {
      return { success: false, message: "Failed to track usage. Please try again." };
    }

    return { success: true };
  }

  /**
   * Get usage statistics for all resources
   */
  async getAllUsageStats(userId: string): Promise<Record<ResourceType, UsageInfo>> {
    const resources: ResourceType[] = [
      'ai_chat', 'biblical_qa', 'verse_analysis', 'character_explanations',
      'parables_explanations', 'topical_study', 'journal_entries', 
      'study_notes', 'favorites', 'bookmarks', 'sermon_library',
      'audio_sermons', 'sermon_creation'
    ];

    const stats: Record<ResourceType, UsageInfo> = {} as Record<ResourceType, UsageInfo>;

    for (const resource of resources) {
      stats[resource] = await this.checkUsageLimit(userId, resource);
    }

    return stats;
  }

  /**
   * Get plan limits for display
   */
  getPlanLimits(plan: SubscriptionPlan): Record<ResourceType, number> {
    const limits: Record<SubscriptionPlan, Record<ResourceType, number>> = {
      free: {
        ai_chat: 5,
        biblical_qa: 5,
        verse_analysis: 2,
        character_explanations: 2,
        parables_explanations: 2,
        topical_study: 2,
        journal_entries: 5,
        study_notes: 10,
        favorites: 20,
        bookmarks: 20,
        sermon_library: 10,
        audio_sermons: 5,
        sermon_creation: 5
      },
      pro: {
        ai_chat: 25,
        biblical_qa: 25,
        verse_analysis: 10,
        character_explanations: 10,
        parables_explanations: 10,
        topical_study: 10,
        journal_entries: 25,
        study_notes: 50,
        favorites: 100,
        bookmarks: 100,
        sermon_library: 50,
        audio_sermons: 25,
        sermon_creation: 25
      },
      supporter: {
        ai_chat: 60,
        biblical_qa: 60,
        verse_analysis: 24,
        character_explanations: 24,
        parables_explanations: 24,
        topical_study: 24,
        journal_entries: 60,
        study_notes: 120,
        favorites: 240,
        bookmarks: 240,
        sermon_library: 120,
        audio_sermons: 60,
        sermon_creation: 60
      },
      partner: {
        ai_chat: -1,
        biblical_qa: -1,
        verse_analysis: -1,
        character_explanations: -1,
        parables_explanations: -1,
        topical_study: -1,
        journal_entries: -1,
        study_notes: -1,
        favorites: -1,
        bookmarks: -1,
        sermon_library: -1,
        audio_sermons: -1,
        sermon_creation: -1
      }
    };

    return limits[plan];
  }

  /**
   * Format limit for display (handle unlimited)
   */
  formatLimit(limit: number): string {
    return limit === -1 ? 'Unlimited' : limit.toString();
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService(); 