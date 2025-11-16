// Sermon AI Editor Utilities - Smart editing features
import { callSermonAIAPI } from './sermon-ai-api-helper';
import { checkAndIncrementUsage } from './ai-limits';

export interface GrammarIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  original: string;
  corrected: string;
  position: number;
  length: number;
  message: string;
}

export interface StyleSuggestion {
  type: 'word-choice' | 'sentence-structure' | 'clarity' | 'tone';
  original: string;
  suggestion: string;
  position: number;
  reason: string;
}

export interface ScriptureReference {
  reference: string;
  text: string;
  isValid: boolean;
  position?: number;
}

/**
 * Check grammar and style of selected text
 */
export async function checkGrammarAndStyle(
  text: string,
  context: string,
  userId?: string
): Promise<{
  grammarIssues: GrammarIssue[];
  styleSuggestions: StyleSuggestion[];
}> {
  if (!text.trim()) {
    return { grammarIssues: [], styleSuggestions: [] };
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return { grammarIssues: [], styleSuggestions: [] };
    }
  }

  const prompt = `Review this sermon text for grammar, spelling, punctuation, and style issues:

Context: ${context.substring(0, 200)}
Text to review: ${text}

Provide corrections in JSON format:
{
  "grammarIssues": [
    {
      "type": "grammar|spelling|punctuation|style",
      "original": "incorrect text",
      "corrected": "corrected text",
      "position": 0,
      "length": 5,
      "message": "explanation"
    }
  ],
  "styleSuggestions": [
    {
      "type": "word-choice|sentence-structure|clarity|tone",
      "original": "current text",
      "suggestion": "improved text",
      "position": 0,
      "reason": "why this is better"
    }
  ]
}`;

  try {
    const response = await callSermonAIAPI(prompt, {
      systemPrompt: 'You are an expert editor specializing in sermon writing. Provide clear, helpful corrections.',
      maxTokens: 600,
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response);
      return {
        grammarIssues: Array.isArray(result.grammarIssues) ? result.grammarIssues : [],
        styleSuggestions: Array.isArray(result.styleSuggestions) ? result.styleSuggestions : [],
      };
    } catch {
      return { grammarIssues: [], styleSuggestions: [] };
    }
  } catch (error) {
    console.error('Grammar check error:', error);
    return { grammarIssues: [], styleSuggestions: [] };
  }
}

/**
 * Validate and enhance scripture references in content
 */
export async function validateScriptureReferences(
  content: string,
  userId?: string
): Promise<ScriptureReference[]> {
  // Extract potential scripture references using regex
  const scripturePattern = /\b([1-3]?\s*)?([A-Z][a-z]+)\s+(\d+):(\d+)(?:-(\d+))?(?:\s*\(([^)]+)\))?/g;
  const matches = Array.from(content.matchAll(scripturePattern));
  
  if (matches.length === 0) {
    return [];
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return matches.map(match => ({
        reference: match[0],
        text: '',
        isValid: true, // Assume valid if can't check
      }));
    }
  }

  const references = matches.map(match => match[0]);
  const prompt = `Validate these Bible verse references and provide the verse text:

References: ${references.join(', ')}

Return JSON:
[
  {
    "reference": "Book Chapter:Verse",
    "text": "verse text or empty if invalid",
    "isValid": true/false
  }
]`;

  try {
    const response = await callSermonAIAPI(prompt, {
      systemPrompt: 'You are a Bible reference validator. Verify references and provide accurate verse text.',
      maxTokens: 800,
      temperature: 0.2,
    });

    try {
      const validated = JSON.parse(response);
      return Array.isArray(validated) ? validated : references.map(ref => ({
        reference: ref,
        text: '',
        isValid: true,
      }));
    } catch {
      return references.map(ref => ({
        reference: ref,
        text: '',
        isValid: true,
      }));
    }
  } catch (error) {
    console.error('Scripture validation error:', error);
    return references.map(ref => ({
      reference: ref,
      text: '',
      isValid: true,
    }));
  }
}

/**
 * Get quick content improvement suggestions
 */
export async function getQuickImprovements(
  text: string,
  focus: 'clarity' | 'engagement' | 'biblical-accuracy' | 'flow',
  userId?: string
): Promise<string[]> {
  if (!text.trim()) {
    return [];
  }

  if (userId) {
    const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
    if (!usageResult.allowed) {
      return [];
    }
  }

  const focusMap = {
    clarity: 'improve clarity and readability',
    engagement: 'increase audience engagement',
    'biblical-accuracy': 'enhance biblical accuracy',
    flow: 'improve flow and transitions',
  };

  const prompt = `Provide 3-5 specific suggestions to ${focusMap[focus]} for this sermon text:

Text: ${text.substring(0, 1000)}${text.length > 1000 ? '...' : ''}

Return as JSON array: ["suggestion 1", "suggestion 2", ...]`;

  try {
    const response = await callSermonAIAPI(prompt, {
      systemPrompt: 'You are an expert sermon editor. Provide specific, actionable improvement suggestions.',
      maxTokens: 400,
      temperature: 0.5,
    });

    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      // Parse as text if not JSON
      return response.split('\n')
        .filter(line => line.trim() && !line.match(/^[\[\]{}]/))
        .slice(0, 5)
        .map(line => line.replace(/^[-*•]\s*/, '').trim());
    }
  } catch (error) {
    console.error('Quick improvements error:', error);
    return [];
  }
}

/**
 * Apply enhancement to text at specific position
 */
export function applyEnhancement(
  content: string,
  position: number,
  length: number,
  replacement: string
): string {
  return content.substring(0, position) + replacement + content.substring(position + length);
}

/**
 * Extract main points from content
 */
export function extractMainPoints(content: string): string[] {
  // Look for numbered or bulleted points
  const pointPatterns = [
    /(?:^|\n)\s*(?:[IVX]+\.|\d+\.|[-*•])\s*([A-Z][^\n]{10,100})/g,
    /(?:^|\n)\s*([A-Z][A-Z\s]{5,50}):/g,
  ];

  const points: string[] = [];
  pointPatterns.forEach(pattern => {
    const matches = Array.from(content.matchAll(pattern));
    matches.forEach(match => {
      const point = match[1]?.trim();
      if (point && point.length > 10 && point.length < 150) {
        points.push(point);
      }
    });
  });

  return [...new Set(points)].slice(0, 5);
}

/**
 * Calculate reading time estimate
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 150): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get word count statistics
 */
export function getWordStats(content: string): {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
} {
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  return {
    wordCount: words.length,
    characterCount: content.length,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
  };
}

