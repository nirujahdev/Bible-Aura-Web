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
  Send, Bot, Sparkles, BookOpen, Users, HelpCircle, 
  Cross, Clock, Lightbulb, MessageSquare, X, Loader2 
} from 'lucide-react';
import { AI_RESPONSE_TEMPLATES, generateSystemPrompt } from '@/lib/ai-response-templates';
import { supabase } from '@/integrations/supabase/client';
import { callOpenAIAPI } from '@/lib/openai-api-helper';
import { checkAndIncrementUsage } from '@/lib/ai-limits';

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

// OpenAI integration - SPEED OPTIMIZED
const callBiblicalAI = async (
  messages: Array<{role: string, content: string}>,
  mode: string = 'verse',
  verseContext: string = '',
  abortController?: AbortController
): Promise<string> => {
  try {
    const systemPrompt = generateSystemPrompt(mode as keyof typeof AI_RESPONSE_TEMPLATES) + `

VERSE CONTEXT: ${verseContext}

LANGUAGE: Respond in English.
TRANSLATION: Use KJV Bible translation when citing verses.
FOCUS: Center your analysis specifically on the provided verse while connecting to broader biblical themes.
SPEED PRIORITY: Generate fast, accurate verse-specific responses.`;

    const maxTokens = mode === 'verse' || mode === 'character' || mode === 'parable' || mode === 'topical' ? 800 : 500;
    
    // Convert messages array to OpenAI format
    const openAIMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get the last user message as the prompt, or use empty string if no messages
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    const response = await callOpenAIAPI(lastUserMessage, {
      systemPrompt,
      messages: openAIMessages,
      maxTokens,
      temperature: 0.2, // Lower for faster, more focused responses
      model: 'gpt-4.1-nano'
    });

    return response;
  } catch (error: any) {
    console.error('AI Call Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('⏰ Request timed out. Please try again.');
    }
    throw error;
  }
};

export default function BibleVerseAIChat({ verse, isOpen, onClose, verseReference, sidebarMode = false }: BibleVerseAIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('verse');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const verseRef = verseReference || `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  const verseContext = `${verseRef}: "${verse.text}"`;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation();
    }
  }, [isOpen]);

  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `<span className="text-orange-500">✦</span> **Welcome to Bible Aura AI**

I'm ready to help you explore **${verseRef}**:

*"${verse.text}"*

Choose an analysis mode above and ask me anything about this verse! I can provide theological insights, historical context, character studies, cross-references, and more.`,
      timestamp: new Date().toISOString(),
      mode: selectedMode
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with AI about Bible verses",
        variant: "destructive",
      });
      return;
    }

    // Check AI message limit
    const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
    
    if (!usageResult.allowed) {
      toast({
        title: "AI Message Limit Reached",
        description: `You've reached your daily limit of ${usageResult.limit} AI messages. Please try again tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      mode: selectedMode
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      abortControllerRef.current = new AbortController();
      
      const conversationMessages = newMessages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));

      const aiResponse = await callBiblicalAI(
        conversationMessages,
        selectedMode,
        verseContext,
        abortControllerRef.current
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: selectedMode
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save conversation to database
      await saveConversation(finalMessages);

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
                  Bible Aura AI Assistant
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
      <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <div className="py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className={`mb-2 last:mb-0 ${
                        message.role === 'user' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Bible Aura AI is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

      {/* Input Area - Matches main chat style */}
      <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 flex-shrink-0">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-end gap-2 p-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${verseRef}...`}
              className="flex-1 min-h-[36px] max-h-[100px] py-2 px-3 resize-none border-0 focus:ring-0 focus-visible:ring-0 text-sm bg-white rounded-lg placeholder:text-gray-400 outline-none"
              disabled={isLoading}
              rows={1}
            />
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
        <p className="text-[8px] text-gray-500 text-center mt-1.5">
          By using bible aura you agree with our policies
        </p>
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