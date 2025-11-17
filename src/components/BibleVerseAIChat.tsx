import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, X, Cross, Users, BookOpen, Lightbulb, Clock, HelpCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AIUsageTracker, getUsageInfo } from '@/lib/ai-usage-tracker';
import { sendBibleAuraMessage } from '@/lib/agent-sdk';
import { RotatingThinkingMessageInline } from '@/components/BibleAuraLoadingAnimation';
import { motion, AnimatePresence } from 'framer-motion';

interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  id?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: string;
}

interface BibleVerseAIChatProps {
  verse: BibleVerse;
  isOpen: boolean;
  onClose: () => void;
  verseReference?: string;
  sidebarMode?: boolean; // If true, renders as sidebar without Sheet wrapper
  defaultMode?: string; // Default mode to use (e.g., 'verse' for verse analysis)
}

// AI Chat modes with enhanced descriptions and icons
const AI_CHAT_MODES = [
  {
    id: 'verse',
    name: 'Theological Analysis',
    description: 'Deep theological and doctrinal analysis',
    icon: <Cross className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'character',
    name: 'Character Study',
    description: 'Biblical character insights and profiles',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'topical',
    name: 'Cross References',
    description: 'Related verses and connections',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    id: 'parable',
    name: 'Parables Study',
    description: 'Parable meanings and applications',
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  {
    id: 'chat',
    name: 'History & Insights',
    description: 'Historical context and cultural insights',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'qa',
    name: 'Q&A Format',
    description: 'Simple question and answer style',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
];

export default function BibleVerseAIChat({ verse, isOpen, onClose, verseReference, sidebarMode = false, defaultMode = 'verse' }: BibleVerseAIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(defaultMode);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset mode when defaultMode changes
  useEffect(() => {
    if (defaultMode) {
      setSelectedMode(defaultMode);
    }
  }, [defaultMode]);

  const verseRef = verseReference || `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  const verseContext = `${verseRef}: "${verse.text}"`;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // No welcome message - start with empty messages

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

    const messageTimestamp = new Date().toISOString();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: messageTimestamp,
      mode: selectedMode
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Track start time for response time calculation
    const startTime = Date.now();
    const pairId = `pair_${userMessage.id}`;
    let reservationId: string | undefined;

    try {
      // Reserve usage BEFORE API call (atomic operation)
      const reservationResult = await AIUsageTracker.reserveUsage(
        user.id,
        'ai_message',
        conversationId || undefined
      );

      if (!reservationResult.allowed) {
        toast({
          title: "AI Message Limit Reached",
          description: reservationResult.message || "You've reached your daily limit.",
          variant: "destructive",
        });
        setMessages(messages); // Revert user message
        return;
      }

      reservationId = reservationResult.reservation_id;

      // Use sendBibleAuraMessage with verse mode
      const aiResponse = await sendBibleAuraMessage(userInput, {
        mode: 'verse', // Always use verse analysis mode
        language: 'en'
      });
      
      const responseTime = Date.now() - startTime;
      const aiMessageTimestamp = new Date().toISOString();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.text,
        timestamp: aiMessageTimestamp,
        mode: aiResponse.mode || 'verse',
        sources: aiResponse.sources,
        crossReferences: aiResponse.crossReferences,
        validatedVerses: (aiResponse as any).validatedVerses
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Confirm usage and link conversation
      if (reservationId) {
        const confirmResult = await AIUsageTracker.confirmUsage(
          reservationId,
          user.id,
          {
            conversation_id: conversationId,
            mode: 'verse',
            language: 'english',
            translation: 'KJV'
          },
          {
            pair_id: pairId,
            user_message_id: userMessage.id,
            assistant_message_id: aiMessage.id,
            user_message_content: userInput,
            assistant_message_content: aiResponse.text,
            user_message_timestamp: messageTimestamp,
            assistant_message_timestamp: aiMessageTimestamp,
            mode: 'verse',
            language: 'english',
            translation: 'KJV',
            ai_mode: aiResponse.mode || 'verse',
            has_sources: !!(aiResponse.sources && aiResponse.sources.length > 0),
            sources_count: aiResponse.sources?.length || 0,
            has_cross_references: !!(aiResponse.crossReferences && aiResponse.crossReferences.length > 0),
            cross_references_count: aiResponse.crossReferences?.length || 0,
            has_validated_verses: !!((aiResponse as any).validatedVerses && (aiResponse as any).validatedVerses.length > 0),
            validated_verses_count: (aiResponse as any).validatedVerses?.length || 0,
            response_time_ms: responseTime,
            metadata: {
              sources: aiResponse.sources || [],
              crossReferences: aiResponse.crossReferences || [],
              validatedVerses: (aiResponse as any).validatedVerses || []
            }
          }
        );

        // Update conversation ID if a new one was created
        if (confirmResult.conversation_id && !conversationId) {
          setConversationId(confirmResult.conversation_id);
        }

        // Update conversation with all messages
        const convId = confirmResult.conversation_id || conversationId;
        if (convId) {
          await AIUsageTracker.updateConversation(convId, user.id, finalMessages);
        }
      }
      
    } catch (error: any) {
      // Rollback usage on API failure
      if (reservationId) {
        await AIUsageTracker.rollbackUsage(reservationId, user.id, 'ai_message');
      }

      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
      
      // Remove user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (messages: Message[]) => {
    if (!user) return;

    try {
      const conversationData = {
        user_id: user.id,
        title: `${verseRef} - ${AI_CHAT_MODES.find(m => m.id === selectedMode)?.name}`,
        messages: messages,
        mode: selectedMode,
        language: 'english',
        translation: 'KJV',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (conversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from('ai_conversations')
          .update({
            messages: messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (error) throw error;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert(conversationData)
          .select()
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    
    const modeChangeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `<span className="text-orange-500">✦</span> **Mode switched to ${AI_CHAT_MODES.find(m => m.id === mode)?.name}**

${AI_CHAT_MODES.find(m => m.id === mode)?.description}

Ask me anything about **${verseRef}** using this analysis mode!`,
      timestamp: new Date().toISOString(),
      mode: mode
    };
    
    setMessages(prev => [...prev, modeChangeMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Header - Only show if not in sidebar mode (sidebar mode has its own header) */}
      {!sidebarMode && (
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                ✦
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Bible AI Assistant
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Analyzing: <span className="font-semibold">{verseRef}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

        {/* AI Mode Selection - Hidden to simplify, only use default 'verse' mode */}
        {false && (
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {AI_CHAT_MODES.map((mode) => (
              <Button
                key={mode.id}
                variant={selectedMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeChange(mode.id)}
                className={`h-8 text-xs ${
                  selectedMode === mode.id 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'hover:bg-orange-50'
                }`}
              >
                {mode.icon}
                <span className="ml-1">{mode.name}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {AI_CHAT_MODES.find(m => m.id === selectedMode)?.description}
          </p>
        </div>
        )}

      {/* Messages Area - Properly sized for scrolling */}
      <ScrollArea className="flex-1 min-h-0 px-3 sm:px-4">
          <div className="py-3 space-y-3">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className="w-full max-w-[90%]">
                    {message.role === 'user' ? (
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-[20px] sm:rounded-[24px] p-3 sm:p-3 shadow-none sm:shadow-sm">
                        <div className="whitespace-pre-wrap text-[15px] leading-[1.75] break-words">{message.content}</div>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-100 rounded-[20px] sm:rounded-[24px] p-3 sm:p-4 shadow-sm">
                        <div className="whitespace-pre-wrap text-[15px] leading-[1.75] break-words text-gray-900">{message.content}</div>
                      </div>
                    )}
                    <div className={`text-[9px] md:text-[10px] text-gray-400 mt-1 px-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
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
                    <RotatingThinkingMessageInline />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

      {/* Input Area - Compact for sidebar mode */}
      <div className={`px-3 sm:px-4 py-2.5 border-t bg-gray-50 flex-shrink-0 ${sidebarMode ? 'pb-2' : ''}`}>
        <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-end gap-1.5 p-1.5">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={verseRef}
              className={`flex-1 min-h-[32px] max-h-[80px] py-1.5 px-2.5 resize-none border-0 focus:ring-0 focus-visible:ring-0 bg-white rounded-lg placeholder:text-gray-400 outline-none ${sidebarMode ? 'text-xs' : 'text-sm'}`}
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </Button>
          </div>
        </div>
        {!sidebarMode && (
          <p className="text-[8px] text-gray-500 text-center mt-1.5">
            By using bible aura you agree with our policies
          </p>
        )}
      </div>
    </div>
  );

  // If sidebar mode, return content directly without Sheet wrapper
  if (sidebarMode) {
    return content;
  }

  // Otherwise, wrap in Sheet for modal behavior
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[90vw] sm:w-[500px] h-full flex flex-col p-0">
        {content}
      </SheetContent>
    </Sheet>
  );
} 