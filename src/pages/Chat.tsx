import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Book, MessageCircle, LogIn, Languages, BookOpen, X, StopCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { aiChatRateLimiter, getUserIdentifier } from '@/lib/enhancedRateLimiter';
import { 
  AI_CONFIG, 
  type SupportedLanguage
} from '@/lib/ai-bible-system';
import { PageLayout } from '@/components/PageLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}



// Function to call DeepSeek Direct API with enhanced biblical focus
const callBiblicalAI = async (messages: Array<{role: 'user' | 'assistant', content: string}>, abortController?: AbortController) => {
  try {
    console.log('🤖 Calling Biblical AI:', {
      model: AI_CONFIG.model,
      baseURL: AI_CONFIG.baseURL,
      hasApiKey: !!AI_CONFIG.apiKey,
      messageCount: messages.length
    });

    // Enhanced request with timeout and retry logic
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Bible-Aura/1.0',
        'Accept': 'application/json',
        'HTTP-Referer': 'https://bible-aura.app',
        'X-Title': '✦Bible Aura - AI Chat'
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: "You are Bible Aura AI, a specialized biblical assistant with comprehensive knowledge of Scripture. You MUST base ALL responses exclusively on biblical truth and passages. Always cite specific Bible verses with book, chapter, and verse references. Provide practical spiritual application rooted in Scripture."
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response structure');
    }

    return {
      content: data.choices[0].message.content,
      model: data.model || AI_CONFIG.model
    };

  } catch (error: any) {
    console.error('❌ Biblical AI Error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error(`Unable to connect: ${error.message}`);
  }
};

// Helper function to limit conversation to last 10 messages for performance
const limitMessagesToLast10 = (messages: Message[]): Message[] => {
  return messages.slice(-10);
};

export default function Chat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const layoutConfig = useResponsiveLayout();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('english');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);



  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Stop message function for aborting AI responses
  const stopMessage = () => {
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

    // Check rate limits
    const userIdentifier = getUserIdentifier(user?.id);
    const rateLimitCheck = aiChatRateLimiter.checkLimit(userIdentifier);
    
    if (!rateLimitCheck.allowed) {
      const resetTime = new Date(rateLimitCheck.resetTime!);
      const remainingMinutes = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 60000);
      
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} before sending another message.`,
        variant: "destructive",
      });
      return;
    }

    // Create AbortController for this request
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

        try {
      // Regular conversation - simplified approach
      const fullHistory = [...messages, userMessage];
      const limitedHistory = limitMessagesToLast10(fullHistory);
      const conversationHistory = limitedHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      console.log(`🧠 Sending ${conversationHistory.length} messages to AI (limited from ${fullHistory.length} total)`);

      // Call biblical AI with optimized conversation history
      const aiResponse = await callBiblicalAI(conversationHistory, abortControllerRef.current);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        model: aiResponse.model
      };

      // Update messages in state
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `I apologize, but I'm experiencing some difficulty connecting to provide biblical insights. This could be due to:\n\n• Network connectivity issues\n• AI service temporarily unavailable\n• Rate limiting\n\nPlease try again in a moment. In the meantime, you can reflect on your question, and I'll be ready to provide biblical wisdom when the connection is restored.\n\n"Be still, and know that I am God" - Psalm 46:10`,
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
      sendMessage();
    }
  };

  const useQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const renderMessage = (message: Message) => {
    const isAI = message.role === 'assistant';
    
    return (
      <div key={message.id} className={`flex gap-4 mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
        {isAI && (
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="✦ Bible Aura AI" />
              <AvatarFallback className="bg-transparent border-0">
                <span className="text-orange-500 text-lg font-bold">✦</span>
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className={`max-w-[80%] ${isAI ? 'mr-auto' : 'ml-auto'}`}>
          <div className={`p-4 rounded-2xl ${
            isAI 
              ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              : 'bg-primary text-white'
          }`}>
            {/* Regular Message Content */}
            <div className="prose prose-sm max-w-none">
              <div className={`whitespace-pre-wrap leading-relaxed ${
                isAI 
                  ? 'text-gray-800 dark:text-gray-200' 
                  : 'text-white'
              }`}>
                {message.content}
              </div>
            </div>
            
            <div className={`text-xs mt-3 flex justify-between items-center ${
              isAI 
                ? 'text-gray-500 dark:text-gray-400' 
                : 'text-white/70'
            }`}>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              {isAI && message.model && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {message.model}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!isAI && (
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <MessageCircle className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold text-primary">Bible Aura AI</h1>
          <p className="text-muted-foreground text-lg">
            Discover biblical wisdom through scriptural insights
          </p>
          <p className="text-sm text-muted-foreground">
            Please sign in to start your biblical conversation
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Link to="/auth">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout padding="none" maxWidth="full">
      <>
    <div className="h-full bg-background flex flex-col w-full">
      <UnifiedHeader
        icon={MessageCircle}
        title="✦ Bible Aura AI"
        subtitle="Ask me anything about Scripture"
      >
        <Select value={selectedLanguage} onValueChange={(value: SupportedLanguage) => setSelectedLanguage(value)}>
          <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="tamil">Tamil</SelectItem>
            <SelectItem value="sinhala">Sinhala</SelectItem>
          </SelectContent>
        </Select>
      </UnifiedHeader>

      <div className="flex-1 flex overflow-hidden w-full">


        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <div className="flex flex-col h-full w-full">


            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 w-full" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg">
                      <span className="text-2xl font-bold text-primary">✦</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    ✦ Bible Aura AI
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    Ask me anything about Scripture
                  </p>
                  
                  {/* Quick Bible Verse Examples */}
                  <div className="w-full space-y-3 mb-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Try asking about specific Bible verses for detailed explanations:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickPrompt("John 3:16")}
                        className="text-left justify-start h-auto p-2 sm:p-3 text-xs sm:text-sm"
                      >
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium">John 3:16</div>
                          <div className="text-xs text-muted-foreground">God's love for the world</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickPrompt("Psalm 23:1")}
                        className="text-left justify-start h-auto p-3"
                      >
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Psalm 23:1</div>
                          <div className="text-xs text-muted-foreground">The Lord is my shepherd</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickPrompt("Romans 8:28")}
                        className="text-left justify-start h-auto p-3"
                      >
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Romans 8:28</div>
                          <div className="text-xs text-muted-foreground">All things work together</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useQuickPrompt("Philippians 4:13")}
                        className="text-left justify-start h-auto p-3"
                      >
                        <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Philippians 4:13</div>
                          <div className="text-xs text-muted-foreground">I can do all things</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    You can also ask general biblical questions or request explanations in English, Tamil, or Sinhala.
                  </p>
                </div>
                              ) : (
                <div className="space-y-4 w-full">
                  {messages.map(renderMessage)}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt="Bible Aura AI" />
                          <AvatarFallback className="bg-transparent border-0">
                            <span className="text-orange-500 text-lg font-bold">✦</span>
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-muted-foreground">Generating response...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3 sm:p-4 bg-gray-50 flex-shrink-0">
              <div className="flex gap-2 w-full">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your biblical question..."
                  disabled={isLoading}
                  className="flex-1 bg-white min-w-0 text-sm sm:text-base"
                />
                <Button
                  onClick={isLoading ? stopMessage : sendMessage}
                  disabled={!isLoading && !input.trim()}
                  className={`flex-shrink-0 p-3 sm:p-4 text-sm sm:text-base ${
                    isLoading 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <StopCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Stop</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </>
    </PageLayout>
  );
}