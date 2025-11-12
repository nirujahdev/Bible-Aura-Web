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

const PLACEHOLDER_RESPONSES: Record<ChatMode, string> = {
  theological: `➤ THEOLOGICAL ANALYSIS

⤷ Core Doctrine
This verse highlights central truths about God's nature and His work in redemption
Believers are invited to reflect on how this passage fits within the broader testimony of Scripture

⤷ Biblical Context
The surrounding chapters reinforce God's faithfulness and call to obedience
The message aligns with recurring biblical themes of grace, covenant, and discipleship

⤷ Church Teaching
Christians have long used this verse to encourage faithfulness and spiritual growth
Today it continues to inspire worship, repentance, and confident trust in the Lord`,
  historical: `➤ HISTORICAL CONTEXT

⤷ Time Period
The verse emerged within a pivotal moment in Israel's or the early church's story
Knowing the political and social setting clarifies the urgency of this message

⤷ Cultural Background
Original listeners would recognize the imagery, customs, and covenant language employed
Understanding their daily realities sheds light on how they received the teaching

⤷ Author Context
The author wrote pastorally, addressing real communities facing trials and questions
His intent was to strengthen faith and anchor believers in God's promises`,
  'cross-reference': `➤ CROSS REFERENCES

⤷ Related Verses
Romans 8:28 – God works in all things for the good of those who love Him
Jeremiah 29:11 – The Lord proclaims hope and future for His people

⤷ Parallel Passages
Psalm 37:3-5 – Trust in the Lord, do good, and He will guide your steps
Philippians 4:6-7 – Present every concern to God and receive His peace

⤷ Supporting Scriptures
Isaiah 41:10 – “Fear not, for I am with you; I will strengthen you.”
Hebrews 13:5-6 – God will never leave nor forsake His people`,
  insights: `➤ PRACTICAL INSIGHTS

⤷ Key Message
God remains steadfast even when circumstances are uncertain
Believers are called to rest in His character and promises

⤷ Personal Application
Set aside time to meditate on God’s faithfulness and write down specific ways He has led you
Seek counsel from mature believers when you face decisions that test your faith

⤷ Prayer Focus
Ask the Lord to anchor your heart in truth rather than fear
Pray for grace to remain obedient and hopeful in every season`
};

const generateAIResponse = async (
  userMessage: string,
  mode: ChatMode,
  verseText: string,
  verseReference: string
): Promise<string> => {
  return PLACEHOLDER_RESPONSES[mode];
};

// Function to clean and format AI responses
const cleanAIResponse = (response: string, mode: ChatMode): string => response;

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