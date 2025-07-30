import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  LogIn, 
  Cloud, 
  Package, 
  Zap,
  Home,
  Grid3X3,
  HelpCircle,
  Settings,
  Paperclip,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

// Simple, working AI function using OpenRouter
const callBiblicalAI = async (messages: Array<{role: 'user' | 'assistant', content: string}>, abortController?: AbortController) => {
  try {
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-50e2e8a01cc440c3bf61641eee6aa2a6',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://bible-aura.app',
        'X-Title': '✦Bible Aura - AI Chat'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: "system",
            content: "You are Bible Aura AI, a specialized biblical assistant with comprehensive knowledge of Scripture. You MUST base ALL responses exclusively on biblical truth and passages. Always cite specific Bible verses with book, chapter, and verse references. Provide practical spiritual application rooted in Scripture. Be encouraging, wise, and helpful."
          },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
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

    return {
      content: data.choices[0].message.content,
      model: data.model || 'deepseek/deepseek-r1'
    };

  } catch (error: any) {
    console.error('Biblical AI Error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error(`Connection failed: ${error.message}`);
  }
};

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Load conversation history from Supabase
  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user]);

  const loadConversationHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages as unknown as Message[]);
        if (data.messages.length > 0) {
          setShowChat(true);
        }
      }
    } catch (error) {
      console.log('No previous conversation found');
    }
  };

  const saveConversation = async (updatedMessages: Message[]) => {
    if (!user || updatedMessages.length === 0) return;

    try {
      await supabase
        .from('ai_conversations')
        .upsert({
          user_id: user.id,
          messages: updatedMessages as any,
          title: updatedMessages[0]?.content.substring(0, 50) || 'Bible Chat',
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input;
    if (!messageToSend.trim() || !user) return;

    setShowChat(true);
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

      const aiResponse = await callBiblicalAI(conversationHistory, abortControllerRef.current);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        sendMessage();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
            <p className="text-gray-400">
              Please sign in to chat with Bible Aura AI and get personalized biblical insights.
            </p>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Sign In to Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showChat) {
    // Welcome screen with modern dark design
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={() => setShowChat(false)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-600 text-white text-sm">
              {getUserName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Main Content */}
        <div className="ml-16 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Greeting */}
            <div className="mb-12">
              <h1 className="text-3xl font-light text-gray-300 mb-2">
                Hello {getUserName()}!
              </h1>
              <h2 className="text-4xl font-semibold text-white">
                How can I assist you today?
              </h2>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card 
                className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all cursor-pointer group"
                onClick={() => handleSuggestionClick("Help me understand a Bible verse")}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                    <Cloud className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Scripture Study</h3>
                  <p className="text-gray-400 text-sm">Get biblical insights and verse explanations</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all cursor-pointer group"
                onClick={() => handleSuggestionClick("I need prayer guidance")}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Prayer & Worship</h3>
                  <p className="text-gray-400 text-sm">Find guidance for your spiritual journey</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Quick Start</h3>
                  <p className="text-white/80 text-sm">Begin your conversation now</p>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <div className="mb-8">
              <p className="text-gray-400 text-sm mb-4">Bible Aura suggestion</p>
              <div 
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4 cursor-pointer hover:border-purple-400/50 transition-all group"
                onClick={() => handleSuggestionClick("What has been the weather forecast for August 23rd in the past 10 years?")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white group-hover:text-purple-200 transition-colors">
                      Bible Aura, what does Romans 8:28 mean for my daily life?
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Ask
                  </Button>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Bible Aura"
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 focus:border-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => {
            setShowChat(false);
            setMessages([]);
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Home className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Grid3X3 className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gray-600 text-white text-sm">
            {getUserName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Chat Area */}
      <div className="ml-16 flex flex-col h-screen">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                      ✦
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'assistant' 
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-white">
                      {message.content}
                    </div>
                    
                    <div className="text-xs mt-3 text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                    ✦
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                    <span>Bible Aura AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Bible Aura"
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 focus:border-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}