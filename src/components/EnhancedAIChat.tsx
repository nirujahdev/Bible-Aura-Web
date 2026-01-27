import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase, hasSupabaseCredentials } from '@/integrations/supabase/client';
import { sendBibleAuraMessage } from '@/lib/agent-sdk';
// import { subscriptionService } from '@/lib/subscription-service'; // Removed subscription feature
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Mic,
  History,
  X
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
  sources?: Array<{
    id: string;
    filename: string;
    score: number;
    url?: string;
    snippet?: string;
    reference?: string;
    verseText?: string;
  }>;
  crossReferences?: string[];
  validatedVerses?: Array<{
    reference: string;
    verseText: string;
    book: string;
    chapter: number;
    verse: number;
  }>;
  followUpQuestions?: Array<{
    question: string;
    relevance: number;
  }>;
  validationStatus?: 'verified' | 'partial' | 'failed';
  thinking?: {
    reasoningSummary: string[];
    selectedSources: Array<{
      reference?: string;
      filename: string;
      score: number;
      url?: string;
    }>;
    confidence: 'high' | 'medium' | 'low';
  };
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

type ChatMode = 'chat-clean' | 'verse-clean' | 'parable-clean' | 'character-clean' | 'topical-clean' | 'qa-clean';
type Language = 'english' | 'tamil';
type TranslationCode = 'KJV' | 'NIV' | 'ESV' | 'NLT' | 'NASB' | 'NKJV';

// AI thinking states
type AIState = 'idle' | 'thinking' | 'generating' | 'analyzing' | 'responding';

// Chat modes configuration - Updated with clean formats
const CHAT_MODES = {
  'chat-clean': { name: 'AI Chat', icon: MessageCircle, color: 'bg-orange-500', description: 'General Bible chat and guidance' },
  'verse-clean': { name: 'Verse Analysis', icon: BookOpen, color: 'bg-blue-500', description: 'Deep verse analysis and interpretation' },
  'parable-clean': { name: 'Parable Study', icon: Heart, color: 'bg-green-500', description: 'Understanding parables and stories' },
  'character-clean': { name: 'Character Study', icon: Search, color: 'bg-purple-500', description: 'Biblical character profiles' },
  'topical-clean': { name: 'Topical Study', icon: Sparkles, color: 'bg-pink-500', description: 'Topic-based Bible study' },
  'qa-clean': { name: 'Quick Q&A', icon: Brain, color: 'bg-indigo-500', description: 'Fast answers with scripture' }
};

const TRANSLATIONS = [
  { code: 'KJV', name: 'King James Version' },
  { code: 'NIV', name: 'New International Version' },
  { code: 'ESV', name: 'English Standard Version' },
  { code: 'NLT', name: 'New Living Translation' },
  { code: 'NASB', name: 'New American Standard Bible' },
  { code: 'NKJV', name: 'New King James Version' }
];

// Map UI mode names to API mode names
function mapModeToAPI(mode: ChatMode): string {
  const modeMap: Record<ChatMode, string> = {
    'chat-clean': 'chat',
    'verse-clean': 'verse',
    'parable-clean': 'parable',
    'character-clean': 'character',
    'topical-clean': 'topical',
    'qa-clean': 'qa'
  };
  return modeMap[mode] || 'chat';
}

// Map UI language to API language
function mapLanguageToAPI(language: Language): string {
  return language === 'english' ? 'en' : 'ta';
}

