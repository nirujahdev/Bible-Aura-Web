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

// Mock AI response function
const generateAIResponse = async (
  userMessage: string, 
  mode: ChatMode, 
  verseText: string, 
  verseReference: string
): Promise<string> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses: Record<ChatMode, () => string> = {
    theological: () => {
      const responses = [
        `Based on ${verseReference}, this passage reveals important theological truths about God's nature and His relationship with humanity. The verse demonstrates divine attributes of grace, sovereignty, and love, pointing to the doctrine of salvation by faith.`,
        `Theologically, ${verseReference} connects to the broader biblical narrative of redemption. This verse emphasizes the covenantal relationship between God and His people, highlighting themes of divine mercy and human responsibility.`,
        `From a theological perspective, this passage in ${verseReference} illustrates fundamental Christian doctrines including the nature of God, the role of faith, and the promise of eternal life through divine grace.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    },
    
    historical: () => {
      const responses = [
        `Historically, ${verseReference} was written in a specific cultural context that deeply influences its meaning. The ancient Near Eastern background, including religious practices and social customs of the time, provides crucial insight into the original audience's understanding.`,
        `The historical setting of ${verseReference} includes the political climate and cultural practices of ancient Israel. Understanding the original historical context helps us grasp the full significance of this passage for its first readers.`,
        `This verse from ${verseReference} reflects the historical circumstances of its time, including the religious, social, and political environment that shaped how the original audience would have understood these words.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    },
    
    'cross-reference': () => {
      const references = [
        'John 3:16', 'Romans 8:28', 'Philippians 4:13', 'Psalm 23:1', 'Matthew 6:33',
        'Romans 12:1-2', '1 Peter 2:9', 'Ephesians 2:8-9', 'Isaiah 55:8-9', 'Proverbs 3:5-6'
      ];
      const selectedRefs = references.slice(0, 3 + Math.floor(Math.random() * 3));
      
      return `${verseReference} connects beautifully with several other biblical passages. Key cross-references include: ${selectedRefs.join(', ')}. These verses share similar themes of God's faithfulness, the importance of trust, and the call to live according to biblical principles. Together, they form a tapestry of biblical truth that reinforces the central message of Scripture.`;
    },
    
    insights: () => {
      const responses = [
        `${verseReference} offers profound practical insights for daily Christian living. This passage challenges us to examine our attitudes and align our actions with biblical truth. Here are key applications: trust in God's timing, practice gratitude daily, and seek His guidance in decisions.`,
        `The practical wisdom in ${verseReference} provides guidance for contemporary life. This verse encourages us to develop spiritual disciplines like prayer, meditation on Scripture, and service to others. It reminds us to find our identity in Christ rather than worldly achievements.`,
        `From ${verseReference}, we can extract valuable life principles: the importance of faith over fear, the power of prayer in difficult times, and the call to love others as Christ loved us. These insights transform how we approach relationships, work, and personal growth.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };
  
  return responses[mode]();
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
        content: `✦ Welcome! I'm here to help you explore **${verseReference}**: "${verseText}"\n\nChoose a mode above and ask me anything about this verse!`,
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

      {/* Mode Selector */}
      <div className="p-3 border-b border-gray-100">
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