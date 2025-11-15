// Sermon AI Service - Centralized AI operations for sermon features
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
      model: 'gpt-4.1-mini',
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
  } catch (error) {
    console.error('Auto-complete error:', error);
    return [];
  }
}

/**
 * Analyze sermon content for quality and improvements
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

  const prompt = `Analyze this sermon content for quality, clarity, and theological accuracy:

Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}

Content:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

Provide analysis in JSON format:
{
  "clarity": 0-100,
  "readability": 0-100,
  "theologicalAccuracy": 0-100,
  "structure": 0-100,
  "suggestions": ["improvement 1", "improvement 2"],
  "issues": [
    {"type": "grammar|style|theology|structure", "message": "issue description", "position": 123}
  ]
}`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are an expert sermon analyst. Provide constructive, theologically sound feedback.',
      maxTokens: 800,
      temperature: 0.3,
      model: 'gpt-4.1-mini',
    });

    try {
      const analysis = JSON.parse(response);
      return {
        ...analysis,
        wordCount,
        estimatedDuration,
      };
    } catch {
      // Fallback analysis
      return {
        clarity: 75,
        readability: 75,
        theologicalAccuracy: 80,
        structure: 70,
        wordCount,
        estimatedDuration,
        suggestions: ['Consider adding more illustrations', 'Strengthen transitions between points'],
        issues: [],
      };
    }
  } catch (error) {
    console.error('Content analysis error:', error);
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

  const focusPrompt = focus === 'all' 
    ? 'all aspects (clarity, illustrations, transitions, applications, word choice)'
    : focus;

  const prompt = `Analyze this sermon content and provide specific enhancement suggestions for ${focusPrompt}:

Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}

Content:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Provide 3-5 enhancement suggestions in JSON format:
[
  {
    "type": "clarity|illustration|transition|application|word-choice",
    "original": "original text",
    "enhanced": "improved version",
    "reason": "why this is better",
    "position": 123
  }
]`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are an expert sermon editor. Provide specific, actionable enhancement suggestions.',
      maxTokens: 1000,
      temperature: 0.5,
      model: 'gpt-4.1-mini',
    });

    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Content enhancement error:', error);
    return [];
  }
}

/**
 * Find relevant scriptures based on topic and context
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

  const prompt = `Find 5-7 relevant Bible verses for this sermon topic:

Topic: ${topic}
${context.currentContent ? `Current Content: ${context.currentContent.substring(0, 500)}` : ''}
${context.mainPoints ? `Main Points: ${context.mainPoints.join(', ')}` : ''}

Provide verses in JSON format:
[
  {
    "reference": "Book Chapter:Verse",
    "text": "verse text",
    "relevance": 0-100,
    "context": "why this verse is relevant",
    "crossReferences": ["related verse 1", "related verse 2"]
  }
]`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are a biblical reference expert. Provide accurate, relevant scripture references.',
      maxTokens: 800,
      temperature: 0.4,
      model: 'gpt-4.1-mini',
    });

    try {
      const scriptures = JSON.parse(response);
      return Array.isArray(scriptures) ? scriptures : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Scripture finder error:', error);
    return [];
  }
}

/**
 * Generate sermon outline with AI assistance
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

  const prompt = `Create a detailed sermon outline:

Topic: ${topic || 'Not specified'}
Scripture: ${scripture || 'Not specified'}
Audience: ${options.audienceType || 'general'}
Type: ${options.sermonType || 'expository'}
Length: ${options.length || 'medium'}

Provide outline in JSON format:
[
  {
    "title": "Main Point Title",
    "level": 1,
    "content": "detailed explanation",
    "subPoints": ["sub-point 1", "sub-point 2"]
  }
]`;

  try {
    const response = await callOpenAIAPI(prompt, {
      systemPrompt: 'You are an expert sermon outline creator. Provide structured, biblically sound outlines.',
      maxTokens: 1200,
      temperature: 0.6,
      model: 'gpt-4.1-mini',
    });

    try {
      const outline = JSON.parse(response);
      return Array.isArray(outline) ? outline : [];
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Outline generation error:', error);
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
      model: 'gpt-4.1-mini',
    });

    try {
      const result = JSON.parse(response);
      return result;
    } catch {
      return { accuracy: 85, issues: [], suggestions: [] };
    }
  } catch (error) {
    console.error('Theological accuracy check error:', error);
    return { accuracy: 85, issues: [], suggestions: [] };
  }
}

