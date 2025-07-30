import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  MessageCircle, BookOpen, PenTool, Sparkles, TrendingUp, 
  Star, Calendar, Target, Heart, Brain, Clock, ChevronRight,
  Plus, Book, Zap, Users, Trophy, ArrowRight, Send, Bot, User,
  Menu, Settings, LogOut, Headphones, FileText
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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

const quickStartPrompts = [
  {
    id: 1,
    title: "Start Your Daily Devotion",
    description: "Reflect on today's spiritual journey",
    icon: Heart,
    color: "bg-rose-500",
    action: "journal",
    prompt: "What did I learn about God today?"
  },
  {
    id: 2,
    title: "Ask Bible Questions",
    description: "Get AI insights on any Scripture",
    icon: Brain,
    color: "bg-purple-500",
    action: "chat",
    prompt: "Explain Romans 8:28 and how it applies to my life today"
  },
  {
    id: 3,
    title: "Prayer Journal",
    description: "Document your prayer requests",
    icon: BookOpen,
    color: "bg-blue-500",
    action: "journal",
    prompt: "Today I'm praying for..."
  },
  {
    id: 4,
    title: "Bible Study Insights",
    description: "Explore deeper biblical truths",
    icon: Sparkles,
    color: "bg-amber-500",
    action: "chat",
    prompt: "What are the key themes in the book of Philippians?"
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

// Direct DeepSeek API function
const callBiblicalAI = async (messages: Array<{role: 'user' | 'assistant', content: string}>, abortController?: AbortController) => {
  try {
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: "You are Bible Aura AI, a specialized biblical assistant. Format ALL responses as clean, simple text without any markdown symbols (*,#,etc). Structure responses for verses in this exact format:\n\nVerse:\n[Bible verse reference and text]\n\nHistorical Background:\n[Brief historical context in simple sentences]\n\nTheology:\n[Core theological points in simple language]\n\nExplanation:\n[Practical application in simple points]\n\nUse clean, simple language. No bullet points, no formatting symbols. Keep each section short and easy to understand."
          },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    return {
      content: data.choices[0].message.content,
      model: data.model || 'deepseek-chat'
    };

  } catch (error: any) {
    console.error('Biblical AI Error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error(`Connection failed: ${error.message}`);
  }
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    journalEntries: 0,
    chatConversations: 0,
    readingStreak: 0,
    weeklyGoal: 70
  });
  const [currentQuote, setCurrentQuote] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chat functionality
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
      loadConversationHistory();
      
      // Rotate inspirational quotes every 5 seconds
      const interval = setInterval(() => {
        setCurrentQuote(prev => (prev + 1) % inspirationalQuotes.length);
      }, 5000);
      
      // Check for any pre-filled prompt from sessionStorage
      const prompt = sessionStorage.getItem('chatPrompt');
      if (prompt) {
        setInput(prompt);
        sessionStorage.removeItem('chatPrompt');
        setShowChat(true);
      }

      return () => clearInterval(interval);
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Load journal entries count
      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Load chat conversations count
      const { count: chatCount } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      setStats(prev => ({
        ...prev,
        journalEntries: journalCount || 0,
        chatConversations: chatCount || 0,
        readingStreak: profile?.reading_streak || 0
      }));
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages as unknown as Message[]);
        if (data.messages.length > 0) {
          setShowChat(true);
        }
      }
    } catch (error) {
      console.log('No previous conversation found');
    }
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    if (!user || updatedMessages.length === 0) return;

    try {
      await supabase
        .from('ai_conversations')
        .upsert({
          user_id: user.id,
          messages: updatedMessages as any,
          title: updatedMessages[0]?.content.substring(0, 50) || 'Bible Chat',
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || !user) return;

    setShowChat(true);
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Keep only last 10 messages for context
      const conversationHistory = updatedMessages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const aiResponse = await callBiblicalAI(conversationHistory, abortControllerRef.current);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        model: aiResponse.model
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save to Supabase
      await saveConversation(finalMessages);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting right now. This could be due to network issues or service availability. Please try again in a moment.\n\n"Be still, and know that I am God" - Psalm 46:10`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Having trouble reaching the AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickStart = (prompt: typeof quickStartPrompts[0]) => {
    if (prompt.action === 'journal') {
      // Navigate to journal with pre-filled prompt
      const params = new URLSearchParams({
        template: prompt.id === 1 ? 'daily-reflection' : 'prayer',
        prompt: prompt.prompt
      });
      window.location.href = `/journal?${params.toString()}`;
    } else if (prompt.action === 'chat') {
      // Start chat with pre-filled message
      sendMessage(prompt.prompt);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowChat(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.display_name?.split(' ')[0] || 'Friend';
    
    if (hour < 12) return `Good morning, ${name}! 🌅`;
    if (hour < 17) return `Good afternoon, ${name}! ☀️`;
    return `Good evening, ${name}! 🌙`;
  };

  const getUserName = () => {
    return profile?.display_name?.split(' ')[0] || 'Friend';
  };

  // Mobile navigation items
  const navigationItems = [
    { name: 'Bible', href: '/bible', icon: BookOpen },
    { name: 'Songs', href: '/songs', icon: Sparkles },
    { name: 'Characters', href: '/bible-characters', icon: Users },
    { name: 'Study Hub', href: '/study-hub', icon: Book },
    { name: 'Sermons', href: '/sermons', icon: Headphones },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Journal', href: '/journal', icon: FileText },
  ];

  const MobileNavigation = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    return (
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="fixed top-4 left-4 z-50 h-12 w-12 p-0 bg-white/95 backdrop-blur-sm border-2 border-orange-500/20 shadow-lg hover:bg-orange-50 rounded-xl"
            >
              <div className="relative">
                <Menu className="h-5 w-5 text-gray-700" />
                <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-orange-500">✦</span>
              </div>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-[320px] p-0 bg-white">
            {/* Mobile Header */}
            <div className="p-6 bg-gradient-to-r from-orange-500 to-purple-600 text-white">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                  <span className="text-xl font-bold">✦</span>
                </div>
                <h1 className="text-xl font-bold">Bible Aura</h1>
                <p className="text-sm text-white/80 mt-1">AI Biblical Assistant</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all ${
                      location.pathname === item.href 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : ''
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${
                      location.pathname === item.href 
                        ? 'text-orange-500' 
                        : 'text-gray-600'
                    }`} />
                    <span className={`font-medium text-sm ${
                      location.pathname === item.href 
                        ? 'text-orange-500' 
                        : 'text-gray-700'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t bg-gray-50/50">
              {user && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-orange-500 text-white">
                        {getUserName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">
                        {getUserName()}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/profile">
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full text-red-600">
                      <LogOut className="h-4 w-4 mr-1" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  };

  const isMobile = useIsMobile();

  if (!showChat) {
    // Welcome screen with chat integration
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <MobileNavigation />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Mobile padding for menu button */}
          <div className="lg:hidden h-16"></div>
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 text-white mb-6 shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {getGreeting()}
            </h1>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto shadow-lg border border-orange-100">
              <p className="text-lg text-gray-700 mb-2">
                "{inspirationalQuotes[currentQuote].text}"
              </p>
              <p className="text-sm text-gray-500">
                — {inspirationalQuotes[currentQuote].reference}
              </p>
            </div>
          </div>

          {/* Stats Overview - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
            <Card className="text-center border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PenTool className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.journalEntries}</div>
                <div className="text-sm text-gray-600">Journal Entries</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.chatConversations}</div>
                <div className="text-sm text-gray-600">AI Chats</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.readingStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{Math.round((stats.journalEntries / 7) * 100)}%</div>
                <div className="text-sm text-gray-600">Weekly Goal</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start Actions - Mobile Responsive */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-900">
              Start Your Spiritual Journey Today
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {quickStartPrompts.map((prompt) => (
                <Card 
                  key={prompt.id}
                  className="group cursor-pointer border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                  onClick={() => handleQuickStart(prompt)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 ${prompt.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <prompt.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-gray-700">
                      {prompt.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {prompt.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.action === 'journal' ? 'Journal' : 'AI Chat'}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Chat Suggestion */}
          <div className="mb-8">
            <p className="text-gray-500 text-sm mb-4">Bible Aura suggestion</p>
            <div 
              className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 cursor-pointer hover:border-orange-300 transition-all group max-w-2xl mx-auto"
              onClick={() => handleSuggestionClick("Bible Aura, what does Romans 8:28 mean for my daily life?")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-black group-hover:text-orange-600 transition-colors">
                    Bible Aura, what does Romans 8:28 mean for my daily life?
                  </span>
                </div>
                <Button 
                  size="sm" 
                  className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300"
                >
                  Ask
                </Button>
              </div>
            </div>
          </div>

          {/* Input Area for Quick Chat - Mobile Responsive */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isMobile ? "Ask about any Bible verse..." : "Ask me about any Bible verse or spiritual question..."}
                  className="flex-1 border-0 text-base md:text-lg focus:ring-0 shadow-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size={isMobile ? "default" : "lg"}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 md:px-8"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-12">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Explore More Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" size="lg" className="h-auto p-4 flex-col bg-white hover:bg-blue-50 border-blue-200">
                  <Link to="/bible">
                    <BookOpen className="h-8 w-8 mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Bible Study</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-auto p-4 flex-col bg-white hover:bg-green-50 border-green-200">
                  <Link to="/study-hub">
                    <Book className="h-8 w-8 mb-2 text-green-600" />
                    <span className="text-sm font-medium">Study Hub</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-auto p-4 flex-col bg-white hover:bg-purple-50 border-purple-200">
                  <Link to="/favorites">
                    <Star className="h-8 w-8 mb-2 text-purple-600" />
                    <span className="text-sm font-medium">Favorites</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-auto p-4 flex-col bg-white hover:bg-orange-50 border-orange-200">
                  <Link to="/profile">
                    <Users className="h-8 w-8 mb-2 text-orange-600" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <MobileNavigation />
      
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        {/* Mobile padding for menu button */}
        <div className="lg:hidden h-16"></div>
        {/* Chat Header - Mobile Responsive */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bible Aura AI</h1>
              <p className="text-sm md:text-base text-gray-600 hidden sm:block">Your Biblical Assistant</p>
            </div>
          </div>
          <Button
            onClick={startNewConversation}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="bg-white hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Chat Messages - Mobile Responsive */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm mb-4 md:mb-6">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-[400px] md:h-[500px] p-4 md:p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={message.role === 'user' ? 'bg-orange-500 text-white' : 'bg-purple-500 text-white'}>
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500 text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Input - Mobile Responsive */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isMobile ? "Ask about Bible verses..." : "Ask me about any Bible verse or spiritual question..."}
                className="flex-1 border-0 text-base md:text-lg focus:ring-0 shadow-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size={isMobile ? "default" : "lg"}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 md:px-8"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 