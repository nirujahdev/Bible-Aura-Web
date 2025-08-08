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

// DeepSeek AI integration with enhanced speed optimization
const callDeepSeekAPI = async (messages: Message[], mode: ChatMode = 'chat-clean') => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY || 'sk-c253b7693e9f49f5830d936b9c92d446';
  
  const systemPrompt = generateSystemPrompt(mode);
  
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to AI service');
  }
};

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
    } catch (error) {
      console.error('Error saving conversation:', error);
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
    
    // Check subscription limits
    if (!user) return;
    
    const usageInfo = await subscriptionService.canUseFeature(user.id, 'ai_chat');
    if (!usageInfo.canUse) {
      toast({
        title: 'Upgrade Required',
        description: 'You have reached your AI chat limit. Please upgrade your plan.',
        variant: 'destructive'
      });
      return;
    }

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
      const response = await callDeepSeekAPI([...messages, userMessage], currentMode);
      
      clearInterval(stateInterval);
      setAiState('idle');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        mode: currentMode
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Increment usage after successful response
      await subscriptionService.incrementUsage(user.id, 'ai_chat');
      
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
                  <h1 className="text-xl font-bold text-gray-800">Bible Aura AI Chat</h1>
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
                  Welcome to Bible Aura AI
                </h2>
                <p className="text-gray-600 mb-6">
                  Your Biblical Study Assistant
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
                        <span className="text-sm font-medium text-gray-600">Bible Aura AI</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
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
              <span className="text-orange-500">✦ Powered by Bible Aura AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 