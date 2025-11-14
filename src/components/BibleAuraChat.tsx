import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase, hasSupabaseCredentials } from '@/integrations/supabase/client';
import { sendBibleAuraMessage } from '@/lib/agent-sdk';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Sparkles,
  BookOpen,
  Brain,
  Search,
  Heart,
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
import { Link } from 'react-router-dom';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: string;
  sources?: Array<{
    id: string;
    filename: string;
    score: number;
  }>;
  crossReferences?: string[];
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

// Chat modes configuration
const CHAT_MODES = {
  'chat-clean': { name: 'AI Chat', icon: MessageCircle, description: 'General Bible chat and guidance' },
  'verse-clean': { name: 'Verse Analysis', icon: BookOpen, description: 'Deep verse analysis' },
  'parable-clean': { name: 'Parable Study', icon: Heart, description: 'Understanding parables' },
  'character-clean': { name: 'Character Study', icon: Search, description: 'Biblical characters' },
  'topical-clean': { name: 'Topical Study', icon: Sparkles, description: 'Topic-based study' },
  'qa-clean': { name: 'Quick Q&A', icon: Brain, description: 'Fast answers' }
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

  // Auto-save conversation when messages change (debounced)
  useEffect(() => {
    if (user && messages.length > 0) {
      const saveTimer = setTimeout(async () => {
        try {
          await saveCurrentConversation();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 3000); // Increased delay to 3 seconds
      
      return () => clearTimeout(saveTimer);
    }
  }, [messages, user]);

  const loadConversations = async () => {
    if (!user) return;
    
    // Check if Supabase is properly configured
    if (!hasSupabaseCredentials) {
      console.warn('⚠️ Supabase credentials not configured - chat history unavailable');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20); // Limit to recent 20 conversations
      
      if (error) {
        console.error('Load conversations error:', error);
        // Check if table doesn't exist
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.error('❌ ai_conversations table does not exist. Please run database migration.');
        }
        return; // Fail silently
      }
      setConversations(data || []);
    } catch (error: any) {
      console.error('Load conversations error:', error);
      // Removed toast - fail silently
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
        translation: 'KJV',
        updated_at: new Date().toISOString()
      };

      if (currentConversationId) {
        // Update existing conversation silently
        const { error } = await supabase
          .from('ai_conversations')
          .update(conversationData)
          .eq('id', currentConversationId);
        
        if (error) {
          console.error('Save error:', error);
          return; // Fail silently, don't show toast
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
          console.error('Save error:', error);
          return; // Fail silently
        }
        setCurrentConversationId(data.id);
      }
      
      // Load conversations in background without blocking UI
      loadConversations().catch(err => console.error('Background load error:', err));
    } catch (error: any) {
      console.error('Save conversation error:', error);
      // Removed toast - fail silently
    }
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
    setMessages(JSON.parse(conversation.messages as any) || []);
    setCurrentMode(conversation.mode as ChatMode);
    setCurrentLanguage(conversation.language as Language);
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
        description: "Please sign in to chat with AI",
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
      const aiResponse = await sendBibleAuraMessage(userInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date().toISOString(),
        mode: aiResponse.mode || currentMode,
        sources: aiResponse.sources,
        crossReferences: aiResponse.crossReferences
      };

      setMessages([...newMessages, aiMessage]);
      
    } catch (error: any) {
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
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

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={createNewConversation}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversationId === conversation.id
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-50'
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
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Mobile Chat History */}
      {showMobileHistory && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileHistory(false)}>
          <div className="w-80 h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium">History</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileHistory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      loadConversation(conversation);
                      setShowMobileHistory(false);
                    }}
                  >
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
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
        {/* Header - Desktop Only */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-500 text-2xl drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">✦</span>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Bible Aura AI</h1>
                <p className="text-xs text-gray-600">Your Biblical Study Assistant</p>
              </div>
            </div>
            
            <Button
              onClick={createNewConversation}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-sm shadow-lg"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block mb-6">
                  <span className="text-6xl text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]">✦</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  I'm Bible Aura AI, How can I assist you from the Bible?
                </h2>
                <p className="text-sm text-gray-600 mb-8">
                  Ask me anything about Scripture and I'll provide biblical insights
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                        <span className="text-white text-lg font-bold drop-shadow-lg">✦</span>
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                    {message.role === 'assistant' ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        
                        {/* Sources and Cross-References */}
                        {(message.sources && message.sources.length > 0) || (message.crossReferences && message.crossReferences.length > 0) ? (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {/* Cross-References */}
                            {message.crossReferences && message.crossReferences.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs font-semibold text-gray-700">Cross-References</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {message.crossReferences.map((ref, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                      {ref}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Search className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs font-semibold text-gray-700">Sources</span>
                                </div>
                                <div className="space-y-1">
                                  {message.sources.slice(0, 5).map((source, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                                      <span className="truncate flex-1">{source.filename}</span>
                                      <span className="text-gray-400 ml-2">{(source.score * 100).toFixed(0)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-4 shadow-lg">
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1 px-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <motion.span
                      className="text-white text-lg font-bold drop-shadow-lg"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      ✦
                    </motion.span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-orange-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-orange-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-orange-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMobileHistory(true);
                }}
                className="lg:hidden flex-shrink-0 h-9 px-2"
              >
                <History className="h-4 w-4" />
              </Button>
              
              <Select value={currentMode} onValueChange={(value) => setCurrentMode(value as ChatMode)}>
                <SelectTrigger className="w-40 h-9 text-xs">
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
                <SelectTrigger className="w-28 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
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
                placeholder="Ask a follow-up question"
                className="pr-12 min-h-[52px] max-h-32 resize-none border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 rounded-xl text-sm shadow-[0_0_25px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                disabled={isLoading}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            {/* Terms */}
            <p className="text-[10px] text-gray-500 text-center mt-3">
              By using Bible Aura you agree with our <Link to="/terms" className="underline hover:text-orange-500">terms of use</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
