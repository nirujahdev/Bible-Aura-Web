import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Tablet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDevicePreference } from '@/hooks/useDevicePreference';
import { type DeviceType } from '@/lib/devicePreferences';

export default function MobileDeviceSelection() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isMobileDevice = useIsMobile();
  const { updatePreference, hasPreference } = useDevicePreference();

  // If user is not authenticated, redirect to auth
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // If user already has a preference, redirect to dashboard
  useEffect(() => {
    if (!loading && user && hasPreference) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, hasPreference, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (useEffect will handle redirect)
  if (!user) {
    return null;
  }

  // If user already has preference, return null (useEffect will handle redirect)
  if (hasPreference) {
    return null;
  }

  const handleDeviceSelection = (deviceType: DeviceType) => {
    try {
      // Store the user's preference using the hook
      updatePreference(deviceType);
      
      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error setting device preference:', error);
      // Still navigate to dashboard as fallback
      navigate('/dashboard', { replace: true });
    }
  };

  const getRecommendedDevice = () => {
    return isMobileDevice ? 'mobile' : 'desktop';
  };

  const recommendedDevice = getRecommendedDevice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Bible Aura!
          </h1>
          <p className="text-lg text-gray-600">
            Choose your preferred experience to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Desktop Experience */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              recommendedDevice === 'desktop' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleDeviceSelection('desktop')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Monitor className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">
                Desktop Experience
                {recommendedDevice === 'desktop' && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Full-featured interface optimized for laptops and desktop computers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Advanced Bible study tools</li>
                <li>• Multi-panel layouts</li>
                <li>• Enhanced AI chat interface</li>
                <li>• Comprehensive sermon writing</li>
                <li>• Detailed analytics dashboard</li>
              </ul>
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeviceSelection('desktop');
                }}
              >
                Choose Desktop
              </Button>
            </CardContent>
          </Card>

          {/* Mobile Experience */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              recommendedDevice === 'mobile' ? 'ring-2 ring-green-500 bg-green-50' : ''
            }`}
            onClick={() => handleDeviceSelection('mobile')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-xl">
                Mobile Experience
                {recommendedDevice === 'mobile' && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Touch-optimized interface designed for phones and tablets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Touch-friendly navigation</li>
                <li>• Simplified layouts</li>
                <li>• Quick AI chat access</li>
                <li>• Mobile-optimized reading</li>
                <li>• Gesture-based controls</li>
              </ul>
              <Button 
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeviceSelection('mobile');
                }}
              >
                Choose Mobile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            Don't worry - you can always change this preference later in your settings
          </p>
          <Button 
            variant="outline" 
            onClick={() => handleDeviceSelection(recommendedDevice)}
            className="text-gray-600 hover:text-gray-800"
          >
            Continue with Recommended ({recommendedDevice === 'mobile' ? 'Mobile' : 'Desktop'})
          </Button>
        </div>
      </div>
    </div>
  );
} 