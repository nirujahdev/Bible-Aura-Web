import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AI_RESPONSE_TEMPLATES, generateSystemPrompt } from '@/lib/ai-response-templates';
import { subscriptionService } from '@/lib/subscription-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Plus, 
  Settings, 
  Trash2, 
  Send, 
  Loader2, 
  Brain,
  Sparkles,
  BookOpen,
  Heart,
  Search,
  Volume2,
  ChevronDown,
  ChevronUp,
  Mic
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: Message[];
  mode: string;
  language: string;
  translation: string;
  created_at: string;
  updated_at: string;
}

type ChatMode = 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa' | 'enhanced-chat';
type Language = 'english' | 'tamil';
type TranslationCode = 'KJV' | 'NIV' | 'ESV' | 'NLT' | 'NASB' | 'NKJV';

// AI thinking states
type AIState = 'idle' | 'thinking' | 'generating' | 'analyzing' | 'responding';

// Chat modes configuration
const CHAT_MODES = {
  'chat': { name: 'AI Chat', icon: MessageCircle, color: 'bg-orange-500', description: 'General Bible chat and guidance' },
  'verse': { name: 'Verse Analysis', icon: BookOpen, color: 'bg-blue-500', description: 'Deep verse analysis and interpretation' },
  'parable': { name: 'Parable Study', icon: Heart, color: 'bg-green-500', description: 'Understanding parables and stories' },
  'character': { name: 'Character Study', icon: Search, color: 'bg-purple-500', description: 'Biblical character profiles' },
  'topical': { name: 'Topical Study', icon: Sparkles, color: 'bg-pink-500', description: 'Topic-based Bible study' },
  'qa': { name: 'Quick Q&A', icon: Brain, color: 'bg-indigo-500', description: 'Fast answers with scripture' },
  'enhanced-chat': { name: 'Enhanced Chat', icon: Sparkles, color: 'bg-amber-500', description: 'Advanced conversational AI' }
};

const TRANSLATIONS = [
  { code: 'KJV', name: 'King James Version' },
  { code: 'NIV', name: 'New International Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
  { code: 'NKJV', name: 'New King James Version' }
];

// DeepSeek AI integration with enhanced speed optimization
const callBiblicalAI = async (
  messages: Array<{role: string, content: string}>,
  mode: ChatMode = 'chat',
  language: Language = 'english',
  translation: TranslationCode = 'KJV',
  cleanMode: boolean = false,
  abortController?: AbortController
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey.includes('your_')) {
      throw new Error('🔑 DeepSeek API key not configured! Please:\n1. Go to https://platform.deepseek.com/\n2. Create an API key\n3. Add it to your .env.local file\n4. Restart the dev server');
    }

    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced to 15 seconds for faster responses

    // Get system prompt from templates - optimized for speed
    const systemPrompt = generateSystemPrompt(mode as keyof typeof AI_RESPONSE_TEMPLATES) + `

LANGUAGE: Respond in ${language === 'tamil' ? 'Tamil using Tamil script' : 'English'}.
TRANSLATION: Reference ${translation} Bible translation when citing verses.
CLEAN MODE: ${cleanMode ? 'Keep responses concise and focused.' : 'Provide detailed explanations when helpful.'}
BIBLE FOCUS: Always maintain biblical accuracy and provide scripture references when relevant.

SPEED OPTIMIZATION:
- Prioritize fast, direct answers
- Use concise language and structure
- Avoid unnecessary elaboration
- Focus on essential biblical truth

CRITICAL FORMATTING RULES:
- Start responses with the orange ✦ icon (no background shapes)
- Use clear section headers with ↗ for structure
- Use • for bullet points
- Maintain spiritual tone appropriate for Bible study
- End with encouragement or reflection question when appropriate`;

    // Optimized token limits for faster responses
    const getMaxTokens = (mode: ChatMode): number => {
      switch (mode) {
        case 'chat': return 400; // Reduced from 800
        case 'qa': return 500; // Reduced from 800
        case 'verse': return 800; // Reduced from 1500
        case 'parable': return 600; // Reduced from 1500
        case 'character': return 700; // Reduced from 1500
        case 'topical': return 800; // Reduced from 1500
        default: return 400;
      }
    };

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: getMaxTokens(mode),
      temperature: 0.2, // Lower temperature for faster, more focused responses
      top_p: 0.8, // Reduced for more focused responses
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false
    };

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API Error:', errorText);
      
      if (response.status === 401) {
        throw new Error('🔐 AI service authentication failed. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('⏳ Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('🔧 AI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`❌ AI service error (${response.status}). Please try again.`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('❌ Invalid response from AI service. Please try again.');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('AI Call Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('⏰ Request timed out. Please try again.');
    }
    throw error;
  }
};

