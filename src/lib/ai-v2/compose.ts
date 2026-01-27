// Compose Response: Generate formatted text (gpt-4o-mini, strict JSON, mode-specific)

import { callGPT4oMini } from './model.js';
import { getComposePrompt } from './prompts.js';
import { GroundingPlan } from './ground.js';
import { Source } from './evidence.js';
import { z } from 'zod';

export interface ComposedResponse {
  text: string;
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';
  lang: 'en' | 'ta';
  usedVerseRefs: string[];
  followUpQuestions: Array<{
    question: string;
    relevance: number;
  }>;
}

const ComposedResponseSchema = z.object({
  text: z.string(),
  mode: z.enum(['chat', 'verse', 'parable', 'character', 'topical', 'qa']),
  lang: z.enum(['en', 'ta']),
  usedVerseRefs: z.array(z.string()),
  followUpQuestions: z.array(z.object({
    question: z.string(),
    relevance: z.number().min(0).max(1)
  })).min(3).max(5)
});

/**
 * Compose response using mode-specific formatting
 */
export async function composeResponse(
  query: string,
  groundingPlan: GroundingPlan,
  evidence: { sources: Source[] },
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa',
  lang: 'en' | 'ta'
): Promise<ComposedResponse> {
  const prompt = getComposePrompt(mode, query, groundingPlan, evidence);

  const systemPrompt = `You are the Bible Aura Meta-Agent. Always return valid JSON matching the required schema. Every response MUST include at least one Bible verse reference. CRITICAL LANGUAGE REQUIREMENT: You MUST respond in ${lang === "ta" ? "Tamil (தமிழ்)" : "English"} language. If the detected language is "ta", write your ENTIRE response in Tamil. If "en", write in English. Never mix languages.`;

  try {
    const result = await callGPT4oMini(prompt, ComposedResponseSchema, {
      systemPrompt,
      temperature: 0.35,
      maxTokens: 2048
    });

    // Verify that response contains at least one verse reference
    const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/;
    if (!versePattern.test(result.text)) {
      // Add fallback verse reference if none found
      if (groundingPlan.usedVerseRefs.length > 0) {
        result.text = `${result.text}\n\nScripture reference: ${groundingPlan.usedVerseRefs[0]}`;
        if (!result.usedVerseRefs.includes(groundingPlan.usedVerseRefs[0])) {
          result.usedVerseRefs.push(groundingPlan.usedVerseRefs[0]);
        }
      } else {
        console.warn('[Compose] No verse reference found in response and no fallback available');
      }
    }

    // Ensure all required fields are present
    if (!result.text || !result.mode || !result.lang) {
      throw new Error('Invalid response from compose: missing required fields');
    }
    
    return {
      text: result.text,
      mode: result.mode,
      lang: result.lang,
      usedVerseRefs: result.usedVerseRefs || [],
      followUpQuestions: result.followUpQuestions || []
    };
  } catch (error) {
    console.error('[Compose] Error:', error);
    // Fallback response
    const fallbackRef = groundingPlan.usedVerseRefs[0] || 'John 3:16';
    return {
      text: `➤ Response Generation Error\n\n⤷ I encountered an error processing your query. Please try rephrasing your question.\n\nScripture reference: ${fallbackRef}`,
      mode,
      lang,
      usedVerseRefs: [fallbackRef],
      followUpQuestions: [
        { question: 'Could you rephrase your question?', relevance: 0.8 },
        { question: 'What specific aspect would you like to know more about?', relevance: 0.7 },
        { question: 'Would you like to explore a related topic?', relevance: 0.6 }
      ]
    };
  }
}

