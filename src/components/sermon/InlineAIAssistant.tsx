// Inline AI Assistant - Bottom input bar (SermonAI-style)
import React, { useState, useRef } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { useAuth } from '@/hooks/useAuth';
import { checkAndIncrementUsage } from '@/lib/ai-limits';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, Sparkles, Wand2, Lightbulb, Search, Loader2,
  ArrowRight, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateSermonContent } from '@/lib/sermon-agent-sdk';

interface InlineAIAssistantProps {
  onApplySuggestion?: (suggestion: string, action: 'insert' | 'replace' | 'append') => void;
  onQuickAction?: (action: string) => void;
}

export function InlineAIAssistant({ 
  onApplySuggestion,
  onQuickAction 
}: InlineAIAssistantProps) {
  const { state } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickActions = [
    { id: 'improve', label: 'Improve this', icon: Wand2 },
    { id: 'illustration', label: 'Add illustration', icon: Lightbulb },
    { id: 'scripture', label: 'Find scripture', icon: Search },
    { id: 'enhance', label: 'Enhance', icon: Sparkles },
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
      const prompt = `You are an AI assistant helping to edit or generate sermon content.

Sermon Context:
- Title: ${state.sermonTitle || 'Not specified'}
- Scripture: ${state.scriptureReference || 'Not specified'}
- Current Content: ${state.currentContent.substring(Math.max(0, state.currentContent.length - 500))}

User Request: ${input}

Provide the requested content or edit. Be concise and practical.`;

      const response = await generateSermonContent({
        message: prompt,
        context: {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
          content: state.currentContent,
          mainPoints: state.mainPoints
        },
        task: 'enhance'
      });

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
    if (!user) return;

    const actionPrompts: Record<string, string> = {
      improve: `Improve the following sermon content for clarity, engagement, and impact:\n\n${state.currentContent.substring(Math.max(0, state.currentContent.length - 1000))}`,
      illustration: `Suggest a relevant illustration or story for this sermon:\n\nTitle: ${state.sermonTitle}\nScripture: ${state.scriptureReference}\nTopic: ${state.currentContent.substring(0, 200)}`,
      scripture: `Find relevant Bible verses for this sermon topic:\n\n${state.sermonTitle}\n${state.scriptureReference}\n${state.currentContent.substring(0, 300)}`,
      enhance: `Enhance this sermon content with better structure, flow, and engagement:\n\n${state.currentContent.substring(Math.max(0, state.currentContent.length - 1000))}`,
    };

    const prompt = actionPrompts[actionId] || input;
    if (!prompt) return;

    setIsLoading(true);
    try {
      const usageResult = await checkAndIncrementUsage(user.id, 'ai_message');
      if (!usageResult.allowed) {
        toast({
          title: "AI Message Limit Reached",
          description: `You've reached your daily limit.`,
          variant: "destructive",
        });
        return;
      }

      const response = await generateSermonContent({
        message: prompt,
        context: {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
          content: state.currentContent,
          mainPoints: state.mainPoints
        },
        task: 'enhance'
      });

      setSuggestion(response);
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
    }
  };

  return (
    <div className="border-t bg-white">
      {/* Quick Actions */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 overflow-x-auto">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.id)}
              disabled={isLoading}
              className="text-xs whitespace-nowrap"
            >
              <Icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI to edit or generate..."
              className="min-h-[50px] max-h-[120px] resize-none text-sm pr-10"
              disabled={isLoading}
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 right-2 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-orange-500 hover:bg-orange-600 h-[50px]"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Suggestion Display */}
        {suggestion && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Suggestion
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApply('insert')}
                  className="h-6 text-xs"
                >
                  Insert
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApply('replace')}
                  className="h-6 text-xs"
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApply('append')}
                  className="h-6 text-xs"
                >
                  Append
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSuggestion(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

