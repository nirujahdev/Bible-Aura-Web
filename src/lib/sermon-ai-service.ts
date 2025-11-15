// Sermon AI Service - Centralized AI operations for sermon features
// Uses Agent SDK for specialized sermon AI assistance
// Use dynamic imports to prevent circular dependencies and code-splitting issues
import { callOpenAIAPI } from './openai-api-helper';
import { checkAndIncrementUsage } from './ai-limits';

export interface AutoCompleteSuggestion {
  text: string;
  confidence: number;
  reason: string;
}

export interface ContentAnalysisResult {
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

export interface EnhancementSuggestion {
  type: 'clarity' | 'illustration' | 'transition' | 'application' | 'word-choice';
  original: string;
  enhanced: string;
  reason: string;
  position: number;
}

export interface ScriptureSuggestion {
  reference: string;
  text: string;
  relevance: number;
  context: string;
  crossReferences: string[];
}

export interface OutlineSuggestion {
  title: string;
  level: number;
  content: string;
  subPoints?: string[];
}

/**
 * Get AI-powered auto-complete suggestions
 */
export async function getAutoCompleteSuggestions(
  content: string,
  cursorPosition: number,
  context: {
    title?: string;
    scripture?: string;
    previousText?: string;
  },
  userId?: string
): Promise<AutoCompleteSuggestion[]> {
  if (userId) {
    // Check limit if user is provided
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return [];
    }
  }

  const textBeforeCursor = content.substring(0, cursorPosition);
  const lastSentence = textBeforeCursor.split(/[.!?]\s+/).pop() || '';
  const contextWindow = content.substring(Math.max(0, cursorPosition - 500), cursorPosition);

  const prompt = `You are a sermon writing assistant. Based on the context below, suggest 3-5 natural continuations for the current sentence.

Sermon Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}
Recent Context: ${contextWindow}
Current Sentence: ${lastSentence}

Provide suggestions that are:
- Theologically sound
- Natural and flowing
- Appropriate for sermon context
- 5-15 words each

Return as JSON array: [{"text": "suggestion", "confidence": 0.9, "reason": "why this fits"}]`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are an expert sermon writing assistant. Provide helpful, natural text completions.',
      maxTokens: 300,
      temperature: 0.7,
      model: 'gpt-4o',
    });

    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      // If not JSON, parse as text
      const lines = response.split('\n').filter(l => l.trim());
      return lines.slice(0, 5).map((line, i) => ({
        text: line.replace(/^[-*•]\s*/, '').trim(),
        confidence: 0.8 - i * 0.1,
        reason: 'AI-generated suggestion',
      }));
    }
  } catch (error: any) {
    console.error('Auto-complete error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return [];
  }
}

/**
 * Analyze sermon content for quality and improvements
 * Uses Agent SDK for specialized sermon analysis
 */
