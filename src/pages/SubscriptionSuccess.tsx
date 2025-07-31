import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Gift } from 'lucide-react';
import { GlobalNavigation } from '@/components/GlobalNavigation';
import Footer from '@/components/Footer';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate payment verification delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavigation variant="landing" />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold mb-2">Verifying Your Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavigation variant="landing" />
      
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 mb-2">
              Payment Successful! 🎉
            </CardTitle>
            <p className="text-lg text-gray-600">
              Welcome to your new ✦Bible Aura subscription
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <Gift className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800">
                  Your Premium Features Are Now Active
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Unlimited AI Bible Chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Advanced Scripture Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Personal Prayer Journal</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Premium Sermon Library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ministry Resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Your subscription is now active and you have full access to all premium features. 
                Start exploring the enhanced Bible study tools designed to deepen your spiritual journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
                >
                  Start Your Journey
                </Button>
                <Button 
                  onClick={() => navigate('/bible-ai')} 
                  variant="outline" 
                  className="border-orange-200 hover:bg-orange-50"
                >
                  Try AI Bible Chat
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Need help getting started? Visit our{' '}
                <button 
                  onClick={() => navigate('/features')} 
                  className="text-orange-600 hover:underline"
                >
                  features guide
                </button>
                {' '}or{' '}
                <button 
                  onClick={() => navigate('/contact')} 
                  className="text-orange-600 hover:underline"
                >
                  contact support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
} 