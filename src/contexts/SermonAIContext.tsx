// Sermon AI Context - Shared state for all sermon AI features
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SermonAIState {
  currentContent: string;
  sermonTitle: string;
  scriptureReference: string;
  mainPoints: string[];
  outline: OutlineItem[];
  conversationHistory: ConversationMessage[];
  analysisResults: ContentAnalysis | null;
  suggestions: AISuggestion[];
  isLoading: boolean;
}

interface OutlineItem {
  id: string;
  title: string;
  level: number;
  content?: string;
  subItems?: OutlineItem[];
  order: number;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

interface ContentAnalysis {
  clarity: number;
  readability: number;
  theologicalAccuracy: number;
  structure: number;
  wordCount: number;
  estimatedDuration: number;
  suggestions: string[];
  issues: Array<{
    type: 'grammar' | 'style' | 'theology' | 'structure';
    message: string;
    position?: number;
  }>;
}

interface AISuggestion {
  id: string;
  type: 'autocomplete' | 'enhancement' | 'scripture' | 'illustration';
  content: string;
  position?: number;
  confidence: number;
  metadata?: Record<string, any>;
}

interface SermonAIContextType {
  state: SermonAIState;
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  updateScriptureReference: (reference: string) => void;
  updateMainPoints: (points: string[]) => void;
  updateOutline: (outline: OutlineItem[]) => void;
  addConversationMessage: (message: ConversationMessage) => void;
  clearConversationHistory: () => void;
  updateAnalysisResults: (analysis: ContentAnalysis) => void;
  addSuggestion: (suggestion: AISuggestion) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
  setLoading: (loading: boolean) => void;
}

const SermonAIContext = createContext<SermonAIContextType | undefined>(undefined);

const initialState: SermonAIState = {
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

export function SermonAIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SermonAIState>(initialState);

  const updateContent = useCallback((content: string) => {
    setState(prev => ({ ...prev, currentContent: content }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, sermonTitle: title }));
  }, []);

  const updateScriptureReference = useCallback((reference: string) => {
    setState(prev => ({ ...prev, scriptureReference: reference }));
  }, []);

  const updateMainPoints = useCallback((points: string[]) => {
    setState(prev => ({ ...prev, mainPoints: points }));
  }, []);

  const updateOutline = useCallback((outline: OutlineItem[]) => {
    setState(prev => ({ ...prev, outline }));
  }, []);

  const addConversationMessage = useCallback((message: ConversationMessage) => {
    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  }, []);

  const clearConversationHistory = useCallback(() => {
    setState(prev => ({ ...prev, conversationHistory: [] }));
  }, []);

  const updateAnalysisResults = useCallback((analysis: ContentAnalysis) => {
    setState(prev => ({ ...prev, analysisResults: analysis }));
  }, []);

  const addSuggestion = useCallback((suggestion: AISuggestion) => {
    setState(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, suggestion],
    }));
  }, []);

  const removeSuggestion = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== id),
    }));
  }, []);

  const clearSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, suggestions: [] }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const value: SermonAIContextType = {
    state,
    updateContent,
    updateTitle,
    updateScriptureReference,
    updateMainPoints,
    updateOutline,
    addConversationMessage,
    clearConversationHistory,
    updateAnalysisResults,
    addSuggestion,
    removeSuggestion,
    clearSuggestions,
    setLoading,
  };

  return (
    <SermonAIContext.Provider value={value}>
      {children}
    </SermonAIContext.Provider>
  );
}

export function useSermonAI() {
  const context = useContext(SermonAIContext);
  if (context === undefined) {
    throw new Error('useSermonAI must be used within a SermonAIProvider');
  }
  return context;
}

export type { OutlineItem, ConversationMessage, ContentAnalysis, AISuggestion };

