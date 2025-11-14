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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Sparkles,
  BookOpen,
  Brain,
  Search,
  Heart,
  User,
  History,
  Trash2,
  X,
  FileText,
  Link as LinkIcon,
  Plus,
  ThumbsUp,
  ThumbsDown
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
    url?: string;
    snippet?: string;
  }>;
  crossReferences?: string[];
  validatedVerses?: Array<{
    reference: string;
    verseText: string;
    book: string;
    chapter: number;
    verse: number;
  }>;
  feedback?: 'positive' | 'negative' | null;
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

// Generate related questions based on the conversation
function generateRelatedQuestions(lastResponse: string, allMessages: Message[]): string[] {
  const questions: string[] = [];
  const responseLower = lastResponse.toLowerCase();
  const userMessages = allMessages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
  const lastUserMessage = userMessages[userMessages.length - 1] || '';
  
  // Check for Jesus/Christ mentions
  if (responseLower.includes('jesus') || responseLower.includes('christ')) {
    questions.push('Historical evidence for Jesus outside the New Testament');
    questions.push('Key differences between the historical Jesus and theological claims');
    questions.push('Major non-Christian sources that mention Jesus and what they say');
  }
  
  // Check for Bible verses
  const verseMatch = lastResponse.match(/(\d*\s*[A-Za-z]+\s+\d+:\d+)/);
  if (verseMatch) {
    const verse = verseMatch[1];
    questions.push(`What is the historical context of ${verse}?`);
    questions.push(`How do scholars interpret ${verse}?`);
  }
  
  // Check for theological topics
  if (responseLower.includes('salvation') || responseLower.includes('saved')) {
    questions.push('What does the Bible say about how to be saved?');
    questions.push('What is the difference between grace and works in salvation?');
  }
  
  if (responseLower.includes('trinity') || responseLower.includes('god the father') || responseLower.includes('holy spirit')) {
    questions.push('What is the biblical basis for the Trinity?');
    questions.push('How do different Christian denominations understand the Trinity?');
  }
  
  if (responseLower.includes('parable')) {
    questions.push('What are the main themes in Jesus\' parables?');
    questions.push('How do parables relate to the Kingdom of God?');
  }
  
  if (responseLower.includes('character') || responseLower.includes('person')) {
    questions.push('What can we learn from biblical character studies?');
    questions.push('How do biblical characters demonstrate faith?');
  }
  
  // Generic follow-up questions
  if (questions.length < 5) {
    if (lastUserMessage.includes('who is')) {
      questions.push('What is the historical background of this person?');
      questions.push('What are the key events in this person\'s life?');
    } else if (lastUserMessage.includes('what is') || lastUserMessage.includes('what does')) {
      questions.push('How does this relate to other biblical teachings?');
      questions.push('What is the practical application of this?');
    } else if (lastUserMessage.includes('why')) {
      questions.push('What is the biblical context for this?');
      questions.push('How do scholars explain this?');
    } else {
      questions.push('What are the key biblical passages about this topic?');
      questions.push('How does this relate to the overall biblical narrative?');
    }
  }
  
  // Fill remaining slots with generic questions
  const genericQuestions = [
    'What are the key biblical passages about this topic?',
    'How do different Christian traditions interpret this?',
    'What is the historical context of this?',
    'How does this apply to modern life?',
    'What are the theological implications of this?'
  ];
  
  while (questions.length < 5) {
    const generic = genericQuestions[questions.length % genericQuestions.length];
    if (!questions.includes(generic)) {
      questions.push(generic);
    } else {
      break;
    }
  }
  
  return questions.slice(0, 5);
}

