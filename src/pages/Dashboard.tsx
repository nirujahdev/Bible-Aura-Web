import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, BookOpen, PenTool, Sparkles, TrendingUp, 
  Star, Calendar, Target, Heart, Brain, Clock, ChevronRight,
  Plus, Book, Zap, Users, Trophy, ArrowRight, Send, Bot,
  Menu, Settings, LogOut, Headphones, FileText, Edit, History,
  Mic, Search, Play, Pause, Volume2, MoreVertical, X, Home,
  Bookmark, User, Bell, Gift, Flame, RefreshCw, Grid3X3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import EnhancedAIChat from '@/components/EnhancedAIChat';
import { useDevicePreference } from '@/hooks/useDevicePreference';

interface DashboardStats {
  journalEntries: number;
  chatConversations: number;
  readingStreak: number;
  weeklyGoal: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

// Quick start prompts - works for both laptop and mobile
const quickStartPrompts = [
  {
    id: 1,
    title: "Daily Devotion",
    description: "Start your spiritual journey today",
    icon: Heart,
    color: "bg-rose-500",
    action: "chat",
    prompt: "Give me an inspiring Bible verse for today with explanation"
  },
  {
    id: 2,
    title: "Bible Questions",
    description: "Ask AI about Scripture",
    icon: Brain,
    color: "bg-blue-500",
    action: "chat",
    prompt: "I have a question about the Bible:"
  },
  {
    id: 3,
    title: "Prayer Guide",
    description: "Guided prayer suggestions",
    icon: Calendar,
    color: "bg-purple-500",
    action: "chat",
    prompt: "Help me with a prayer for today"
  },
  {
    id: 4,
    title: "Study Helper",
    description: "Dive deeper into Scripture",
    icon: BookOpen,
    color: "bg-green-500",
    action: "chat",
    prompt: "Help me understand this Bible passage:"
  }
];

// Bible Aura features that work for both mobile and laptop
const dashboardFeatures = [
  {
    title: "AI Bible Chat",
    description: "Ask any biblical question",
    icon: MessageCircle,
    color: "bg-orange-500",
    href: "/ai-chat",
    subtitle: "Active AI assistant"
  },
  {
    title: "Bible",
    description: "Read & study Scripture",
    icon: Book,
    color: "bg-blue-500",
    href: "/bible",
    subtitle: "Multiple translations"
  },
  {
    title: "Sermons",
    description: "AI-enhanced sermons",
    icon: Headphones,
    color: "bg-purple-500",
    href: "/sermons",
    subtitle: "Sermon library"
  },
  {
    title: "Journal",
    description: "Personal faith insights",
    icon: PenTool,
    color: "bg-green-500",
    href: "/journal",
    subtitle: "Personal insights"
  }
];

// Inspirational quotes carousel
const inspirationalQuotes = [
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11"
  },
  {
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5"
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28"
  }
];

// Helper functions
const formatTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getUserName = () => {
  const { profile } = useAuth();
  return profile?.display_name || 'Benaiah';
};

const getAIInsight = async (prompt: string): Promise<string> => {
  // Simulate AI response for quick insights
  const insights = [
    "Remember that God's love for you is unconditional and everlasting.",
    "Today is a new opportunity to grow in faith and show kindness to others.",
    "Prayer is your direct line to God - use it frequently throughout your day.",
    "Scripture reading nourishes your soul like food nourishes your body.",
    "God has equipped you with everything you need for today's challenges."
  ];
  return insights[Math.floor(Math.random() * insights.length)] + "\n\n• Trust in His timing\n• Seek His wisdom in prayer\n• He will never leave nor forsake you";
};

// Main Dashboard Component - Responsive for both laptop and mobile
const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { preference } = useDevicePreference();
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // State management
  const [stats, setStats] = useState<DashboardStats>({
    journalEntries: 0,
    chatConversations: 0,
    readingStreak: 0,
    weeklyGoal: 0
  });
  
  const [quickInput, setQuickInput] = useState('');
  const [isQuickChatLoading, setIsQuickChatLoading] = useState(false);
  const [quickInsight, setQuickInsight] = useState<string>('');
  const [showQuickInsight, setShowQuickInsight] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Load dashboard data
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const handleQuickAIChat = async (promptText?: string) => {
    const textToSend = promptText || quickInput;
    if (!textToSend.trim()) return;

    setIsQuickChatLoading(true);
    setQuickInput('');

    try {
      const insight = await getAIInsight(textToSend);
      setQuickInsight(insight);
      setShowQuickInsight(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI insight. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsQuickChatLoading(false);
    }
  };

  // Get device preference indicator
  const deviceBadge = () => {
    if (preference?.type === 'desktop') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Desktop Experience</Badge>;
    }
    if (preference?.type === 'mobile') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Mobile Experience</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Responsive */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Bible Aura</h1>
              {deviceBadge()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 z-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{getUserName().charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">{getUserName()}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="p-4 space-y-6 pb-24 max-w-6xl mx-auto">
        {/* Welcome Section - Responsive */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full opacity-20"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full opacity-15"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">{formatTime()}, {getUserName()}!</h2>
            <p className="text-orange-100 mb-4">Ready for your spiritual journey today?</p>
            
            {/* Inspirational Quote */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm italic mb-2">"{inspirationalQuotes[currentQuote].text}"</p>
              <p className="text-xs text-orange-200">— {inspirationalQuotes[currentQuote].reference}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.chatConversations}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center mt-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                AI Chats
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.journalEntries}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center mt-1">
                <BookOpen className="h-4 w-4 mr-1" />
                Journal Entries
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick AI Chat */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Bot className="h-5 w-5 mr-2 text-orange-600" />
              Quick AI Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="Ask about Scripture..."
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickAIChat()}
              />
              <Button 
                onClick={() => handleQuickAIChat()}
                disabled={isQuickChatLoading}
                size="sm"
              >
                {isQuickChatLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {showQuickInsight && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">AI Insight</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowQuickInsight(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-blue-700 whitespace-pre-line">{quickInsight}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bible Aura Features - Responsive Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Bible Aura Features</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardFeatures.map((feature, index) => (
              <Link key={index} to={feature.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-slate-600">{feature.description}</p>
                    <p className="text-xs text-slate-500 mt-2">{feature.subtitle}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Start Actions - Responsive */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickStartPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleQuickAIChat(prompt.prompt)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${prompt.color} rounded-lg flex items-center justify-center`}>
                      <prompt.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{prompt.title}</h4>
                      <p className="text-xs text-slate-600">{prompt.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.readingStreak}</div>
              <div className="text-sm text-slate-600 flex items-center justify-center mt-1">
                <Flame className="h-4 w-4 mr-1" />
                Reading Streak
              </div>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.weeklyGoal}%</div>
              <div className="text-sm text-slate-600 flex items-center justify-center mt-1">
                <Target className="h-4 w-4 mr-1" />
                Weekly Goal
              </div>
              <p className="text-xs text-slate-500 mt-1">progress</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 