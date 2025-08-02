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
  Settings,
  Languages,
  BookOpen,
  Filter,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Brain,
  Target,
  Search,
  X,
  Menu,
  Lightbulb,
  RefreshCw
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
import StructuredAIResponse from '../StructuredAIResponse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { generateSystemPrompt, AI_RESPONSE_TEMPLATES } from '../../lib/ai-response-templates';
import { BIBLE_TRANSLATIONS, TranslationCode } from '@/lib/local-bible';
import { Link } from 'react-router-dom';
import { Textarea } from './ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

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
    language: 'english',
    icon: MessageCircle,
    color: 'bg-orange-500'
  },
  verse: {
    name: "Verse Study",
    description: AI_RESPONSE_TEMPLATES.verse.purpose,
    language: 'english',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  qa: {
    name: "Q&A",
    description: AI_RESPONSE_TEMPLATES.qa.purpose,
    language: 'english',
    icon: Brain,
    color: 'bg-purple-500'
  },
  parable: {
    name: "Parables",
    description: AI_RESPONSE_TEMPLATES.parable.purpose,
    language: 'english',
    icon: Sparkles,
    color: 'bg-green-500'
  },
  character: {
    name: "Characters",
    description: AI_RESPONSE_TEMPLATES.character.purpose,
    language: 'english',
    icon: User,
    color: 'bg-indigo-500'
  },
  topical: {
    name: "Study",
    description: AI_RESPONSE_TEMPLATES.topical.purpose,
    language: 'english',
    icon: Target,
    color: 'bg-amber-500'
  }
};

// Quick start prompts optimized for mobile
const QUICK_PROMPTS = [
  {
    id: 1,
    text: "Daily verse inspiration",
    prompt: "Give me an inspiring Bible verse for today with explanation",
    icon: Heart,
    color: "bg-rose-500"
  },
  {
    id: 2,
    text: "Prayer guidance",
    prompt: "Help me with prayer for my current situation",
    icon: Sparkles,
    color: "bg-purple-500"
  },
  {
    id: 3,
    text: "Bible study help",
    prompt: "I need help understanding a Bible passage",
    icon: BookOpen,
    color: "bg-blue-500"
  },
  {
    id: 4,
    text: "Faith questions",
    prompt: "I have questions about my faith journey",
    icon: Search,
    color: "bg-green-500"
  }
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English', icon: '🇺🇸' },
  { value: 'tamil', label: 'தமிழ்', icon: '🇮🇳' }
];

// English translations
const SELECT_TRANSLATIONS = BIBLE_TRANSLATIONS.filter(t => t.language === 'english').slice(0, 9);

