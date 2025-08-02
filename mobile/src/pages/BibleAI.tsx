import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  MessageCircle, Send, Bot, User, Sparkles, BookOpen, 
  MoreVertical, ArrowLeft, Settings, Share, Copy, 
  Trash2, Star, History, RefreshCw, Mic, Image,
  ChevronDown, Search, Brain, Heart, Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'verse-analysis' | 'theology' | 'prayer' | 'general';
}

interface QuickPrompt {
  title: string;
  prompt: string;
  icon: any;
  color: string;
  category: string;
}

const quickPrompts: QuickPrompt[] = [
  {
    title: "Verse Analysis",
    prompt: "Please analyze John 3:16 with historical context",
    icon: Search,
    color: "bg-blue-500",
    category: "Study"
  },
  {
    title: "Prayer Request", 
    prompt: "Help me write a prayer for strength during difficult times",
    icon: Heart,
    color: "bg-pink-500",
    category: "Prayer"
  },
  {
    title: "Theological Study",
    prompt: "Explain the doctrine of salvation from a biblical perspective",
    icon: Brain,
    color: "bg-purple-500",
    category: "Theology"
  },
  {
    title: "Daily Devotion",
    prompt: "Give me an inspiring Bible verse with explanation for today",
    icon: Flame,
    color: "bg-orange-500",
    category: "Devotion"
  },
  {
    title: "Character Study",
    prompt: "Tell me about David's faith journey and lessons we can learn",
    icon: User,
    color: "bg-green-500",
    category: "Study"
  },
  {
    title: "Biblical Wisdom",
    prompt: "What does the Bible say about handling anxiety and worry?",
    icon: BookOpen,
    color: "bg-indigo-500",
    category: "Wisdom"
  }
];

const BibleAI = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load initial AI greeting
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome to Bible AI! I'm here to help you explore God's word with AI-powered insights. 

🔍 **How I Can Help:**
• Analyze Bible verses with context
• Answer theological questions  
• Provide prayer guidance
• Share biblical wisdom
• Explain difficult passages

What would you like to explore today?`,
        timestamp: new Date(),
        type: 'general'
      }]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowQuickPrompts(false);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputText),
        timestamp: new Date(),
        type: 'general'
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      `📖 **Biblical Insight**

Based on your question, here's what Scripture teaches:

**Key Verse:** "Trust in the Lord with all your heart and lean not on your own understanding" - Proverbs 3:5

**Context & Meaning:**
This passage reminds us that God's wisdom surpasses human understanding. When we face uncertainty, we're called to place our complete trust in Him.

**Application:**
• Surrender your worries to God in prayer
• Seek His guidance through Scripture
• Trust His timing even when you can't see the path

**Prayer:** Lord, help me trust in Your perfect plan and timing. Give me peace in uncertainty and wisdom to follow Your ways.`,

      `✨ **Theological Perspective**

Great question! Let me break this down biblically:

**Core Truth:** God's love is unconditional and eternal (Romans 8:38-39)

**Supporting Verses:**
• John 3:16 - God's sacrificial love
• 1 John 4:19 - We love because He first loved us
• Ephesians 2:8-9 - Salvation by grace, not works

**Practical Application:**
This truth should transform how we:
- View ourselves (beloved children)
- Treat others (with Christ's love)
- Respond to challenges (with faith, not fear)

**Reflection:** How has experiencing God's love changed your perspective on life?`,

      `🙏 **Prayer & Devotion**

Thank you for bringing this to prayer. Here's biblical guidance:

**Scripture Foundation:** "Cast all your anxiety on him because he cares for you" - 1 Peter 5:7

**Prayer Pattern:**
1. **Praise** - Acknowledge God's goodness
2. **Confession** - Admit our need for Him  
3. **Thanksgiving** - Count your blessings
4. **Supplication** - Present your requests

**Suggested Prayer:**
"Father, I thank You for Your faithfulness. I confess my need for Your strength today. Help me trust in Your perfect plan and find peace in Your presence. Amen."

**Action Step:** Spend 5 minutes in quiet prayer today, focusing on God's character rather than your circumstances.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    setShowQuickPrompts(false);
    inputRef.current?.focus();
  };

  const clearConversation = () => {
    setMessages([]);
    setShowQuickPrompts(true);
    toast({
      title: "Conversation Cleared",
      description: "Your chat history has been cleared."
    });
  };

  const shareConversation = () => {
    toast({
      title: "Share Feature",
      description: "Conversation sharing will be available soon!"
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bible AI Assistant</h1>
            <p className="text-xs text-orange-100">Ask anything about the Bible</p>
          </div>
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white p-2"
            onClick={() => setShowSettings(!showSettings)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button
                onClick={clearConversation}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span>Clear Chat</span>
              </button>
              <button
                onClick={shareConversation}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Share className="h-4 w-4 text-blue-500" />
                <span>Share Chat</span>
              </button>
              <button
                onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Toggle Prompts</span>
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {/* Quick Prompts */}
        {showQuickPrompts && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Start Prompts</h3>
            <div className="grid grid-cols-1 gap-3">
              {quickPrompts.map((prompt, index) => (
                <Card 
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${prompt.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <prompt.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800 text-sm">{prompt.title}</h4>
                          <Badge className="text-xs bg-gray-100 text-gray-600">{prompt.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{prompt.prompt}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === 'user' ? (
                    <>
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                        {(profile?.display_name || user?.email)?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  <div className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={index} className={`font-semibold mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      } else if (line.startsWith('•')) {
                        return (
                          <p key={index} className="ml-3 mb-1">
                            {line}
                          </p>
                        );
                      } else if (line.trim()) {
                        return <p key={index} className="mb-2">{line}</p>;
                      }
                      return <br key={index} />;
                    })}
                  </div>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-[85%]">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about the Bible..."
              className="pr-12 rounded-2xl border-2 border-gray-200 focus:border-orange-400 min-h-[44px] resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            {inputText.trim() && (
              <Button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-xl h-8 w-8"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="p-3 rounded-xl border-2 border-gray-200"
            onClick={() => toast({ title: "Voice Input", description: "Voice input coming soon!" })}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BibleAI; 