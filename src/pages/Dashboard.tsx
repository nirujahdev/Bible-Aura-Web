import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ModernLayout } from '@/components/ModernLayout';
import { Navigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Plus, Send, MoreVertical, Filter, Languages, BookOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// AI Chat Mode templates
import { AI_RESPONSE_TEMPLATES, generateSystemPrompt } from '@/lib/ai-response-templates';

// DeepSeek API integration function
const callBiblicalAI = async (
  messages: Array<{role: string, content: string}>,
  mode: string = 'aichat',
  language: string = 'english',
  translation: string = 'KJV',
  cleanMode: boolean = false,
  abortController?: AbortController
): Promise<string> => {
  try {
    // Check for API key
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here' || apiKey === 'your_actual_deepseek_api_key_here') {
      throw new Error('🔑 DeepSeek API key not configured! Please:\n1. Go to https://platform.deepseek.com/\n2. Create an API key\n3. Add it to your .env.local file\n4. Restart the dev server');
    }

    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    // Get the appropriate system prompt from template
    const systemPrompt = generateSystemPrompt(mode as keyof typeof AI_RESPONSE_TEMPLATES) + `

LANGUAGE: Respond in ${language === 'tamil' ? 'Tamil using Tamil script' : 'English'}.
TRANSLATION: Reference ${translation} Bible translation when citing verses.
CLEAN MODE: ${cleanMode ? 'Keep responses concise and focused.' : 'Provide detailed explanations when helpful.'}`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: mode === 'verse' || mode === 'characters' || mode === 'parables' ? 1500 : 800,
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

// SEO Configuration
const SEO_CONFIG = {
  DASHBOARD: {
    title: 'Dashboard - Bible Aura AI Assistant',
    description: 'Access your personalized Bible study dashboard with AI-powered insights, chat history, and spiritual guidance.',
    keywords: 'bible dashboard, ai assistant, spiritual guidance, bible study, chat history'
  }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  mode?: string;
  language?: string;
  translation?: string;
}

// AI Chat modes
const CHAT_MODES = [
  { id: 'aichat', name: 'AI Chat', description: 'General Bible discussion' },
  { id: 'verse', name: 'Verse Analysis', description: 'Deep verse study' },
  { id: 'parables', name: 'Parables', description: 'Parable explanations' },
  { id: 'characters', name: 'Characters', description: 'Biblical character study' },
  { id: 'qa', name: 'Q&A', description: 'Question & Answer format' },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [translation, setTranslation] = useState('KJV King James');
  const [cleanMode, setCleanMode] = useState(false);
  const [chatMode, setChatMode] = useState('aichat');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const getUserName = () => {
    if (profile?.display_name) return profile.display_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Load user conversations from Supabase
  useEffect(() => {
    if (user) {
      loadUserConversations();
    }
  }, [user]);

  const loadUserConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: Array.isArray(conv.messages) ? conv.messages : [],
        created_at: new Date(conv.created_at).toLocaleDateString(),
        mode: conv.mode || 'aichat',
        language: conv.language || 'English',
        translation: conv.translation || 'KJV'
      }));

      setConversations(formattedConversations);
      
      // Auto-select first conversation if available
      if (formattedConversations.length > 0 && !activeConversation) {
        setActiveConversation(formattedConversations[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive"
      });
    }
  };

  const createNewChat = async () => {
    if (!user) return;

    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      created_at: new Date().toLocaleDateString(),
      mode: chatMode,
      language: language,
      translation: translation
    };

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: newConversation.title,
          messages: [],
          mode: chatMode,
          language: language,
          translation: translation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      newConversation.id = data.id;
      setConversations([newConversation, ...conversations]);
      setActiveConversation(data.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
      
      // Create conversation locally if database fails
      newConversation.id = Date.now().toString();
      setConversations([newConversation, ...conversations]);
      setActiveConversation(newConversation.id);
      
      toast({
        title: "Chat Created",
        description: "New conversation started (local mode)",
      });
    }
  };

  const saveConversationToDatabase = async (conversationId: string, messages: Message[], title?: string) => {
    if (!user) return;

    try {
      const updateData: any = {
        messages: messages,
        updated_at: new Date().toISOString()
      };

      if (title) {
        updateData.title = title;
      }

      const { error } = await supabase
        .from('ai_conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isLoading || !user) return;

    setMessage('');
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleString()
    };

    let currentActiveConversation = activeConversation;
    let updatedConversations = [...conversations];

    // If no active conversation exists, create one automatically
    if (!currentActiveConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : ''),
        messages: [userMessage],
        created_at: new Date().toLocaleDateString(),
        mode: chatMode,
        language: language,
        translation: translation
      };

      try {
        const { data, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            title: newConversation.title,
            messages: [userMessage],
            mode: chatMode,
            language: language,
            translation: translation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        newConversation.id = data.id;
        updatedConversations = [newConversation, ...conversations];
        setConversations(updatedConversations);
        setActiveConversation(data.id);
        currentActiveConversation = data.id;
      } catch (error) {
        console.error('Error creating new chat:', error);
        toast({
          title: "Error",
          description: "Failed to create new conversation. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } else {
      // Add user message to existing conversation
      updatedConversations = conversations.map(conv => {
        if (conv.id === currentActiveConversation) {
          const newMessages = [...conv.messages, userMessage];
          const newTitle = conv.messages.length === 0 ? textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : '') : conv.title;
          
          // Save to database
          saveConversationToDatabase(conv.id, newMessages, conv.messages.length === 0 ? newTitle : undefined);
          
          return { 
            ...conv, 
            messages: newMessages,
            title: newTitle
          };
        }
        return conv;
      });

      setConversations(updatedConversations);
    }

    // Get AI response using DeepSeek API
    try {
      const conversationMessages = updatedConversations
        .find(conv => conv.id === currentActiveConversation)
        ?.messages
        .map(msg => ({ role: msg.role, content: msg.content })) || [];

      const aiResponse = await callBiblicalAI(
        conversationMessages,
        chatMode,
        language.toLowerCase(),
        translation,
        cleanMode
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleString()
      };

      const finalUpdatedConversations = updatedConversations.map(conv => {
        if (conv.id === currentActiveConversation) {
          const finalMessages = [...conv.messages, aiMessage];
          
          // Save AI response to database
          saveConversationToDatabase(conv.id, finalMessages);
          
          return { ...conv, messages: finalMessages };
        }
        return conv;
      });

      setConversations(finalUpdatedConversations);
      setIsLoading(false);
    } catch (error: any) {
      console.error('AI Response Error:', error);
      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (activeConversation === id) {
        const remaining = conversations.filter(c => c.id !== id);
        setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
      }

      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  };

  return (
    <ModernLayout>
      <div className="h-screen flex bg-gray-100">
        {/* Chat History Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Chat</h2>
              <Button 
                onClick={createNewChat}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 rounded"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded cursor-pointer hover:bg-gray-50 transition-colors mb-1 ${
                    activeConversation === conv.id ? 'bg-gray-100 border border-orange-200' : ''
                  }`}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conv.title}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{conv.created_at}</span>
                        <span>{conv.messages.length} messages</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-gray-200">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="text-gray-700 hover:bg-gray-100"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">✦</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Bible Aura AI</div>
                <div className="text-sm text-gray-600">Your Biblical Study Assistant</div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {activeConversation ? (
              conversations.find(c => c.id === activeConversation)?.messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-2xl mx-auto p-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-white font-bold text-3xl">✦</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Hello {getUserName()}!
                    </h2>
                    <p className="text-gray-600 mb-8">
                      I'm your Bible Aura AI assistant. Start a conversation by typing your question below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                  {conversations.find(c => c.id === activeConversation)?.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">✦</span>
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-orange-500 text-white ml-auto' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-2">{msg.timestamp}</p>
                      </div>
                      
                      {msg.role === 'user' && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getUserName().charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">✦</span>
                      </div>
                      <div className="bg-white text-gray-800 p-4 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg mb-4">
                  <div className="w-8 h-8 rotate-45 bg-white/20 rounded-lg"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Hello {getUserName()}!
                </h3>
                <p className="text-gray-600 mb-6">How can I assist you with your Bible studies today?</p>
                
                <Button onClick={createNewChat} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Controls and Input */}
          <div className="bg-white border-t p-4">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button
                  variant={cleanMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCleanMode(!cleanMode)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clean Mode
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-500" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <Select value={translation} onValueChange={setTranslation}>
                    <SelectTrigger className="w-40 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KJV King James">KJV King James</SelectItem>
                      <SelectItem value="NIV">NIV</SelectItem>
                      <SelectItem value="ESV">ESV</SelectItem>
                      <SelectItem value="NASB">NASB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="flex gap-3">
              <Select value={chatMode} onValueChange={setChatMode}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAT_MODES.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask me anything about the Bible... (${CHAT_MODES.find(m => m.id === chatMode)?.name || 'AI Chat'})`}
                  className="pr-12 h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 h-8 w-8 p-0 rounded"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
} 