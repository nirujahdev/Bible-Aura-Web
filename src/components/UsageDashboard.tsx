import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { subscriptionService, UsageInfo, ResourceType, SubscriptionInfo } from '@/lib/subscription-service';
import { 
  Crown, 
  MessageSquare, 
  BookOpen, 
  Users, 
  Heart, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';

interface UsageDashboardProps {
  className?: string;
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<Record<ResourceType, UsageInfo> | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [usage, subscription] = await Promise.all([
        subscriptionService.getAllUsageStats(user.id),
        subscriptionService.getSubscriptionInfo(user.id)
      ]);

      setUsageStats(usage);
      setSubscriptionInfo(subscription);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'supporter': return 'Supporter';
      case 'partner': return 'Partner';
      default: return 'Free';
    }
  };

  const resourceIcons: Record<string, React.ReactNode> = {
    ai_chat: <MessageSquare className="h-4 w-4" />,
    biblical_qa: <BookOpen className="h-4 w-4" />,
    verse_analysis: <BookOpen className="h-4 w-4" />,
    character_explanations: <Users className="h-4 w-4" />,
    parables_explanations: <Heart className="h-4 w-4" />,
    topical_study: <BookOpen className="h-4 w-4" />,
    journal_entries: <Calendar className="h-4 w-4" />,
  };

  const resourceLabels: Record<string, string> = {
    ai_chat: 'AI Chat',
    biblical_qa: 'Biblical Q&A',
    verse_analysis: 'Verse Analysis',
    character_explanations: 'Character Studies',
    parables_explanations: 'Parable Studies',
    topical_study: 'Topical Studies',
    journal_entries: 'Journal Entries',
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">
            Please sign in to view your usage statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mainResources = ['ai_chat', 'biblical_qa', 'verse_analysis', 'character_explanations', 'journal_entries'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Subscription Status */}
      {subscriptionInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-orange-600" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${subscriptionInfo.plan !== 'free' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <Crown className={`h-4 w-4 ${subscriptionInfo.plan !== 'free' ? 'text-orange-600' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{getPlanDisplayName(subscriptionInfo.plan)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {subscriptionInfo.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              {subscriptionInfo.plan === 'free' && (
                <Button size="sm" onClick={() => window.location.href = '/pricing'}>
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usageStats ? (
            <div className="space-y-4">
              {mainResources.map((resource) => {
                const usage = usageStats[resource as ResourceType];
                const percentage = getUsagePercentage(usage.currentUsage, usage.limitAmount);
                const isUnlimited = usage.limitAmount === -1;

                return (
                  <div key={resource} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {resourceIcons[resource]}
                        <span className="text-sm font-medium">
                          {resourceLabels[resource]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                          {usage.currentUsage}{!isUnlimited && `/${usage.limitAmount}`}
                        </span>
                        {isUnlimited && (
                          <Badge variant="secondary" className="text-xs">
                            Unlimited
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isUnlimited && (
                      <Progress 
                        value={percentage} 
                        className="h-2" 
                      />
                    )}
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Usage resets on {new Date(usageStats.ai_chat.resetDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load usage data</p>
              <Button variant="outline" size="sm" onClick={loadUsageData} className="mt-2">
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 