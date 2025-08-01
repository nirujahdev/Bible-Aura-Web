import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X,
  Send,
  BookOpen,
  Clock,
  Link,
  Lightbulb,
  Loader2,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generateSystemPrompt } from '@/lib/ai-response-templates';

interface BibleAIChatProps {
  verseId: string;
  verseText: string;
  verseReference: string;
  isOpen: boolean;
  onClose: () => void;
}

type ChatMode = 'theological' | 'historical' | 'cross-reference' | 'insights';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  mode: ChatMode;
}

const CHAT_MODES = [
  {
    id: 'theological' as ChatMode,
    name: 'Theological',
    icon: BookOpen,
    description: 'Explore theological meanings and doctrines',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'historical' as ChatMode,
    name: 'Historical',
    icon: Clock,
    description: 'Understand historical context and background',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'cross-reference' as ChatMode,
    name: 'Cross Reference',
    icon: Link,
    description: 'Find related verses and connections',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 'insights' as ChatMode,
    name: 'Insights',
    icon: Lightbulb,
    description: 'Get practical insights and applications',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
];

// Enhanced AI response function with proper structure
const generateAIResponse = async (
  userMessage: string, 
  mode: ChatMode, 
  verseText: string, 
  verseReference: string
): Promise<string> => {
  try {
    // Create system prompt based on mode
    let systemPrompt = '';
    
    switch (mode) {
      case 'theological':
        systemPrompt = `You are Bible Aura AI, providing theological analysis of Bible verses.

CRITICAL FORMATTING RULES:
- ALWAYS start with ✮ for the main title
- Use ↗ for each section header
- Use • for bullet points
- NO emojis like 📖 🎯 ✝️ etc.
- NO hashtags or asterisks
- Each section should be clearly separated with blank lines

EXACT FORMAT TO FOLLOW:
✮ THEOLOGICAL ANALYSIS

↗ Core Doctrine
• [Main theological truth]
• [Key doctrinal point]

↗ Biblical Context  
• [Connection to broader Scripture]
• [Theological significance]

↗ Church Teaching
• [Historical church understanding]
• [Modern application]

Focus on ${verseReference}: "${verseText}"`;
        break;
        
      case 'historical':
        systemPrompt = `You are Bible Aura AI, providing historical context for Bible verses.

CRITICAL FORMATTING RULES:
- ALWAYS start with ✮ for the main title
- Use ↗ for each section header
- Use • for bullet points
- NO emojis, hashtags, or asterisks
- Each section should be clearly separated with blank lines

EXACT FORMAT TO FOLLOW:
✮ HISTORICAL CONTEXT

↗ Time & Place
• [When and where written]
• [Historical setting]

↗ Cultural Background
• [Original audience]
• [Cultural practices]

↗ Author Context
• [Writer's background]
• [Purpose for writing]

Focus on ${verseReference}: "${verseText}"`;
        break;
        
      case 'cross-reference':
        systemPrompt = `You are Bible Aura AI, finding cross-references and connections for Bible verses.

CRITICAL FORMATTING RULES:
- ALWAYS start with ✮ for the main title
- Use ↗ for each section header
- Use • for bullet points
- NO emojis, hashtags, or asterisks
- Each section should be clearly separated with blank lines

EXACT FORMAT TO FOLLOW:
✮ CROSS REFERENCES

↗ Related Verses
• [Verse reference]: [Brief connection]
• [Verse reference]: [Brief connection]

↗ Thematic Connections
• [Common theme]
• [Shared truth]

↗ Biblical Pattern
• [How this fits biblical narrative]
• [God's consistent character]

Provide 3-4 relevant verses with clear connections. Focus on ${verseReference}: "${verseText}"`;
        break;
        
      case 'insights':
        systemPrompt = `You are Bible Aura AI, providing practical insights and applications for Bible verses.

CRITICAL FORMATTING RULES:
- ALWAYS start with ✮ for the main title
- Use ↗ for each section header
- Use • for bullet points
- NO emojis, hashtags, or asterisks
- Each section should be clearly separated with blank lines

EXACT FORMAT TO FOLLOW:
✮ PRACTICAL INSIGHTS

↗ Life Application
• [Practical way to apply this]
• [Daily life connection]

↗ Spiritual Growth
• [How this builds faith]
• [Character development]

↗ Action Steps
• [Specific thing to do]
• [Way to live this out]

Make it practical, encouraging, and actionable. Focus on ${verseReference}: "${verseText}"`;
        break;
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-6251eb1f9fb8476cb2aba1431ab3c114',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userMessage
          }
        ],
        max_tokens: 400,
        temperature: 0.6,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || 'Sorry, I could not generate a response at this time.';
    
    // Clean and ensure proper formatting
    content = cleanAIResponse(content, mode);
    
    return content;
    
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback structured responses
    return getFallbackResponse(mode, verseReference, verseText);
  }
};

