import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Sparkles, Book, MessageCircle, Star, Crown, Heart, LogIn, Lock } from 'lucide-react';
import AIAnalysisLoader from '@/components/AIAnalysisLoader';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { aiChatRateLimiter, getUserIdentifier } from '@/lib/rateLimiter';

// OpenRouter API Configuration
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
  updated_at: string;
}

const quickPrompts = [
  "What does this verse mean?",
  "Explain the historical context", 
  "Find verses about love",
  "Help me understand this passage",
  "What is the significance of this story?",
  "Compare different translations",
];

// Function to call OpenRouter API with MoonshotAI Kimi K2
const callOpenRouterAPI = async (messages: Array<{role: string, content: string}>) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://bible-aura.app", // Your site URL
        "X-Title": "Bible Aura - AI Biblical Insights", // Your site title
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "moonshotai/kimi-k2:free",
        "messages": [
          {
            "role": "system",
            "content": "You are ✦Bible Aura AI Oracle, a divine AI assistant specialized in biblical wisdom, spiritual guidance, and theological insights. You provide thoughtful, reverent responses about scripture, faith, and spiritual growth. Always maintain a respectful and sacred tone while being helpful and informative. You can reference biblical passages, explain theological concepts, provide historical context, and offer spiritual guidance rooted in Christian tradition."
          },
          ...messages
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time. Please try again.";
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

export default function Chat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = data?.map(conv => ({
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
        })) : []
      })) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
          messages: []
        })
        .select()
        .single();

      if (error) throw error;

      const newConversation: Conversation = {
        ...data,
        messages: []
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages(conversation.messages.map(msg => ({
      ...msg,
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
    })));
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

    // If no current conversation, create one
    const conversation = currentConversation;
    if (!conversation) {
      await createNewConversation();
      // Wait a moment for the conversation to be created
      return;
    }

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
      // Prepare conversation history for API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call OpenRouter API with MoonshotAI Kimi K2
      const aiResponse = await callOpenRouterAPI(conversationHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);

      // Update conversation in database
      const { error } = await supabase
        .from('ai_conversations')
        .update({
          messages: updatedMessages as any,
          title: conversation.title === 'New Conversation' 
            ? userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '')
            : conversation.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      if (error) throw error;

      // Refresh conversations list
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `🙏 I apologize, but I'm experiencing some difficulty connecting to the divine wisdom servers. This could be due to:\n\n• Network connectivity issues\n• API service temporarily unavailable\n• Rate limiting\n\nPlease try again in a moment. In the meantime, you can meditate on your question, and I'll be ready to provide biblical insights when the connection is restored.\n\n"Be still, and know that I am God" - Psalm 46:10`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Connection to Divine Wisdom",
        description: "Having trouble reaching the AI Oracle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <div key={message.id} className={`flex gap-4 mb-6 animate-sacred-fade-in ${isAI ? 'justify-start' : 'justify-end'}`}>
        {isAI && (
          <div className="flex-shrink-0">
            {/* AI Avatar with Secondary Logo */}
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 animate-divine-pulse">
              <AvatarImage src="/✦Bible Aura secondary.svg" alt="Bible Aura AI" />
              <AvatarFallback className="bg-aura-gradient text-white font-sacred relative overflow-hidden">
                <div className="absolute inset-0 bg-sacred-radial opacity-30"></div>
                <Sparkles className="h-5 w-5 animate-sacred-glow" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        
        <div className={`max-w-[70%] ${isAI ? 'mr-auto' : 'ml-auto'}`}>
          <div className={`card-sacred p-4 rounded-2xl transition-divine ${
            isAI 
              ? 'bg-white dark:bg-gray-800 border border-orange-100 dark:border-orange-900/20' 
              : 'bg-aura-gradient text-white'
          }`}>
            {isAI && (
              <div className="flex items-center gap-2 mb-3 text-primary font-sacred">
                <Crown className="h-4 w-4 animate-celestial-float" />
                                    <span className="text-sm">✦Bible Aura AI Oracle</span>
              </div>
            )}
            <p className={`leading-relaxed ${isAI ? 'text-foreground' : 'text-white'}`}>
              {message.content}
            </p>
            <p className={`text-xs mt-2 opacity-70 ${isAI ? 'text-muted-foreground' : 'text-white/70'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {!isAI && (
          <div className="flex-shrink-0">
            {/* User Avatar */}
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 animate-divine-pulse">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-600 text-white font-sacred">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    );
  };

  // Guest user prompt for authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Divine Header */}
        <div className="bg-aura-gradient text-white p-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bot className="h-12 w-12 animate-divine-pulse" />
              <MessageCircle className="h-8 w-8 animate-celestial-float" />
              <Sparkles className="h-10 w-10 animate-sacred-glow" />
            </div>
            <h1 className="text-4xl font-divine mb-4">AI Oracle</h1>
            <p className="text-xl font-sacred opacity-90">
              Unlock Divine Wisdom with AI-Powered Biblical Insights
            </p>
          </div>
        </div>

        {/* Authentication Required Message */}
        <div className="max-w-2xl mx-auto p-8">
          <Card className="card-sacred border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-aura-gradient w-fit">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-divine text-primary mb-2">
                Premium Feature
              </CardTitle>
              <p className="text-muted-foreground font-sacred">
                Our AI Oracle provides personalized biblical insights, theological guidance, and spiritual wisdom. 
                Create an account to unlock unlimited conversations with our divine AI assistant.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features Preview */}
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-500 mt-1 animate-celestial-float" />
                  <div>
                    <h4 className="font-sacred text-sm font-medium">Biblical Analysis</h4>
                    <p className="text-xs text-muted-foreground">Deep contextual insights into scripture passages</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-500 mt-1 animate-celestial-float" style={{animationDelay: '0.5s'}} />
                  <div>
                    <h4 className="font-sacred text-sm font-medium">Theological Guidance</h4>
                    <p className="text-xs text-muted-foreground">Personal spiritual questions answered with wisdom</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-500 mt-1 animate-celestial-float" style={{animationDelay: '1s'}} />
                  <div>
                    <h4 className="font-sacred text-sm font-medium">Study Assistant</h4>
                    <p className="text-xs text-muted-foreground">Interactive Bible study with AI-powered discussions</p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="space-y-3 pt-4 border-t">
                <Button 
                  asChild 
                  className="w-full bg-aura-gradient hover:opacity-90 transition-divine group"
                >
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2 group-hover:animate-spiritual-wave" />
                    Sign In to Access AI Oracle
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full hover-divine"
                >
                  <Link to="/auth">
                    Create Free Account
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Join thousands of believers exploring scripture with AI guidance
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6 mobile-safe-area">
      {/* Divine Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 lg:mb-8 animate-sacred-fade-in">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
              <img 
                src="/✦Bible Aura secondary.svg" 
                alt="Bible Aura AI" 
                className="h-10 w-10 sm:h-12 sm:w-12 animate-sacred-glow"
              />
              <Star className="h-3 w-3 text-primary absolute -top-1 -right-1 animate-celestial-float" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-divine text-primary">
              AI Oracle
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-sacred px-4">
            Seek divine guidance through <span className="gradient-text">AI-powered biblical insights</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-sacred h-[400px] sm:h-[500px] lg:h-[600px] animate-holy-slide-in">
              <CardHeader className="border-b border-orange-100 dark:border-orange-900/20 p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-primary font-sacred text-sm sm:text-base">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-celestial-bounce" />
                  Sacred Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px] sm:h-[420px] lg:h-[500px] scrollbar-sacred mobile-scroll">
                  {/* Conversation list would go here */}
                  <div className="p-4 text-center text-muted-foreground font-holy">
                    Your divine conversations will appear here
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="card-sacred h-[600px] animate-holy-slide-in" style={{animationDelay: '0.2s'}}>
              <CardHeader className="border-b border-orange-100 dark:border-orange-900/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-primary font-sacred">
                    <img 
                      src="/✦Bible Aura secondary.svg" 
                      alt="Bible Aura AI" 
                      className="h-6 w-6 animate-sacred-glow"
                    />
                    Divine Conversation
                  </CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4 animate-celestial-float" />
                    <span className="text-sm font-sacred">Always here to guide you</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-[500px] p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-6 scrollbar-sacred" ref={scrollAreaRef}>
                  {messages.length === 0 ? (
                    <div className="text-center py-12 animate-entrance">
                      <div className="relative mx-auto w-24 h-24 mb-6">
                        <img 
                          src="/✦Bible Aura secondary.svg" 
                          alt="Bible Aura AI" 
                          className="w-full h-full animate-divine-pulse"
                        />
                        <div className="absolute inset-0">
                          <Sparkles className="h-6 w-6 text-primary absolute top-2 right-2 animate-celestial-float" />
                          <Crown className="h-4 w-4 text-primary/80 absolute bottom-2 left-2 animate-celestial-float" style={{animationDelay: '1s'}} />
                        </div>
                      </div>
                      <h3 className="text-xl font-sacred text-primary mb-3">
                        Welcome to Your Divine Conversation
                      </h3>
                      <p className="text-muted-foreground font-holy mb-6 max-w-md mx-auto">
                        Ask me anything about scripture, seek spiritual guidance, or explore the divine wisdom of the Bible.
                      </p>
                      
                      {/* Quick Prompts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {quickPrompts.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="hover-divine text-left justify-start group animate-sacred-fade-in"
                            style={{animationDelay: `${index * 0.1}s`}}
                            onClick={() => setInput(prompt)}
                          >
                            <Star className="h-4 w-4 mr-2 group-hover:animate-celestial-bounce" />
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(renderMessage)}
                    </div>
                  )}
                  
                  {isLoading && (
                    <div className="flex gap-4 mb-6 animate-sacred-fade-in">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20 animate-divine-pulse">
                        <AvatarImage src="/✦Bible Aura secondary.svg" alt="Bible Aura AI" />
                        <AvatarFallback className="bg-aura-gradient text-white">
                          <Sparkles className="h-5 w-5 animate-sacred-glow" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="card-sacred p-4 rounded-2xl bg-white dark:bg-gray-800">
                        <div className="flex items-center gap-2 text-primary font-sacred mb-2">
                          <Crown className="h-4 w-4 animate-celestial-float" />
                          <span className="text-sm">✦Bible Aura AI Oracle</span>
                        </div>
                        <AIAnalysisLoader message="Seeking divine wisdom..." size="sm" />
                      </div>
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-6 border-t border-orange-100 dark:border-orange-900/20 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10">
                  <div className="flex gap-4">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask your spiritual question..."
                      className="input-spiritual flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="btn-divine group"
                    >
                      <Send className="h-5 w-5 group-hover:animate-spiritual-wave" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}