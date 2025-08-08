import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AI_RESPONSE_TEMPLATES, generateSystemPrompt } from '@/lib/ai-response-templates';
import { StructuredAIResponse } from './StructuredAIResponse';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Loader2, 
  Sparkles,
  BookOpen,
  Brain,
  Search,
  Heart,
  Volume2,
  User,
  History,
  Trash2,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
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

// Chat modes configuration
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

// DeepSeek AI integration
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

export function BibleAuraChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings state
  const [currentMode, setCurrentMode] = useState<ChatMode>('verse-clean');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');
  const [currentTranslation, setCurrentTranslation] = useState<TranslationCode>('KJV');
  
  // Chat history state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  
  // UI refs
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
      // Auto-save after a short delay to allow UI to update
      const saveTimer = setTimeout(() => {
        saveCurrentConversation();
      }, 500);
      
      return () => clearTimeout(saveTimer);
    }
  }, [messages.length, user]);

  // Save when conversation settings change
  useEffect(() => {
    if (user && currentConversationId && messages.length > 0) {
      saveCurrentConversation();
    }
  }, [currentMode, currentLanguage, currentTranslation]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }
      
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error loading chat history",
        description: "Failed to load your previous conversations.",
        variant: "destructive",
      });
    }
  };

  const saveCurrentConversation = async () => {
    if (!user || messages.length === 0) return;
    
    try {
      const title = messages[0]?.content.slice(0, 50) + '...' || 'New Conversation';
      
      const conversationData = {
        user_id: user.id,
        title,
        messages: JSON.stringify(messages),
        mode: currentMode,
        language: currentLanguage,
        translation: currentTranslation,
        updated_at: new Date().toISOString()
      };

      if (currentConversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from('ai_conversations')
          .update(conversationData)
          .eq('id', currentConversationId);
        
        if (error) {
          console.error('Error updating conversation:', error);
          throw error;
        }
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({
            ...conversationData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
        
        setCurrentConversationId(data.id);
      }
      
      // Reload conversations to update the list
      await loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
      // Don't show toast for auto-save errors to avoid spam
    }
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(JSON.parse(conversation.messages as any) || []);
    setCurrentMode(conversation.mode as ChatMode);
    setCurrentLanguage(conversation.language as Language);
    setCurrentTranslation(conversation.translation as TranslationCode);
  };

  const createNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInput('');
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
      
      if (currentConversationId === conversationId) {
        createNewConversation();
      }
      
      await loadConversations();
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your history.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with AI about the Bible",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const userInput = input.trim();
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString(),
      mode: currentMode
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const aiResponse = await callDeepSeekAPI(newMessages, currentMode);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: currentMode
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      
    } catch (error: any) {
      console.error('AI Response Error:', error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
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

  const getSuggestedQuestions = () => {
    const suggestions = {
      'verse-clean': [
        "What does Romans 8:28 mean?",
        "Explain the Good Samaritan parable",
        "What are the fruits of the Spirit?",
        "How to strengthen faith in trials?"
      ],
      'chat-clean': [
        "How do I pray effectively?", 
        "What does the Bible say about forgiveness?",
        "How can I grow spiritually?",
        "What is God's will for my life?"
      ],
      'character-clean': [
        "Tell me about King David",
        "What can we learn from Moses?",
        "How did Paul change after conversion?",
        "What made Daniel so faithful?"
      ]
    };
    
    return suggestions[currentMode] || suggestions['verse-clean'];
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              <h2 className="font-medium text-gray-800">Chat History</h2>
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
        
        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
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
      </div>

      {/* Mobile Chat History Overlay */}
      {showMobileHistory && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileHistory(false)}>
          <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-600" />
                  <h2 className="font-medium text-gray-800">Chat History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileHistory(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Mobile Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conversation.id
                        ? 'bg-orange-100 border border-orange-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      loadConversation(conversation);
                      setShowMobileHistory(false);
                    }}
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
            
            {/* Mobile New Chat Button */}
            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  createNewConversation();
                  setShowMobileHistory(false);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Chat History Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileHistory(!showMobileHistory)}
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                <History className="h-5 w-5" />
              </Button>
              
              <span className="text-orange-500 text-xl">✦</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bible Aura AI</h1>
                <p className="text-sm text-gray-600">Your Biblical Study Assistant</p>
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

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <div className="text-orange-500 mb-4">
                  <Sparkles className="h-12 lg:h-16 w-12 lg:w-16 mx-auto" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">
                  Hello Benaiah!
                </h2>
                <p className="text-gray-600 mb-6 lg:mb-8">
                  How can I assist you with your biblical studies today?
                </p>
                
                {/* Suggested Questions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl mx-auto">
                  {getSuggestedQuestions().map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-4 hover:bg-orange-50 border-orange-200 whitespace-normal break-words min-h-[60px] flex items-center justify-start"
                      onClick={() => {
                        // Directly send the suggested question
                        if (!isLoading && question.trim()) {
                          setInput(question);
                          setTimeout(() => {
                            handleSendMessage();
                          }, 10);
                        }
                      }}
                    >
                      <span className="text-sm leading-relaxed">{question}</span>
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
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">✦</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                    {message.role === 'assistant' ? (
                      <StructuredAIResponse 
                        content={message.content}
                        verseReference={message.mode === 'verse-clean' ? 'John 3:16' : undefined}
                      />
                    ) : (
                      <div className="bg-orange-500 text-white p-4 rounded-lg">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">✦</span>
                  </div>
                </div>
                <div className="bg-white border border-orange-200 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-3 text-sm overflow-x-auto">
              <Select value={currentMode} onValueChange={(value) => setCurrentMode(value as ChatMode)}>
                <SelectTrigger className="w-32 lg:w-40 h-8 text-xs flex-shrink-0">
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

              <Select value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as Language)}>
                <SelectTrigger className="w-20 lg:w-24 h-8 text-xs flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentTranslation} onValueChange={(value) => setCurrentTranslation(value as TranslationCode)}>
                <SelectTrigger className="w-16 lg:w-20 h-8 text-xs flex-shrink-0">
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
            </div>

            {/* Message Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about the Bible... (${CHAT_MODES[currentMode]?.name})`}
                className="pr-14 min-h-[60px] max-h-32 resize-none border-orange-200 focus:border-orange-400"
                disabled={isLoading}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute bottom-2 right-2 h-8 bg-orange-500 hover:bg-orange-600 text-white px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 