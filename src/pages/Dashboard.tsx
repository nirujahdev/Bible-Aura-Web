import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DailyVerseWidget } from "@/components/DailyVerseWidget";
import WidgetErrorBoundary from "@/components/WidgetErrorBoundary";
import { 
  DashboardHeaderSkeleton,
  DashboardStatsSkeleton
} from "@/components/ui/skeleton-extended";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSwipeNavigation } from "@/hooks/useTouchGestures";
import { 
  Calendar, 
  BookOpen, 
  MessageCircle, 
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DebugConsole } from "@/components/DebugConsole";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageLayout } from "@/components/PageLayout";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Minimal loading for essential content only
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => {
        clearTimeout(loadingTimer);
      };
    } catch (error) {
      console.error('Error setting up Dashboard:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Friend';
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're having trouble loading your dashboard. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 py-6">
          <DashboardHeaderSkeleton />
          <DashboardStatsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <PageLayout padding="none" maxWidth="full">
      <>
      {/* Header Banner with Orange Background and Centered Content */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {/* Icon and Title */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-16 w-16 flex items-center justify-center bg-white/20 rounded-xl">
                <span className="text-4xl font-bold text-white">✦</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Welcome back, {getDisplayName()}
                </h1>
                <p className="text-lg text-white/90 mt-1">
                  AI-Powered Biblical Insights & Spiritual Growth
                </p>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="flex justify-center items-center gap-6 mt-6">
              {(profile?.reading_streak || 0) > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile?.reading_streak}</div>
                  <div className="text-sm text-white/80">Day Streak 🔥</div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Link to="/bible">
                  <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-white/90 font-semibold">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Read Bible
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 font-semibold">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Daily Verse Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <WidgetErrorBoundary widgetName="Daily Verse" fallbackMessage="Unable to load today's verse. Please try refreshing.">
            <DailyVerseWidget />
          </WidgetErrorBoundary>
        </div>
        
        {/* Essential Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-3xl mx-auto">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">{profile?.reading_streak || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">12</div>
              <div className="text-xs sm:text-sm text-gray-600">Journal Entries</div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">47</div>
              <div className="text-xs sm:text-sm text-gray-600">✦ Bible Aura AI Insights</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Debug Console for Development */}
      {process.env.NODE_ENV === 'development' && <DebugConsole />}
      </>
    </PageLayout>
  );
};

export default Dashboard; 