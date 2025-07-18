import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BibleStudyWidget, 
  AIChatWidget, 
  JournalWidget, 
 
  ReadingProgressWidget 
} from "@/components/FeatureWidgets";
import { DailyVerseWidget } from "@/components/DailyVerseWidget";
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

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get current hour for greeting
  const hour = currentTime.getHours();
  const getGreeting = () => {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Section */}
      <div className="gradient-primary text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="container relative z-10 section-spacing-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Greeting and User Info */}
            <div className="text-spacing">
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {getGreeting()}, {profile?.display_name?.split(' ')[0] || 'Friend'}!
                </h1>
                <div className="flex items-center gap-2">
                  {profile?.reading_streak >= 7 && <span className="text-3xl animate-bounce">🔥</span>}
                  {profile?.reading_streak >= 30 && <span className="text-3xl animate-pulse">⭐</span>}
                </div>
              </div>
              <p className="text-white/90 text-lg sm:text-xl font-medium">
                Continue your spiritual journey with AI-powered biblical insights
              </p>
              <div className="flex flex-wrap items-center gap-6 text-base text-white/80 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🕒</span>
                  <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="btn-group">
              <Link to="/bible">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 rounded-xl">
                  <BookOpen className="mr-3 h-6 w-6" />
                  Read Bible
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 rounded-xl">
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Ask AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Daily Verse Section - Full Width */}
        <div className="mb-12">
          <DailyVerseWidget />
        </div>
        
        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Reading Streak</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                    {profile?.reading_streak || 0}
                  </p>
                  <p className="text-xs text-blue-500">days</p>
                </div>
                <div className="p-3 bg-blue-200/50 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">AI Insights</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">47</p>
                  <p className="text-xs text-purple-500">generated</p>
                </div>
                <div className="p-3 bg-purple-200/50 rounded-full">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Journal Entries</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">12</p>
                  <p className="text-xs text-green-500">written</p>
                </div>
                <div className="p-3 bg-green-200/50 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Core Features Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Core Features
            </h2>
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <BibleStudyWidget />
            <AIChatWidget />
            <JournalWidget />
            
            <ReadingProgressWidget />
            
            {/* Quick Create Widget */}
            <Card className="h-full border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50">
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

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Read John 3:16</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Asked AI about faith</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New journal entry</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
              
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  View All Activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BarChart3 className="h-5 w-5" />
                Your Progress
                <Badge variant="secondary" className="ml-auto">
                  This Week
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Analytics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{profile?.reading_streak || 0}</div>
                  <div className="text-xs text-blue-600/70">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">47</div>
                  <div className="text-xs text-purple-600/70">AI Questions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">12</div>
                  <div className="text-xs text-green-600/70">Journal Entries</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-xl font-bold text-amber-600">85%</div>
                  <div className="text-xs text-amber-600/70">Prayer Rate</div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weekly Progress</span>
                  <span className="text-gray-500">5/7 days</span>
                </div>
                <Progress value={71} className="h-2" />
              </div>

              {/* Current Achievement */}
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl">🔥</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">On Fire!</p>
                  <p className="text-xs text-amber-600">7-day reading streak achieved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Explore Features
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* All feature cards */}
            {[
              { name: 'Bible Study', icon: BookOpen, link: '/bible', color: 'blue' },
              { name: 'AI Chat', icon: MessageCircle, link: '/chat', color: 'purple' },
              { name: 'Journal', icon: FileText, link: '/journal', color: 'green' },
              { name: 'Prayers', icon: Star, link: '/prayers', color: 'amber' },
              { name: 'Songs', icon: Music, link: '/songs', color: 'pink' },
              { name: 'Sermons', icon: Headphones, link: '/sermons', color: 'red' },
              { name: 'Bible Q&A', icon: HelpCircle, link: '/bible-qa', color: 'orange' },
              { name: 'Characters', icon: Users, link: '/bible-characters', color: 'cyan' },
              { name: 'Topical Study', icon: BookOpen, link: '/topical-study', color: 'indigo' },
              { name: 'Sermon Library', icon: Mic, link: '/sermon-library', color: 'violet' },
              { name: 'Parables', icon: TreePine, link: '/parables-study', color: 'teal' },
              { name: 'Favorites', icon: Heart, link: '/favorites', color: 'rose' }
            ].map((feature) => (
              <Link key={feature.name} to={feature.link}>
                <Card className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100/50 border-${feature.color}-200 cursor-pointer`}>
                  <CardContent className="p-4 text-center">
                    <div className={`p-3 bg-${feature.color}-100 rounded-full w-fit mx-auto mb-3`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <h3 className={`font-semibold text-sm text-${feature.color}-800`}>
                      {feature.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 