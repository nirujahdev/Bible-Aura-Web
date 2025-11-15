// Inline AI Suggestions - Overlay component for editor suggestions
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { checkGrammarAndStyle, GrammarIssue, StyleSuggestion } from '@/lib/sermon-ai-editor';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Sparkles, X, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface InlineAISuggestionsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onApplyFix?: (original: string, fixed: string, position: number) => void;
  enabled?: boolean;
}

export function InlineAISuggestions({
  textareaRef,
  onApplyFix,
  enabled = true,
}: InlineAISuggestionsProps) {
  let state;
  try {
    const sermonAI = useSermonAI();
    state = sermonAI.state;
  } catch (error) {
    console.error('InlineAISuggestions: SermonAI context error:', error);
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
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      setShowSuggestions(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 5,
      left: rect.left - textareaRect.left,
    });
  }, [textareaRef]);

  const handleTextSelection = async () => {
    if (!textareaRef.current || !enabled || !user) {
      setShowSuggestions(false);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (selected.length < 10 || selected.length > 500) {
      setShowSuggestions(false);
      return;
    }

    setSelectedText(selected);
    updatePosition();
    setIsLoading(true);
    setShowSuggestions(true);

    try {
      const context = textarea.value.substring(Math.max(0, start - 100), Math.min(textarea.value.length, end + 100));
      const result = await checkGrammarAndStyle(selected, context, user.id);

      setIssues(result.grammarIssues);
      setStyleSuggestions(result.styleSuggestions);
    } catch (error) {
      console.error('Inline suggestions error:', error);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!textareaRef.current || !enabled) return;

    const textarea = textareaRef.current;

    const handleMouseUp = () => {
      setTimeout(handleTextSelection, 100);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'ArrowRight') {
        setTimeout(handleTextSelection, 100);
      }
    };

    textarea.addEventListener('mouseup', handleMouseUp);
    textarea.addEventListener('keyup', handleKeyUp);

    return () => {
      textarea.removeEventListener('mouseup', handleMouseUp);
      textarea.removeEventListener('keyup', handleKeyUp);
    };
  }, [textareaRef, enabled, user]);

  const handleApplyFix = (issue: GrammarIssue) => {
    if (onApplyFix && textareaRef.current) {
      onApplyFix(issue.original, issue.corrected, issue.position);
      setShowSuggestions(false);
      toast({
        title: "Fix Applied",
        description: "The correction has been applied",
      });
    }
  };

  const handleApplySuggestion = (suggestion: StyleSuggestion) => {
    if (onApplyFix && textareaRef.current) {
      onApplyFix(suggestion.original, suggestion.suggestion, suggestion.position);
      setShowSuggestions(false);
      toast({
        title: "Suggestion Applied",
        description: "The improvement has been applied",
      });
    }
  };

  if (!showSuggestions || (!issues.length && !styleSuggestions.length && !isLoading)) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 min-w-[300px] max-w-[400px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Card className="shadow-lg border-orange-200 bg-white">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">AI Suggestions</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowSuggestions(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-xs text-gray-500">
              Analyzing selected text...
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {/* Grammar Issues */}
              {issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium text-gray-700">Grammar Issues</span>
                  </div>
                  <div className="space-y-2">
                    {issues.map((issue, index) => (
                      <div
                        key={index}
                        className="border rounded p-2 bg-red-50 border-red-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 line-through mb-1">
                              {issue.original}
                            </p>
                            <p className="text-xs font-medium text-gray-800">
                              {issue.corrected}
                            </p>
                            {issue.message && (
                              <p className="text-xs text-gray-500 mt-1">{issue.message}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleApplyFix(issue)}
                          >
                            Fix
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Style Suggestions */}
              {styleSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-gray-700">Style Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    {styleSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="border rounded p-2 bg-green-50 border-green-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">
                              {suggestion.original}
                            </p>
                            <p className="text-xs font-medium text-gray-800">
                              {suggestion.suggestion}
                            </p>
                            {suggestion.reason && (
                              <p className="text-xs text-gray-500 mt-1">{suggestion.reason}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleApplySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

