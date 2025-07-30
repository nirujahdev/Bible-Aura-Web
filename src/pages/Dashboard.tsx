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
  Menu, Settings, LogOut, Headphones, FileText, Edit, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
      loadConversationHistory();
      loadConversations();
      
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
    // Always start with a fresh conversation - no history loaded
    setMessages([]);
    setCurrentConversationId(null);
  };

  const loadConversations = async () => {
    // Always start with no saved conversations - fresh start
    setConversations([]);
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    // Conversation saving disabled - always start fresh
    return;
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || !user) return;

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
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user?.id)
        .single();

      if (data && data.messages) {
        setMessages(data.messages as unknown as Message[]);
        setCurrentConversationId(conversationId);
        setShowConversations(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
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

  const isMobile = useIsMobile();

  // Single unified page for chat - everything happens here
  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Conversations Sidebar - Mobile responsive */}
      {showConversations && (
        <>
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowConversations(false)}
          />
          
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:w-80 lg:relative lg:z-auto bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Saved Conversations</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowConversations(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-3 bg-white rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => loadConversation(conv.id)}
                >
                  <h4 className="font-medium text-sm text-gray-900 truncate">{conv.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 truncate">{conv.preview}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No saved conversations yet</p>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-8 max-w-4xl mx-auto relative">
        {/* Top Action Bar - Mobile responsive */}
        <div className="flex justify-end gap-2 mb-4 lg:absolute lg:top-4 lg:right-4 lg:mb-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={startNewConversation}
            className="bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-xs sm:text-sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConversations(!showConversations)}
            className={`bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-xs sm:text-sm ${showConversations ? 'bg-gray-100' : ''}`}
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">History</span>
          </Button>
        </div>

        {/* Header - Always show when no messages - Mobile responsive */}
        {messages.length === 0 && (
          <>
            <div className="mb-6 lg:mb-8 pt-2 lg:pt-0">
              <h2 className="text-gray-500 text-base lg:text-lg mb-2">Hello {getUserName()}!</h2>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black">How can I assist you today?</h1>
            </div>

            {/* Updated Action Cards Grid - Already responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-12 lg:mb-16">
              {/* Read Bible Card */}
              <Card 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => window.location.href = '/bible'}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-blue-50 transition-colors">
                    <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <h3 className="text-black font-semibold mb-2 text-sm lg:text-base">Read Bible</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">Explore scripture with enhanced reading tools</p>
                </CardContent>
              </Card>

              {/* Write Sermon or Journal Card */}
              <Card 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => window.location.href = '/journal'}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-green-50 transition-colors">
                    <PenTool className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 group-hover:text-green-600" />
                  </div>
                  <h3 className="text-black font-semibold mb-2 text-sm lg:text-base">Write & Reflect</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">Start your spiritual journal</p>
                </CardContent>
              </Card>

              {/* Explore Songs Card */}
              <Card 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => window.location.href = '/songs'}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:bg-purple-50 transition-colors">
                    <Sparkles className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600 group-hover:text-purple-600" />
                  </div>
                  <h3 className="text-black font-semibold mb-2 text-sm lg:text-base">Worship Songs</h3>
                  <p className="text-gray-600 text-xs lg:text-sm">Find inspiration through music</p>
                </CardContent>
              </Card>
            </div>

            {/* Bible Aura Suggestion - Mobile responsive */}
            <div className="mb-6 lg:mb-8">
              <p className="text-gray-500 text-xs sm:text-sm mb-3 lg:mb-4">Ask anything about Bible</p>
              <div 
                className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-3 lg:p-4 cursor-pointer hover:border-orange-300 transition-all group"
                onClick={() => handleSuggestionClick("Bible Aura, what does Romans 8:28 mean for my daily life?")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs lg:text-sm">✦</span>
                    </div>
                    <span className="text-black group-hover:text-orange-600 transition-colors text-xs sm:text-sm lg:text-base truncate">
                      Bible Aura, what does Romans 8:28 mean for my daily life?
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300 text-xs lg:text-sm flex-shrink-0"
                  >
                    Ask
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chat Messages - Show when messages exist - Mobile responsive */}
        {messages.length > 0 && (
          <div className="mb-24 lg:mb-32">
            <div className="space-y-3 lg:space-y-4 max-h-[60vh] lg:max-h-96 overflow-y-auto" ref={scrollAreaRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-sm lg:max-w-md xl:max-w-lg px-3 lg:px-4 py-2 lg:py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-1 lg:mb-2">
                        <span className="text-orange-500 text-xs lg:text-sm">✦</span>
                        <span className="text-xs lg:text-sm text-gray-500 font-medium">Bible Aura AI</span>
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex items-center justify-end space-x-2 mb-1 lg:mb-2">
                        <User className="h-3 w-3 lg:h-4 lg:w-4 text-white/80" />
                        <span className="text-xs lg:text-sm text-white/80 font-medium">You</span>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm lg:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* AI Thinking indicator - Mobile responsive */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-3 lg:px-4 py-2 lg:py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500 text-xs lg:text-sm">✦</span>
                      <span className="text-gray-600 text-xs lg:text-sm">Bible Aura AI is thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Message Input at Bottom - Mobile responsive */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-100 rounded-2xl lg:rounded-3xl p-3 lg:p-4 flex items-center gap-2 lg:gap-3 shadow-lg">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <span className="text-orange-500 text-base lg:text-lg">✦</span>
              <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
            <Input 
              type="text" 
              placeholder="Message Bible Aura"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-0 text-black placeholder-gray-500 outline-none focus:ring-0 shadow-none text-sm lg:text-base"
              disabled={isLoading}
            />
            {messages.length > 0 && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={startNewConversation}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-600 rounded-xl lg:rounded-2xl p-2"
              >
                <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl lg:rounded-2xl p-2"
            >
              {isLoading ? (
                <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-3 w-3 lg:h-4 lg:w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );


} 