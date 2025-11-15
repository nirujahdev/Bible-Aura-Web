// Sermon Auto-Complete Component - Real-time AI suggestions
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { getAutoCompleteSuggestions, AutoCompleteSuggestion } from '@/lib/sermon-ai-service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SermonAutoCompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onSuggestionSelect: (suggestion: string) => void;
  enabled?: boolean;
}

export function SermonAutoComplete({
  textareaRef,
  onSuggestionSelect,
  enabled = true,
}: SermonAutoCompleteProps) {
  const { state } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (content: string, cursorPos: number) => {
    if (!enabled || !user || content.length < 10) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getAutoCompleteSuggestions(
        content,
        cursorPos,
        {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
          previousText: content.substring(Math.max(0, cursorPos - 200), cursorPos),
        },
        user.id
      );

      if (results.length > 0) {
        setSuggestions(results);
        updatePosition();
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Auto-complete error:', error);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, user, state.sermonTitle, state.scriptureReference]);

  const updatePosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, selectionStart);
    
    // Create a temporary span to measure text position
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre-wrap';
    span.style.font = window.getComputedStyle(textarea).font;
    span.textContent = textBeforeCursor;
    document.body.appendChild(span);

    const rect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    setPosition({
      top: rect.top + spanRect.height + 5,
      left: rect.left + (spanRect.width % textarea.offsetWidth),
    });

    document.body.removeChild(span);
  }, [textareaRef]);

  useEffect(() => {
    if (!textareaRef.current || !enabled) return;

    const textarea = textareaRef.current;

    const handleInput = () => {
      const content = textarea.value;
      const cursorPos = textarea.selectionStart;
      const lastChar = content[cursorPos - 1];

      // Only show suggestions after space, period, or comma
      if (![' ', '.', ',', '\n'].includes(lastChar || '')) {
        setShowSuggestions(false);
        return;
      }

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce API call
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(content, cursorPos);
      }, 500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        // Focus first suggestion
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('keydown', handleKeyDown);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [textareaRef, enabled, showSuggestions, suggestions, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 min-w-[300px] max-w-[500px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Card className="shadow-lg border-orange-200 bg-white">
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Sparkles className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-medium text-gray-600">AI Suggestions</span>
            {isLoading && (
              <span className="text-xs text-gray-400 ml-auto">Loading...</span>
            )}
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-orange-50"
                onClick={() => handleSelectSuggestion(suggestion.text)}
              >
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{suggestion.text}</div>
                  {suggestion.reason && (
                    <div className="text-xs text-gray-500 mt-0.5">{suggestion.reason}</div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

