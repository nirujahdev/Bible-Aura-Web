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
import { StructuredAIResponse } from './StructuredAIResponse';

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

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
- Start with ➤ followed by title
- Put TWO line breaks after the title
- Each section starts with ⤷ followed by section name
- Put ONE line break after section header
- Each point starts with text content (no bullet symbols)
- Put ONE line break after each point
- Put TWO line breaks between sections
- NO emojis, asterisks, hashes, or decorative symbols
- ONLY use ➤ and ⤷ symbols

EXACT FORMAT (copy this structure):
➤ THEOLOGICAL ANALYSIS

⤷ Core Doctrine
First theological point about the verse
Second theological point about the verse

⤷ Biblical Context
How this connects to broader Scripture
The theological significance in biblical narrative

⤷ Church Teaching
Historical church understanding
Modern application for believers

Focus on ${verseReference}: "${verseText}"
IMPORTANT: Follow the exact line break pattern shown above.`;
        break;
        
      case 'historical':
        systemPrompt = `You are Bible Aura AI, providing historical context for Bible verses.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
- Start with ➤ followed by title
- Put TWO line breaks after the title
- Each section starts with ⤷ followed by section name
- Put ONE line break after section header
- Each point starts with text content (no bullet symbols)
- Put ONE line break after each point
- Put TWO line breaks between sections
- NO emojis, asterisks, hashes, or decorative symbols
- ONLY use ➤ and ⤷ symbols

EXACT FORMAT (copy this structure):
➤ HISTORICAL CONTEXT

⤷ Time Period
When this was written or occurred
Historical setting and circumstances

⤷ Cultural Background
Social customs and practices of the time
How the original audience would understand this

⤷ Author Context
Who wrote this and to whom
The author's purpose and message

Focus on ${verseReference}: "${verseText}"
IMPORTANT: Follow the exact line break pattern shown above.`;
        break;
        
      case 'cross-reference':
        systemPrompt = `You are Bible Aura AI, providing cross-references for Bible verses.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
- Start with ➤ followed by title
- Put TWO line breaks after the title
- Each section starts with ⤷ followed by section name
- Put ONE line break after section header
- Each point starts with text content (no bullet symbols)
- Put ONE line break after each point
- Put TWO line breaks between sections
- NO emojis, asterisks, hashes, or decorative symbols
- ONLY use ➤ and ⤷ symbols

EXACT FORMAT (copy this structure):
➤ CROSS REFERENCES

⤷ Related Verses
[Verse reference] - Connection to main theme
[Verse reference] - Similar teaching or principle

⤷ Parallel Passages
[Verse reference] - Same concept in different words
[Verse reference] - Related story or example

⤷ Supporting Scriptures
[Verse reference] - Additional biblical support
[Verse reference] - Broader theological connection

Focus on ${verseReference}: "${verseText}"
IMPORTANT: Follow the exact line break pattern shown above.`;
        break;
        
      case 'insights':
        systemPrompt = `You are Bible Aura AI, providing practical insights from Bible verses.

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:
- Start with ➤ followed by title
- Put TWO line breaks after the title
- Each section starts with ⤷ followed by section name
- Put ONE line break after section header
- Each point starts with text content (no bullet symbols)
- Put ONE line break after each point
- Put TWO line breaks between sections
- NO emojis, asterisks, hashes, or decorative symbols
- ONLY use ➤ and ⤷ symbols

EXACT FORMAT (copy this structure):
➤ PRACTICAL INSIGHTS

⤷ Key Message
Main spiritual truth from this verse
Central principle for Christian living

⤷ Personal Application
How to apply this in daily life
Practical steps for spiritual growth

⤷ Prayer Focus
Areas for personal reflection
How this verse guides prayer life

