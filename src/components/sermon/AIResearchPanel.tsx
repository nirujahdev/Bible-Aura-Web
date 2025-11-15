// AI Research Panel - Left side panel with chat and research tools (SermonAI-style)
import React, { useState, useRef, useEffect } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { useAuth } from '@/hooks/useAuth';
import { checkAndIncrementUsage } from '@/lib/ai-limits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Send, Sparkles, History, X, ChevronRight, 
  BookOpen, Search, Quote, Lightbulb, Globe, FileText,
  MessageSquare, Zap, Loader2, Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateSermonContent } from '@/lib/sermon-agent-sdk';
import { executeAgent, getAllAgents, SermonAgent } from '@/lib/sermon-agents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolUsed?: string;
}

interface ResearchHistory {
  id: string;
  query: string;
  result: string;
  tool: string;
  timestamp: Date;
}

export function AIResearchPanel() {
  const { state } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'history'>('chat');
  const [researchHistory, setResearchHistory] = useState<ResearchHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  // Get available agents
  const availableAgents = getAllAgents();
  
  // Quick action tools (mapped from agents)
  const quickTools = availableAgents
    .filter(agent => agent.category === 'research' || agent.category === 'writing')
    .map(agent => {
      const iconMap: Record<string, any> = {
        'Globe': Globe,
        'BookOpen': BookOpen,
        'Search': Search,
        'Quote': Quote,
        'Lightbulb': Lightbulb,
        'Target': Target,
        'Wand2': Zap,
      };
      return {
        id: agent.id,
        name: agent.name,
        icon: iconMap[agent.icon] || Sparkles,
        description: agent.description,
        agent: agent
      };
    });

  const handleSendMessage = async (toolId?: string) => {
    const query = toolId ? quickTools.find(t => t.id === toolId)?.name || input.trim() : input.trim();
    if (!query || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
      toolUsed: toolId,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let response = '';
      
      // If toolId is provided, execute the agent
      if (toolId && user) {
        try {
          const agentResult = await executeAgent(
            toolId,
            {
              title: state.sermonTitle,
              scripture: state.scriptureReference,
              content: state.currentContent,
              mainPoints: state.mainPoints
            },
            user.id
          );
          response = agentResult.content;
        } catch (error: any) {
          if (error.message?.includes('limit reached')) {
            toast({
              title: "AI Message Limit Reached",
              description: error.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          throw error;
        }
      } else {
        // Regular chat mode
        const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
        if (!usageResult.allowed) {
          toast({
            title: "AI Message Limit Reached",
            description: `You've reached your daily limit of ${usageResult.limit} AI messages.`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const contextPrompt = `You are a sermon research assistant (like SermonAI's RA). Help with research, analysis, and sermon preparation.

Sermon Context:
- Title: ${state.sermonTitle || 'Not specified'}
- Scripture: ${state.scriptureReference || 'Not specified'}
- Content Length: ${state.currentContent.length} characters

User Question: ${query}

Provide detailed, helpful research and insights.`;

        response = await generateSermonContent({
          message: contextPrompt,
          context: {
            title: state.sermonTitle,
            scripture: state.scriptureReference,
            content: state.currentContent,
            mainPoints: state.mainPoints
          },
          task: 'chat'
        });
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        toolUsed: toolId,
      };

      setMessages([...newMessages, aiMessage]);
      
      // Add to research history
      if (toolId) {
        setResearchHistory(prev => [{
          id: Date.now().toString(),
          query,
          result: response.substring(0, 200) + '...',
          tool: toolId,
          timestamp: new Date(),
        }, ...prev].slice(0, 20));
      }
    } catch (error: any) {
      console.error('AI Research error:', error);
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "Research Error",
        description: error?.message || "Failed to get research results",
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

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-lg">AI Research Assistant</h2>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            RA
          </Badge>
        </div>
        <p className="text-xs text-gray-500">
          Your personal research ally for sermon preparation
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 mt-4 h-auto">
          <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">Tools</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium mb-1">Welcome to SermonAI Research Assistant!</p>
                  <p className="text-xs">Ask me anything about your sermon, biblical research, or theology.</p>
                  <p className="text-xs mt-2">I understand your current sermon context.</p>
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
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border text-gray-800'
                    )}
                  >
                    {message.toolUsed && (
                      <Badge variant="outline" className="mb-1 text-xs">
                        {quickTools.find(t => t.id === message.toolUsed)?.name}
                      </Badge>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Researching...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about historical context, theology, passages..."
                className="min-h-[60px] resize-none text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="self-end bg-orange-500 hover:bg-orange-600"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Context: {state.sermonTitle || 'Untitled Sermon'}
            </p>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-3">Quick Research Tools</h3>
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSendMessage(tool.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Icon className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{tool.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-3">Recent Research</h3>
            {researchHistory.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No research history yet</p>
              </div>
            ) : (
              researchHistory.map((item) => (
                <Card key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {quickTools.find(t => t.id === item.tool)?.name || 'Research'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{item.query}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.result}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

