import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, BookOpen, PenTool, Send, Plus, Menu, Settings, LogOut,
  Sparkles, User, Bot, MoreVertical, Trash2, Edit3, History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

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
  const { user, profile, signOut } = useAuth();
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
      title: 'Understanding Romans 8:28',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'What does Romans 8:28 mean?',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Romans 8:28 teaches us that "all things work together for good to those who love God, to those who are the called according to His purpose." This verse doesn\'t mean that everything that happens is good, but rather that God can work even difficult circumstances together for our ultimate good and His glory.',
          timestamp: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString()
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getUserName = () => {
    if (profile?.display_name) return profile.display_name.split(' ')[0];
    if (user?.email) return user.email.split('@')[0];
    return 'Friend';
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
      created_at: new Date().toISOString()
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message to current conversation
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            title: conv.messages.length === 0 ? message.slice(0, 50) + '...' : conv.title
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
        content: 'Thank you for your question. This is a simulated response. The AI assistant is helping you explore biblical truths and spiritual insights.',
        timestamp: new Date().toISOString()
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

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Bible Aura</h1>
            <p className="text-xs text-gray-600">AI Biblical Assistant</p>
          </div>
        </div>
        
        <Button 
          onClick={createNewConversation}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative p-3 rounded-lg cursor-pointer hover:bg-white transition-colors ${
                activeConversation === conv.id ? 'bg-white shadow-sm border border-orange-200' : ''
              }`}
              onClick={() => setActiveConversation(conv.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conv.messages.length} messages
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => deleteConversation(conv.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-white">
        <div className="space-y-2">
          <Link to="/bible">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Bible Study
            </Button>
          </Link>
          <Link to="/sermons">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <PenTool className="h-4 w-4 mr-2" />
              Sermons
            </Button>
          </Link>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-orange-500 text-white text-sm">
                {getUserName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="font-semibold">Bible Aura AI</span>
          </div>
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-orange-500 text-white text-sm">
              {getUserName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentConversation?.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hello {getUserName()}!
                </h2>
                <p className="text-gray-600 mb-6">
                  I'm your AI Biblical assistant. Ask me anything about Scripture, theology, or faith.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-left"
                    onClick={() => setMessage("What does John 3:16 mean?")}
                  >
                    "What does John 3:16 mean?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-left"
                    onClick={() => setMessage("How can I grow in my faith?")}
                  >
                    "How can I grow in my faith?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-left"
                    onClick={() => setMessage("Explain the parable of the prodigal son")}
                  >
                    "Explain the parable of the prodigal son"
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {currentConversation?.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
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
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-2xl">
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

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about the Bible..."
                className="flex-1 min-h-[44px] max-h-32 resize-none border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button 
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Verify important spiritual guidance with Scripture and trusted sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 