Focus on ${verseReference}: "${verseText}"
IMPORTANT: Follow the exact line break pattern shown above.`;
        break;
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY}`,
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
  // Remove any unwanted characters
  let cleaned = response
    .replace(/[#*@$_]/g, '') // Remove banned symbols
    .replace(/📖|🎯|✝️|🔗|🏛️|📝|💭|🌟|🔍|⏰|💎|📚|👥|🌍/g, '') // Remove emojis
    .replace(/\*\*[^*]+\*\*/g, '') // Remove ** decorative formatting
    .trim();
  
  // Fix spacing and line breaks for proper structure
  cleaned = cleaned
    // Ensure proper spacing around main title
    .replace(/➤\s*/g, '➤ ')
    // Ensure section headers are on new lines with proper spacing
    .replace(/\s*⤷\s*/g, '\n\n⤷ ')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Ensure sections are properly separated
    .replace(/⤷([^⤷➤]*?)⤷/g, '⤷$1\n\n⤷')
    .trim();
  
  // Ensure it starts with ➤ if not already
  if (!cleaned.startsWith('➤')) {
    const modeTitle = {
      theological: '➤ THEOLOGICAL ANALYSIS',
      historical: '➤ HISTORICAL CONTEXT',
      'cross-reference': '➤ CROSS REFERENCES',
      insights: '➤ PRACTICAL INSIGHTS'
    };
    cleaned = `${modeTitle[mode]}\n\n${cleaned}`;
  }
  
  // Final cleanup to ensure consistent formatting
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/➤([^\n]*)\n/g, '➤$1\n\n')
    .replace(/⤷([^\n]*)\n/g, '⤷$1\n');
  
  return cleaned;
};

// Fallback responses with proper structure
const getFallbackResponse = (mode: ChatMode, verseReference: string, verseText: string): string => {
  const fallbacks = {
    theological: `➤ THEOLOGICAL ANALYSIS

⤷ Core Doctrine
This verse reveals fundamental truths about God's character and His relationship with humanity
Scripture teaches us about divine attributes and spiritual principles for believers

⤷ Biblical Context
This passage connects to the broader narrative of God's redemptive plan
The theological significance emphasizes God's faithfulness and love

⤷ Church Teaching
Christian tradition has understood this verse as foundational to faith
Modern believers can apply these truths in contemporary spiritual life`,

    historical: `➤ HISTORICAL CONTEXT

⤷ Time Period
This verse was written during a significant period in biblical history
The historical setting provides important background for understanding the message

⤷ Cultural Background
The original audience would have understood specific cultural references
Social customs of the time illuminate the meaning of the text

⤷ Author Context
The biblical author wrote with specific purposes and audiences in mind
Understanding the writer's context enhances our interpretation`,

    'cross-reference': `➤ CROSS REFERENCES

⤷ Related Verses
Similar themes appear throughout Scripture in various contexts
Other biblical passages support and expand on this teaching

⤷ Parallel Passages
Comparable stories and teachings reinforce the main message
Different biblical books contain related spiritual principles

⤷ Supporting Scriptures
Additional verses provide theological foundation for this truth
The broader biblical witness confirms these spiritual insights`,

    insights: `➤ PRACTICAL INSIGHTS

⤷ Key Message
This verse contains timeless truth applicable to Christian living
The spiritual principle guides believers in faith and practice

⤷ Personal Application
Christians can apply this teaching in daily life and relationships
Practical steps help believers grow in spiritual maturity

⤷ Prayer Focus
This verse provides direction for personal prayer and reflection
Meditation on this truth deepens our relationship with God`
  };

  return fallbacks[mode];
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
        content: `<span className="text-orange-500">✦</span> Welcome! I'm here to help you explore **${verseReference}**: "${verseText}"\n\nChoose a mode below and ask me anything about this verse!`,
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
    <div className="fixed right-0 top-0 h-full w-full sm:w-80 md:w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-sm sm:text-lg font-bold">✦</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">Bible AI Chat</h3>
            <p className="text-xs text-gray-600 truncate">{verseReference}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' ? (
                <div className="max-w-[85%]">
                  <StructuredAIResponse 
                    content={message.content} 
                    timestamp={message.timestamp}
                  />
                </div>
              ) : (
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
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
              )}
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

      {/* Mode Selector - Improved layout */}
      <div className="p-2 sm:p-3 border-t border-gray-100 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          {CHAT_MODES.map((mode) => (
            <Button
              key={mode.id}
              variant={activeMode === mode.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange(mode.id)}
              className={`text-xs px-2 py-2 h-auto flex flex-col items-center gap-1 ${
                activeMode === mode.id 
                  ? 'bg-orange-500 text-white border-orange-500' 
                  : 'hover:bg-orange-50 hover:border-orange-200 text-gray-700'
              }`}
              title={mode.description}
            >
              <mode.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{mode.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about ${verseReference}...`}
            className="flex-1 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 h-9 w-9 p-0 flex-shrink-0"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center hidden sm:block">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
} 