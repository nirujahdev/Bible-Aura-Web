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
    title: "Ask Bible Questions",
    description: "Get AI insights on Scripture",
    icon: Brain,
    color: "bg-purple-500",
    action: "chat",
    prompt: "I have a question about the Bible"
  },
  {
    id: 3,
    title: "Prayer Journal",
    description: "Document your prayers",
    icon: BookOpen,
    color: "bg-blue-500",
    action: "journal",
    prompt: "Today I'm praying for..."
  },
  {
    id: 4,
    title: "Bible Study",
    description: "Explore biblical truths",
    icon: Sparkles,
    color: "bg-amber-500",
    action: "chat",
    prompt: "Help me understand this Bible passage"
  }
];

// Mobile-friendly feature cards (same as laptop version)
const dashboardFeatures = [
  {
    title: "AI Bible Chat",
    description: "Ask any biblical question",
    icon: MessageCircle,
    href: "/bible-ai",
    color: "bg-orange-500",
    stats: "Active AI assistant"
  },
  {
    title: "Bible",
    description: "Read & study Scripture",
    icon: Book,
    href: "/bible",
    color: "bg-blue-500",
    stats: "Multiple translations"
  },
  {
    title: "Sermons",
    description: "Browse sermon library",
    icon: Headphones,
    href: "/sermons",
    color: "bg-purple-500",
    stats: "Curated collection"
  },
  {
    title: "Journal",
    description: "Record spiritual insights",
    icon: PenTool,
    href: "/journal",
    color: "bg-green-500",
    stats: "Private & secure"
  },
  {
    title: "Study Hub",
    description: "Comprehensive Bible study",
    icon: BookOpen,
    href: "/study-hub",
    color: "bg-amber-500",
    stats: "Multiple study tools"
  },
  {
    title: "Topical Study",
    description: "Study by topics",
    icon: Target,
    href: "/topical-study",
    color: "bg-indigo-500",
    stats: "Organized by themes"
  },
  {
    title: "Parables Study",
    description: "Explore Jesus' parables",
    icon: Sparkles,
    href: "/parables-study",
    color: "bg-pink-500",
    stats: "Deep insights"
  },
  {
    title: "Sermon Writer",
    description: "AI-assisted sermon creation",
    icon: Edit,
    href: "/sermon-writer",
    color: "bg-cyan-500",
    stats: "AI-powered"
  }
];

const inspirationalQuotes = [
  {
    text: "Your spiritual journey is unique and beautiful",
    reference: "Psalm 139:14"
  },
  {
    text: "God has great plans for your growth today",
    reference: "Jeremiah 29:11"
  },
  {
    text: "Let faith guide your thoughts and actions",
    reference: "Proverbs 3:5-6"
  }
];

// Mock AI function for demo purposes (same as laptop version)
const getAIInsight = async (prompt: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const insights = [
      `✮ Daily Inspiration\n\n↗ Today's Blessing\n• God's love surrounds you in every moment\n• Trust in His timing for your life\n• You are fearfully and wonderfully made\n\n↗ Prayer Focus\n• Gratitude for His faithfulness\n• Strength for today's challenges`,
      `✮ Biblical Wisdom\n\n↗ God's Promise\n• "For I know the plans I have for you," declares the Lord\n• Plans to prosper you and not to harm you\n• To give you hope and a future\n\n↗ Application\n• Trust in God's perfect timing\n• Rest in His sovereign plan`,
      `✮ Spiritual Growth\n\n↗ Today's Focus\n• Seek first His kingdom and righteousness\n• All these things will be added unto you\n• Walk by faith, not by sight\n\n↗ Action Steps\n• Spend time in prayer\n• Read God's Word daily`
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  } catch (error) {
    return "✮ God's Love\n\n↗ Remember\n• You are loved beyond measure\n• His grace is sufficient for you\n• He will never leave nor forsake you";
  }
};

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
        variant: "destructive"
      });
    } finally {
      setIsQuickChatLoading(false);
    }
  };

  const formatTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserName = () => {
    return profile?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Left: Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-orange-600 font-bold text-2xl">✦</span>
            <h1 className="text-lg font-bold text-gray-900">Bible Aura</h1>
          </div>

          {/* Right: 3-dot menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 p-2"
              onClick={() => setShowSettings(!showSettings)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-orange-100 text-orange-700">
                        {getUserName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800">{getUserName()}</p>
                      <p className="text-xs text-gray-500">{formatTime()}!</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => loadDashboardStats()}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                  <span>Refresh Stats</span>
                </button>
                
                <button
                  onClick={() => toast({ title: "Notifications", description: "Notification settings updated." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Bell className="h-4 w-4 text-purple-500" />
                  <span>Notifications</span>
                </button>
                
                <button
                  onClick={() => toast({ title: "Widget Settings", description: "Customize your dashboard widgets." })}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                >
                  <Grid3X3 className="h-4 w-4 text-green-500" />
                  <span>Widget Layout</span>
                </button>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link to="/profile">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Profile Settings</span>
                    </button>
                  </Link>
                  
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.chatConversations}</p>
                  <p className="text-xs text-gray-600">AI Chats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.journalEntries}</p>
                  <p className="text-xs text-gray-600">Journal Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features Grid */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Bible Aura Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {dashboardFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.href}>
                  <Card className="border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-200 h-full">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      <p className="text-xs text-gray-500">{feature.stats}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            {quickStartPrompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={prompt.id}
                  onClick={() => handleQuickAIChat(prompt.prompt)}
                  className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 text-left"
                >
                  <div className={`w-12 h-12 ${prompt.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{prompt.title}</h4>
                    <p className="text-sm text-gray-600">{prompt.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick AI Chat */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick AI Chat</h3>
          </div>

          <div className="space-y-4">
            {/* Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Ask me anything about the Bible..."
                  className="pr-12 rounded-xl border-2 border-gray-200 focus:border-orange-400 h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAIChat();
                    }
                  }}
                  disabled={isQuickChatLoading}
                />
                
                {quickInput.trim() && (
                  <Button
                    onClick={() => handleQuickAIChat()}
                    disabled={isQuickChatLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2 rounded-lg h-8 w-8"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Insight Display */}
            {showQuickInsight && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <Bot className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="font-medium text-orange-900">AI Insight</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowQuickInsight(false)}
                      className="p-1 h-6 w-6 text-orange-600 hover:bg-orange-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800">
                    {quickInsight.split('\n').map((line, index) => {
                      if (line.startsWith('✮')) {
                        return (
                          <h4 key={index} className="font-bold text-orange-800 mb-2">
                            {line.replace('✮ ', '')}
                          </h4>
                        );
                      } else if (line.startsWith('↗')) {
                        return (
                          <h5 key={index} className="font-semibold text-orange-700 mt-3 mb-1">
                            {line.replace('↗ ', '')}
                          </h5>
                        );
                      } else if (line.startsWith('•')) {
                        return (
                          <p key={index} className="ml-3 mb-1">
                            {line.replace('• ', '• ')}
                          </p>
                        );
                      } else if (line.trim()) {
                        return <p key={index} className="mb-1">{line}</p>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-orange-200">
                    <Link to="/bible-ai">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl">
                        Continue in Full AI Chat
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isQuickChatLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Getting insights...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard; 