const callBiblicalAI = async (
  messages: Array<{role: 'user' | 'assistant', content: string}>, 
  mode: keyof typeof CHAT_MODES = 'chat',
  language: 'english' | 'tamil' = 'english',
  translation: TranslationCode = 'KJV',
  cleanMode: boolean = false,
  abortController?: AbortController
) => {
  try {
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const basePrompt = generateSystemPrompt(mode);
    
    const formatOverride = `

CRITICAL FORMATTING OVERRIDE - FOLLOW EXACTLY:
- Start responses with ✮ followed by main title
- Put TWO line breaks after the title
- Each section starts with ↗ followed by section name
- Put ONE line break after section header
- Each bullet point starts with • followed by content
- Put ONE line break after each bullet point  
- Put TWO line breaks between sections
- NO emojis like 📖 🎯 ✝️ etc.
- NO hashtags, asterisks, or markdown symbols (#*@$_)

EXACT FORMAT TO FOLLOW:
✮ MAIN TITLE

↗ Section Name
• First point here
• Second point here

↗ Another Section
• Another point here
• Final point here

${language === 'tamil' ? 'Respond in Tamil language using Tamil script.' : 'Respond in English.'}
Use ${translation} Bible translation for all verse references.
`;

    const systemPrompt = `${basePrompt}${formatOverride}`;

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7,
      stream: false
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const MobileEnhancedAIChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Settings state
  const [currentMode, setCurrentMode] = useState<keyof typeof CHAT_MODES>('chat');
  const [currentLanguage, setCurrentLanguage] = useState<'english' | 'tamil'>('english');
  const [currentTranslation, setCurrentTranslation] = useState<TranslationCode>('KJV');
  const [cleanMode, setCleanMode] = useState(false);
  
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const saveConversation = async (messages: Message[]) => {
    if (!user || messages.length === 0) return;

    try {
      const title = messages[0]?.content.slice(0, 50) + '...' || 'New Chat';
      
      if (currentConversationId) {
        await supabase
          .from('ai_conversations')
          .update({
            title,
            messages,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);
      } else {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title,
            messages,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
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

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setIsLoading(true);
    setInput('');
    setShowQuickPrompts(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await callBiblicalAI(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        currentMode,
        currentLanguage,
        currentTranslation,
        cleanMode,
        abortControllerRef.current
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: 'gpt-4o-mini'
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      await saveConversation(finalMessages);

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowQuickPrompts(true);
  };

  const loadConversation = (conversation: Conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setShowQuickPrompts(false);
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);
      
      await loadConversations();
      
      if (currentConversationId === conversationId) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const toggleVoiceRecording = () => {
    setIsVoiceRecording(!isVoiceRecording);
    // Voice recording implementation would go here
    toast({
      title: isVoiceRecording ? "Voice recording stopped" : "Voice recording started",
      description: isVoiceRecording ? "Processing your voice..." : "Speak your question"
    });
  };

  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState(input);

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Chat Header - Simplified for within layout */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        {/* Title and Mode */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">Bible AI Chat</h1>
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full ${CHAT_MODES[currentMode].color} mr-2`}></div>
            <span className="text-xs text-gray-500">{CHAT_MODES[currentMode].name}</span>
          </div>
        </div>

        {/* Right: New Chat + Settings */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={startNewConversation}
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-gray-100 rounded-xl"
            title="New Chat"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </Button>
          
          {/* Settings */}
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chat Settings</h3>
                  
                  {/* Chat Mode */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-700">Chat Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CHAT_MODES).map(([key, mode]) => {
                        const Icon = mode.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setCurrentMode(key as keyof typeof CHAT_MODES)}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                              currentMode === key 
                                ? 'border-orange-300 bg-orange-50 text-orange-900' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-5 w-5 mb-2 text-orange-600" />
                            <div className="text-sm font-medium">{mode.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <Select value={currentLanguage} onValueChange={(value: 'english' | 'tamil') => setCurrentLanguage(value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center">
                              <span className="mr-2">{lang.icon}</span>
                              {lang.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bible Translation */}
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-medium text-gray-700">Bible Translation</label>
                    <Select value={currentTranslation} onValueChange={(value: TranslationCode) => setCurrentTranslation(value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SELECT_TRANSLATIONS.map((translation) => (
                          <SelectItem key={translation.code} value={translation.code}>
                            {translation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clean Mode */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                    <div>
                      <div className="text-sm font-medium">Clean Mode</div>
                      <div className="text-xs text-gray-500">Simplified responses</div>
                    </div>
                    <Switch checked={cleanMode} onCheckedChange={setCleanMode} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages Area - Mobile-Optimized */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 mobile-scroll">
        {messages.length === 0 && showQuickPrompts ? (
          /* Welcome Screen - Mobile-First Design */
          <div className="max-w-sm sm:max-w-md mx-auto text-center space-y-4 sm:space-y-6 px-2 sm:px-4">
            
            {/* Compact Header for Mobile */}
            <div className="space-y-2 sm:space-y-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
                <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Welcome to Bible AI</h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Ask me anything about the Bible. I'm here to help you explore God's word with AI-powered insights.
              </p>
            </div>

            {/* Mobile-Optimized Quick Start Cards */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mt-4">
              {QUICK_PROMPTS.map((prompt) => (
                <Button
                  key={prompt.id}
                  variant="outline"
                  onClick={() => {
                    setInputValue(prompt.prompt);
                    setShowQuickPrompts(false);
                    handleSendMessage(prompt.prompt);
                  }}
                  className="p-4 sm:p-5 h-auto text-left justify-start hover:bg-orange-50 hover:border-orange-200 border-2 touch-optimized group"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${prompt.color} flex-shrink-0`}>
                      <prompt.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base group-hover:text-orange-700 transition-colors">
                        {prompt.text}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                        {prompt.prompt}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Mobile Quick Tips */}
            <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-blue-900 mb-1">Quick Tip</div>
                  <div className="text-xs sm:text-sm text-blue-700">
                    Try asking specific questions like "What does John 3:16 mean?" or "Tell me about David's story"
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages - Mobile-Optimized */
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[70%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  {message.role === 'assistant' && currentMode !== 'chat' ? (
                    <StructuredAIResponse content={message.content} />
                  ) : (
                    <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap mobile-text">
                      {message.content}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-orange-100' : 'text-gray-400'
                  }`}>
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 ml-2">Bible AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile-Optimized Input Area */}
      <div className="border-t border-gray-200 bg-white p-3 sm:p-4 mobile-safe-area">
        
        {/* Quick Suggestions Bar - Mobile Only */}
        {isMobile && messages.length > 0 && (
          <div className="mb-3 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {["Quick prayer", "Bible study"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInputValue(suggestion);
                    handleSendMessage(suggestion);
                  }}
                  className="whitespace-nowrap text-xs px-2 py-1 h-7 touch-optimized bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me about the Bible..."
                className="resize-none pr-10 sm:pr-12 min-h-[44px] max-h-32 text-base mobile-text touch-optimized"
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
                rows={1}
                disabled={isLoading}
              />
              
              {/* Voice Input Button - Mobile */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 touch-optimized"
                  onClick={() => {
                    // Voice input functionality
                    toast({
                      title: "Voice Input",
                      description: "Voice input feature coming soon!"
                    });
                  }}
                >
                  <Mic className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
          
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] px-4 sm:px-6 touch-optimized"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Bible AI Online</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{messages.length} messages</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileEnhancedAIChat; 