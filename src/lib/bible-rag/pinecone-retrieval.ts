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
  }>;
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
        const metadata = match.metadata;
        return {
          id: match.id,
          filename: metadata.verse_reference || `${metadata.book} ${metadata.chapter}:${metadata.verse}`,
          score: match.score || 0,
          text: metadata.verse_text || '', // Use stored verse text
          metadata: metadata,
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

