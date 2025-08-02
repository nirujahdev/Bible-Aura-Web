import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  MessageCircle, BookOpen, PenTool, Sparkles, TrendingUp, 
  Star, Calendar, Target, Heart, Brain, Clock, ChevronRight,
  Plus, Book, Zap, Users, Trophy, ArrowRight, Send, Bot,
  Menu, Settings, LogOut, Headphones, FileText, Edit, History,
  Mic, Search, Play, Pause, Volume2, MoreVertical, X, Home,
  Bookmark, User, Bell, Gift, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { useSEO, SEO_CONFIG } from '../hooks/useSEO';

interface DashboardStats {
  journalEntries: number;
  chatConversations: number;
  readingStreak: number;
  weeklyGoal: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
}

interface DailyVerse {
  verse: string;
  reference: string;
  theme: string;
}

// Mobile-optimized quick actions
const quickActions: QuickAction[] = [
  {
    title: "AI Chat",
    description: "Ask biblical questions",
    icon: MessageCircle,
    href: "/bible-ai",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    title: "Bible",
    description: "Read Scripture",
    icon: Book,
    href: "/bible",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Study Hub",
    description: "Deep study tools",
    icon: BookOpen,
    href: "/study-hub",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Journal",
    description: "Record insights",
    icon: PenTool,
    href: "/journal",
    color: "text-green-600",
    bgColor: "bg-green-50"
  }
];

// Featured study prompts for mobile
const studyPrompts = [
  {
    title: "Verse Analysis",
    description: "Analyze John 3:16 with historical context",
    icon: Search,
    color: "bg-gradient-to-r from-green-500 to-green-600"
  },
  {
    title: "Theological Study",
    description: "Explain the doctrine of salvation",
    icon: Sparkles,
    color: "bg-gradient-to-r from-purple-500 to-purple-600"
  },
  {
    title: "Historical Context",
    description: "Paul's missionary journeys",
    icon: History,
    color: "bg-gradient-to-r from-orange-500 to-orange-600"
  },
  {
    title: "Character Study",
    description: "Learn from David's faith journey",
    icon: User,
    color: "bg-gradient-to-r from-blue-500 to-blue-600"
  }
];

const MobileDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // State management
  const [stats, setStats] = useState<DashboardStats>({
    journalEntries: 0,
    chatConversations: 0,
    readingStreak: 0,
    weeklyGoal: 0
  });
  
  const [showQuickChat, setShowQuickChat] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [dailyVerse] = useState<DailyVerse>({
    verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    theme: "God's Love"
  });

  // Load dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      const [journalRes, conversationsRes] = await Promise.all([
        supabase
          .from('journal_entries')
          .select('id')
          .eq('user_id', user?.id),
        supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user?.id)
      ]);

      setStats({
        journalEntries: journalRes.data?.length || 0,
        chatConversations: conversationsRes.data?.length || 0,
        readingStreak: Math.floor(Math.random() * 30) + 1,
        weeklyGoal: Math.floor(Math.random() * 100) + 50
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleQuickAI = (prompt: string) => {
    setQuickInput(prompt);
    setShowQuickChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Bible Aura</h1>
                <p className="text-orange-100 text-sm">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white">
                <Bell className="h-5 w-5" />
              </Button>
                             <Avatar className="h-8 w-8 border-2 border-white/20">
                 <AvatarImage src={profile?.avatar_url || undefined} />
                 <AvatarFallback className="bg-white/20 text-white text-sm">
                   {(profile?.display_name || user?.email)?.charAt(0) || 'U'}
                 </AvatarFallback>
               </Avatar>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                         <h2 className="text-lg font-semibold mb-1">
               Welcome back, {(profile?.display_name || user?.email)?.split(' ')[0] || 'Friend'}! 👋
             </h2>
            <p className="text-orange-100 text-sm">
              Continue your spiritual journey with AI-powered insights
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs">Reading Streak</p>
                  <p className="text-xl font-bold">{stats.readingStreak}</p>
                </div>
                <Flame className="h-5 w-5 text-orange-200" />
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs">AI Chats</p>
                  <p className="text-xl font-bold">{stats.chatConversations}</p>
                </div>
                <Bot className="h-5 w-5 text-orange-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-6 space-y-6">
          {/* Daily Verse Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <Badge className="bg-blue-100 text-blue-700 text-xs mb-2">
                    Daily Verse • {dailyVerse.theme}
                  </Badge>
                  <p className="text-gray-800 text-sm leading-relaxed mb-2">
                    "{dailyVerse.verse}"
                  </p>
                  <p className="text-blue-600 font-medium text-sm">
                    {dailyVerse.reference}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 ${action.bgColor} rounded-2xl flex items-center justify-center mb-3`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">
                        {action.title}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Study Prompts */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-semibold text-gray-800">
                Study with AI
              </h3>
              <Link to="/bible-ai">
                <Button variant="ghost" size="sm" className="text-orange-600">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {studyPrompts.map((prompt, index) => (
                <Card 
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleQuickAI(prompt.description)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${prompt.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <prompt.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">
                          {prompt.title}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          {prompt.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 px-1">
              Continue Your Journey
            </h3>
            <div className="space-y-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <PenTool className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Continue Journal Entry
                      </h4>
                      <p className="text-gray-600 text-xs">
                        "Reflections on God's goodness..." - 2 days ago
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      Draft
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Resume Reading
                      </h4>
                      <p className="text-gray-600 text-xs">
                        Psalms 23 - "The Lord is my shepherd..."
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      75%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Goals Progress */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">Weekly Goal</h4>
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bible Reading</span>
                  <span className="text-amber-600 font-medium">{stats.weeklyGoal}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.weeklyGoal}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  Great progress! You're {stats.weeklyGoal >= 80 ? 'crushing' : 'on track for'} your weekly goal.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick AI Chat Input */}
          {showQuickChat && (
            <Card className="border-0 shadow-lg border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Quick AI Chat</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowQuickChat(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask anything about the Bible..."
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      // Handle AI chat
                      toast({
                        title: "AI Chat Started",
                        description: "Redirecting to full chat interface..."
                      });
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom padding for mobile navigation */}
          <div className="h-20"></div>
        </div>
      </ScrollArea>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-4">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
          onClick={() => setShowQuickChat(!showQuickChat)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MobileDashboard; 