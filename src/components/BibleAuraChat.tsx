import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase, hasSupabaseCredentials } from '@/integrations/supabase/client';
import { sendBibleAuraMessage } from '@/lib/agent-sdk';
import { checkAndIncrementUsage, getUsageInfo } from '@/lib/ai-limits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea as DialogTextarea } from '@/components/ui/textarea';
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
  ThumbsDown,
  Flag,
  Copy,
  Share2,
  Menu,
  MoreVertical,
  PenTool
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
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
  const [showMobileNavMenu, setShowMobileNavMenu] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  
  // UI refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Report dialog state
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Report categories
  const reportCategories = [
    { id: 'inaccurate', label: 'Inaccurate Information', icon: '⚠️' },
    { id: 'inappropriate', label: 'Inappropriate Content', icon: '🚫' },
    { id: 'offensive', label: 'Offensive Language', icon: '😞' },
    { id: 'spam', label: 'Spam or Misleading'},
    { id: 'other', label: 'Other Issue'},
    { id: 'technical', label: 'Technical Problem'}
  ];

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

    // Check AI message limit first (without incrementing)
    const usageInfo = await getUsageInfo(user.id, 'ai_message');
    
    if (usageInfo.limit_reached) {
      toast({
        title: "AI Message Limit Reached",
        description: `You've reached your daily limit of ${usageInfo.limit} AI messages. Please try again tomorrow.`,
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
        language: apiLanguage
      });
      
      // Only increment usage count AFTER successful API response
      const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
      if (!usageResult.allowed) {
        // This shouldn't happen since we checked first, but handle it gracefully
        console.warn('Usage limit reached after successful API call');
      }
      
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
          response: message.content,
          userId: user?.id || null
        })
      });

      if (!response.ok) {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleCopy = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const shareData = {
      title: 'Bible Aura AI Response',
      text: message.content,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
          toast({
            title: "Link copied!",
            description: "Share link copied to clipboard",
          });
        } catch (copyError) {
          console.error('Failed to copy:', copyError);
        }
      }
    }
  };

  const handleReport = (messageId: string) => {
    setReportingMessageId(messageId);
    setReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportingMessageId || !selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a report category",
        variant: "destructive",
      });
      return;
    }

    const message = messages.find(m => m.id === reportingMessageId);
    if (!message) return;

    const categoryLabel = reportCategories.find(c => c.id === selectedCategory)?.label || selectedCategory;
    const fullReportReason = reportReason.trim() 
      ? `${categoryLabel}: ${reportReason.trim()}`
      : categoryLabel;

    try {
      // Send report to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: reportingMessageId,
          feedback: 'negative',
          message: message.content,
          response: message.content,
          userId: user?.id || null,
          reportReason: fullReportReason,
          reportCategory: selectedCategory
        })
      });

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for your feedback. We'll review this content.",
        });
        setReportDialogOpen(false);
        setReportReason('');
        setSelectedCategory('');
        setReportingMessageId(null);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen h-dvh w-full bg-gradient-to-br from-gray-50 to-white overflow-hidden fixed inset-0 lg:relative lg:inset-auto lg:h-full">
      {/* Sidebar - Chat History */}
      <div className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col min-h-0 overflow-hidden">
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
            {/* Header - No duplicate, just close button */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="font-medium text-gray-700">Chat History</h2>
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
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full max-w-full pb-20 lg:pb-0">
        {/* Mobile Header - Hide when history or menus are open */}
        {!showMobileHistory && !showMobileNavMenu && !showMobileMoreMenu && (
          <div className="lg:hidden sticky top-0 bg-white border-b border-gray-200 z-40 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Left - Hamburger Menu (Navigation) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileNavMenu(true)}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </Button>
              
              {/* Center - Logo */}
              <div className="flex flex-col items-center justify-center leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500 text-xl font-semibold drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]">✦</span>
                  <span className="text-lg font-semibold text-gray-900">Bible Aura</span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-orange-500 font-medium">
                  Bible AI Assistance
                </span>
              </div>
              
              {/* Right - Three Dots Menu (Page Actions) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMoreMenu(true)}
                className="h-10 w-10 p-0 hover:bg-gray-100 rounded-lg"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        )}

        {/* Header - Desktop Only */}
        <div className="hidden lg:block bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
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


        {/* Messages Area - Scrollable */}
        <ScrollArea className="flex-1 min-h-0 overflow-auto px-0 sm:px-3 md:px-4 py-2 md:py-6 pb-20 sm:pb-2 lg:pb-2">
          <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-6 px-3 sm:px-0">
            {messages.length === 0 ? (
              <div className="text-center py-4 md:py-12 px-2 md:px-4 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="inline-block mb-3 md:mb-4">
                  <span className="text-2xl md:text-4xl text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">✦</span>
                </div>
                <h2 className="text-sm md:text-base font-bold text-gray-800 mb-2 md:mb-2 whitespace-nowrap">
                  How can I assist you from the Bible?
                </h2>
                <p className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                  Ask me anything about Scripture
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                  >
                    <div className={`${message.role === 'assistant' ? 'w-full' : 'w-full max-w-[90%]'} sm:max-w-[90%] md:max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      {message.role === 'assistant' ? (
                        <div className="bg-white border-0 sm:border border-gray-100 rounded-none sm:rounded-xl md:rounded-2xl p-3 sm:p-3 md:p-4 shadow-none sm:shadow-sm w-full">
                          <div className="prose max-w-none text-gray-700 leading-relaxed">
                            {message.content.split('\n').map((line, idx) => {
                              // Check if line starts with ✦ (title marker)
                              if (line.trim().startsWith('✦')) {
                                const titleText = line.replace(/^✦\s*/, '').trim();
                                return (
                                  <div key={idx} className="mb-2 md:mb-3 mt-2 md:mt-3 first:mt-0">
                                    <strong className="text-gray-900 font-semibold text-[15px] md:text-[15px]">{titleText}</strong>
                                  </div>
                                );
                              }
                              // Check if line starts with ↗ (section heading)
                              if (line.trim().startsWith('↗')) {
                                const headingText = line.replace(/^↗\s*/, '').trim();
                                return (
                                  <div key={idx} className="mt-1.5 md:mt-2 mb-1">
                                    <strong className="text-gray-800 font-medium text-[15px] md:text-[15px]">{headingText}</strong>
                                  </div>
                                );
                              }
                              // Regular line - ChatGPT font size: 15px
                              return <div key={idx} className="mb-1 text-[15px] leading-[1.75]">{line || '\u00A0'}</div>;
                            })}
                          </div>
                          
                          {/* Sources and Cross-References with Tabs - Clean design */}
                          {(message.sources && message.sources.length > 0) || (message.crossReferences && message.crossReferences.length > 0) ? (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <Tabs defaultValue="sources" className="w-full">
                                <TabsList className="inline-flex h-auto p-0 bg-transparent gap-0 border-b border-gray-100">
                                  <TabsTrigger 
                                    value="sources" 
                                    className="text-xs md:text-sm font-medium text-gray-600 px-2 md:px-4 py-1.5 md:py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                  >
                                    <span>Sources</span>
                                    {message.sources && message.sources.length > 0 && (
                                      <span className="ml-1 text-[10px] md:text-xs text-gray-500">({message.sources.length})</span>
                                    )}
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="crossrefs" 
                                    className="text-xs md:text-sm font-medium text-gray-600 px-2 md:px-4 py-1.5 md:py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                  >
                                    <span>Cross-Refs</span>
                                    {message.crossReferences && message.crossReferences.length > 0 && (
                                      <span className="ml-1 text-[10px] md:text-xs text-gray-500">({message.crossReferences.length})</span>
                                    )}
                                  </TabsTrigger>
                                  {message.validatedVerses && message.validatedVerses.length > 0 && (
                                    <TabsTrigger 
                                      value="verses" 
                                      className="text-xs md:text-sm font-medium text-gray-600 px-2 md:px-4 py-1.5 md:py-2 border-b-2 border-transparent data-[state=active]:text-gray-900 data-[state=active]:border-gray-900 rounded-none bg-transparent hover:text-gray-900 transition-colors"
                                    >
                                      <span>Verses</span>
                                      <span className="ml-1 text-[10px] md:text-xs text-gray-500">({message.validatedVerses.length})</span>
                                    </TabsTrigger>
                                  )}
                                </TabsList>
                                
                                <TabsContent value="sources" className="mt-3">
                              {message.sources && message.sources.length > 0 ? (
                                <div className="space-y-2">
                                  {message.sources.map((source, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px] md:text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 md:px-3 py-1.5 md:py-2 transition-colors">
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
                          
                          {/* Feedback and Action Buttons - All in one line */}
                          {message.role === 'assistant' && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] md:text-xs text-gray-500 mr-1">Was this helpful?</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                  className={`h-6 md:h-7 px-1.5 md:px-2 ${message.feedback === 'positive' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50'}`}
                                  title="Helpful"
                                >
                                  <ThumbsUp className={`h-3 w-3 md:h-3.5 md:w-3.5 ${message.feedback === 'positive' ? 'fill-green-600' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                  className={`h-6 md:h-7 px-1.5 md:px-2 ${message.feedback === 'negative' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'}`}
                                  title="Not helpful"
                                >
                                  <ThumbsDown className={`h-3 w-3 md:h-3.5 md:w-3.5 ${message.feedback === 'negative' ? 'fill-red-600' : ''}`} />
                                </Button>
                                <div className="flex items-center gap-1 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(message.id)}
                                    className="h-6 md:h-7 px-1.5 md:px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    title="Copy message"
                                  >
                                    <Copy className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleShare(message.id)}
                                    className="h-6 md:h-7 px-1.5 md:px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    title="Share message"
                                  >
                                    <Share2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReport(message.id)}
                                    className="h-6 md:h-7 px-1.5 md:px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    title="Report inappropriate content"
                                  >
                                    <Flag className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-none sm:rounded-xl md:rounded-2xl p-3 sm:p-3 md:p-4 shadow-none sm:shadow-sm w-full">
                          <div className="whitespace-pre-wrap text-[15px] leading-[1.75] break-words">{message.content}</div>
                        </div>
                      )}
                      <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 px-2">
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

        {/* Input Area - Fixed at bottom (moves up with keyboard on mobile) */}
        <div className="bg-white border-t border-gray-200 px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 flex-shrink-0 safe-area-bottom fixed bottom-0 left-0 right-0 lg:relative lg:left-auto lg:right-auto">
          <div className="max-w-3xl mx-auto w-full">
            {/* Mobile: Redesigned Input Bar */}
            <div className="lg:hidden">
              {/* Mode and Language - On Top */}
              <div className="flex items-center gap-2 mb-2">
                <Select value={currentMode} onValueChange={(value) => setCurrentMode(value as ChatMode)}>
                  <SelectTrigger className="h-8 text-[10px] border border-gray-200 bg-white hover:bg-gray-50 focus:ring-0 shadow-sm rounded-lg flex-1">
                    <div className="flex items-center gap-1.5">
                      {React.createElement(CHAT_MODES[currentMode]?.icon, { className: "h-3 w-3" })}
                      <span className="truncate text-[10px]">{CHAT_MODES[currentMode]?.name}</span>
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
                  <SelectTrigger className="h-8 text-[10px] border border-gray-200 bg-white hover:bg-gray-50 focus:ring-0 shadow-sm rounded-lg w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Input Bar */}
              <div className="bg-gray-50 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-end gap-1.5 sm:gap-2 p-1.5 sm:p-2">
                  {/* Text Input */}
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about bible"
                    className="flex-1 min-h-[40px] sm:min-h-[36px] max-h-[100px] py-2 px-2 sm:px-3 resize-none border-0 focus:ring-0 focus-visible:ring-0 text-[15px] bg-white rounded-lg placeholder:text-gray-400 outline-none"
                    disabled={isLoading}
                    rows={1}
                  />
                  
                  {/* Send Button */}
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-9 w-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0 mb-0.5"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
              {/* Disclaimer */}
              <p className="text-[10px] text-gray-500 text-center mt-1.5 px-2">
                By using Bible Aura you agree with our <Link to="/privacy-policy" className="text-orange-500 hover:text-orange-600 underline">privacy policy</Link>
              </p>
            </div>

            {/* Desktop: Original Input Bar */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="relative bg-transparent rounded-2xl border border-gray-200/30 shadow-sm hover:shadow-md hover:border-gray-300/50 transition-all duration-200 focus-within:border-gray-300/50 focus-within:shadow-lg">
                  <div className="flex items-center gap-2 px-3 py-2.5">
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
                      className="flex-1 min-h-[24px] max-h-[200px] py-1.5 px-0 resize-none border-0 focus:ring-0 focus-visible:ring-0 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
                      disabled={isLoading}
                      rows={1}
                    />
                    
                    {/* Send Button */}
                    <Button
                      onClick={() => handleSendMessage()}
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
                  By using Bible Aura you agree with our <Link to="/privacy-policy" className="text-orange-500 hover:text-orange-600 underline">privacy policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileNavMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileNavMenu(false)}>
          <div className="fixed left-0 top-0 bottom-0 z-50 bg-white shadow-2xl w-72 max-w-[85vw] transform transition-transform duration-300 translate-x-0" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-amber-400/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-orange-500">✦</span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-gray-900">Bible Aura</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-orange-500 font-medium">
                      Bible AI Assistance
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileNavMenu(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {[
                  { name: 'AI Chat', href: '/dashboard', icon: 'star', description: 'Biblical AI Assistant' },
                  { name: 'Bible', href: '/bible', icon: 'bible', description: 'Read Scripture' },
                  { name: 'Reading Plan', href: '/reading-plan', icon: 'favorites', description: 'Bible Reading Planner' },
                  { name: 'Sermons', href: '/sermons', icon: 'sermon', description: 'Sermon Library' },
                  { name: 'Favorites', href: '/favorites', icon: 'favorites', description: 'Saved Content' },
                  { name: 'Profile', href: '/profile', icon: 'profile', description: 'Account & Settings' }
                ].map((item) => {
                  const isActive = location.pathname === item.href || (item.href === '/dashboard' && ['/', '/dashboard', '/app', '/ai-chat'].includes(location.pathname));
                  const renderIcon = (icon: string) => {
                    switch (icon) {
                      case 'star':
                        return <span className="text-base leading-none font-semibold">✦</span>;
                      case 'bible':
                        return <BookOpen className="h-5 w-5" />;
                      case 'sermon':
                        return <PenTool className="h-5 w-5" />;
                      case 'favorites':
                        return <Heart className="h-5 w-5" />;
                      case 'profile':
                        return <User className="h-5 w-5" />;
                      default:
                        return null;
                    }
                  };
                  
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        navigate(item.href);
                        setShowMobileNavMenu(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 ${
                        isActive 
                          ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                          : "border-transparent hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isActive ? "bg-white text-orange-500" : "bg-orange-50 text-orange-500"
                      }`}>
                        {renderIcon(item.icon)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer - Sign Out */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  await signOut();
                  setShowMobileNavMenu(false);
                }}
                className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </span>
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile More Menu (Page Actions) */}
      {showMobileMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMoreMenu(false)}>
          <div className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl w-72 max-w-[85vw] transform transition-transform duration-300 translate-x-0" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Chat Actions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMoreMenu(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              {[
                { 
                  name: 'Chat History', 
                  icon: History, 
                  action: () => { 
                    setShowMobileHistory(true); 
                    setShowMobileMoreMenu(false); 
                  }, 
                  description: 'View past conversations' 
                },
                { 
                  name: 'New Chat', 
                  icon: Plus, 
                  action: () => { 
                    createNewConversation(); 
                    setShowMobileMoreMenu(false);
                    toast({
                      title: "New Chat",
                      description: "Started a new conversation",
                    });
                  }, 
                  description: 'Start fresh conversation' 
                },
                { 
                  name: 'Clear Chat', 
                  icon: Trash2, 
                  action: () => { 
                    createNewConversation(); 
                    setShowMobileMoreMenu(false);
                    toast({
                      title: "Chat Cleared",
                      description: "Current conversation has been cleared",
                    });
                  }, 
                  description: 'Clear current chat' 
                },
              ].map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <action.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={(open) => {
        setReportDialogOpen(open);
        if (!open) {
          setReportReason('');
          setSelectedCategory('');
          setReportingMessageId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>
              Please select a category and provide details about the issue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Report Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Category</label>
              <div className="grid grid-cols-2 gap-2">
                {reportCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedCategory === category.id
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-medium">{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Additional Details */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Additional Details (Optional)</label>
              <DialogTextarea
                placeholder="Provide more details about the issue..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportDialogOpen(false);
                setReportReason('');
                setSelectedCategory('');
                setReportingMessageId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={!selectedCategory}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
