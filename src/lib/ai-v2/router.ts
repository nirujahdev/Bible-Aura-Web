// Router: Detect mode, language, and extract verse references
// Uses gpt-4o-mini for mode detection, deterministic for language/verse extraction

import { callGPT4oMini } from './model.js';
import { z } from 'zod';

export interface RouterOutput {
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';
  lang: 'en' | 'ta';
  hasDirectVerseRef: boolean;
  verseRefs: string[];
}

const RouterOutputSchema = z.object({
  mode: z.enum(['chat', 'verse', 'parable', 'character', 'topical', 'qa']),
  lang: z.enum(['en', 'ta']),
  hasDirectVerseRef: z.boolean(),
  verseRefs: z.array(z.string())
});

/**
 * Detect language using Unicode check (Tamil range: 0B80-0BFF)
 */
function detectLanguage(text: string): 'en' | 'ta' {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? 'ta' : 'en';
}

/**
 * Extract verse references from text
 * Pattern: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
 */
export function extractVerseReferences(text: string): string[] {
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const matches = text.match(versePattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Detect mode from query intent using LLM
 */
async function detectMode(query: string, preferredMode?: string): Promise<'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa'> {
  // If mode is explicitly provided, use it (map from UI format if needed)
  if (preferredMode) {
    const modeMap: Record<string, 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa'> = {
      'chat': 'chat',
      'verse': 'verse',
      'parable': 'parable',
      'character': 'character',
      'topical': 'topical',
      'qa': 'qa',
      'chat-clean': 'chat',
      'verse-clean': 'verse',
      'parable-clean': 'parable',
      'character-clean': 'character',
      'topical-clean': 'topical',
      'qa-clean': 'qa'
    };
    if (modeMap[preferredMode]) {
      return modeMap[preferredMode];
    }
  }

  // Use LLM to detect mode
  const prompt = `Analyze this Bible-related query and determine the most appropriate response mode.

Query: "${query}"

Modes:
- chat: General conversational Bible guidance
- verse: Deep analysis of a specific Bible verse
- parable: Explanation of a biblical parable
- character: Study of a biblical character
- topical: Study of a biblical topic/theme
- qa: Direct answer to a Bible question

Return JSON only:
{
  "mode": "chat" | "verse" | "parable" | "character" | "topical" | "qa"
}`;

  const schema = z.object({
    mode: z.enum(['chat', 'verse', 'parable', 'character', 'topical', 'qa'])
  });

  try {
    const result = await callGPT4oMini(prompt, schema, {
      temperature: 0.2, // Low temperature for consistent mode detection
      maxTokens: 100
    });
    return result.mode;
  } catch (error) {
    console.warn('[Router] Mode detection failed, defaulting to chat:', error);
    return 'chat';
  }
}

/**
 * Main router function
 */
export async function routeQuery(
  userInput: string,
  preferredMode?: string,
  preferredLanguage?: 'en' | 'ta'
): Promise<RouterOutput> {
  // Detect language (prefer explicit preference, then detect)
  const lang = preferredLanguage || detectLanguage(userInput);

  // Extract verse references
  const verseRefs = extractVerseReferences(userInput);
  const hasDirectVerseRef = verseRefs.length > 0;

  // Detect mode
  const mode = await detectMode(userInput, preferredMode);

  return {
    mode,
    lang,
    hasDirectVerseRef,
    verseRefs
  };
}

