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
  Plus, Book, Zap, Users, Trophy, ArrowRight, Send, Bot,
  Menu, Settings, LogOut, Headphones, FileText, Edit, History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
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
            content: "You are Bible Aura AI, a specialized biblical assistant. Follow these formatting guidelines strictly:\n\n1. Format ALL responses in clean, simple text using Montserrat Medium Bold font weight\n2. Structure responses in numbered points format\n3. NO markdown symbols (#, *, etc.) - use plain text only\n4. ALWAYS quote the relevant Bible verse at the beginning or end of your response\n5. Use this structure for verse explanations:\n\n1. [Quote the Bible verse with reference]\n2. [Historical context in simple points]\n3. [Theological meaning in simple points]\n4. [Practical application in simple points]\n\nFor general biblical questions:\n1. [Always include a relevant Bible verse quote]\n2. [Answer in clear, numbered points]\n3. [Provide practical application]\n\nUse simple, accessible language. Keep responses concise and focused. Always maintain reverence for scripture."
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
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [hasLoadedInitialConversation, setHasLoadedInitialConversation] = useState(false);
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
    // Only load on first time login, preserve existing conversation afterwards
    if (!hasLoadedInitialConversation) {
      const savedMessages = localStorage.getItem(`chat_messages_${user?.id}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Error loading saved messages:', error);
          setMessages([]);
        }
      }
      setHasLoadedInitialConversation(true);
    }
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    // Save to localStorage to persist conversation
    if (user?.id) {
      localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(updatedMessages));
    }
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
    // Clear saved conversation
    if (user?.id) {
      localStorage.removeItem(`chat_messages_${user.id}`);
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

  // Simply return the EnhancedAIChat component
  return <EnhancedAIChat />;
} 