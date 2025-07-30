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
  Cloud, 
  Package, 
  Zap,
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
  const { user, profile } = useAuth();
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
    if (profile?.display_name) {
      return profile.display_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Friend';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-black">Sign In Required</h2>
              <p className="text-gray-600">
                Please sign in to chat with Bible Aura AI and get personalized biblical insights.
              </p>
            </div>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Sign In to Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showChat) {
    // Welcome screen with clean white theme
    return (
      <div className="min-h-screen bg-white">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Greeting */}
            <div className="mb-12">
              <h1 className="text-2xl text-gray-500 mb-2">
                Hello {getUserName()}!
              </h1>
              <h2 className="text-4xl font-medium text-black">
                How can I assist you today?
              </h2>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => handleSuggestionClick("Help me understand a Bible verse")}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                    <Cloud className="h-6 w-6 text-gray-600 group-hover:text-orange-600" />
                  </div>
                  <h3 className="text-black font-semibold mb-2">Cloud Storage</h3>
                  <p className="text-gray-600 text-sm">Sync your study notes and insights across devices</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white border border-gray-200 hover:border-gray-300 transition-all cursor-pointer group hover:shadow-lg"
                onClick={() => handleSuggestionClick("I need prayer guidance")}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-50 transition-colors">
                    <Package className="h-6 w-6 text-gray-600 group-hover:text-orange-600" />
                  </div>
                  <h3 className="text-black font-semibold mb-2">Integrations</h3>
                  <p className="text-gray-600 text-sm">Connect with your favorite study apps</p>
                </CardContent>
              </Card>

              <Card 
                className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer group"
                onClick={() => handleSuggestionClick("What does Romans 8:28 mean for my daily life?")}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Quick Start</h3>
                  <p className="text-white/90 text-sm">Begin your spiritual journey now</p>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions */}
            <div className="mb-8">
              <p className="text-gray-500 text-sm mb-4">Bible Aura suggestion</p>
              <div 
                className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 cursor-pointer hover:border-orange-300 transition-all group"
                onClick={() => handleSuggestionClick("Bible Aura, what does Romans 8:28 mean for my daily life?")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-black group-hover:text-orange-600 transition-colors">
                      Bible Aura, what does Romans 8:28 mean for my daily life?
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300"
                  >
                    Ask
                  </Button>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Bible Aura"
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 text-black placeholder-gray-400 focus:ring-0 focus:border-0 shadow-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowChat(false);
                setMessages([]);
              }}
              className="text-gray-600 hover:text-orange-600"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-black">Bible Aura AI</h1>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                    ✦
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`p-4 rounded-2xl ${
                  message.role === 'assistant' 
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                }`}>
                  <div className={`whitespace-pre-wrap leading-relaxed ${
                    message.role === 'assistant' ? 'text-black' : 'text-white'
                  }`}>
                    {message.content}
                  </div>
                  
                  <div className={`text-xs mt-3 ${
                    message.role === 'assistant' ? 'text-gray-500' : 'text-white/70'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gray-200 text-gray-600">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm">
                  ✦
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span>Bible Aura AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message Bible Aura"
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 text-black placeholder-gray-400 focus:ring-0 focus:border-0 shadow-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button 
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
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