// AI Thinking Animation Component
const AIThinkingAnimation: React.FC<{ state: AIState }> = ({ state }) => {
  const states = {
    thinking: { icon: Brain, text: 'AI is thinking...', color: 'text-orange-500' },
    generating: { icon: Sparkles, text: 'Generating response...', color: 'text-blue-500' },
    analyzing: { icon: Search, text: 'Analyzing scripture...', color: 'text-green-500' },
    responding: { icon: MessageCircle, text: 'Crafting response...', color: 'text-purple-500' }
  };

  if (state === 'idle') return null;

  const currentState = states[state];
  const Icon = currentState.icon;

  return (
    <motion.div 
      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Icon className={`h-5 w-5 ${currentState.color}`} />
      </motion.div>
      <span className="text-sm font-medium text-gray-700">{currentState.text}</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-orange-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Message Component with enhanced styling
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">✦</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Bible Aura AI</span>
          </div>
        )}
        <div
          className={`rounded-xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white ml-auto'
              : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <div key={i} className={isUser ? 'text-white' : ''}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

const EnhancedAIChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [aiState, setAiState] = useState<AIState>('idle');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Settings state
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');
  const [currentTranslation, setCurrentTranslation] = useState<TranslationCode>('KJV');
  const [cleanMode, setCleanMode] = useState(false);
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && !currentConversationId) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `✦ **Welcome to Bible Aura AI**

I'm here to help you explore God's Word with deep insights, thoughtful analysis, and spiritual guidance. 

**Choose a mode to get started:**
• **AI Chat** - General Bible questions and spiritual guidance
• **Verse Analysis** - Deep examination of specific verses  
• **Parable Study** - Understanding Jesus' parables
• **Character Study** - Biblical character profiles
• **Topical Study** - Theme-based Bible exploration
• **Quick Q&A** - Fast answers with scripture support

Ask me anything about the Bible, and I'll provide thoughtful, scripture-based responses! 🙏`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentConversationId, messages.length]);

  const saveConversation = async (messages: Message[]) => {
    if (!user || messages.length === 0) return;

    try {
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 50) + '...' || 'New Chat';
      
      if (currentConversationId) {
        await supabase
          .from('ai_conversations')
          .update({
            title,
            messages,
            mode: currentMode,
            language: currentLanguage,
            translation: currentTranslation,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);
      } else {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title,
            messages,
            mode: currentMode,
            language: currentLanguage,
            translation: currentTranslation,
          })
          .select()
          .single();

        if (error) throw error;
        setCurrentConversationId(data.id);
      }
      
      await loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }

      await loadConversations();
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
    setCurrentMode(conversation.mode as ChatMode);
    setCurrentLanguage(conversation.language as Language);
    setCurrentTranslation(conversation.translation as TranslationCode);
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setCurrentMode('chat');
    setCurrentLanguage('english');
    setCurrentTranslation('KJV');
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || !user || aiState !== 'idle') return;

    // Check subscription limits
    try {
      const canUseResult = await subscriptionService.canUseFeature(user.id, 'ai_chat');
      if (!canUseResult.canUse) {
        toast({
          title: "Usage Limit Reached",
          description: canUseResult.message,
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Subscription check failed:', error);
      toast({
        title: "Error",
        description: "Unable to verify usage limits. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Faster AI state progression for quicker responses
    setAiState('thinking');
    await new Promise(resolve => setTimeout(resolve, 300)); // Reduced from 800ms
    setAiState('analyzing');
    await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 600ms
    setAiState('generating');

    try {
      const conversationMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await callBiblicalAI(
        conversationMessages,
        currentMode,
        currentLanguage,
        currentTranslation,
        cleanMode,
        abortControllerRef.current
      );

      setAiState('responding');
      await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 500ms

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: currentMode
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveConversation(finalMessages);

      // Track usage for successful AI chat
      try {
        await subscriptionService.incrementUsage(user.id, 'ai_chat');
      } catch (usageError) {
        console.error('Failed to track usage:', usageError);
        // Don't show error to user, just log it
      }
    } catch (error: any) {
      console.error('AI Response Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **I apologize, but I encountered an error:** 

${error.message}

Please try again, and if the problem persists, check your internet connection or try a different question.`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiState('idle');
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
  return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <span className="text-4xl">✦</span>
          <p className="mt-2 text-gray-600">Please sign in to use AI Chat</p>
          </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Conversations Sidebar */}
      <AnimatePresence>
        {showConversations && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-r border-gray-200 flex flex-col shadow-lg"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <span className="text-xl">✦</span>
                  AI Conversations
                </h2>
          <Button 
            size="sm" 
                  variant="ghost"
                  onClick={createNewConversation}
                  className="text-white hover:bg-white/20"
          >
                  <Plus className="h-4 w-4" />
          </Button>
              </div>
            </div>
          
            {/* Conversations List */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        currentConversationId === conversation.id 
                          ? 'ring-2 ring-orange-500 bg-orange-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => loadConversation(conversation)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {conversation.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {CHAT_MODES[conversation.mode as ChatMode]?.name || conversation.mode}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(conversation.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <span className="sr-only">Options</span>
                                <span className="text-gray-400">⋯</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(conversation.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowConversations(!showConversations)}
                className="lg:hidden"
              >
                {showConversations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
                <div>
                <h1 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-orange-500 text-xl">✦</span>
                  Bible Aura AI Chat
                </h1>
                <p className="text-sm text-gray-500">
                  Current mode: <Badge variant="outline">{CHAT_MODES[currentMode].name}</Badge>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mode Selector */}
              <Select value={currentMode} onValueChange={(value: ChatMode) => setCurrentMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHAT_MODES).map(([mode, config]) => {
                    const Icon = config.icon;
                        return (
                      <SelectItem key={mode} value={mode}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.name}
                        </div>
                      </SelectItem>
                        );
                      })}
                </SelectContent>
              </Select>

              {/* Settings */}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-orange-500">✦</span>
                      AI Chat Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Language</label>
                      <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
                        <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="tamil">Tamil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bible Translation</label>
                    <Select value={currentTranslation} onValueChange={(value: TranslationCode) => setCurrentTranslation(value)}>
                        <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          {TRANSLATIONS.map(translation => (
                          <SelectItem key={translation.code} value={translation.code}>
                            {translation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cleanMode"
                        checked={cleanMode}
                        onChange={(e) => setCleanMode(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="cleanMode" className="text-sm">Clean Mode (concise responses)</label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
                </div>
        </div>
      </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
                  
            <AnimatePresence>
              {aiState !== 'idle' && (
                <AIThinkingAnimation state={aiState} />
            )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
            </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
          <div className="flex-1">
              <Textarea
                  ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the Bible..."
                  className="resize-none border-2 border-gray-200 focus:border-orange-500 rounded-xl"
                  rows={3}
                  disabled={aiState !== 'idle'}
                />
            </div>
          <Button
            onClick={() => handleSendMessage()}
                disabled={!input.trim() || aiState !== 'idle'}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl px-6 py-3 h-auto"
          >
                {aiState !== 'idle' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                  <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line • <span className="text-orange-500">✦</span> Powered by Bible Aura AI
            </p>
            </div>
            </div>
      </div>
    </div>
  );
};

export default EnhancedAIChat; 