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

// Mobile-optimized quick start prompts (same as laptop version)
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
  return profile?.display_name || profile?.username || 'Benaiah';
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

// Desktop Dashboard Layout
const DesktopDashboard = () => {
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
  
  const [quickInput, setQuickInput] = useState('');
  const [isQuickChatLoading, setIsQuickChatLoading] = useState(false);
  const [quickInsight, setQuickInsight] = useState<string>('');
  const [showQuickInsight, setShowQuickInsight] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

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
    const prompt = promptText || quickInput;
    if (!prompt.trim()) return;

    setIsQuickChatLoading(true);
    try {
      const insight = await getAIInsight(prompt);
      setQuickInsight(insight);
      setShowQuickInsight(true);
      setQuickInput('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Desktop Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">Bible Aura</h1>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Desktop Experience
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>{getUserName().charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">{getUserName()}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section - Desktop Layout */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-8 w-32 h-32 bg-white rounded-full opacity-20"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 bg-white rounded-full opacity-15"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-3">{formatTime()}, {getUserName()}!</h2>
              <p className="text-orange-100 text-lg mb-6">Ready for your spiritual journey today?</p>
              
              {/* Quick AI Chat Input - Desktop */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Ask AI about Scripture, prayer, or faith..."
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickAIChat()}
                    className="bg-white/20 border-white/30 text-white placeholder:text-orange-200"
                  />
                  <Button 
                    onClick={() => handleQuickAIChat()}
                    disabled={isQuickChatLoading}
                    className="bg-white text-orange-600 hover:bg-orange-50"
                  >
                    {isQuickChatLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Inspirational Quote */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <p className="text-lg italic mb-3">"{inspirationalQuotes[currentQuote].text}"</p>
              <p className="text-orange-200">— {inspirationalQuotes[currentQuote].reference}</p>
            </div>
          </div>
        </div>

        {/* Quick AI Insight Display */}
        {showQuickInsight && (
          <div className="mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-800 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI Insight
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowQuickInsight(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 whitespace-pre-line">{quickInsight}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Grid - Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">AI Chats</span>
                </div>
                <Badge variant="secondary">{stats.chatConversations}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Journal Entries</span>
                </div>
                <Badge variant="secondary">{stats.journalEntries}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Reading Streak</span>
                </div>
                <Badge variant="secondary">{stats.readingStreak} days</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickStartPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-4 rounded-xl border hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => handleQuickAIChat(prompt.prompt)}
                  >
                    <div className={`w-10 h-10 ${prompt.color} rounded-lg flex items-center justify-center mb-3`}>
                      <prompt.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800 mb-1">{prompt.title}</h3>
                    <p className="text-sm text-slate-600 group-hover:text-slate-800">
                      {prompt.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bible Aura Features - Desktop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Bible Chat</h3>
              <p className="text-sm text-slate-600 mb-4">Ask any biblical question</p>
              <Link to="/ai-chat">
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Bible</h3>
              <p className="text-sm text-slate-600 mb-4">Read & study Scripture</p>
              <Link to="/bible">
                <Button variant="outline" size="sm" className="w-full">
                  Read Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <PenTool className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Journal</h3>
              <p className="text-sm text-slate-600 mb-4">Reflect on your faith</p>
              <Link to="/journal">
                <Button variant="outline" size="sm" className="w-full">
                  Write Entry
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Sermons</h3>
              <p className="text-sm text-slate-600 mb-4">Create and manage sermons</p>
              <Link to="/sermons">
                <Button variant="outline" size="sm" className="w-full">
                  View Sermons
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mobile Dashboard Layout
const MobileDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // State management (same as laptop version)
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

  // Load dashboard data (same backend calls as laptop)
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  // Rotate quotes every 10 seconds (same as laptop)
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
    const prompt = promptText || quickInput;
    if (!prompt.trim()) return;

    setIsQuickChatLoading(true);
    try {
      const insight = await getAIInsight(prompt);
      setQuickInsight(insight);
      setShowQuickInsight(true);
      setQuickInput('');
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Bible Aura</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Mobile Experience
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Settings Panel */}
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

      {/* Main Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
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

        {/* Quick Stats */}
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

        {/* Bible Aura Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Bible Aura Features</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/ai-chat">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">AI Bible Chat</h4>
                  <p className="text-xs text-slate-600">Ask any biblical question</p>
                  <p className="text-xs text-slate-500 mt-2">Active AI assistant</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bible">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Book className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Bible</h4>
                  <p className="text-xs text-slate-600">Read & study Scripture</p>
                  <p className="text-xs text-slate-500 mt-2">Multiple translations</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/journal">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <PenTool className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Journal</h4>
                  <p className="text-xs text-slate-600">Reflect on your faith</p>
                  <p className="text-xs text-slate-500 mt-2">Personal insights</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/sermons">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Sermons</h4>
                  <p className="text-xs text-slate-600">Create and manage</p>
                  <p className="text-xs text-slate-500 mt-2">Sermon library</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component - Routes based on device preference
const Dashboard = () => {
  const { preference } = useDevicePreference();
  
  // Show desktop layout if user chose desktop, mobile if they chose mobile
  if (preference?.type === 'desktop') {
    return <DesktopDashboard />;
  }
  
  // Default to mobile for users who haven't set preference yet or chose mobile
  return <MobileDashboard />;
};

export default Dashboard; 