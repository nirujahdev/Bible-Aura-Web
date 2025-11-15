// Sermon Content Enhancer - Real-time improvement suggestions
import React, { useState, useEffect, useCallback } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { enhanceContent, EnhancementSuggestion } from '@/lib/sermon-ai-service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Check, X, Wand2, Loader2, 
  Eye, Lightbulb, ArrowRight, Target, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SermonContentEnhancerProps {
  className?: string;
  onApplyEnhancement?: (original: string, enhanced: string, position: number) => void;
}

export function SermonContentEnhancer({ 
  className, 
  onApplyEnhancement 
}: SermonContentEnhancerProps) {
  const { state } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFocus, setActiveFocus] = useState<'all' | 'clarity' | 'illustration' | 'transition' | 'application' | 'word-choice'>('all');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const fetchEnhancements = useCallback(async (focus: typeof activeFocus) => {
    if (!state.currentContent.trim() || !user) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await enhanceContent(
        state.currentContent,
        focus,
        {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
        },
        user.id
      );

      setSuggestions(results);
    } catch (error: any) {
      console.error('Enhancement error:', error);
      const errorMessage = error?.message || "Failed to get enhancements";
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "Enhancement Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.currentContent, state.sermonTitle, state.scriptureReference, user, toast]);

  useEffect(() => {
    // Debounce enhancement requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (state.currentContent.trim().length > 100) {
      debounceTimerRef.current = setTimeout(() => {
        fetchEnhancements(activeFocus);
      }, 1500);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.currentContent, activeFocus, fetchEnhancements]);

  const handleApply = (suggestion: EnhancementSuggestion) => {
    if (onApplyEnhancement) {
      onApplyEnhancement(
        suggestion.original,
        suggestion.enhanced,
        suggestion.position
      );
    }
    setAppliedIds(prev => new Set([...prev, suggestion.original]));
    toast({
      title: "Enhancement Applied",
      description: "The suggestion has been applied to your content",
    });
  };

  const handleDismiss = (suggestion: EnhancementSuggestion) => {
    setSuggestions(prev => prev.filter(s => s.original !== suggestion.original));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'clarity':
        return <Eye className="h-3.5 w-3.5" />;
      case 'illustration':
        return <Lightbulb className="h-3.5 w-3.5" />;
      case 'transition':
        return <ArrowRight className="h-3.5 w-3.5" />;
      case 'application':
        return <Target className="h-3.5 w-3.5" />;
      case 'word-choice':
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <Sparkles className="h-3.5 w-3.5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'clarity':
        return 'Clarity';
      case 'illustration':
        return 'Illustration';
      case 'transition':
        return 'Transition';
      case 'application':
        return 'Application';
      case 'word-choice':
        return 'Word Choice';
      default:
        return 'Enhancement';
    }
  };

  const filteredSuggestions = suggestions.filter(s => !appliedIds.has(s.original));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Content Enhancer
          {isLoading && (
            <Loader2 className="h-3 w-3 ml-2 animate-spin text-gray-400" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeFocus} onValueChange={(v) => setActiveFocus(v as typeof activeFocus)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="clarity" className="text-xs">Clarity</TabsTrigger>
            <TabsTrigger value="illustration" className="text-xs">Illustration</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="transition" className="text-xs">Transitions</TabsTrigger>
            <TabsTrigger value="application" className="text-xs">Application</TabsTrigger>
            <TabsTrigger value="word-choice" className="text-xs">Word Choice</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFocus} className="mt-0">
            {filteredSuggestions.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.type}-${index}`}
                      className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          {getTypeIcon(suggestion.type)}
                          {getTypeLabel(suggestion.type)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleApply(suggestion)}
                          >
                            <Check className="h-3 w-3 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleDismiss(suggestion)}
                          >
                            <X className="h-3 w-3 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Original:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {suggestion.original}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Enhanced:</p>
                          <p className="text-sm text-gray-800 bg-orange-50 p-2 rounded border border-orange-200">
                            {suggestion.enhanced}
                          </p>
                        </div>
                        {suggestion.reason && (
                          <p className="text-xs text-gray-500 italic">
                            {suggestion.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                {isLoading ? (
                  <>
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-400" />
                    <p>Analyzing content...</p>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No enhancements found</p>
                    <p className="text-xs mt-1">Your content looks good, or try a different focus</p>
                  </>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

