// Pinecone-based Bible RAG Retrieval
// Replaces OpenAI Vector Store with Pinecone for Bible content

import { getPineconeClient } from '../research-lab/pinecone-client.js';
import { generateOpenAIEmbedding } from './openai-embeddings.js';

// Maximum chunks to retrieve (optimized for speed)
const MAX_CHUNKS = 5;
const MIN_SCORE = 0.7; // Minimum similarity score

export interface RAGResult {
  lang: "en" | "ta";
  context: string;
  query: string;
  sources: Array<{
    id: string;
    filename: string;
    score: number;
    url?: string;
    snippet?: string;
    reference?: string;
    verseText?: string;
  }>;
  crossReferences?: string[];
}

/**
 * Detect language using simple Unicode heuristic
 * Tamil Unicode range: 0B80-0BFF
 */
function detectLanguage(text: string): "en" | "ta" {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? "ta" : "en";
}

/**
 * RAG Retriever - Node 1
 * Searches Pinecone for Bible content and returns context
 */
export async function retrieveBibleContextFromPinecone(
  userInput: string,
  client: any, // OpenAI client (kept for compatibility, but not used)
  preferredLanguage?: "en" | "ta"
): Promise<RAGResult> {
  // Detect language (use preference if provided, otherwise detect)
  const lang = preferredLanguage || detectLanguage(userInput);
  
  try {
    // Check if Pinecone is configured
    const pineconeApiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    if (!pineconeApiKey || pineconeApiKey.trim() === '') {
      console.warn('[Bible RAG] Pinecone API key not configured, falling back to user input');
      return {
        lang,
        context: userInput,
        query: userInput,
        sources: []
      };
    }

    // Use separate index for Bible (1536 dimensions for OpenAI embeddings)
    const client = getPineconeClient();
    const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
    const index = client.index(bibleIndexName);
    
    // Generate embedding for query using OpenAI
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateOpenAIEmbedding(userInput);
    } catch (embeddingError: any) {
      console.error('[Bible RAG] Failed to generate query embedding:', embeddingError);
      return {
        lang,
        context: userInput,
        query: userInput,
        sources: []
      };
    }

    // Query Pinecone with metadata filter for Bible content
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: MAX_CHUNKS * 2, // Get more results to filter
      includeMetadata: true,
      filter: {
        content_type: { $eq: 'bible' },
        language: { $eq: lang },
      } as any,
    });

    // Process results
    const results = (queryResponse.matches || [])
      .filter((match: any) => {
        const score = match.score || 0;
        return score >= MIN_SCORE;
      })
      .slice(0, MAX_CHUNKS)
      .map((match: any) => {
        const metadata = match.metadata || {};
        const verseRef = metadata.verse_reference || 
                        `${metadata.book} ${metadata.chapter}:${metadata.verse}`;
        const verseText = metadata.verse_text || '';
        return {
          id: match.id,
          filename: verseRef || match.id,
          score: match.score || 0,
          text: verseText,
          metadata,
          verseRef,
        };
      });

    // Build context from results
    const context = results
      .map((result: any) => {
        // Reconstruct verse text from metadata
        const verseRef = result.metadata.verse_reference || 
                        `${result.metadata.book} ${result.metadata.chapter}:${result.metadata.verse}`;
        const verseText = result.metadata.verse_text || result.text || '[Verse content]';
        return `${verseRef}: ${verseText}`;
      })
      .filter(Boolean)
      .join("\n---\n");

    // Extract sources
    const sources = results.map((result: any) => ({
      id: result.id,
      filename: result.filename,
      score: result.score,
      snippet: result.text,
      reference: result.verseRef || result.filename,
      verseText: result.text,
    }));

    console.log(`[Bible RAG] Found ${results.length} Bible verses for query (language: ${lang})`);

    return {
      lang,
      context: context || userInput, // Fallback to user input if no context
      query: userInput,
      sources: sources.slice(0, MAX_CHUNKS)
    };
  } catch (error: any) {
    console.error("[Bible RAG] Pinecone search error:", error.message);
    
    // Return fallback result if search fails
    return {
      lang,
      context: userInput, // Use user input as fallback context
      query: userInput,
      sources: []
    };
  }
}

/**
 * Retrieve cross-references from Pinecone for a verse reference
 * @param verseReference - Verse reference in format "Book Chapter:Verse" (e.g., "Genesis 1:1")
 * @param limit - Maximum number of cross-references to return (default: 10)
 * @returns Array of cross-referenced verse references
 */
export async function retrieveCrossReferencesFromPinecone(
  verseReference: string,
  limit: number = 10
): Promise<string[]> {
  try {
    // Check if Pinecone is configured
    const pineconeApiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    if (!pineconeApiKey || pineconeApiKey.trim() === '') {
      console.warn('[Cross-Ref RAG] Pinecone API key not configured');
      return [];
    }

    const client = getPineconeClient();
    // Use dedicated cross-references index (1536 dimensions for OpenAI embeddings)
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);
    
    // Generate embedding for the verse reference
    const queryText = `Cross-references for ${verseReference}. Related Bible verses that provide additional context and thematic connections.`;
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateOpenAIEmbedding(queryText);
    } catch (embeddingError: any) {
      console.error('[Cross-Ref RAG] Failed to generate embedding:', embeddingError);
      return [];
    }

    // Query Pinecone for cross-references
    // Note: Cross-references index uses semantic search, so we query by similarity
    // rather than exact metadata matching
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more to filter
      includeMetadata: true,
    });

    // Extract cross-referenced verses from semantic search results
    const crossRefs = new Set<string>();
    
    (queryResponse.matches || []).forEach((match: any) => {
      const metadata = match.metadata;
      const score = match.score || 0;
      
      // Only include high-quality matches (cosine similarity threshold)
      if (score >= 0.6) {
        // Extract verse references from metadata
        // The cross-references index may store references in various formats
        if (metadata.target_verse) {
          crossRefs.add(metadata.target_verse);
        }
        if (metadata.source_verse && metadata.source_verse !== verseReference) {
          crossRefs.add(metadata.source_verse);
        }
        // Also check for verse_reference field as fallback
        if (metadata.verse_reference && metadata.verse_reference !== verseReference) {
          crossRefs.add(metadata.verse_reference);
        }
      }
    });

    const result = Array.from(crossRefs).slice(0, limit);
    console.log(`[Cross-Ref RAG] Found ${result.length} cross-references for ${verseReference}`);
    
    return result;
  } catch (error: any) {
    console.error("[Cross-Ref RAG] Error retrieving cross-references:", error.message);
    return [];
  }
}

/**
 * Retrieve cross-references for multiple verses
 * @param verseReferences - Array of verse references
 * @param limitPerVerse - Maximum cross-references per verse (default: 5)
 * @returns Map of verse reference to its cross-references
 */
export async function retrieveCrossReferencesForVerses(
  verseReferences: string[],
  limitPerVerse: number = 5
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();
  
  // Process in parallel (but limit concurrency to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < verseReferences.length; i += batchSize) {
    const batch = verseReferences.slice(i, i + batchSize);
    const batchPromises = batch.map(async (ref) => {
      const crossRefs = await retrieveCrossReferencesFromPinecone(ref, limitPerVerse);
      results.set(ref, crossRefs);
    });
    
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < verseReferences.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

