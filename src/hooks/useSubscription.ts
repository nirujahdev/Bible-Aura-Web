import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  price: number;
  isActive: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // TODO: Implement actual subscription fetching logic
      // For now, return a default free plan
      setSubscription({
        id: 'free',
        name: 'Free Plan',
        features: ['Basic Bible reading', 'Limited features'],
        price: 0,
        isActive: true
      });
    } else {
      setSubscription(null);
    }
    setLoading(false);
  }, [user]);

  const upgradeSubscription = async (planId: string) => {
    // TODO: Implement subscription upgrade logic
    console.log('Upgrading to plan:', planId);
  };

  const cancelSubscription = async () => {
    // TODO: Implement subscription cancellation logic
    console.log('Cancelling subscription');
  };

  return {
    subscription,
    loading,
    upgradeSubscription,
    cancelSubscription,
    hasPremium: subscription?.name !== 'Free Plan',
    isActive: subscription?.isActive || false
  };
} 