import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

// DeepSeek API integration
const callBiblicalAI = async (
  messages: Array<{role: string, content: string}>,
  mode: string = 'verse',
  verseContext: string = '',
  abortController?: AbortController
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here' || apiKey === 'your_actual_deepseek_api_key_here') {
      throw new Error('🔑 DeepSeek API key not configured! Please:\n1. Go to https://platform.deepseek.com/\n2. Create an API key\n3. Add it to your .env.local file\n4. Restart the dev server');
    }

    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const systemPrompt = generateSystemPrompt(mode as keyof typeof AI_RESPONSE_TEMPLATES) + `

VERSE CONTEXT: ${verseContext}

LANGUAGE: Respond in English.
TRANSLATION: Use KJV Bible translation when citing verses.
FOCUS: Center your analysis specifically on the provided verse while connecting to broader biblical themes.`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: mode === 'verse' || mode === 'character' || mode === 'parable' || mode === 'topical' ? 1500 : 800,
      temperature: 0.3,
      top_p: 0.9,
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
      console.error('API Error Response:', errorText);
      
      if (response.status === 401) {
        throw new Error('AI service authentication failed. Please check your API key.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`AI service error (${response.status}). Please try again.`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid API Response:', data);
      throw new Error('Invalid response from AI service. Please try again.');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('AI Call Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled.');
    }
    throw error;
  }
};

export default function BibleVerseAIChat({ verse, isOpen, onClose, verseReference }: BibleVerseAIChatProps) {
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
      content: `✦ **Welcome to Bible Aura AI**

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
      content: `✦ **Mode switched to ${AI_CHAT_MODES.find(m => m.id === mode)?.name}**

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">✦</span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Bible Aura AI Assistant
                </DialogTitle>
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
        </DialogHeader>

        {/* AI Mode Selection */}
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

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
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

        {/* Input Area */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask about ${verseRef} using ${AI_CHAT_MODES.find(m => m.id === selectedMode)?.name}...`}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 