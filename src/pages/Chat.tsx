import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, MessageCircle, LogIn, StopCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';

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

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      
      toast({
        title: "Message Stopped",
        description: "AI response has been cancelled.",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
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

  const clearConversation = () => {
    setMessages([]);
    if (user) {
      supabase.from('ai_conversations').delete().eq('user_id', user.id);
    }
    toast({
      title: "Conversation Cleared",
      description: "Chat history has been cleared.",
    });
  };

  if (!user) {
    return (
      <PageLayout>
        <UnifiedHeader 
          icon={MessageCircle}
          title="Bible AI Chat"
          subtitle="Ask questions about Scripture and get biblical insights"
        />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center gap-2 justify-center">
                <LogIn className="h-5 w-5" />
                Sign In Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Please sign in to chat with Bible Aura AI and get personalized biblical insights.
              </p>
              <Link to="/auth">
                <Button className="w-full">
                  Sign In to Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout padding="none" maxWidth="full">
      <UnifiedHeader 
        icon={MessageCircle}
        title="Bible AI Chat"
        subtitle="Ask questions about Scripture and get biblical insights"
      />
      
      <div className="w-full px-4 py-8 min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  ✦ Bible Aura AI
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearConversation}
                    disabled={messages.length === 0}
                  >
                    Clear Chat
                  </Button>
                  {isLoading && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={stopGeneration}
                    >
                      <StopCircle className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Welcome to Bible Aura AI!</h3>
                    <p>Ask me anything about Scripture, theology, or biblical wisdom.</p>
                    <p className="text-sm mt-2">Try: "What does John 3:16 mean?" or "How can I grow in faith?"</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="" alt="✦ Bible Aura AI" />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          ✦
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                      <div className={`p-4 rounded-2xl ${
                        message.role === 'assistant' 
                          ? 'bg-white border border-gray-200'
                          : 'bg-primary text-white'
                      }`}>
                        <div className={`whitespace-pre-wrap leading-relaxed ${
                          message.role === 'assistant' 
                            ? 'text-gray-800' 
                            : 'text-white'
                        }`}>
                          {message.content}
                        </div>
                        
                        <div className={`text-xs mt-3 flex justify-between items-center ${
                          message.role === 'assistant' 
                            ? 'text-gray-500' 
                            : 'text-white/70'
                        }`}>
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.role === 'assistant' && message.model && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {message.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gray-500 text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        ✦
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Bible Aura AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex-shrink-0 p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask your biblical question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
    </PageLayout>
  );
}