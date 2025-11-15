// Floating AI Assistant - Context-aware chat panel
import React, { useState, useRef, useEffect } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { useAuth } from '@/hooks/useAuth';
import { checkAndIncrementUsage } from '@/lib/ai-limits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Minimize2, Maximize2, X, Send, MessageCircle, 
  Sparkles, ChevronUp, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const { state, addConversationMessage } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    // Check AI message limit
    const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
    
    if (!usageResult.allowed) {
      toast({
        title: "AI Message Limit Reached",
        description: `You've reached your daily limit of ${usageResult.limit} AI messages. Please try again tomorrow.`,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    addConversationMessage({
      id: userMessage.id,
      role: 'user',
      content: userMessage.content,
      timestamp: userMessage.timestamp.toISOString(),
      context: `Sermon: ${state.sermonTitle || 'Untitled'}`,
    });

    setInput('');
    setIsLoading(true);

    try {
      // Build context-aware prompt
      const contextPrompt = `You are a sermon writing assistant helping with a sermon.

Sermon Title: ${state.sermonTitle || 'Not specified'}
Scripture Reference: ${state.scriptureReference || 'Not specified'}
Current Content Length: ${state.currentContent.length} characters
Main Points: ${state.mainPoints.length > 0 ? state.mainPoints.join(', ') : 'Not yet defined'}

${state.currentContent.length > 0 ? `Recent Content Context:\n${state.currentContent.substring(Math.max(0, state.currentContent.length - 500))}` : ''}

User Question: ${userMessage.content}

Provide helpful, practical, and theologically sound assistance specific to this sermon.`;

      // Use Agent SDK for specialized sermon assistance
      const { generateSermonContent } = await import('@/lib/sermon-agent-sdk');
      const response = await generateSermonContent({
        message: userMessage.content,
        context: {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
          content: state.currentContent,
          mainPoints: state.mainPoints
        },
        task: 'chat'
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages([...newMessages, aiMessage]);
      addConversationMessage({
        id: aiMessage.id,
        role: 'assistant',
        content: aiMessage.content,
        timestamp: aiMessage.timestamp.toISOString(),
      });
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMessage = error?.message || "Failed to get AI response";
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "AI Error",
        description: errorMessage,
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-orange-500 hover:bg-orange-600 text-white z-50"
        size="lg"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] shadow-2xl z-50 flex flex-col",
        isMinimized ? "h-16" : "h-[600px] max-h-[calc(100vh-8rem)]"
      )}
    >
      <CardHeader className="pb-3 flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4 text-orange-500" />
            AI Assistant
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Context-Aware
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Ask me anything about your sermon!</p>
                  <p className="text-xs mt-1">I understand your current content and context.</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardContent className="pt-3 pb-4 flex-shrink-0 border-t">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your sermon..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end"
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Context: {state.sermonTitle || 'Untitled Sermon'}
            </p>
          </CardContent>
        </>
      )}
    </Card>
  );
}

