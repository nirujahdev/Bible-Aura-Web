import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, BookOpen, PenTool, Send, Plus, Menu, Settings, LogOut,
  Sparkles, User, Bot, MoreVertical, Trash2, Edit3, History, Heart,
  Library, Music, Brain, Home, FileText
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
      title: 'Explain John 3:14 in simple words',
      messages: [
        {
          id: '1',
          role: 'user',
          content: 'Explain John 3:14 in simple words',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          role: 'assistant',
          content: `1. "And as Moses lifted up the serpent in the wilderness, even so must the Son of Man be lifted up." (John 3:14)

2. Historical context:
   - Refers to Numbers 21:4-9 when Israelites were bitten by snakes
   - Moses made a bronze snake on a pole to heal them
   - Jesus compares this to His coming crucifixion

3. Theological meaning:
   - Jesus would be "lifted up" on the cross
   - Just looking at the bronze snake brought healing
   - Similarly, believing in Christ brings salvation

4. Practical application:
   - Our salvation comes by looking to Jesus
   - No complicated rituals - simple faith is enough`,
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
            title: conv.messages.length === 0 ? message.slice(0, 30) + '...' : conv.title
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

  // Navigation items with correct paths
  const navigationItems = [
    { icon: MessageCircle, path: '/dashboard', label: 'Chat', isActive: true },
    { icon: BookOpen, path: '/bible', label: 'Bible' },
    { icon: Library, path: '/study-hub', label: 'Study Hub' },
    { icon: FileText, path: '/journal', label: 'Journal' },
    { icon: PenTool, path: '/sermons', label: 'Sermons' },
    { icon: Music, path: '/songs', label: 'Songs' },
    { icon: Heart, path: '/favorites', label: 'Favorites' }
  ];

  // Sidebar content with white theme and orange icons
  const SidebarContent = () => (
    <div className="flex h-full bg-white">
      {/* Left icon bar - White background with orange icons */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col space-y-2 px-2">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                item.isActive 
                  ? 'bg-orange-50 text-orange-600 shadow-md' 
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600 hover:shadow-sm'
              }`}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>

        <div className="p-2 space-y-2 border-t border-gray-100">
          <Link 
            to="/profile"
            className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
          
          <Avatar className="w-12 h-12 rounded-lg border-2 border-orange-100">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-orange-500 text-white text-sm rounded-lg">
              {getUserName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Chat History Panel - Light gray background */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
            <Button 
              onClick={createNewConversation}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8 p-0 rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={createNewConversation}
            variant="outline" 
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
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
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                      <DropdownMenuItem 
                        onClick={() => deleteConversation(conv.id)}
                        className="text-gray-700 hover:bg-gray-50"
                      >
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80">
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
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">Bible Aura AI</div>
              <div className="text-xs text-gray-600">Your Biblical Study Assistant</div>
            </div>
          </div>
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-orange-500 text-white text-sm">
              {getUserName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">✦</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">Bible Aura AI</div>
              <div className="text-sm text-gray-600">Your Biblical Study Assistant</div>
            </div>
          </div>
          
          <Button 
            onClick={createNewConversation}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentConversation?.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hello {getUserName()}!
                </h2>
                <p className="text-gray-600 mb-6">
                  How can I assist you today?
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-left border-orange-200 text-gray-700 hover:bg-orange-50"
                    onClick={() => setMessage("What does John 3:16 mean?")}
                  >
                    "What does John 3:16 mean?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-left border-orange-200 text-gray-700 hover:bg-orange-50"
                    onClick={() => setMessage("How can I grow in my faith?")}
                  >
                    "How can I grow in my faith?"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-left border-orange-200 text-gray-700 hover:bg-orange-50"
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
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-sm font-bold">✦</span>
                    </div>
                  )}
                  
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-orange-500 text-white rounded-br-md' 
                        : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
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
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">✦</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl rounded-bl-md border border-gray-100">
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
              <div className="flex-1 relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about the Bible..."
                  className="min-h-[44px] max-h-32 resize-none border-gray-200 focus:border-orange-500 focus:ring-orange-500 pr-12"
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
                  className="absolute right-2 bottom-2 bg-orange-500 hover:bg-orange-600 h-8 w-8 p-0 rounded-lg shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
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