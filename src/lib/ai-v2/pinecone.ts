// Pinecone Retriever: Direct Pinecone SDK (not LangChain integration)
// Retrieves Bible verses from bible-aura-bible index

import { getPineconeClient } from '../research-lab/pinecone-client.js';
import { generateOpenAIEmbedding } from '../bible-rag/openai-embeddings.js';

export interface RetrievedChunk {
  id: string;
  score: number;
  metadata: {
    content_type: 'bible';
    language: 'en' | 'ta';
    book: string;
    chapter: number;
    verse: number;
    verse_reference: string;
    chunk_index: number;
    translation: string;
    verse_text: string;
  };
  text: string; // Chunk text for context
}

const MIN_SCORE = 0.7; // Minimum similarity score
const TOP_K = 30; // Initial retrieval count

/**
 * Retrieve Bible chunks from Pinecone
 */
export async function retrieveFromPinecone(
  query: string,
  language: 'en' | 'ta',
  verseRefs?: string[]
): Promise<RetrievedChunk[]> {
  try {
    // Check if Pinecone is configured
    const pineconeApiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    if (!pineconeApiKey || pineconeApiKey.trim() === '') {
      console.warn('[Pinecone Retriever] Pinecone API key not configured');
      return [];
    }

    // Generate query embedding
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateOpenAIEmbedding(query);
    } catch (embeddingError: any) {
      console.error('[Pinecone Retriever] Failed to generate query embedding:', embeddingError);
      return [];
    }

    // Get Pinecone client and index
    const client = getPineconeClient();
    const bibleIndexName = process.env.PINECONE_INDEX_NAME_BIBLE || 'bible-aura-bible';
    const index = client.index(bibleIndexName);

    // Query Pinecone with metadata filter
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: TOP_K,
      includeMetadata: true,
      filter: {
        content_type: { $eq: 'bible' },
        language: { $eq: language },
      } as any,
    });

    // Process results
    const results: RetrievedChunk[] = (queryResponse.matches || [])
      .filter((match: any) => {
        const score = match.score || 0;
        return score >= MIN_SCORE;
      })
      .map((match: any) => {
        const metadata = match.metadata || {};
        const verseRef = metadata.verse_reference || 
                        `${metadata.book} ${metadata.chapter}:${metadata.verse}`;
        
        // Reconstruct chunk text from metadata
        const chunkText = `${verseRef}: ${metadata.verse_text || ''}`;

        return {
          id: match.id,
          score: match.score || 0,
          metadata: {
            content_type: 'bible',
            language: metadata.language || language,
            book: metadata.book || '',
            chapter: metadata.chapter || 0,
            verse: metadata.verse || 0,
            verse_reference: verseRef,
            chunk_index: metadata.chunk_index || 0,
            translation: metadata.translation || 'KJV',
            verse_text: metadata.verse_text || ''
          },
          text: chunkText
        };
      });

    console.log(`[Pinecone Retriever] Found ${results.length} Bible chunks for query (language: ${language})`);

    return results;
  } catch (error: any) {
    console.error('[Pinecone Retriever] Error:', error.message);
    return [];
  }
}

/**
 * Retrieve cross-references from cross-references index
 */
export async function retrieveCrossReferences(
  verseReference: string,
  limit: number = 10
): Promise<string[]> {
  try {
    const pineconeApiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    if (!pineconeApiKey || pineconeApiKey.trim() === '') {
      return [];
    }

    const client = getPineconeClient();
    const crossRefIndexName = process.env.PINECONE_INDEX_NAME_CROSS_REFERENCES || 'cross-references';
    const index = client.index(crossRefIndexName);

    // Generate embedding for verse reference query
    const queryText = `Cross-references for ${verseReference}. Related Bible verses that provide additional context and thematic connections.`;
    let queryEmbedding: number[];
    try {
      queryEmbedding = await generateOpenAIEmbedding(queryText);
    } catch (embeddingError: any) {
      console.error('[Cross-Ref Retriever] Failed to generate embedding:', embeddingError);
      return [];
    }

    // Query Pinecone for cross-references
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: limit * 2, // Get more to filter
      includeMetadata: true,
    });

    // Extract cross-referenced verses
    const crossRefs = new Set<string>();
    
    (queryResponse.matches || []).forEach((match: any) => {
      const metadata = match.metadata;
      const score = match.score || 0;
      
      // Only include high-quality matches
      if (score >= 0.6) {
        if (metadata.target_verse) {
          crossRefs.add(metadata.target_verse);
        }
        if (metadata.source_verse && metadata.source_verse !== verseReference) {
          crossRefs.add(metadata.source_verse);
        }
        if (metadata.verse_reference && metadata.verse_reference !== verseReference) {
          crossRefs.add(metadata.verse_reference);
        }
      }
    });

    return Array.from(crossRefs).slice(0, limit);
  } catch (error: any) {
    console.error('[Cross-Ref Retriever] Error:', error.message);
    return [];
  }
}

