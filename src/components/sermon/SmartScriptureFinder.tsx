// Smart Scripture Finder - AI-powered verse suggestions
import React, { useState, useEffect } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { findRelevantScriptures, ScriptureSuggestion } from '@/lib/sermon-ai-service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Search, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SmartScriptureFinderProps {
  onVerseSelect?: (verse: ScriptureSuggestion) => void;
  className?: string;
}

export function SmartScriptureFinder({ onVerseSelect, className }: SmartScriptureFinderProps) {
  const { state } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ScriptureSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setIsSearching(true);
    setSuggestions([]);
    
    try {
      const results = await findRelevantScriptures(
        searchQuery,
        {
          currentContent: state.currentContent,
          mainPoints: state.mainPoints,
        },
        user.id
      );

      if (results.length === 0) {
        toast({
          title: "No Verses Found",
          description: "Try a different search term",
          variant: "destructive",
        });
      } else {
        setSuggestions(results);
      }
    } catch (error: any) {
      console.error('Scripture search error:', error);
      const errorMessage = error?.message || "Failed to search scriptures";
      toast({
        title: error?.message?.includes('API key') ? "API Configuration Error" : "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerseSelect = (verse: ScriptureSuggestion) => {
    setSelectedVerse(verse.reference);
    if (onVerseSelect) {
      onVerseSelect(verse);
    }
    toast({
      title: "Verse Selected",
      description: `${verse.reference} has been selected`,
    });
  };

  const handleCopy = async (verse: ScriptureSuggestion) => {
    const text = `${verse.reference}: ${verse.text}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(verse.reference);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied",
        description: "Verse copied to clipboard",
      });
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Auto-search based on sermon context
  useEffect(() => {
    if (state.sermonTitle && state.sermonTitle.length > 5 && suggestions.length === 0) {
      setSearchQuery(state.sermonTitle);
    }
  }, [state.sermonTitle]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Smart Scripture Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by topic, theme, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            size="sm"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Context Info */}
        {(state.sermonTitle || state.currentContent) && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p className="font-medium mb-1">Context:</p>
            {state.sermonTitle && <p>Title: {state.sermonTitle}</p>}
            {state.currentContent.length > 0 && (
              <p className="mt-1">
                Content: {state.currentContent.substring(0, 100)}
                {state.currentContent.length > 100 ? '...' : ''}
              </p>
            )}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                {suggestions.length} Verse{suggestions.length !== 1 ? 's' : ''} Found
              </span>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {suggestions.map((verse) => (
                  <div
                    key={verse.reference}
                    className={cn(
                      "border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors",
                      selectedVerse === verse.reference && "border-orange-500 bg-orange-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {verse.reference}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(verse)}
                        >
                          {copiedId === verse.reference ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleVerseSelect(verse)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2 italic">
                      "{verse.text}"
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {verse.context}
                    </p>
                    {verse.relevance && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Relevance:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 h-1.5 rounded-full"
                            style={{ width: `${verse.relevance}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{verse.relevance}%</span>
                      </div>
                    )}
                    {verse.crossReferences && verse.crossReferences.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Cross References:</p>
                        <div className="flex flex-wrap gap-1">
                          {verse.crossReferences.map((ref, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {suggestions.length === 0 && !isSearching && (
          <div className="text-center py-8 text-sm text-gray-500">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Search for relevant Bible verses</p>
            <p className="text-xs mt-1">AI will find verses based on your sermon topic</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

