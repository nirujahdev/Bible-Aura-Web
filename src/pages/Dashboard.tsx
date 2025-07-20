import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BibleStudyWidget, 
  AIChatWidget, 
  JournalWidget, 
  PrayerWidget,
  ReadingProgressWidget 
} from "@/components/FeatureWidgets";
import { DailyVerseWidget } from "@/components/DailyVerseWidget";
import WidgetErrorBoundary from "@/components/WidgetErrorBoundary";
import { 
  DashboardHeaderSkeleton,
  DashboardStatsSkeleton,
  DashboardWidgetsSkeleton,
  DailyVerseSkeletonLoad
} from "@/components/ui/skeleton-extended";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useSwipeNavigation } from "@/hooks/useTouchGestures";
import { 
  Calendar, 
  BookOpen, 
  Zap, 
  Plus, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Star, 
  MessageCircle, 
  FileText, 
  Users, 
  Music, 
  Mic, 
  Search,
  Headphones,
  HelpCircle,
  Brain,
  TreePine,
  ArrowRight,
  Settings,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DebugConsole } from "@/components/DebugConsole";
import ErrorBoundary from "@/components/ErrorBoundary";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgetsLoaded, setWidgetsLoaded] = useState(false);

  useEffect(() => {
    try {
      // Simulate initial loading
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setWidgetsLoaded(true), 300);
      }, 800);

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
        <div className="container mx-auto px-4 py-6">
          <DashboardHeaderSkeleton />
          <DashboardStatsSkeleton />
          <div className="mb-12">
            <DailyVerseSkeletonLoad />
          </div>
          <DashboardWidgetsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-primary text-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">
                Welcome back, {getDisplayName()}
              </h1>
              <p className="text-white/80 text-sm">
                {(profile?.reading_streak || 0) > 0 && `${profile?.reading_streak} day reading streak 🔥`}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/bible">
                <Button size="sm" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Bible
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Daily Verse Section */}
        <div className="mb-6">
          <WidgetErrorBoundary widgetName="Daily Verse" fallbackMessage="Unable to load today's verse. Please try refreshing.">
            {widgetsLoaded ? <DailyVerseWidget /> : <DailyVerseSkeletonLoad />}
          </WidgetErrorBoundary>
        </div>
        
        {/* Essential Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold text-blue-600">{profile?.reading_streak || 0}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold text-green-600">12</div>
              <div className="text-sm text-gray-600">Journal Entries</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-semibold text-purple-600">47</div>
              <div className="text-sm text-gray-600">AI Insights</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bible Study Widget */}
            <WidgetErrorBoundary widgetName="Bible Study" fallbackMessage="Unable to load Bible study progress.">
              {widgetsLoaded ? <BibleStudyWidget /> : <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>}
            </WidgetErrorBoundary>
            
            {/* AI Chat Widget */}
            <WidgetErrorBoundary widgetName="AI Chat" fallbackMessage="Unable to load AI chat history.">
              {widgetsLoaded ? <AIChatWidget /> : <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>}
            </WidgetErrorBoundary>
            
            {/* Journal Widget */}
            <WidgetErrorBoundary widgetName="Journal" fallbackMessage="Unable to load journal entries.">
              {widgetsLoaded ? <JournalWidget /> : <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>}
            </WidgetErrorBoundary>
            
            {/* Prayer Widget */}
            <WidgetErrorBoundary widgetName="Prayer" fallbackMessage="Unable to load prayer requests.">
              {widgetsLoaded ? <PrayerWidget /> : <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>}
            </WidgetErrorBoundary>
            
            {/* Reading Progress Widget */}
            <WidgetErrorBoundary widgetName="Reading Progress" fallbackMessage="Unable to load your reading progress.">
              {widgetsLoaded ? <ReadingProgressWidget /> : <div className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>}
            </WidgetErrorBoundary>
            
            {/* Quick Create Widget */}
            <Card className="h-full border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Plus className="h-5 w-5" />
                  Quick Create
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/journal">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    New Journal Entry
                  </Button>
                </Link>

                <Link to="/chat">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start AI Chat
                  </Button>
                </Link>
                <Link to="/bible">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Study Scripture
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Debug Console for Development */}
      {process.env.NODE_ENV === 'development' && <DebugConsole />}
    </div>
  );
};

export default Dashboard; 