export async function analyzeContent(
  content: string,
  context: {
    title?: string;
    scripture?: string;
  },
  userId?: string
): Promise<ContentAnalysisResult | null> {
  if (!content.trim()) {
    return null;
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return null;
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const estimatedDuration = Math.ceil(wordCount / 150);

  try {
    // Dynamically import to prevent circular dependency
    const { analyzeSermonContent: analyzeWithAgent } = await import('./sermon-agent-sdk');
    
    // Use Agent SDK for specialized analysis
    const analysisText = await analyzeWithAgent(content, {
      title: context.title,
      scripture: context.scripture
    });

    // Parse the analysis text to extract scores and suggestions
    // The Agent SDK returns structured text, we'll parse it
    const clarityMatch = analysisText.match(/clarity[:\s]+(\d+)/i);
    const readabilityMatch = analysisText.match(/readability[:\s]+(\d+)/i);
    const theologyMatch = analysisText.match(/theological[:\s]+accuracy[:\s]+(\d+)/i);
    const structureMatch = analysisText.match(/structure[:\s]+(\d+)/i);

    const suggestions = analysisText
      .split(/suggestion|recommendation|improvement/i)
      .slice(1)
      .map(s => s.split(/[.!?]/)[0].trim())
      .filter(s => s.length > 10 && s.length < 200)
      .slice(0, 5);

    return {
      clarity: clarityMatch ? parseInt(clarityMatch[1]) : 75,
      readability: readabilityMatch ? parseInt(readabilityMatch[1]) : 75,
      theologicalAccuracy: theologyMatch ? parseInt(theologyMatch[1]) : 80,
      structure: structureMatch ? parseInt(structureMatch[1]) : 70,
      wordCount,
      estimatedDuration,
      suggestions: suggestions.length > 0 ? suggestions : ['Consider adding more illustrations', 'Strengthen transitions between points'],
      issues: [],
    };
  } catch (error: any) {
    console.error('Content analysis error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return {
      clarity: 75,
      readability: 75,
      theologicalAccuracy: 80,
      structure: 70,
      wordCount,
      estimatedDuration,
      suggestions: [],
      issues: [],
    };
  }
}

/**
 * Get content enhancement suggestions
 * Uses Agent SDK for specialized sermon enhancements
 */
export async function enhanceContent(
  content: string,
  focus: 'clarity' | 'illustration' | 'transition' | 'application' | 'word-choice' | 'all',
  context: {
    title?: string;
    scripture?: string;
  },
  userId?: string
): Promise<EnhancementSuggestion[]> {
  if (!content.trim()) {
    return [];
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return [];
    }
  }

  try {
    // Map focus types to agent SDK focus
    const focusMap: Record<string, 'clarity' | 'illustration' | 'application' | 'structure' | 'theology'> = {
      'clarity': 'clarity',
      'illustration': 'illustration',
      'application': 'application',
      'transition': 'structure',
      'word-choice': 'clarity',
      'all': 'structure'
    };

    const agentFocus = focusMap[focus] || 'structure';
    
    // Dynamically import to prevent circular dependency
    const { getSermonEnhancements: enhanceWithAgent } = await import('./sermon-agent-sdk');
    
    // Use Agent SDK for specialized enhancements
    const enhancementText = await enhanceWithAgent(content, agentFocus, {
      title: context.title,
      scripture: context.scripture
    });

    // Parse enhancement text into structured suggestions
    // This is a simplified parser - in production, you might want more sophisticated parsing
    const suggestions: EnhancementSuggestion[] = [];
    const lines = enhancementText.split('\n').filter(l => l.trim());
    
    let currentSuggestion: Partial<EnhancementSuggestion> | null = null;
    for (const line of lines) {
      if (line.match(/original|current/i)) {
        if (currentSuggestion) suggestions.push(currentSuggestion as EnhancementSuggestion);
        currentSuggestion = { type: focus === 'all' ? 'clarity' : focus, original: '', enhanced: '', reason: '', position: 0 };
        const match = line.match(/original[:\s]+(.+)/i);
        if (match) currentSuggestion.original = match[1].trim();
      } else if (line.match(/enhanced|improved|better/i) && currentSuggestion) {
        const match = line.match(/enhanced[:\s]+(.+)/i) || line.match(/improved[:\s]+(.+)/i);
        if (match) currentSuggestion.enhanced = match[1].trim();
      } else if (line.match(/reason|why/i) && currentSuggestion) {
        const match = line.match(/reason[:\s]+(.+)/i);
        if (match) currentSuggestion.reason = match[1].trim();
      }
    }
    if (currentSuggestion) suggestions.push(currentSuggestion as EnhancementSuggestion);

    return suggestions.length > 0 ? suggestions.slice(0, 5) : [];
  } catch (error: any) {
    console.error('Content enhancement error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return [];
  }
}

/**
 * Find relevant scriptures based on topic and context
 * Uses Agent SDK for specialized scripture finding
 */
export async function findRelevantScriptures(
  topic: string,
  context: {
    currentContent?: string;
    mainPoints?: string[];
  },
  userId?: string
): Promise<ScriptureSuggestion[]> {
  if (!topic.trim()) {
    return [];
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return [];
    }
  }

  try {
    // Dynamically import to prevent circular dependency
    const { findSermonScriptures: scripturesWithAgent } = await import('./sermon-agent-sdk');
    
    // Use Agent SDK for specialized scripture finding
    const scriptureText = await scripturesWithAgent(topic, {
      content: context.currentContent,
      mainPoints: context.mainPoints
    });

    // Parse scripture text into structured suggestions
    const suggestions: ScriptureSuggestion[] = [];
    const versePattern = /([1-3]?\s*[A-Z][a-z]+\s+\d+:\d+(?:-\d+)?)/g;
    const verses = scriptureText.match(versePattern) || [];

    for (const verseRef of verses.slice(0, 7)) {
      const contextMatch = scriptureText.match(new RegExp(`${verseRef.replace(/[()]/g, '\\$&')}[^\\n]*\\n([^\\n]+)`, 'i'));
      suggestions.push({
        reference: verseRef,
        text: contextMatch?.[1]?.trim() || '',
        relevance: 85,
        context: `Relevant to: ${topic}`,
        crossReferences: []
      });
    }

    return suggestions;
  } catch (error: any) {
    console.error('Scripture finder error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return [];
  }
}

/**
 * Generate sermon outline with AI assistance
 * Uses Agent SDK for specialized outline generation
 */
export async function generateOutline(
  topic: string,
  scripture: string,
  options: {
    audienceType?: string;
    sermonType?: string;
    length?: string;
  },
  userId?: string
): Promise<OutlineSuggestion[]> {
  if (!topic.trim() && !scripture.trim()) {
    return [];
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_sermon');
    if (!usageResult.allowed) {
      return [];
    }
  }

  try {
    // Dynamically import to prevent circular dependency
    const { generateSermonOutline: outlineWithAgent } = await import('./sermon-agent-sdk');
    
    // Use Agent SDK for specialized outline generation
    const outlineText = await outlineWithAgent(topic, scripture, {
      sermonType: options.sermonType as any,
      audience: options.audienceType
    });

    // Parse outline text into structured suggestions
    const suggestions: OutlineSuggestion[] = [];
    const mainPointPattern = /(?:^|\n)\s*(?:[IVX]+\.|\d+\.|#)\s*([^\n]+)/g;
    const mainPoints = Array.from(outlineText.matchAll(mainPointPattern));

    mainPoints.forEach((match, index) => {
      const title = match[1].trim();
      if (title.length > 5 && title.length < 100) {
        // Find content after the title
        const contentStart = match.index! + match[0].length;
        const nextMatch = mainPoints[index + 1];
        const contentEnd = nextMatch ? nextMatch.index! : outlineText.length;
        const content = outlineText.substring(contentStart, contentEnd).trim().substring(0, 300);

        // Find sub-points
        const subPointPattern = /(?:^|\n)\s*(?:[a-z]\)|[-*•])\s*([^\n]+)/g;
        const subPoints: string[] = [];
        const subMatches = Array.from(content.matchAll(subPointPattern));
        subMatches.forEach(subMatch => {
          const subPoint = subMatch[1].trim();
          if (subPoint.length > 5 && subPoint.length < 150) {
            subPoints.push(subPoint);
          }
        });

        suggestions.push({
          title,
          level: 1,
          content: content.split('\n')[0] || '',
          subPoints: subPoints.length > 0 ? subPoints : undefined
        });
      }
    });

    return suggestions.length > 0 ? suggestions : [{
      title: topic || 'Main Point',
      level: 1,
      content: outlineText.substring(0, 200),
      subPoints: []
    }];
  } catch (error: any) {
    console.error('Outline generation error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return [];
  }
}

/**
 * Check theological accuracy of content
 */
export async function checkTheologicalAccuracy(
  content: string,
  context: {
    title?: string;
    scripture?: string;
  },
  userId?: string
): Promise<{
  accuracy: number;
  issues: Array<{ message: string; position?: number; severity: 'low' | 'medium' | 'high' }>;
  suggestions: string[];
}> {
  if (!content.trim()) {
    return { accuracy: 100, issues: [], suggestions: [] };
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return { accuracy: 100, issues: [], suggestions: [] };
    }
  }

  const prompt = `Review this sermon content for theological accuracy:

Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}

Content:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Check for:
- Biblical accuracy
- Doctrinal soundness
- Proper interpretation
- Potential misunderstandings

Return JSON:
{
  "accuracy": 0-100,
  "issues": [
    {"message": "issue description", "position": 123, "severity": "low|medium|high"}
  ],
  "suggestions": ["improvement 1", "improvement 2"]
}`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are a theological accuracy reviewer. Ensure content is biblically sound and doctrinally correct.',
      maxTokens: 600,
      temperature: 0.2,
      model: 'gpt-4o',
    });

    try {
      const result = JSON.parse(response);
      return result;
    } catch {
      return { accuracy: 85, issues: [], suggestions: [] };
    }
  } catch (error: any) {
    console.error('Theological accuracy check error:', error);
    // Re-throw API key errors so they can be displayed to the user
    if (error?.message?.includes('API key') || error?.message?.includes('OpenAI')) {
      throw error;
    }
    return { accuracy: 85, issues: [], suggestions: [] };
  }
}

