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
  Play, Clock, Info, Calendar, Tag, Bookmark, Users, Timer,
  FileText as FileTextIcon, Award, BarChart, AlertCircle, ListOrdered, MapPin, Edit2
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

interface AIResearchPanelProps {
  selectedSermon?: {
    id?: string;
    title?: string;
    scripture_reference?: string | null;
    sermon_date?: string | null;
    congregation?: string | null;
    content?: string | null;
  } | null;
  onUpdateSermon?: (updates: {
    title?: string;
    scripture_reference?: string;
    sermon_date?: string;
    congregation?: string;
  }) => void;
}

export function AIResearchPanel({ selectedSermon, onUpdateSermon }: AIResearchPanelProps = {} as AIResearchPanelProps) {
  let sermonAI;
  let state;
  try {
    sermonAI = useSermonAI();
    state = sermonAI.state;
  } catch (error) {
    console.error('AIResearchPanel: SermonAI context error:', error);
    sermonAI = null;
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
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'history' | 'info'>('info');
  const [researchHistory, setResearchHistory] = useState<ResearchHistory[]>([]);
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [agents, setAgents] = useState<SermonAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
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
      setAgentsLoading(true);
      setAgentsError(null);
      try {
        const { getAllAgents } = await import('@/lib/sermon-agents');
        const allAgents = getAllAgents();
        setAgents(allAgents);
        if (allAgents.length === 0) {
          setAgentsError('No agents available');
        }
      } catch (error: any) {
        console.error('Error loading agents:', error);
        setAgentsError(error?.message || 'Failed to load agents');
        setAgents([]);
      } finally {
        setAgentsLoading(false);
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
      {/* Header removed per user request */}

      {/* Enhanced Tabs - Optimized for mobile and laptop */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
        <TabsList className="grid grid-cols-4 mx-2 sm:mx-3 mt-2 sm:mt-3 h-9 sm:h-10 bg-gray-100 flex-shrink-0 gap-0.5 sm:gap-1 rounded-lg p-1">
          {/* Tab order: Info, Tools, Chat, History */}
          <TabsTrigger 
            value="info" 
            className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all h-7 sm:h-8 touch-manipulation"
          >
            <Info className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline font-medium">Info</span>
          </TabsTrigger>
          <TabsTrigger 
            value="tools" 
            className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all h-7 sm:h-8 touch-manipulation"
          >
            <Zap className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline font-medium">Tools</span>
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all h-7 sm:h-8 touch-manipulation"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline font-medium">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="text-[11px] sm:text-xs px-2 sm:px-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md transition-all h-7 sm:h-8 touch-manipulation"
          >
            <History className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline font-medium">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Tools Tab - Compact to fit without scroll */}
        <TabsContent value="tools" className="flex-1 overflow-hidden p-2 sm:p-3 m-0 min-h-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
          <ScrollArea className="h-full">
          <div className="space-y-2.5 pb-2">
            {agentsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
                <p className="font-medium">Loading tools...</p>
              </div>
            ) : agentsError ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
                <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
                <p className="font-medium text-red-600">Error loading tools</p>
                <p className="text-xs mt-1 text-gray-400">{agentsError}</p>
              </div>
            ) : availableAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
                <Zap className="h-8 w-8 text-gray-400 mb-3" />
                <p className="font-medium">No tools available</p>
                <p className="text-xs mt-1 text-gray-400">Please check your configuration</p>
              </div>
            ) : (
              Object.entries(agentsByCategory).map(([category, agents]) => {
              const categoryInfo = categoryLabels[category] || { label: category, icon: Sparkles, color: 'bg-gray-500' };
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("p-1 rounded-lg", categoryInfo.color)}>
                      <CategoryIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h3 className="font-semibold text-xs text-gray-700">{categoryInfo.label}</h3>
                    <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0">
                      {agents.length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-1.5">
                    {agents.map((agent) => {
                      const iconMap: Record<string, any> = {
                        'Globe': Globe,
                        'BookOpen': BookOpen,
                        'Search': Search,
                        'Quote': Quote,
                        'Lightbulb': Lightbulb,
                        'Target': Target,
                        'Wand2': Wand2,
                        'Sparkles': Sparkles,
                      };
                      const Icon = iconMap[agent.icon] || Sparkles;
                      const isExecuting = executingAgent === agent.id;
                      
                      return (
                        <Card
                          key={agent.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-200",
                            "hover:shadow-sm hover:border-orange-300 cursor-pointer",
                            isExecuting && "border-orange-500 bg-orange-50",
                            !isExecuting && "hover:bg-white"
                          )}
                          onClick={() => handleExecuteAgent(agent.id)}
                        >
                          <CardContent className="p-2">
                            <div className="flex items-start gap-2">
                              <div className={cn(
                                "p-1.5 rounded-lg flex-shrink-0 transition-all",
                                isExecuting 
                                  ? "bg-orange-500 animate-pulse" 
                                  : "bg-gradient-to-br from-orange-100 to-orange-50 group-hover:from-orange-200 group-hover:to-orange-100"
                              )}>
                                <Icon className={cn(
                                  "h-4 w-4 transition-colors",
                                  isExecuting ? "text-white" : "text-orange-600"
                                )} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <h4 className="font-semibold text-xs text-gray-900">{agent.name}</h4>
                                  {isExecuting ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-orange-500" />
                                  ) : (
                                    <Play className="h-3 w-3 text-gray-400 group-hover:text-orange-500 transition-colors" />
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-600 leading-tight">{agent.description}</p>
                                
                                {isExecuting && (
                                  <div className="mt-1 flex items-center gap-1 text-[10px] text-orange-600">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    <span>Executing...</span>
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
            }))
            }
          </div>
          </ScrollArea>
        </TabsContent>

        {/* Enhanced Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 min-h-0 overflow-hidden data-[state=active]:animate-in data-[state=active]:fade-in-0">
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
        <TabsContent value="history" className="flex-1 overflow-y-auto p-2 sm:p-3 m-0 min-h-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
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

        {/* Info Tab - Sermon Information - EDITABLE */}
        <TabsContent value="info" className="flex-1 overflow-y-auto p-2 sm:p-3 m-0 min-h-0 data-[state=active]:animate-in data-[state=active]:fade-in-0">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">Sermon Information</h3>
              </div>

              {/* Title - Editable */}
              <Card className="p-3 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <FileTextIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                    <Input
                      value={selectedSermon?.title || state.sermonTitle || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        if (sermonAI) {
                          sermonAI.updateTitle(newTitle);
                        }
                        if (onUpdateSermon) {
                          onUpdateSermon({ title: newTitle });
                        }
                      }}
                      placeholder="Enter sermon title..."
                      className="text-sm font-semibold border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Scripture Reference - Editable */}
              <Card className="p-3 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Scripture Reference</label>
                    <Input
                      value={selectedSermon?.scripture_reference || state.scriptureReference || ''}
                      onChange={(e) => {
                        const newRef = e.target.value;
                        if (sermonAI) {
                          sermonAI.updateScriptureReference(newRef);
                        }
                        if (onUpdateSermon) {
                          onUpdateSermon({ scripture_reference: newRef });
                        }
                      }}
                      placeholder="e.g., John 3:16"
                      className="text-sm border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Sermon Date - Editable */}
              <Card className="p-3 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Sermon Date</label>
                    <Input
                      type="date"
                      value={selectedSermon?.sermon_date || ''}
                      onChange={(e) => {
                        if (onUpdateSermon) {
                          onUpdateSermon({ sermon_date: e.target.value });
                        }
                      }}
                      className="text-sm border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Place/Location - Editable */}
              <Card className="p-3 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Place/Location</label>
                    <Input
                      value={selectedSermon?.congregation || ''}
                      onChange={(e) => {
                        if (onUpdateSermon) {
                          onUpdateSermon({ congregation: e.target.value });
                        }
                      }}
                      placeholder="e.g., Sunday Service, Main Sanctuary"
                      className="text-sm border-gray-300 focus:border-orange-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Main Points */}
              {state.mainPoints && state.mainPoints.length > 0 && (
                <Card className="p-3 border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-2">Main Points</p>
                      <ul className="space-y-1.5">
                        {state.mainPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-orange-600 mt-0.5">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-gray-700 flex-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Content Statistics - Read-only */}
              <Card className="p-3 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <BarChart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-2">Statistics</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Word Count</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {state.currentContent ? state.currentContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Est. Duration</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {state.currentContent 
                            ? Math.ceil(state.currentContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length / 150)
                            : 0} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Characters</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {state.currentContent?.replace(/<[^>]*>/g, '').length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Main Points</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {state.mainPoints?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Outline */}
              {state.outline && state.outline.length > 0 && (
                <Card className="p-3 border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                      <ListOrdered className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-2">Outline</p>
                      <div className="space-y-1">
                        {state.outline.map((item: any, index: number) => (
                          <div key={index} className="text-sm text-gray-700">
                            {typeof item === 'string' ? item : item.title || item.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Empty State */}
              {!state.sermonTitle && !state.scriptureReference && !state.currentContent && (
                <div className="text-center py-12 text-sm text-gray-500">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Info className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-medium">No sermon information yet</p>
                  <p className="text-xs mt-1 text-gray-400">Start writing to see details here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
