import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Plus, 
  MessageCircle, 
  History, 
  Trash2, 
  MoreVertical,
  ChevronLeft,
  Sparkles,
  Clock,
  User,
  Bot,
  ChevronDown,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { generateSystemPrompt, AI_RESPONSE_TEMPLATES } from '../lib/ai-response-templates';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// Chat modes using the detailed JSON templates
const CHAT_MODES = {
  chat: {
    name: "AI Chat",
    description: AI_RESPONSE_TEMPLATES.chat.purpose,
  },
  verse: {
    name: "AI Analysis",
    description: AI_RESPONSE_TEMPLATES.verse.purpose,
  },
  qa: {
    name: "Q&A",
    description: AI_RESPONSE_TEMPLATES.qa.purpose,
  },
  parable: {
    name: "Parables",
    description: AI_RESPONSE_TEMPLATES.parable.purpose,
  },
  character: {
    name: "Character",
    description: AI_RESPONSE_TEMPLATES.character.purpose,
  },
  topical: {
    name: "Study",
    description: AI_RESPONSE_TEMPLATES.topical.purpose,
  }
};

const callBiblicalAI = async (
  messages: Array<{role: 'user' | 'assistant', content: string}>, 
  mode: keyof typeof CHAT_MODES = 'chat',
  abortController?: AbortController
) => {
  try {
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Reduced from 30s to 15s

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: generateSystemPrompt(mode)
          },
          ...messages
        ],
        max_tokens: 600, // Reduced from 1000 for faster responses
        temperature: 0.5, // Reduced for more focused responses
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    // Clean response content
    const cleanContent = cleanResponseText(data.choices[0].message.content);

    return {
      content: cleanContent,
      model: data.model || 'deepseek-chat'
    };

  } catch (error: any) {
    console.error('AI API Error:', error);
    throw error;
  }
};

// Function to clean response text from unwanted formatting
const cleanResponseText = (text: string): string => {
  return text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // Remove markdown formatting
    .replace(/[#*$]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
};

export default function EnhancedAIChat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<keyof typeof CHAT_MODES>('chat');
  
  // History state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
      } else if (scrollAreaRef.current) {
        // Fallback: try to find the viewport element
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    // Use setTimeout to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else if (scrollAreaRef.current) {
      // Fallback: try to find the viewport element
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      const conversations = (data || []).map(conv => ({
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages as unknown as Message[] : []
      }));
      setConversations(conversations as Conversation[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const generateTitle = (firstMessage: string): string => {
    // Generate a title from the first message (first 50 characters)
    const title = firstMessage.substring(0, 50);
    return title.length < firstMessage.length ? title + '...' : title;
  };

  const saveConversation = async (messages: Message[]) => {
    if (!user || messages.length === 0) return;

    try {
      const title = currentConversationId 
        ? conversations.find(c => c.id === currentConversationId)?.title
        : generateTitle(messages[0].content);

      if (currentConversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from('ai_conversations')
          .update({
            messages: messages as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title: title,
            messages: messages as any
          })
          .select()
          .single();

        if (error) throw error;
        
        setCurrentConversationId(data.id);
      }

      // Reload conversations to update the sidebar
      loadConversations();
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || !user) return;

    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Keep only last 10 messages for context
      const conversationHistory = updatedMessages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const aiResponse = await callBiblicalAI(conversationHistory, selectedMode, abortControllerRef.current);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        model: aiResponse.model
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Save to Supabase
      await saveConversation(finalMessages);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `I apologize, but I'm having trouble connecting right now. This could be due to network issues or service availability. Please try again in a moment.\n\n"Be still, and know that I am God" - Psalm 46:10`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Having trouble reaching the AI service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setIsHistoryOpen(false);
  };

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages || []);
    setCurrentConversationId(conversation.id);
    setIsHistoryOpen(false);
  };

  const deleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // If we're deleting the current conversation, start a new one
      if (conversationId === currentConversationId) {
        startNewConversation();
      }

      // Reload conversations
      loadConversations();

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUserName = () => {
    return profile?.display_name?.split(' ')[0] || 'Friend';
  };

  const suggestionPrompts = [
    "What does Romans 8:28 mean for my daily life?",
    "Explain the parable of the Good Samaritan",
    "What are the fruits of the Spirit?",
    "How can I strengthen my faith during difficult times?"
  ];

  // History Sidebar Component
  const HistorySidebar = () => (
    <div className="w-80 border-r bg-gray-50/50 flex flex-col h-full" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}>Chat History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={startNewConversation}
            className="gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-white hover:shadow-sm'
              }`}
              onClick={() => loadConversation(conversation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                    {conversation.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                    {format(new Date(conversation.updated_at), 'MMM d, h:mm a')}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                      {conversation.messages?.length || 0} messages
                    </Badge>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start chatting to see your history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop History Sidebar */}
      <div className="hidden lg:block">
        <HistorySidebar />
      </div>

      {/* Mobile History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <HistorySidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white p-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile history toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsHistoryOpen(true)}
              >
                <History className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">✦</span>
                <div>
                  <h1 className="text-xl font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}>Bible Aura AI</h1>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>Your Biblical Study Assistant</p>
                </div>
              </div>
            </div>

            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                className="gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-hidden relative" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 text-orange-500">✦</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}>
                  Hello {getUserName()}!
                </h2>
                <p className="text-xl text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                  How can I assist you with your biblical studies today?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestionPrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => sendMessage(prompt)}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>{prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div 
              className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
              ref={scrollViewportRef}
              style={{ 
                scrollBehavior: 'smooth',
                maxHeight: 'calc(100vh - 200px)'
              }}
            >
              <div className="max-w-4xl mx-auto p-4 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-500 text-lg font-bold">✦</span>
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed" style={{
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: '500'
                        }}>
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                        <Clock className="h-3 w-3" />
                        {format(new Date(message.timestamp), 'h:mm a')}
                        {message.model && (
                          <Badge variant="outline" className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                            {message.model}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-500 text-lg font-bold">✦</span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                        <span className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scroll to Bottom Button */}
          {messages.length > 0 && (
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="absolute bottom-6 right-6 rounded-full w-12 h-12 shadow-lg bg-orange-500 hover:bg-orange-600 text-white border-2 border-white"
              style={{ zIndex: 10 }}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
          <div className="max-w-4xl mx-auto">
            {/* Input Row with Mode Selector */}
            <div className="flex gap-2 items-end">
              {/* Mode Selector */}
              <div className="flex-shrink-0">
                <Select value={selectedMode} onValueChange={(value: keyof typeof CHAT_MODES) => setSelectedMode(value)}>
                  <SelectTrigger className="w-auto min-w-[120px] h-12 text-sm border-2 rounded-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHAT_MODES).map(([key, mode]) => (
                      <SelectItem key={key} value={key} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                        <span className="font-medium">{mode.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask me anything about the Bible... (${CHAT_MODES[selectedMode].name})`}
                  disabled={isLoading || !user}
                  className="pr-12 rounded-xl border-2 focus:border-primary/50 min-h-[48px] resize-none"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}
                />
              </div>

              {/* Send Button with AI Logo */}
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || !user}
                size="lg"
                className="rounded-xl px-6 min-h-[48px] gap-2"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">✦</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            {!user && (
              <p className="text-sm text-gray-500 mt-2 text-center" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>
                Please sign in to start chatting with Bible Aura AI
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 