export function BibleAuraChat() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings state
  const [currentMode, setCurrentMode] = useState<ChatMode>('verse-clean');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('english');
  const [currentModel, setCurrentModel] = useState<'aura-1.0' | 'aura-1.0-thinking'>('aura-1.0');
  
  // Chat history state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  
  // UI refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount (with error handling)
  useEffect(() => {
    if (user && !authLoading) {
      try {
        loadConversations();
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    }
  }, [user, authLoading]);

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
        // Don't throw - just fail silently to prevent crashes
        return;
      }
      setConversations(data || []);
    } catch (error: any) {
      console.error('Load conversations error:', error);
      // Fail silently to prevent component crashes
      setConversations([]);
    }
  };

  const saveCurrentConversation = async () => {
    if (!user || messages.length === 0) return;
    
    // Check if Supabase is properly configured
    if (!hasSupabaseCredentials) {
      return; // Fail silently
    }
    
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

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with AI",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const userInput = textToSend.trim();
    if (!messageText) {
      setInput('');
    }

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
      // Map UI mode to API mode format
      const apiMode = currentMode.replace('-clean', '');
      const apiLanguage = currentLanguage === 'english' ? 'en' : 'ta';
      
      const aiResponse = await sendBibleAuraMessage(userInput, {
        mode: apiMode,
        language: apiLanguage,
        modelMode: currentModel
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date().toISOString(),
        mode: aiResponse.mode || currentMode,
        sources: aiResponse.sources,
        crossReferences: aiResponse.crossReferences,
        validatedVerses: (aiResponse as any).validatedVerses
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

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Update local state
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback } : m
      ));

      // Send feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback,
          message: message.content,
          response: message.content
        })
      });

      if (!response.ok) {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setShowMobileHistory(false)}>
          <div className="w-80 h-full bg-white/95 backdrop-blur-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-gray-700">History</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileHistory(false)} className="hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer border border-gray-100/50 transition-colors"
                    onClick={() => {
                      loadConversation(conversation);
                      setShowMobileHistory(false);
                    }}
                  >
                    <p className="text-sm font-medium truncate text-gray-700">{conversation.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  createNewConversation();
                  setShowMobileHistory(false);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
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
        <div className="hidden lg:block bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-500 text-2xl drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">✦</span>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Bible Aura AI</h1>
                <p className="text-xs text-gray-600">Your Biblical Study Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Model Selector */}
              <Select value={currentModel} onValueChange={(value) => setCurrentModel(value as 'aura-1.0' | 'aura-1.0-thinking')}>
                <SelectTrigger className="w-48 h-9 text-sm border-gray-200 bg-white hover:bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aura-1.0">
                    <div className="flex flex-col">
                      <span className="font-medium">Aura 1.0</span>
                      <span className="text-xs text-gray-500">Fast & Brief</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="aura-1.0-thinking">
                    <div className="flex flex-col">
                      <span className="font-medium">Aura 1.0 Thinking</span>
                      <span className="text-xs text-gray-500">Deep Analysis</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
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
        </div>

        {/* Mobile Header - Model Selector */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-2">
          <div className="flex items-center justify-center">
            <Select value={currentModel} onValueChange={(value) => setCurrentModel(value as 'aura-1.0' | 'aura-1.0-thinking')}>
              <SelectTrigger className="w-full max-w-xs h-9 text-sm border-gray-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aura-1.0">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Aura 1.0</span>
                    <span className="text-xs text-gray-500">Fast & Brief</span>
                  </div>
                </SelectItem>
                <SelectItem value="aura-1.0-thinking">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Aura 1.0 Thinking</span>
                    <span className="text-xs text-gray-500">Deep Analysis</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
                <p className="text-sm text-gray-600 mb-4">
                  Ask me anything about Scripture and I'll provide biblical insights
                </p>
                
                {/* Model Selector in Welcome Screen */}
                <div className="flex justify-center mt-6">
                  <Select value={currentModel} onValueChange={(value) => setCurrentModel(value as 'aura-1.0' | 'aura-1.0-thinking')}>
                    <SelectTrigger className="w-64 h-10 text-sm border-gray-200 bg-white hover:bg-gray-50 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aura-1.0">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Aura 1.0</span>
                          <span className="text-xs text-gray-500">Fast & Brief</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="aura-1.0-thinking">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Aura 1.0 Thinking</span>
                          <span className="text-xs text-gray-500">Deep Analysis</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      {message.role === 'assistant' ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                            {message.content.split('\n').map((line, idx) => {
                              // Check if line starts with ✦ (title marker)
                              if (line.trim().startsWith('✦')) {
                                const titleText = line.replace(/^✦\s*/, '').trim();
                                return (
                                  <div key={idx} className="mb-3 mt-3 first:mt-0">
                                    <strong className="text-gray-900 font-semibold text-base">{titleText}</strong>
                                  </div>
                                );
                              }
                              // Check if line starts with ↗ (section heading)
                              if (line.trim().startsWith('↗')) {
                                const headingText = line.replace(/^↗\s*/, '').trim();
                                return (
                                  <div key={idx} className="mt-2 mb-1">
                                    <strong className="text-gray-800 font-medium">{headingText}</strong>
                                  </div>
                                );
                              }
                              // Regular line
                              return <div key={idx} className="mb-1">{line || '\u00A0'}</div>;
                            })}
                          </div>
                          
                          {/* Sources and Cross-References with Tabs - Clean design */}
                          {(message.sources && message.sources.length > 0) || (message.crossReferences && message.crossReferences.length > 0) ? (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <Tabs defaultValue="sources" className="w-full">
                                <TabsList className="inline-flex h-auto p-0 bg-transparent gap-0 border-b border-gray-100">
                                  <TabsTrigger 
                                    value="sources" 
                                    className="text-sm font-medium text-gray-600 px-4 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                  >
                                    <span>Sources</span>
                                    {message.sources && message.sources.length > 0 && (
                                      <span className="ml-1.5 text-xs text-gray-500">({message.sources.length})</span>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="crossrefs" 
                                    className="text-sm font-medium text-gray-600 px-4 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                  >
                                    <span>Cross-Refs</span>
                                    {message.crossReferences && message.crossReferences.length > 0 && (
                                      <span className="ml-1.5 text-xs text-gray-500">({message.crossReferences.length})</span>
                                    )}
                                  </TabsTrigger>
                                  {message.validatedVerses && message.validatedVerses.length > 0 && (
                                    <TabsTrigger 
                                      value="verses" 
                                      className="text-sm font-medium text-gray-600 px-4 py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                    >
                                      <span>Verses</span>
                                      <span className="ml-1.5 text-xs text-gray-500">({message.validatedVerses.length})</span>
                                    </TabsTrigger>
                                  )}
                                </TabsList>
                                
                                <TabsContent value="sources" className="mt-3">
                              {message.sources && message.sources.length > 0 ? (
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
                                  ) : (
                                    <div className="text-xs text-gray-500 text-center py-4">No sources available</div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="crossrefs" className="mt-3">
                                  {message.crossReferences && message.crossReferences.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {message.crossReferences.map((ref, idx) => (
                                        <Badge 
                                          key={idx} 
                                          variant="outline" 
                                          className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 cursor-pointer transition-colors"
                                        >
                                          <LinkIcon className="h-3 w-3 mr-1" />
                                          {ref}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-500 text-center py-4">No cross-references available</div>
                                  )}
                                </TabsContent>
                                
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
                              </Tabs>
                            </div>
                          ) : null}
                          
                          {/* Feedback Buttons */}
                          {message.role === 'assistant' && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                              <span className="text-xs text-gray-500 mr-2">Was this helpful?</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`h-7 px-2 ${message.feedback === 'positive' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'}`}
                              >
                                <ThumbsUp className={`h-3.5 w-3.5 ${message.feedback === 'positive' ? 'fill-green-600' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`h-7 px-2 ${message.feedback === 'negative' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
                              >
                                <ThumbsDown className={`h-3.5 w-3.5 ${message.feedback === 'negative' ? 'fill-red-600' : ''}`} />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-4 shadow-sm">
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400 mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Related Questions - Show after assistant messages */}
                  {message.role === 'assistant' && index === messages.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 px-4"
                    >
                      <div className="max-w-2xl">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Related</div>
                        <div className="space-y-2">
                          {generateRelatedQuestions(message.content, messages).map((question, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInput(question);
                                handleSendMessage();
                              }}
                              className="w-full text-left flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-colors group"
                            >
                              <span className="text-gray-400 group-hover:text-orange-500">→</span>
                              <span>{question}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
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
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
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
        <div className="bg-transparent border-t border-gray-100 px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Message Input - All controls inside */}
            <div className="relative">
              <div className="relative bg-transparent rounded-2xl border border-gray-200/30 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-200 focus-within:border-gray-300/50 focus-within:shadow-lg">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {/* History Button (Mobile) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMobileHistory(true);
                    }}
                    className="lg:hidden flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-100/50"
                  >
                    <History className="h-4 w-4 text-gray-500" />
                  </Button>
                  
                  {/* Mode Selector */}
                  <Select value={currentMode} onValueChange={(value) => setCurrentMode(value as ChatMode)}>
                    <SelectTrigger className="w-36 h-8 text-xs border-0 bg-transparent hover:bg-gray-100/50 focus:ring-0 shadow-none">
                      <div className="flex items-center gap-1.5">
                        {React.createElement(CHAT_MODES[currentMode]?.icon, { className: "h-3 w-3" })}
                        <span className="truncate text-xs">{CHAT_MODES[currentMode]?.name}</span>
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
                    <SelectTrigger className="w-24 h-8 text-xs border-0 bg-transparent hover:bg-gray-100/50 focus:ring-0 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Text Input */}
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about bible"
                    className="flex-1 min-h-[24px] max-h-[200px] py-1.5 px-0 resize-none border-0 focus:ring-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-gray-400 outline-none"
                    disabled={isLoading}
                    rows={1}
                  />
                  
                  {/* Send Button */}
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
              
              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center mt-2">
                By using bible aura your are agree with our polices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