// Function to clean and format AI responses
const cleanAIResponse = (response: string, mode: ChatMode): string => {
  // Remove any unwanted characters and ensure proper structure
  let cleaned = response
    .replace(/[#*@$_]/g, '') // Remove banned symbols
    .replace(/📖|🎯|✝️|🔗|🏛️|📝|💭|🌟|🔍|⏰|💎|📚|👥|🌍/g, '') // Remove emojis
    .trim();
  
  // Ensure it starts with ✮ if not already
  if (!cleaned.startsWith('✮')) {
    const modeTitle = {
      theological: '✮ THEOLOGICAL ANALYSIS',
      historical: '✮ HISTORICAL CONTEXT',
      'cross-reference': '✮ CROSS REFERENCES',
      insights: '✮ PRACTICAL INSIGHTS'
    };
    cleaned = `${modeTitle[mode]}\n\n${cleaned}`;
  }
  
  return cleaned;
};

// Fallback responses with proper structure
const getFallbackResponse = (mode: ChatMode, verseReference: string, verseText: string): string => {
  const responses: Record<ChatMode, string> = {
    theological: `✮ THEOLOGICAL ANALYSIS

↗ Core Doctrine
• This verse reveals God's character and His relationship with humanity
• Central to understanding biblical truth about faith and salvation

↗ Biblical Context
• Connects to the broader theme of God's redemptive plan
• Shows consistency with Old and New Testament teachings

↗ Church Teaching
• Historically understood as foundational to Christian doctrine
• Applied by believers throughout church history for spiritual growth`,

    historical: `✮ HISTORICAL CONTEXT

↗ Time & Place
• Written in the ancient Near Eastern context
• Reflects the culture and customs of biblical times

↗ Cultural Background
• Original audience would have understood specific cultural references
• Historical setting influences the meaning and application

↗ Author Context
• Written by the inspired biblical author for specific purposes
• Addresses real situations and needs of the original readers`,

    'cross-reference': `✮ CROSS REFERENCES

↗ Related Verses
• John 3:16: Shows God's love and salvation plan
• Romans 8:28: Demonstrates God's sovereignty and goodness
• Philippians 4:13: Reveals strength available through Christ

↗ Thematic Connections
• Connects to themes of faith, hope, and love throughout Scripture
• Part of God's consistent character revealed in His Word

↗ Biblical Pattern
• Fits into the larger narrative of God's redemptive story
• Shows how God works consistently throughout biblical history`,

    insights: `✮ PRACTICAL INSIGHTS

↗ Life Application
• Apply this truth to your daily decisions and relationships
• Let this verse guide your perspective on current challenges

↗ Spiritual Growth
• Use this passage for prayer and meditation
• Allow God's Word to transform your heart and mind

↗ Action Steps
• Memorize this verse for encouragement in difficult times
• Share this truth with others who need encouragement`
  };

  return responses[mode];
};

export function BibleAIChat({ verseId, verseText, verseReference, isOpen, onClose }: BibleAIChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState<ChatMode>('theological');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when mode changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeMode]);

  // Initialize with a welcome message when verse changes
  useEffect(() => {
    if (isOpen && verseReference) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        type: 'ai',
        content: `✦ Welcome! I'm here to help you explore **${verseReference}**: "${verseText}"\n\nChoose a mode below and ask me anything about this verse!`,
        timestamp: new Date().toISOString(),
        mode: activeMode
      };
      setMessages([welcomeMessage]);
    }
  }, [verseReference, isOpen]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat with AI about Bible verses",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString(),
      mode: activeMode
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userInput, activeMode, verseText, verseReference);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        mode: activeMode
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModeChange = (mode: ChatMode) => {
    setActiveMode(mode);
    
    // Add a mode change message
    const modeChangeMessage: ChatMessage = {
      id: `mode-${Date.now()}`,
      type: 'ai',
      content: `✦ Switched to **${CHAT_MODES.find(m => m.id === mode)?.name}** mode. ${CHAT_MODES.find(m => m.id === mode)?.description}`,
      timestamp: new Date().toISOString(),
      mode: mode
    };
    
    setMessages(prev => [...prev, modeChangeMessage]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-lg font-bold">✦</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bible AI Chat</h3>
            <p className="text-xs text-gray-600">{verseReference}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span className="text-sm">✦ Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Mode Selector - Now positioned above the input */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <Tabs value={activeMode} onValueChange={(value) => handleModeChange(value as ChatMode)}>
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            {CHAT_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="flex flex-col items-center gap-1 p-2 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <Icon className="h-3 w-3" />
                  <span>{mode.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1 mt-1">
            {CHAT_MODES.slice(2).map((mode) => {
              const Icon = mode.icon;
              return (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="flex flex-col items-center gap-1 p-2 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <Icon className="h-3 w-3" />
                  <span>{mode.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${verseReference} in ${CHAT_MODES.find(m => m.id === activeMode)?.name.toLowerCase()} context...`}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 