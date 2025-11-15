// Sermon Content Analyzer - Real-time content analysis
import React, { useState, useEffect, useCallback } from 'react';
import { useSermonAI } from '@/contexts/SermonAIContext';
import { analyzeContent, ContentAnalysisResult } from '@/lib/sermon-ai-service';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SermonContentAnalyzerProps {
  className?: string;
}

export function SermonContentAnalyzer({ className }: SermonContentAnalyzerProps) {
  const { state, updateAnalysisResults } = useSermonAI();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const performAnalysis = useCallback(async () => {
    if (!state.currentContent.trim() || !user) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeContent(
        state.currentContent,
        {
          title: state.sermonTitle,
          scripture: state.scriptureReference,
        },
        user.id
      );

      if (analysis) {
        updateAnalysisResults(analysis);
        setLastAnalysisTime(new Date());
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error?.message || 'Failed to analyze content. Please try again.';
      toast({
        title: error?.message?.includes('API key') ? 'API Configuration Error' : 'Analysis Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [state.currentContent, state.sermonTitle, state.scriptureReference, user, updateAnalysisResults, toast]);

  useEffect(() => {
    // Debounce analysis - wait 2 seconds after user stops typing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (state.currentContent.trim().length > 50) {
      debounceTimerRef.current = setTimeout(() => {
        performAnalysis();
      }, 2000);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state.currentContent, performAnalysis]);

  const analysis = state.analysisResults;

  if (!analysis && !isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Content Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Start writing to see real-time analysis</p>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Content Analysis
          {isAnalyzing && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Analyzing...
            </Badge>
          )}
          {lastAnalysisTime && !isAnalyzing && (
            <span className="text-xs text-gray-400 ml-auto">
              {lastAnalysisTime.toLocaleTimeString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <>
            {/* Score Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Clarity</span>
                  <span className={`text-xs font-medium ${getScoreColor(analysis.clarity)}`}>
                    {analysis.clarity}%
                  </span>
                </div>
                <Progress value={analysis.clarity} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Readability</span>
                  <span className={`text-xs font-medium ${getScoreColor(analysis.readability)}`}>
                    {analysis.readability}%
                  </span>
                </div>
                <Progress value={analysis.readability} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Theology</span>
                  <span className={`text-xs font-medium ${getScoreColor(analysis.theologicalAccuracy)}`}>
                    {analysis.theologicalAccuracy}%
                  </span>
                </div>
                <Progress value={analysis.theologicalAccuracy} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Structure</span>
                  <span className={`text-xs font-medium ${getScoreColor(analysis.structure)}`}>
                    {analysis.structure}%
                  </span>
                </div>
                <Progress value={analysis.structure} className="h-2" />
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">{analysis.wordCount} words</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">~{analysis.estimatedDuration} min</span>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-700">Issues Found</span>
                </div>
                <div className="space-y-1">
                  {analysis.issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-700">Suggestions</span>
                </div>
                <div className="space-y-1">
                  {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

