import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PayHereService, SUBSCRIPTION_PLANS } from '@/lib/payhere';

interface PayHereButtonProps {
  planId: string;
  planName: string;
  price: string;
  className?: string;
}

export function PayHereButton({ 
  planId, 
  planName, 
  price, 
  className 
}: PayHereButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe to a plan.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // Handle free plan
    if (planId === 'free' || price === '0') {
      toast({
        title: 'Free Plan Active',
        description: 'You are already using the free plan with full Bible study access!',
      });
      return;
    }

    try {
      setLoading(true);

      // Get user profile for customer details
      const customer = {
        firstName: user.user_metadata?.full_name?.split(' ')[0] || 'User',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Name',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || 'Address not provided',
        city: 'Colombo', // Default city
        country: 'Sri Lanka'
      };

      // Create payment data
      const payment = PayHereService.createSubscriptionPayment(
        planId,
        user.id,
        customer
      );

      // Submit payment to PayHere
      PayHereService.submitPayment(payment);

      toast({
        title: 'Redirecting to Payment',
        description: `Processing ${planName} subscription payment...`,
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (price === '0') return 'Get Started Free';
    return `Subscribe to ${planName}`;
  };

  return (
    <Button 
      className={className}
      onClick={handleSubscription}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {getButtonText()}
    </Button>
  );
} 