// Inline AI Assistant - Enhanced bottom input bar with better UX
import React, { useState, useRef, useEffect } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { useAuth } from '@/hooks/useAuth';
import { checkAndIncrementUsage } from '@/lib/ai-limits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Send, Sparkles, Wand2, Lightbulb, Search, Loader2,
  ArrowRight, Zap, X, CheckCircle2, Copy, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
// Dynamic imports to prevent module loading errors

interface InlineAIAssistantProps {
  onApplySuggestion?: (suggestion: string, action: 'insert' | 'replace' | 'append') => void;
  onQuickAction?: (action: string) => void;
}

export function InlineAIAssistant({ 
  onApplySuggestion,
  onQuickAction 
}: InlineAIAssistantProps) {
  let state;
  try {
    const sermonAI = useSermonAI();
    state = sermonAI.state;
  } catch (error) {
    console.error('InlineAIAssistant: SermonAI context error:', error);
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load agents for quick actions
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { getAllAgents } = await import('@/lib/sermon-agents');
        const agents = getAllAgents();
        setAvailableAgents(agents);
      } catch (error) {
        console.error('Error loading agents:', error);
        setAvailableAgents([]);
      }
    };
    loadAgents();
  }, []);
  
  const quickActionAgents = availableAgents.filter(a => 
    a && ['illustration-finder', 'call-to-action', 'sermon-sculptor'].includes(a.id)
  );

  const quickActions = [
    { id: 'improve', label: 'Improve', icon: Wand2, color: 'bg-purple-500' },
    { id: 'illustration-finder', label: 'Illustration', icon: Lightbulb, color: 'bg-yellow-500' },
    { id: 'topic-explorer', label: 'Find Scripture', icon: Search, color: 'bg-blue-500' },
    { id: 'enhance', label: 'Enhance', icon: Sparkles, color: 'bg-pink-500' },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

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

    setIsLoading(true);
    try {
      // Dynamically import generateSermonContent
      const { generateSermonContent } = await import('@/lib/sermon-agent-sdk');
      
      const prompt = `You are an AI assistant helping to edit or generate sermon content.

Sermon Context:
- Title: ${state.sermonTitle || 'Not specified'}
- Scripture: ${state.scriptureReference || 'Not specified'}
- Current Content: ${(state.currentContent || '').substring(Math.max(0, (state.currentContent || '').length - 500))}

User Request: ${input}

Provide the requested content or edit. Be concise and practical.`;

      const response = await generateSermonContent({
        message: prompt,
        context: {
          title: state.sermonTitle || '',
          scripture: state.scriptureReference || '',
          content: state.currentContent || '',
          mainPoints: state.mainPoints || []
        },
        task: 'enhance'
      });

      if (!response || typeof response !== 'string') {
        throw new Error('Invalid response from AI');
      }

      setSuggestion(response);
      
      if (onApplySuggestion) {
        // Auto-apply if it's a simple request
        if (input.toLowerCase().includes('improve') || input.toLowerCase().includes('enhance')) {
          onApplySuggestion(response, 'replace');
          setInput('');
          setSuggestion(null);
        }
      }
    } catch (error: any) {
      console.error('Inline AI error:', error);
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "AI Error",
        description: error?.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionId: string) => {
    if (!user || isLoading) return;

    setExecutingAction(actionId);
    setIsLoading(true);
    
    try {
      // Check if it's an agent action
      const agent = availableAgents.find(a => a.id === actionId);
      
      if (agent) {
        // Execute agent
        const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
        if (!usageResult.allowed) {
          toast({
            title: "AI Message Limit Reached",
            description: `You've reached your daily limit.`,
            variant: "destructive",
          });
          return;
        }

        // Dynamically import executeAgent
        const { executeAgent } = await import('@/lib/sermon-agents');
        
        const result = await executeAgent(
          actionId,
          {
            title: state.sermonTitle || '',
            scripture: state.scriptureReference || '',
            content: state.currentContent || '',
            mainPoints: state.mainPoints || []
          },
          user.id
        );

        if (!result || !result.content) {
          throw new Error('Invalid response from agent');
        }

        setSuggestion(result.content);
        
        toast({
          title: "✅ Agent Executed",
          description: `${agent.name} completed`,
        });
      } else {
        // Regular quick action
        const actionPrompts: Record<string, string> = {
          improve: `Improve the following sermon content for clarity, engagement, and impact:\n\n${state.currentContent.substring(Math.max(0, state.currentContent.length - 1000))}`,
          enhance: `Enhance this sermon content with better structure, flow, and engagement:\n\n${state.currentContent.substring(Math.max(0, state.currentContent.length - 1000))}`,
        };

        const prompt = actionPrompts[actionId];
        if (!prompt) return;

        const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
        if (!usageResult.allowed) {
          toast({
            title: "AI Message Limit Reached",
            description: `You've reached your daily limit.`,
            variant: "destructive",
          });
          return;
        }

        // Dynamically import generateSermonContent
        const { generateSermonContent } = await import('@/lib/sermon-agent-sdk');
        
        const response = await generateSermonContent({
          message: prompt,
          context: {
            title: state.sermonTitle || '',
            scripture: state.scriptureReference || '',
            content: state.currentContent || '',
            mainPoints: state.mainPoints || []
          },
          task: 'enhance'
        });

        if (!response || typeof response !== 'string') {
          throw new Error('Invalid response from AI');
        }

        setSuggestion(response);
      }
      
      if (onQuickAction) {
        onQuickAction(actionId);
      }
    } catch (error: any) {
      toast({
        title: "AI Error",
        description: error?.message || "Failed to process action",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setExecutingAction(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApply = (action: 'insert' | 'replace' | 'append') => {
    if (suggestion && onApplySuggestion) {
      onApplySuggestion(suggestion, action);
      setSuggestion(null);
      setInput('');
      toast({
        title: "✅ Applied",
        description: `Content ${action}ed successfully`,
      });
    }
  };

  const handleCopy = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion);
      toast({
        title: "Copied!",
        description: "Suggestion copied to clipboard",
      });
    }
  };

  return (
    <div className="border-t bg-gradient-to-b from-white to-gray-50 shadow-lg flex-shrink-0">
      {/* Quick Actions removed per user request */}
      
      {/* Input Area - Enhanced */}
      <div className="px-3 pb-2.5 pt-2 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI to edit or generate... (e.g., 'Add an illustration about grace', 'Improve this paragraph')"
              className={cn(
                "min-h-[50px] max-h-[120px] resize-none text-sm pr-10",
                "border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200",
                "transition-all"
              )}
              disabled={isLoading}
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 text-xs bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200"
            >
              <Zap className="h-3 w-3 mr-1 text-orange-600" />
              AI
            </Badge>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
              "text-white shadow-md hover:shadow-lg transition-all h-[50px] min-w-[50px]"
            )}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Enhanced Suggestion Display */}
        {suggestion && (
          <Card className="mt-3 p-4 bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 border-orange-200 shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-500 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs bg-white border-orange-300 text-orange-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    AI Suggestion Ready
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Choose an action below</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 text-xs"
                  title="Copy to clipboard"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSuggestion(null)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{suggestion}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApply('insert')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Insert Here
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApply('replace')}
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Replace Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApply('append')}
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Append to End
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
