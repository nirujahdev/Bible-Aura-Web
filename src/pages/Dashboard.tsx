import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, Plus, MoreVertical, Settings, MessageCircle, Filter,
  Languages, BookOpen
} from 'lucide-react';
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
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redirect mobile users to landing page
  if (isMobile) {
    return <Navigate to="/" replace />;
  }
  
  // SEO optimization
  useSEO(SEO_CONFIG.DASHBOARD);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'What does John 3:16 mean',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'What does John 3:16 mean',
          timestamp: 'Aug 3, 1:10 AM'
        },
        {
          id: '2',
          role: 'assistant',
          content: `"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." (John 3:16)

This verse is often called the "Gospel in a nutshell" because it contains the essence of Christian faith:

**God's Love**: Shows the depth of God's love for humanity
**God's Gift**: Jesus Christ is God's ultimate gift to us
**Belief**: Faith in Jesus is the requirement for salvation
**Eternal Promise**: Believers receive eternal life, not condemnation

This verse demonstrates that salvation is available to everyone ("whoever believes") and is a free gift from God, not something we can earn.`,
          timestamp: 'Aug 3, 1:10 AM'
        }
      ],
      created_at: 'Aug 3, 1:10 AM'
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [translation, setTranslation] = useState('KJV King James');
  const [cleanMode, setCleanMode] = useState(false);

  const getUserName = () => {
    if (profile?.display_name) return profile.display_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Benaiah';
  };

  const currentConversation = conversations.find(c => c.id === activeConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      created_at: new Date().toLocaleString()
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
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
                onClick={createNewConversation}
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
            {currentConversation?.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">✦</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Hello {getUserName()}!
                  </h2>
                  <p className="text-gray-600 mb-8">
                    How can I assist you with your biblical studies today?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestionQuestions.map((question, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="p-4 h-auto text-left border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-orange-300"
                        onClick={() => sendMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                {currentConversation?.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">✦</span>
                      </div>
                    )}
                    
                    <div className={`max-w-2xl ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-orange-500 text-white rounded-br-md' 
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                    
                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-blue-500 text-white text-sm">
                          {getUserName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">✦</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-md border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
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
              <Select defaultValue="AI Chat">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI Chat">AI Chat</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about the Bible... (AI Chat)"
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