export function EnhancedAIChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiState, setAiState] = useState<AIState>('idle');
  
  // Settings state
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat-clean');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');
  const [currentTranslation, setCurrentTranslation] = useState<TranslationCode>('KJV');
  
  // Chat history state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // UI state
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-save conversation when messages change
  useEffect(() => {
    if (user && messages.length > 0) {
      saveCurrentConversation();
    }
  }, [messages, user]);

  const loadConversations = async () => {
    if (!user) return;
    
    // Check if Supabase is properly configured
    if (!hasSupabaseCredentials) {
      console.warn('⚠️ Supabase credentials not configured - chat history unavailable');
      setConversations([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50); // Limit to prevent performance issues
      
      if (error) {
        console.error('Error loading conversations:', error);
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('❌ ai_conversations table does not exist. Please run database migration.');
          toast({
            title: "Chat History Unavailable",
            description: "Database table not found. Please contact support.",
            variant: "destructive",
          });
        } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          console.error('❌ Permission denied loading conversations');
          toast({
            title: "Permission Error",
            description: "Unable to load chat history. Please try again.",
            variant: "destructive",
          });
        }
        setConversations([]);
        return;
      }
      
      setConversations(data || []);
    } catch (error: any) {
      console.error('Exception loading conversations:', error);
      setConversations([]);
      // Don't show toast for network errors to avoid spam
      if (error?.message && !error.message.includes('network') && !error.message.includes('fetch')) {
        toast({
          title: "Error Loading History",
          description: "Unable to load chat history. Your conversations are still saved.",
          variant: "destructive",
        });
      }
    }
  };

  const saveCurrentConversation = async () => {
    if (!user || messages.length === 0) return;
    
    const title = messages[0]?.content.substring(0, 50) + (messages[0]?.content.length > 50 ? '...' : '');
    
    const conversationData = {
      user_id: user.id,
      title,
      messages,
      mode: currentMode,
      language: currentLanguage,
      translation: currentTranslation,
      updated_at: new Date().toISOString()
    };

    try {
      if (currentConversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from('ai_conversations')
          .update(conversationData)
          .eq('id', currentConversationId);
        
        if (error) throw error;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert([conversationData])
          .select()
          .single();
        
        if (error) throw error;
        
        setCurrentConversationId(data.id);
      }
      
      await loadConversations();
    } catch (error: any) {
      console.error('Error saving conversation:', error);
      // Don't show error toast for save failures - it's background operation
      // Only log for debugging
      if (error?.code === 'PGRST116' || error?.message?.includes('does not exist')) {
        console.error('❌ ai_conversations table does not exist. Please run database migration.');
      }
    }
  };

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setCurrentMode(conversation.mode as ChatMode);
    setCurrentLanguage(conversation.language as Language);
    setCurrentTranslation(conversation.translation as TranslationCode);
    setShowHistory(false);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
      
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
      
      await loadConversations();
      toast({ title: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({ title: 'Failed to delete conversation', variant: 'destructive' });
    }
  };

  const createNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Subscription check removed - all users have access
    if (!user) return;
    
    // const usageInfo = await subscriptionService.canUseFeature(user.id, 'ai_chat');
    // if (!usageInfo.canUse) {
    //   toast({
    //     title: 'Upgrade Required',
    //     description: 'You have reached your AI chat limit. Please upgrade your plan.',
    //     variant: 'destructive'
    //   });
    //   return;
    // }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      mode: currentMode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // AI thinking states
    const states: AIState[] = ['thinking', 'analyzing', 'generating', 'responding'];
    let stateIndex = 0;
    
    const stateInterval = setInterval(() => {
      setAiState(states[stateIndex]);
      stateIndex = (stateIndex + 1) % states.length;
    }, 800);

    try {
      // Build conversation history from current messages
      const conversationHistory = messages
        .slice(-5) // Last 5 messages for context
        .map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // Call the real API
      const apiMode = mapModeToAPI(currentMode);
      const apiLanguage = mapLanguageToAPI(currentLanguage);
      
      const response = await sendBibleAuraMessage(input.trim(), {
        mode: apiMode,
        language: apiLanguage,
        conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined
      });
      
      clearInterval(stateInterval);
      setAiState('idle');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        mode: currentMode,
        sources: response.sources,
        crossReferences: response.crossReferences,
        validatedVerses: response.validatedVerses,
        followUpQuestions: response.followUpQuestions,
        validationStatus: response.validationStatus,
        thinking: response.thinking
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      clearInterval(stateInterval);
      setAiState('idle');
      
      toast({
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        variant: 'destructive'
      });
      
      // Remove the user message if AI failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAIStateText = () => {
    const states = {
      idle: '',
      thinking: '✦ Thinking...',
      analyzing: '✦ Analyzing...',
      generating: '✦ Generating...',
      responding: '✦ Responding...'
    };
    return states[aiState];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-white border-r border-orange-200 shadow-lg"
          >
            <div className="p-4 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Chat History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={createNewConversation}
                className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? 'bg-orange-100 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {CHAT_MODES[conversation.mode as ChatMode]?.name || conversation.mode}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-orange-200 shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <History className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">✦</span>
                  <h1 className="text-xl font-bold text-gray-800">Bible Aura Chat</h1>
                </div>
              </div>
              
              <Button
                onClick={createNewConversation}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-orange-500 mb-4">
                  <BookOpen className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to Bible Aura
                </h2>
                <p className="text-gray-600 mb-6">
                  Bible AI Assistant
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {Object.entries(CHAT_MODES).map(([key, mode]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-2 hover:bg-orange-50"
                      onClick={() => setCurrentMode(key as ChatMode)}
                    >
                      {React.createElement(mode.icon, { className: "h-6 w-6 text-orange-500" })}
                      <span className="text-sm font-medium">{mode.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-orange-200 shadow-sm'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-orange-500">✦</span>
                        <span className="text-sm font-medium text-gray-600">Bible Aura</span>
                        {message.validationStatus && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] ${
                              message.validationStatus === 'verified' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : message.validationStatus === 'partial'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {message.validationStatus === 'verified' ? '✓ Verified' : message.validationStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Sources, Validated Verses, and Thinking Panels */}
                    {message.role === 'assistant' && 
                     ((message.sources && message.sources.length > 0) || 
                      (message.validatedVerses && message.validatedVerses.length > 0) || 
                      message.thinking) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Tabs defaultValue="sources" className="w-full">
                          <TabsList className="inline-flex h-auto p-0 bg-transparent gap-0 border-b border-gray-100">
                            {message.sources && message.sources.length > 0 && (
                              <TabsTrigger 
                                value="sources" 
                                className="text-xs font-medium text-gray-600 px-3 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                              >
                                <span>Sources</span>
                                <span className="ml-1 text-[10px] text-gray-500">({message.sources.length})</span>
                              </TabsTrigger>
                            )}
                            {message.validatedVerses && message.validatedVerses.length > 0 && (
                              <TabsTrigger 
                                value="verses" 
                                className="text-xs font-medium text-gray-600 px-3 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                              >
                                <span>Verses</span>
                                <span className="ml-1 text-[10px] text-gray-500">({message.validatedVerses.length})</span>
                              </TabsTrigger>
                            )}
                            {message.thinking && (
                              <TabsTrigger 
                                value="thinking" 
                                className="text-xs font-medium text-gray-600 px-3 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                              >
                                <span>Thinking</span>
                              </TabsTrigger>
                            )}
                          </TabsList>
                          
                          {message.sources && message.sources.length > 0 && (
                            <TabsContent value="sources" className="mt-3">
                              <div className="space-y-2">
                                {message.sources.map((source, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {source.url ? (
                                        <LinkIcon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                      ) : (
                                        <FileText className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                                      )}
                                      {source.url ? (
                                        <a 
                                          href={source.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="truncate text-blue-600 hover:underline"
                                        >
                                          {source.filename}
                                        </a>
                                      ) : (
                                        <span className="truncate">{source.filename}</span>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="ml-2 text-[10px] bg-white">
                                      {source.url ? 'Web' : `${(source.score * 100).toFixed(0)}%`}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          )}
                          
                          {message.validatedVerses && message.validatedVerses.length > 0 && (
                            <TabsContent value="verses" className="mt-3">
                              <div className="space-y-3">
                                {message.validatedVerses.map((verse, idx) => (
                                  <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-semibold text-blue-900">{verse.reference}</span>
                                      <Badge variant="outline" className="text-[10px] bg-white text-blue-700 border-blue-300">
                                        Validated
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{verse.verseText}</p>
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                          )}
                          
                          {message.thinking && (
                            <TabsContent value="thinking" className="mt-3">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600">Confidence:</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] ${
                                      message.thinking.confidence === 'high' 
                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                        : message.thinking.confidence === 'medium'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                  >
                                    {message.thinking.confidence.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                {message.thinking.reasoningSummary && message.thinking.reasoningSummary.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Reasoning:</h4>
                                    <ul className="space-y-1.5">
                                      {message.thinking.reasoningSummary.map((reason, idx) => (
                                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                          <span className="text-orange-500 mt-0.5">•</span>
                                          <span>{reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {message.thinking.selectedSources && message.thinking.selectedSources.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Selected Sources:</h4>
                                    <div className="space-y-1.5">
                                      {message.thinking.selectedSources.map((source, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1.5">
                                          <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FileText className="h-3 w-3 text-orange-500 flex-shrink-0" />
                                            <span className="truncate">{source.filename}</span>
                                            {source.reference && (
                                              <span className="text-gray-500 text-[10px]">({source.reference})</span>
                                            )}
                                          </div>
                                          <Badge variant="outline" className="ml-2 text-[10px] bg-white">
                                            {(source.score * 100).toFixed(0)}%
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          )}
                        </Tabs>
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-orange-200 shadow-sm">
          <div className="p-4 max-w-4xl mx-auto">
            {/* Controls Bar - All in one line */}
            <div className="flex items-center gap-2 mb-3 text-sm">
              {/* Mode Selector */}
              <Select value={currentMode} onValueChange={(value) => setCurrentMode(value as ChatMode)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <div className="flex items-center gap-2">
                    {React.createElement(CHAT_MODES[currentMode]?.icon, { className: "h-3 w-3" })}
                    <span className="truncate">{CHAT_MODES[currentMode]?.name}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHAT_MODES).map(([key, mode]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {React.createElement(mode.icon, { className: "h-3 w-3" })}
                        {mode.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Language Selector */}
              <Select value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as Language)}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">EN</SelectItem>
                  <SelectItem value="tamil">TA</SelectItem>
                </SelectContent>
              </Select>

              {/* Translation Selector */}
              <Select value={currentTranslation} onValueChange={(value) => setCurrentTranslation(value as TranslationCode)}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSLATIONS.map((translation) => (
                    <SelectItem key={translation.code} value={translation.code}>
                      {translation.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-4 w-px bg-gray-300" />

              {/* Action Buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={createNewConversation}
                className="h-8 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                className="h-8 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>

            {/* Message Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about the Bible... (${CHAT_MODES[currentMode]?.name})`}
                className="pr-32 min-h-[60px] max-h-32 resize-none border-orange-200 focus:border-orange-400"
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-20 h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Mic className="h-4 w-4 text-gray-500" />
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute bottom-2 right-2 h-8 bg-orange-500 hover:bg-orange-600 text-white px-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">{getAIStateText()}</span>
                  </div>
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send • Shift+Enter for new line</span>
              {aiState !== 'idle' && (
                <span className="text-orange-500">{getAIStateText()}</span>
              )}
              <span className="text-orange-500">✦ Powered by Bible Aura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 