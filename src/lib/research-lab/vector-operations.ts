// Vector Operations Service for Research Lab
// Handles indexing sources and searching in Pinecone

import { getPineconeIndex } from './pinecone-client';
import { generateEmbedding, chunkText } from './embeddings';
import type { Source } from './db-operations';

export interface VectorMetadata {
  notebook_id: string;
  source_id: string;
  source_type: string;
  title: string;
  chunk_index: number;
  chunk_text: string; // First 200 chars for preview
  created_at: string;
}

export interface SearchResult {
  sourceId: string;
  title: string;
  sourceType: string;
  score: number;
  chunkText: string;
  chunkIndex: number;
  notebookId: string;
}

/**
 * Generate vector ID for a chunk
 */
function generateVectorId(notebookId: string, sourceId: string, chunkIndex: number): string {
  return `${notebookId}:${sourceId}:${chunkIndex}`;
}

/**
 * Index a single source in Pinecone
 * Splits content into chunks and creates vectors for each chunk
 */
export async function indexSource(
  source: Source,
  notebookId: string,
  content: string
): Promise<{ vectorCount: number; error?: any }> {
  if (!content || content.trim().length === 0) {
    console.warn(`[Vector Ops] Skipping indexing for source ${source.id}: empty content`);
    return { vectorCount: 0 };
  }

  try {
    const index = getPineconeIndex();
    
    // Split content into chunks
    const chunks = chunkText(content, 1000, 200); // 1000 tokens max, 200 token overlap
    
    if (chunks.length === 0) {
      return { vectorCount: 0 };
    }

    // Generate embeddings for all chunks
    console.log(`[Vector Ops] Generating embeddings for ${chunks.length} chunks...`);
    const embeddings = await generateBatchEmbeddings(chunks);

    // Prepare vectors for upsert
    const vectors = embeddings.map((embedding, chunkIndex) => {
      const vectorId = generateVectorId(notebookId, source.id, chunkIndex);
      const chunkText = chunks[chunkIndex];
      
      const metadata: VectorMetadata = {
        notebook_id: notebookId,
        source_id: source.id,
        source_type: source.source_type,
        title: source.title,
        chunk_index: chunkIndex,
        chunk_text: chunkText.substring(0, 200), // First 200 chars for preview
        created_at: new Date().toISOString(),
      };

      return {
        id: vectorId,
        values: embedding,
        metadata: metadata as any, // Pinecone accepts any metadata
      };
    });

    // Upsert vectors in batches (Pinecone allows up to 100 vectors per request)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`[Vector Ops] Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }

    console.log(`[Vector Ops] Successfully indexed ${vectors.length} vectors for source ${source.id}`);
    return { vectorCount: vectors.length };
  } catch (error: any) {
    console.error(`[Vector Ops] Error indexing source ${source.id}:`, error);
    return { vectorCount: 0, error };
  }
}

/**
 * Search for similar sources using vector similarity
 */
export async function searchSimilarSources(
  query: string,
  notebookId: string,
  topK: number = 5,
  minScore: number = 0.7
): Promise<SearchResult[]> {
  try {
    const index = getPineconeIndex();
    
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Query Pinecone with metadata filter
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: topK * 2, // Get more results to filter
      includeMetadata: true,
      filter: {
        notebook_id: { $eq: notebookId },
      } as any,
    });

    // Process results
    const results: SearchResult[] = (queryResponse.matches || [])
      .filter((match: any) => {
        // Filter by score threshold
        const score = match.score || 0;
        return score >= minScore;
      })
      .slice(0, topK) // Take top K after filtering
      .map((match: any) => {
        const metadata = match.metadata as VectorMetadata;
        
        return {
          sourceId: metadata.source_id,
          title: metadata.title,
          sourceType: metadata.source_type,
          score: match.score || 0,
          chunkText: metadata.chunk_text || '',
          chunkIndex: metadata.chunk_index || 0,
          notebookId: metadata.notebook_id,
        };
      });

    console.log(`[Vector Ops] Found ${results.length} similar sources for query`);
    return results;
  } catch (error: any) {
    console.error('[Vector Ops] Error searching similar sources:', error);
    return [];
  }
}

/**
 * Delete all vectors for a source
 */
export async function deleteSourceVectors(
  sourceId: string,
  notebookId: string
): Promise<{ deleted: number; error?: any }> {
  try {
    const index = getPineconeIndex();
    
    // Delete by metadata filter (notebook_id and source_id)
    // Note: Pinecone deleteByMetadata might not be available in all plans
    // Alternative: Query first, then delete by IDs
    
    // Query to find all vector IDs for this source
    const queryResponse = await index.query({
      vector: new Array(1024).fill(0), // Dummy vector
      topK: 10000, // Large number to get all matches
      includeMetadata: true,
      filter: {
        notebook_id: { $eq: notebookId },
        source_id: { $eq: sourceId },
      } as any,
    });

    const vectorIds = (queryResponse.matches || []).map((match: any) => match.id);
    
    if (vectorIds.length === 0) {
      return { deleted: 0 };
    }

    // Delete vectors in batches
    const batchSize = 1000;
    for (let i = 0; i < vectorIds.length; i += batchSize) {
      const batch = vectorIds.slice(i, i + batchSize);
      await index.deleteMany(batch);
    }

    console.log(`[Vector Ops] Deleted ${vectorIds.length} vectors for source ${sourceId}`);
    return { deleted: vectorIds.length };
  } catch (error: any) {
    console.error(`[Vector Ops] Error deleting vectors for source ${sourceId}:`, error);
    return { deleted: 0, error };
  }
}

/**
 * Update vectors for a source (delete old, create new)
 */
export async function updateSourceVectors(
  source: Source,
  notebookId: string,
  newContent: string
): Promise<{ vectorCount: number; error?: any }> {
  // Delete old vectors
  await deleteSourceVectors(source.id, notebookId);
  
  // Create new vectors
  return await indexSource(source, notebookId, newContent);
}

/**
 * Delete all vectors for a notebook
 */
export async function deleteNotebookVectors(notebookId: string): Promise<{ deleted: number; error?: any }> {
  try {
    const index = getPineconeIndex();
    
    // Query to find all vector IDs for this notebook
    const queryResponse = await index.query({
      vector: new Array(1024).fill(0), // Dummy vector
      topK: 10000, // Large number
      includeMetadata: true,
      filter: {
        notebook_id: { $eq: notebookId },
      } as any,
    });

    const vectorIds = (queryResponse.matches || []).map((match: any) => match.id);
    
    if (vectorIds.length === 0) {
      return { deleted: 0 };
    }

    // Delete in batches
    const batchSize = 1000;
    for (let i = 0; i < vectorIds.length; i += batchSize) {
      const batch = vectorIds.slice(i, i + batchSize);
      await index.deleteMany(batch);
    }

    console.log(`[Vector Ops] Deleted ${vectorIds.length} vectors for notebook ${notebookId}`);
    return { deleted: vectorIds.length };
  } catch (error: any) {
    console.error(`[Vector Ops] Error deleting vectors for notebook ${notebookId}:`, error);
    return { deleted: 0, error };
  }
}

