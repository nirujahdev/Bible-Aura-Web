// Grounding Plan: Generate reasoning + verse refs list (gpt-4o-mini, strict JSON)
// CRITICAL: Must NOT include verse text, only references

import { callGPT4oMini } from './model.js';
import { Source } from './evidence.js';
import { z } from 'zod';

export interface GroundingPlan {
  usedVerseRefs: string[];
  reasoningSummary: string[];
  confidenceDraft: 'high' | 'medium' | 'low';
}

const GroundingPlanSchema = z.object({
  usedVerseRefs: z.array(z.string()),
  reasoningSummary: z.array(z.string()).min(3).max(6),
  confidenceDraft: z.enum(['high', 'medium', 'low'])
});

/**
 * Generate grounding plan from evidence pack
 */
export async function generateGroundingPlan(
  query: string,
  evidence: { sources: Source[] }
): Promise<GroundingPlan> {
  if (evidence.sources.length === 0) {
    return {
      usedVerseRefs: [],
      reasoningSummary: ['No sources available for grounding'],
      confidenceDraft: 'low'
    };
  }

  // Build evidence summary (references only, NO verse text)
  const evidenceSummary = evidence.sources.map((source, idx) => {
    return `[${idx + 1}] ${source.reference || source.filename} (score: ${source.score.toFixed(3)})`;
  }).join('\n');

  const prompt = `You are creating a grounding plan for a Bible answer.

Query: "${query}"

Available Evidence (verse references only):
${evidenceSummary}

Your task:
1. Select which verse references should be used in the answer (3-8 references)
2. Provide 3-6 bullet points explaining why these sources were chosen
3. Assess confidence level (high/medium/low)

CRITICAL RULES:
- Do NOT include verse text, only references like "John 3:16"
- Do NOT quote or paraphrase verse content
- Focus on why each reference is relevant to the query
- Be concise in reasoning (1 sentence per bullet)

Return JSON only:
{
  "usedVerseRefs": ["John 3:16", "Romans 8:28"],
  "reasoningSummary": [
    "Selected John 3:16 because it directly addresses the query about God's love",
    "Included Romans 8:28 for its theological connection to the theme"
  ],
  "confidenceDraft": "high" | "medium" | "low"
}`;

  try {
    const result = await callGPT4oMini(prompt, GroundingPlanSchema, {
      temperature: 0.3,
      maxTokens: 1000
    });

    // Validate that usedVerseRefs exist in sources
    const availableRefs = new Set(
      evidence.sources
        .map(s => s.reference || s.filename)
        .filter(Boolean)
    );

    // Filter to only include references that exist in sources
    const validRefs = result.usedVerseRefs.filter(ref => {
      // Check if reference matches any source (fuzzy match)
      return Array.from(availableRefs).some(availableRef => 
        availableRef.includes(ref) || ref.includes(availableRef.split(' ')[0])
      );
    });

    // If no valid refs, use top sources
    if (validRefs.length === 0 && evidence.sources.length > 0) {
      validRefs.push(...evidence.sources.slice(0, 3).map(s => s.reference || s.filename).filter(Boolean) as string[]);
    }

    return {
      usedVerseRefs: validRefs,
      reasoningSummary: result.reasoningSummary,
      confidenceDraft: result.confidenceDraft
    };
  } catch (error) {
    console.error('[Grounding Plan] Error:', error);
    // Fallback: use top 3 sources
    const fallbackRefs = evidence.sources
      .slice(0, 3)
      .map(s => s.reference || s.filename)
      .filter(Boolean) as string[];

    return {
      usedVerseRefs: fallbackRefs,
      reasoningSummary: [
        'Selected top sources based on relevance scores',
        'Grounding plan generation failed, using fallback'
      ],
      confidenceDraft: 'medium'
    };
  }
}

