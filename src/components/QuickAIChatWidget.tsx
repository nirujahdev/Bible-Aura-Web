import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bot, Send, MessageCircle, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAIChatWidgetProps {
  currentVerse?: string;
  currentBook?: string;
  currentChapter?: number;
  onClose?: () => void;
}

const predefinedQuestions = [
  "What does this verse mean?",
  "Give me the historical context",
  "How does this apply to my life?",
  "Show me related verses",
  "Explain this in simple terms"
];

export function QuickAIChatWidget({ 
  currentVerse, 
  currentBook, 
  currentChapter,
  onClose 
}: QuickAIChatWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your Bible AI assistant. I can help you understand Scripture, provide historical context, explain difficult passages, and answer questions about your faith. ${currentVerse ? `I see you're reading ${currentBook} ${currentChapter}. ` : ''}How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response - replace with actual AI integration
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(inputMessage, currentVerse, currentBook, currentChapter),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    const contextualQuestion = currentVerse 
      ? `${question} (Regarding ${currentBook} ${currentChapter})`
      : question;
    setInputMessage(contextualQuestion);
  };

  const generateAIResponse = (question: string, verse?: string, book?: string, chapter?: number): string => {
    // This is a mock response - replace with actual AI integration
    const responses = [
      `Great question about ${book ? `${book} ${chapter}` : 'Scripture'}! Let me help you understand this passage better. This verse teaches us about God's love and His plan for our lives. The historical context shows that...`,
      `This is a beautiful passage that speaks to the heart of Christian faith. In the original context, this was written to encourage believers who were facing challenges. The key message here is...`,
      `What a wonderful verse to study! This passage has been a source of comfort and guidance for Christians throughout history. The Hebrew/Greek text reveals deeper meanings that show us...`,
      `Thank you for this thoughtful question. This Scripture passage is rich with meaning and has several layers of interpretation. From a theological perspective, this teaches us that...`,
      `This is one of my favorite passages to discuss! The beauty of God's Word is evident here. Let me break this down for you: First, we see... Second, the passage reveals... Finally, this applies to our lives today by...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
        >
          <Bot className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 z-50 shadow-2xl border-2 border-purple-200">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Bible AI Assistant
            <Sparkles className="w-3 h-3" />
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-80">
        {/* Messages */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-3 py-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {predefinedQuestions.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs h-6 px-2"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about Scripture..."
              className="text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for triggering the chat widget
export function QuickAIChatTrigger({ 
  currentVerse, 
  currentBook, 
  currentChapter 
}: { 
  currentVerse?: string;
  currentBook?: string;
  currentChapter?: number;
}) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowChat(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
      >
        <Bot className="w-5 h-5" />
      </Button>

      {showChat && (
        <QuickAIChatWidget
          currentVerse={currentVerse}
          currentBook={currentBook}
          currentChapter={currentChapter}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}

export default QuickAIChatWidget; 