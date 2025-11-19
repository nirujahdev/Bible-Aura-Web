// Agent Reflection & Self-Correction System
// Allows agents to review and improve their own responses

import { OpenAI } from 'openai';

export interface ReflectionResult {
  needsCorrection: boolean;
  confidence: number; // 0-1
  issues: string[];
  correctedResponse?: string;
  reasoning?: string;
}

/**
 * Reflect on and potentially correct an agent response
 */
export async function reflectOnResponse(
  originalResponse: string,
  userQuery: string,
  context: string,
  client: OpenAI
): Promise<ReflectionResult> {
  try {
    const reflectionPrompt = `You are a quality assurance agent reviewing a Bible AI response.

Original User Query: ${userQuery}

Bible Context Available:
${context.substring(0, 2000)}${context.length > 2000 ? '...' : ''}

Agent's Response:
${originalResponse}

Review the response and check for:
1. Accuracy - Are all Bible references correct and present in the context?
2. Completeness - Does it fully answer the user's question?
3. Theological soundness - Is the interpretation biblically sound?
4. Clarity - Is the response clear and well-structured?
5. Hallucination - Are there any made-up verses or incorrect references?

Return JSON:
{
  "needsCorrection": true/false,
  "confidence": 0.0-1.0,
  "issues": ["list of issues found, if any"],
  "correctedResponse": "corrected version if needed, otherwise same as original",
  "reasoning": "brief explanation of your review"
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // Use smaller model for reflection
      messages: [
        {
          role: "system",
          content: "You are a quality assurance agent. Always return valid JSON."
        },
        {
          role: "user",
          content: reflectionPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low temperature for consistent review
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    if (!responseText) {
      return {
        needsCorrection: false,
        confidence: 0.5,
        issues: [],
      };
    }

    try {
      const parsed = JSON.parse(responseText);
      return {
        needsCorrection: parsed.needsCorrection || false,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        issues: parsed.issues || [],
        correctedResponse: parsed.correctedResponse || originalResponse,
        reasoning: parsed.reasoning,
      };
    } catch {
      // If JSON parsing fails, return safe default
      return {
        needsCorrection: false,
        confidence: 0.5,
        issues: [],
      };
    }
  } catch (error: any) {
    console.error('[Reflection] Error:', error);
    // Return safe default on error
    return {
      needsCorrection: false,
      confidence: 0.5,
      issues: [],
    };
  }
}

/**
 * Calculate confidence score for a response
 */
export function calculateConfidence(
  response: string,
  context: string,
  hasVerseReferences: boolean
): number {
  let confidence = 0.5; // Base confidence

  // Boost if response contains verse references
  if (hasVerseReferences) {
    confidence += 0.2;
  }

  // Boost if response is well-structured
  if (response.length > 50 && response.length < 2000) {
    confidence += 0.1;
  }

  // Boost if context was used (response mentions context elements)
  const contextTerms = context.split(/\s+/).slice(0, 10);
  const responseLower = response.toLowerCase();
  const contextMatches = contextTerms.filter(term => 
    term.length > 3 && responseLower.includes(term.toLowerCase())
  ).length;
  confidence += Math.min(0.2, contextMatches / 10);

  return Math.min(1, confidence);
}

/**
 * Detect potential hallucinations (made-up verses)
 */
export function detectHallucinations(
  response: string,
  validReferences: string[]
): string[] {
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const matches = [...response.matchAll(versePattern)];
  const mentionedRefs = matches.map(m => m[0]);
  
  const hallucinations: string[] = [];
  const validRefsLower = validReferences.map(r => r.toLowerCase());
  
  for (const ref of mentionedRefs) {
    const refLower = ref.toLowerCase();
    const isValid = validRefsLower.some(valid => 
      valid.includes(refLower) || refLower.includes(valid)
    );
    
    if (!isValid) {
      hallucinations.push(ref);
    }
  }
  
  return hallucinations;
}

