import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, Plus, MoreVertical, Settings, MessageCircle, Filter,
  Languages, BookOpen, Bot
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ModernLayout } from '@/components/ModernLayout';

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
  
  // Mobile-friendly dashboard - no redirect needed since this IS the main page
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // State management - Start with empty conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [translation, setTranslation] = useState('KJV King James');
  const [cleanMode, setCleanMode] = useState(false);
  const [chatMode, setChatMode] = useState('aichat');

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
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleString()
    };

    // Add user message to current conversation
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            title: conv.messages.length === 0 ? textToSend.slice(0, 30) + '...' : conv.title
          }
        : conv
    ));

    setMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Thank you for your question. As your Biblical Study Assistant, I\'m here to help you explore the depths of Scripture and provide insights for your spiritual journey. Please feel free to ask me anything about the Bible, theology, or Christian faith.',
        timestamp: new Date().toLocaleString()
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: [...conv.messages, aiMessage] }
          : conv
      ));

      setIsLoading(false);
    }, 1000);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversation === id && conversations.length > 1) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversation(remaining[0]?.id || '');
    }
  };

  const suggestionQuestions = [
    "What does Romans 8:28 mean for my daily life?",
    "Explain the parable of the Good Samaritan",
    "What are the fruits of the Spirit?",
    "How can I strengthen my faith during difficult times?"
  ];

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
                          onClick={() => deleteConversation(conv.id)}
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
                <span className="text-white font-bold text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">✦</span>
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
                    <Bot className="w-16 h-16 text-orange-500 mx-auto mb-6" />
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
                        <Bot className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
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
                      <Bot className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
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
                <Bot className="w-16 h-16 text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Bible Aura AI</h3>
                <p className="text-gray-600 mb-6">Choose a chat mode below and start your spiritual conversation</p>
                
                {/* Chat Mode Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-6">
                  {CHAT_MODES.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={chatMode === mode.id ? "default" : "outline"}
                      className={`p-4 h-auto text-left ${chatMode === mode.id ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                      onClick={() => setChatMode(mode.id)}
                    >
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-xs opacity-70">{mode.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
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
                  disabled={!activeConversation}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || isLoading || !activeConversation}
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