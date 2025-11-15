// AI Research Panel - Enhanced UI for better agent selection and execution
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
  MessageSquare, Zap, Loader2, Target, Wand2, CheckCircle2,
  Play, Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { SermonAgent } from '@/lib/sermon-agents';

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
  let state;
  try {
    const sermonAI = useSermonAI();
    state = sermonAI.state;
  } catch (error) {
    console.error('AIResearchPanel: SermonAI context error:', error);
    state = {
      currentContent: '',
      sermonTitle: '',
      scriptureReference: '',
      mainPoints: [],
      outline: [],
      conversationHistory: [],
      analysisResults: null,
      suggestions: [],
      isLoading: false,
    };
  }
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'history'>('tools');
  const [researchHistory, setResearchHistory] = useState<ResearchHistory[]>([]);
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [agents, setAgents] = useState<SermonAgent[]>([]);
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

  // Load agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { getAllAgents } = await import('@/lib/sermon-agents');
        const allAgents = getAllAgents();
        setAgents(allAgents);
      } catch (error) {
        console.error('Error loading agents:', error);
        setAgents([]);
      }
    };
    loadAgents();
  }, []);

  // Use agents from state instead of calling getAllAgents directly
  const availableAgents = agents.length > 0 ? agents : [];
  
  // Organize agents by category
  const agentsByCategory = availableAgents.reduce((acc, agent) => {
    if (!acc[agent.category]) acc[agent.category] = [];
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, SermonAgent[]>);

  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    research: { label: 'Research Tools', icon: Search, color: 'bg-blue-500' },
    writing: { label: 'Writing Tools', icon: Wand2, color: 'bg-purple-500' },
    analysis: { label: 'Analysis Tools', icon: FileText, color: 'bg-green-500' },
  };

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
        'Wand2': Wand2,
      };
      return {
        id: agent.id,
        name: agent.name,
        icon: iconMap[agent.icon] || Sparkles,
        description: agent.description,
        category: agent.category,
        agent: agent
      };
    });

  const handleExecuteAgent = async (agentId: string) => {
    if (!user || isLoading || executingAgent) return;

    setExecutingAgent(agentId);
    setIsLoading(true);

    // Switch to chat tab to show results
    setActiveTab('chat');

    const agent = availableAgents.find(a => a.id === agentId);
    if (!agent) {
      setIsLoading(false);
      setExecutingAgent(null);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Execute: ${agent.name}`,
      timestamp: new Date(),
      toolUsed: agentId,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      // Safely import executeAgent
      const { executeAgent } = await import('@/lib/sermon-agents');
      
      const agentResult = await executeAgent(
        agentId,
        {
          title: state.sermonTitle || '',
          scripture: state.scriptureReference || '',
          content: state.currentContent || '',
          mainPoints: state.mainPoints || []
        },
        user.id
      );

      if (!agentResult || !agentResult.content) {
        throw new Error('Invalid response from agent');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: agentResult.content,
        timestamp: new Date(),
        toolUsed: agentId,
      };

      setMessages([...newMessages, aiMessage]);
      
      // Add to research history
      setResearchHistory(prev => [{
        id: Date.now().toString(),
        query: agent.name,
        result: agentResult.content.substring(0, 200) + '...',
        tool: agentId,
        timestamp: new Date(),
      }, ...prev].slice(0, 20));

      toast({
        title: "✅ Agent Executed",
        description: `${agent.name} completed successfully`,
      });
    } catch (error: any) {
      console.error('Agent execution error:', error);
      
      if (error.message?.includes('limit reached')) {
        toast({
          title: "AI Message Limit Reached",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: error?.message?.includes('API key') ? "API Configuration Error" : "Execution Error",
          description: error?.message || "Failed to execute agent",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setExecutingAgent(null);
    }
  };

  const handleSendMessage = async () => {
    const query = input.trim();
    if (!query || isLoading || !user) return;

    // Check AI message limit
    const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
    if (!usageResult.allowed) {
      toast({
        title: "AI Message Limit Reached",
        description: `You've reached your daily limit of ${usageResult.limit} AI messages.`,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Safely import generateSermonContent
      const { generateSermonContent } = await import('@/lib/sermon-agent-sdk');
      
      const contextPrompt = `You are a sermon research assistant (like SermonAI's RA). Help with research, analysis, and sermon preparation.

Sermon Context:
- Title: ${state.sermonTitle || 'Not specified'}
- Scripture: ${state.scriptureReference || 'Not specified'}
- Content Length: ${(state.currentContent || '').length} characters

User Question: ${query}

Provide detailed, helpful research and insights.`;

      const response = await generateSermonContent({
        message: contextPrompt,
        context: {
          title: state.sermonTitle || '',
          scripture: state.scriptureReference || '',
          content: state.currentContent || '',
          mainPoints: state.mainPoints || []
        },
        task: 'chat'
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages([...newMessages, aiMessage]);
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
    <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50 border-r overflow-hidden">
      {/* Enhanced Header */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900">AI Research Assistant</h2>
              <p className="text-xs text-gray-500">Your personal research ally</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
            <Sparkles className="h-3 w-3 mr-1" />
            RA
          </Badge>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <TabsList className="grid grid-cols-3 mx-4 mt-3 h-9 bg-gray-100 flex-shrink-0">
          <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Zap className="h-3 w-3 mr-1" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <History className="h-3 w-3 mr-1" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Tools Tab */}
        <TabsContent value="tools" className="flex-1 overflow-y-auto p-3 m-0 min-h-0">
          <div className="space-y-4">
            {Object.entries(agentsByCategory).map(([category, agents]) => {
              const categoryInfo = categoryLabels[category] || { label: category, icon: Sparkles, color: 'bg-gray-500' };
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("p-1.5 rounded-lg", categoryInfo.color)}>
                      <CategoryIcon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-700">{categoryInfo.label}</h3>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {agents.length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-2">
                    {agents.map((agent) => {
                      const iconMap: Record<string, any> = {
                        'Globe': Globe,
                        'BookOpen': BookOpen,
                        'Search': Search,
                        'Quote': Quote,
                        'Lightbulb': Lightbulb,
                        'Target': Target,
                        'Wand2': Wand2,
                      };
                      const Icon = iconMap[agent.icon] || Sparkles;
                      const isExecuting = executingAgent === agent.id;
                      
                      return (
                        <Card
                          key={agent.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-200",
                            "hover:shadow-md hover:border-orange-300 cursor-pointer",
                            isExecuting && "border-orange-500 bg-orange-50",
                            !isExecuting && "hover:bg-white"
                          )}
                          onClick={() => handleExecuteAgent(agent.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "p-2.5 rounded-lg flex-shrink-0 transition-all",
                                isExecuting 
                                  ? "bg-orange-500 animate-pulse" 
                                  : "bg-gradient-to-br from-orange-100 to-orange-50 group-hover:from-orange-200 group-hover:to-orange-100"
                              )}>
                                <Icon className={cn(
                                  "h-5 w-5 transition-colors",
                                  isExecuting ? "text-white" : "text-orange-600"
                                )} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900">{agent.name}</h4>
                                  {isExecuting ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{agent.description}</p>
                                
                                {isExecuting && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Executing agent...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent pointer-events-none transition-all" />
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Enhanced Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 px-4 min-h-0">
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-500">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-orange-400" />
                  </div>
                  <p className="font-semibold text-base mb-1 text-gray-700">Welcome to Research Assistant!</p>
                  <p className="text-xs">Ask me anything about your sermon, biblical research, or theology.</p>
                  <p className="text-xs mt-2 text-gray-400">I understand your current sermon context.</p>
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
                      "max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm",
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    )}
                  >
                    {message.toolUsed && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mb-2 text-xs",
                          message.role === 'user' 
                            ? 'bg-white/20 text-white border-white/30' 
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {quickTools.find(t => t.id === message.toolUsed)?.name}
                      </Badge>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span className={cn(
                      "text-xs mt-2 block",
                      message.role === 'user' ? 'opacity-80' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span className="text-gray-600">Researching...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Enhanced Input Area */}
          <div className="p-3 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about historical context, theology, passages..."
                className="min-h-[60px] resize-none text-sm border-gray-300 focus:border-orange-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Context: {state.sermonTitle || 'Untitled Sermon'}
            </p>
          </div>
        </TabsContent>

        {/* Enhanced History Tab */}
        <TabsContent value="history" className="flex-1 overflow-y-auto p-3 m-0 min-h-0">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-orange-500" />
              Recent Research
            </h3>
            {researchHistory.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <History className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-medium">No research history yet</p>
                <p className="text-xs mt-1 text-gray-400">Execute agents to see history here</p>
              </div>
            ) : (
              researchHistory.map((item) => {
                const tool = quickTools.find(t => t.id === item.tool);
                const Icon = tool?.icon || Sparkles;
                
                return (
                  <Card 
                    key={item.id} 
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-all hover:shadow-sm border-gray-200"
                    onClick={() => {
                      setActiveTab('chat');
                      // Could scroll to message if needed
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <Icon className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            {tool?.name || 'Research'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">{item.query}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.result}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
