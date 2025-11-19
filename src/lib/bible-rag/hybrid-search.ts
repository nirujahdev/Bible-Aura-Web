// Hybrid Search: Combines Semantic (Pinecone) + Keyword (BM25-like) Search
// Provides better retrieval by leveraging both semantic understanding and exact keyword matching

import { getPineconeClient } from '../research-lab/pinecone-client.js';
import { generateOpenAIEmbedding } from './openai-embeddings.js';

// Dynamic import for local-bible to avoid circular dependencies
async function getLocalBible() {
  return await import('../../lib/local-bible');
}

export interface HybridSearchResult {
  id: string;
  text: string;
  reference: string;
  score: number;
  source: 'semantic' | 'keyword' | 'hybrid';
  metadata?: any;
}

export interface HybridSearchOptions {
  maxResults?: number;
  semanticWeight?: number; // 0-1, weight for semantic results
  keywordWeight?: number; // 0-1, weight for keyword results
  rerank?: boolean; // Enable reranking
  minScore?: number; // Minimum similarity score
  language?: 'en' | 'ta';
  translation?: TranslationCode;
}

const DEFAULT_OPTIONS: Required<Omit<HybridSearchOptions, 'translation'>> = {
  maxResults: 10,
  semanticWeight: 0.7,
  keywordWeight: 0.3,
  rerank: true,
  minScore: 0.6,
  language: 'en',
};

/**
 * Perform hybrid search combining semantic and keyword search
 */
export async function hybridBibleSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<HybridSearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Run semantic and keyword search in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      performSemanticSearch(query, opts),
      performKeywordSearch(query, opts),
    ]);

    // Combine and deduplicate results
    const combined = combineResults(semanticResults, keywordResults, opts);

    // Rerank if enabled
    if (opts.rerank) {
      return rerankResults(combined, query, opts);
    }

    // Sort by score and return top results
    return combined
      .sort((a, b) => b.score - a.score)
      .slice(0, opts.maxResults);
  } catch (error: any) {
    console.error('[Hybrid Search] Error:', error);
    // Fallback to keyword search only
    return performKeywordSearch(query, opts);
  }
}

/**
 * Semantic search using Pinecone
 */
async function performSemanticSearch(
  query: string,
  options: Required<Omit<HybridSearchOptions, 'translation'>> & { translation?: string }
): Promise<HybridSearchResult[]> {
  try {
    const pineconeApiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    if (!pineconeApiKey || pineconeApiKey.trim() === '') {
      return [];
    }

    const client = getPineconeClient();
    const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
    const index = client.index(bibleIndexName);

    // Generate embedding
    const queryEmbedding = await generateOpenAIEmbedding(query);

    // Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: options.maxResults * 2, // Get more for reranking
      includeMetadata: true,
      filter: {
        content_type: { $eq: 'bible' },
        language: { $eq: options.language },
      } as any,
    });

    return (queryResponse.matches || [])
      .filter(match => (match.score || 0) >= options.minScore)
      .map(match => {
        const metadata = match.metadata || {};
        return {
          id: match.id,
          text: metadata.verse_text || '',
          reference: metadata.verse_reference || `${metadata.book} ${metadata.chapter}:${metadata.verse}`,
          score: (match.score || 0) * options.semanticWeight,
          source: 'semantic' as const,
          metadata,
        };
      });
  } catch (error: any) {
    console.error('[Hybrid Search] Semantic search error:', error);
    return [];
  }
}

/**
 * Keyword search using local Bible search
 */
async function performKeywordSearch(
  query: string,
  options: Required<Omit<HybridSearchOptions, 'translation'>> & { translation?: TranslationCode }
): Promise<HybridSearchResult[]> {
  try {
    const lang = options.language === 'ta' ? 'tamil' : 'english';
    const translation = options.translation || (options.language === 'ta' ? 'TAMIL' : 'KJV');
    
    const results = await searchVerses(
      query.trim(),
      lang,
      undefined,
      translation,
      {
        maxResults: options.maxResults * 2,
        fuzzyEnabled: false,
      }
    );

    // Calculate keyword match scores (simple TF-IDF-like scoring)
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    return results.map(verse => {
      const verseText = verse.text.toLowerCase();
      let matchScore = 0;
      
      // Count term matches
      for (const term of queryTerms) {
        const matches = (verseText.match(new RegExp(term, 'g')) || []).length;
        matchScore += matches / queryTerms.length;
      }
      
      // Normalize score (0-1 range)
      const normalizedScore = Math.min(1, matchScore / queryTerms.length);
      
      return {
        id: `${verse.book_name}-${verse.chapter}-${verse.verse}`,
        text: verse.text,
        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        score: normalizedScore * options.keywordWeight,
        source: 'keyword' as const,
        metadata: {
          book: verse.book_name,
          chapter: verse.chapter,
          verse: verse.verse,
        },
      };
    });
  } catch (error: any) {
    console.error('[Hybrid Search] Keyword search error:', error);
    return [];
  }
}

/**
 * Combine semantic and keyword results, deduplicate and merge scores
 */
function combineResults(
  semantic: HybridSearchResult[],
  keyword: HybridSearchResult[],
  options: Required<Omit<HybridSearchOptions, 'translation'>> & { translation?: string }
): HybridSearchResult[] {
  const resultMap = new Map<string, HybridSearchResult>();

  // Add semantic results
  for (const result of semantic) {
    const key = result.reference.toLowerCase();
    if (resultMap.has(key)) {
      const existing = resultMap.get(key)!;
      existing.score += result.score;
      existing.source = 'hybrid';
    } else {
      resultMap.set(key, { ...result });
    }
  }

  // Add keyword results
  for (const result of keyword) {
    const key = result.reference.toLowerCase();
    if (resultMap.has(key)) {
      const existing = resultMap.get(key)!;
      existing.score += result.score;
      existing.source = 'hybrid';
    } else {
      resultMap.set(key, { ...result });
    }
  }

  return Array.from(resultMap.values());
}

/**
 * Rerank results using cross-encoder-like approach (simplified)
 * Uses query-verse text similarity for better ranking
 */
function rerankResults(
  results: HybridSearchResult[],
  query: string,
  options: Required<Omit<HybridSearchOptions, 'translation'>> & { translation?: string }
): HybridSearchResult[] {
  // Simple reranking: boost scores for results with query terms in verse text
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  return results.map(result => {
    const verseText = result.text.toLowerCase();
    let rerankBoost = 0;
    
    // Check for exact phrase match (highest boost)
    if (verseText.includes(query.toLowerCase())) {
      rerankBoost += 0.2;
    }
    
    // Check for term matches
    let termMatches = 0;
    for (const term of queryTerms) {
      if (verseText.includes(term)) {
        termMatches++;
      }
    }
    rerankBoost += (termMatches / queryTerms.length) * 0.1;
    
    // Boost for semantic results (they're already well-ranked)
    if (result.source === 'semantic' || result.source === 'hybrid') {
      rerankBoost += 0.05;
    }
    
    return {
      ...result,
      score: Math.min(1, result.score + rerankBoost),
    };
  });
}

