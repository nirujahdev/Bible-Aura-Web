// Advanced Reranking for Bible Search Results
// Improves relevance by re-scoring results based on multiple factors

import { HybridSearchResult } from './hybrid-search';

export interface RerankingOptions {
  diversityWeight?: number; // Penalize similar results
  recencyWeight?: number; // Prefer newer/recently accessed content
  relevanceWeight?: number; // Weight for semantic relevance
  queryLength?: number; // Query length affects reranking strategy
}

/**
 * Rerank search results using multiple factors
 */
export function rerankBibleResults(
  results: HybridSearchResult[],
  query: string,
  options: RerankingOptions = {}
): HybridSearchResult[] {
  const opts = {
    diversityWeight: 0.2,
    recencyWeight: 0.1,
    relevanceWeight: 0.7,
    queryLength: query.length,
    ...options,
  };

  if (results.length === 0) return results;

  // Calculate diversity scores
  const diversityScores = calculateDiversityScores(results);
  
  // Calculate recency scores (if metadata has timestamps)
  const recencyScores = calculateRecencyScores(results);
  
  // Calculate enhanced relevance scores
  const relevanceScores = calculateEnhancedRelevance(results, query);

  // Combine scores
  return results
    .map((result, index) => {
      const diversity = diversityScores[index];
      const recency = recencyScores[index];
      const relevance = relevanceScores[index];
      
      // Weighted combination
      const finalScore = 
        (result.score * opts.relevanceWeight) +
        (diversity * opts.diversityWeight) +
        (recency * opts.recencyWeight) +
        (relevance * 0.1); // Additional relevance boost
      
      return {
        ...result,
        score: Math.min(1, finalScore),
        reranked: true,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate diversity scores to avoid redundant results
 */
function calculateDiversityScores(results: HybridSearchResult[]): number[] {
  const scores: number[] = [];
  const seenBooks = new Set<string>();
  const seenChapters = new Set<string>();
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const book = extractBook(result.reference);
    const chapter = extractChapter(result.reference);
    const bookKey = `${book}`;
    const chapterKey = `${book}-${chapter}`;
    
    let diversity = 1.0;
    
    // Penalize if same book seen recently
    if (seenBooks.has(bookKey)) {
      diversity *= 0.8;
    }
    
    // Penalize more if same chapter seen recently
    if (seenChapters.has(chapterKey)) {
      diversity *= 0.6;
    }
    
    seenBooks.add(bookKey);
    seenChapters.add(chapterKey);
    
    scores.push(diversity);
  }
  
  return scores;
}

/**
 * Calculate recency scores (prefer recently accessed content)
 */
function calculateRecencyScores(results: HybridSearchResult[]): number[] {
  return results.map(result => {
    // If metadata has timestamp, use it
    if (result.metadata?.last_accessed) {
      const daysSinceAccess = (Date.now() - new Date(result.metadata.last_accessed).getTime()) / (1000 * 60 * 60 * 24);
      // Prefer content accessed in last 30 days
      return Math.max(0, 1 - (daysSinceAccess / 30));
    }
    
    // Default: neutral score
    return 0.5;
  });
}

/**
 * Calculate enhanced relevance based on query characteristics
 */
function calculateEnhancedRelevance(results: HybridSearchResult[], query: string): number[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  return results.map(result => {
    const textLower = result.text.toLowerCase();
    let relevance = 0;
    
    // Exact phrase match (highest relevance)
    if (textLower.includes(queryLower)) {
      relevance += 0.5;
    }
    
    // All query terms present
    const allTermsPresent = queryTerms.every(term => textLower.includes(term));
    if (allTermsPresent) {
      relevance += 0.3;
    }
    
    // Term frequency (more occurrences = higher relevance)
    let termCount = 0;
    for (const term of queryTerms) {
      const matches = (textLower.match(new RegExp(term, 'g')) || []).length;
      termCount += matches;
    }
    relevance += Math.min(0.2, termCount / (queryTerms.length * 5));
    
    return Math.min(1, relevance);
  });
}

/**
 * Extract book name from reference
 */
function extractBook(reference: string): string {
  const match = reference.match(/^(\d*\s*[A-Za-z]+\.?)/);
  return match ? match[1].trim() : '';
}

/**
 * Extract chapter number from reference
 */
function extractChapter(reference: string): number {
  const match = reference.match(/\s+(\d+):/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * MMR (Maximal Marginal Relevance) reranking
 * Balances relevance and diversity
 */
export function mmrRerank(
  results: HybridSearchResult[],
  query: string,
  lambda: number = 0.7 // 0 = max diversity, 1 = max relevance
): HybridSearchResult[] {
  if (results.length === 0) return results;
  
  const reranked: HybridSearchResult[] = [];
  const remaining = [...results];
  
  // Start with highest scoring result
  remaining.sort((a, b) => b.score - a.score);
  reranked.push(remaining.shift()!);
  
  // Select remaining results using MMR
  while (remaining.length > 0 && reranked.length < results.length) {
    let bestIndex = 0;
    let bestMMR = -Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      
      // Relevance score
      const relevance = candidate.score;
      
      // Max similarity to already selected results
      let maxSimilarity = 0;
      for (const selected of reranked) {
        const similarity = calculateSimilarity(candidate, selected);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
      
      // MMR score
      const mmr = lambda * relevance - (1 - lambda) * maxSimilarity;
      
      if (mmr > bestMMR) {
        bestMMR = mmr;
        bestIndex = i;
      }
    }
    
    reranked.push(remaining.splice(bestIndex, 1)[0]);
  }
  
  return reranked;
}

/**
 * Calculate similarity between two results
 */
function calculateSimilarity(a: HybridSearchResult, b: HybridSearchResult): number {
  // Simple similarity based on book and chapter
  const bookA = extractBook(a.reference);
  const bookB = extractBook(b.reference);
  const chapterA = extractChapter(a.reference);
  const chapterB = extractChapter(b.reference);
  
  if (bookA === bookB && chapterA === chapterB) {
    return 1.0; // Same chapter
  }
  
  if (bookA === bookB) {
    return 0.5; // Same book
  }
  
  return 0.1; // Different books
}

