// Rerank: LLM rerank with strict JSON output
// Takes 30 candidates and returns top 8-12 ranked passages

import { callGPT4oMini } from './model.js';
import { RetrievedChunk } from './pinecone.js';
import { z } from 'zod';

export interface RerankedChunk extends RetrievedChunk {
  rerankScore: number;
  rerankReason: string;
}

const RerankOutputSchema = z.object({
  ranked: z.array(z.object({
    id: z.string(),
    score: z.number().min(0).max(1),
    reason: z.string()
  }))
});

/**
 * Rerank candidates using LLM
 */
export async function rerankCandidates(
  candidates: RetrievedChunk[],
  query: string
): Promise<RerankedChunk[]> {
  if (candidates.length === 0) {
    return [];
  }

  // Limit to top 30 for reranking (already filtered by MIN_SCORE)
  const candidatesToRerank = candidates.slice(0, 30);

  // Build passages list for prompt
  const passagesText = candidatesToRerank.map((candidate, idx) => {
    return `[${idx}] ID: ${candidate.id}
Reference: ${candidate.metadata.verse_reference}
Text: ${candidate.text.substring(0, 200)}...
Original Score: ${candidate.score.toFixed(3)}`;
  }).join('\n\n');

  const prompt = `You are ranking Bible passages by relevance to a user query.

Query: "${query}"

Passages:
${passagesText}

Rank these passages by:
1. Relevance to the query
2. Theological accuracy
3. Completeness of information
4. Directness of answer

Return JSON only with top 8-12 most relevant passages:
{
  "ranked": [
    {"id": "passage_id", "score": 0.0-1.0, "reason": "why relevant"}
  ]
}

Rank by relevance to query, theological accuracy, and completeness.`;

  try {
    const result = await callGPT4oMini(prompt, RerankOutputSchema, {
      temperature: 0.2, // Low temperature for consistent ranking
      maxTokens: 2000
    });

    // Create a map of rerank results
    const rerankMap = new Map<string, { score: number; reason: string }>();
    result.ranked.forEach(item => {
      rerankMap.set(item.id, { score: item.score, reason: item.reason });
    });

    // Merge original scores with rerank scores
    // finalScore = (originalScore * 0.6) + (rerankScore * 0.4)
    const reranked: RerankedChunk[] = candidatesToRerank
      .map(candidate => {
        const rerankData = rerankMap.get(candidate.id);
        if (!rerankData) {
          // If not in rerank results, use original score (lower priority)
          return {
            ...candidate,
            rerankScore: candidate.score * 0.5, // Penalize for not being selected
            rerankReason: 'Not selected by reranker'
          };
        }

        const finalScore = (candidate.score * 0.6) + (rerankData.score * 0.4);
        
        return {
          ...candidate,
          score: finalScore, // Update score with merged value
          rerankScore: rerankData.score,
          rerankReason: rerankData.reason
        };
      })
      .sort((a, b) => b.score - a.score) // Sort by final score
      .slice(0, 12); // Top 12

    console.log(`[Rerank] Reranked ${candidatesToRerank.length} candidates to top ${reranked.length}`);

    return reranked;
  } catch (error) {
    console.error('[Rerank] Error:', error);
    // Fallback: return top candidates by original score
    return candidatesToRerank
      .slice(0, 12)
      .map(c => ({
        ...c,
        rerankScore: c.score,
        rerankReason: 'Rerank failed, using original score'
      }));
  }
}

