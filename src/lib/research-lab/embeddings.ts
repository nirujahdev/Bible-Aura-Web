// Embedding Generation Service for Research Lab
// Generates 1024-dimensional embeddings for source content

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const EMBEDDING_DIMENSION = 1024; // Matches Pinecone index dimension

/**
 * Generate embedding for a single text using GLM-4.5-Air
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
  
  if (!glmApiKey || glmApiKey.trim() === '') {
    throw new Error('GLM_API_KEY is not configured. Please set it in environment variables.');
  }

  try {
    // GLM-4.5-Air uses chat completions API with embedding mode
    // Try embeddings endpoint first, then fallback to chat completions if needed
    let response = await fetch(`${GLM_API_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        input: text.trim(),
        dimensions: EMBEDDING_DIMENSION,
      }),
    });

    // If embeddings endpoint doesn't exist, try chat completions with embedding
    if (!response.ok && response.status === 404) {
      console.log('[Embeddings] Embeddings endpoint not found, trying chat completions...');
      response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${glmApiKey}`,
        },
        body: JSON.stringify({
          model: 'glm-4.5-air',
          messages: [
            {
              role: 'user',
              content: text.trim(),
            },
          ],
          embedding: true, // Request embedding mode
          dimensions: EMBEDDING_DIMENSION,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Embeddings] GLM API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      // Fallback: Try OpenAI if GLM fails (for compatibility)
      return await generateEmbeddingOpenAI(text);
    }

    const data = await response.json();
    
    // Extract embedding from response (handles both endpoints)
    const embedding = data.data?.[0]?.embedding || 
                      data.embedding || 
                      data.vector ||
                      data.choices?.[0]?.message?.embedding;
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from GLM API');
    }

    if (embedding.length !== EMBEDDING_DIMENSION) {
      console.warn(`[Embeddings] Dimension mismatch: expected ${EMBEDDING_DIMENSION}, got ${embedding.length}`);
      // Truncate or pad if needed
      if (embedding.length > EMBEDDING_DIMENSION) {
        return embedding.slice(0, EMBEDDING_DIMENSION);
      } else {
        return [...embedding, ...new Array(EMBEDDING_DIMENSION - embedding.length).fill(0)];
      }
    }

    return embedding;
  } catch (error: any) {
    console.error('[Embeddings] Error generating embedding:', error);
    
    // Fallback to OpenAI if GLM fails (for compatibility, but GLM-4.5-Air is primary)
    if (!error.message?.includes('OpenAI')) {
      try {
        console.warn('[Embeddings] GLM-4.5-Air failed, using OpenAI fallback');
        return await generateEmbeddingOpenAI(text);
      } catch (fallbackError) {
        throw new Error(`Failed to generate embedding with GLM-4.5-Air: ${error.message}`);
      }
    }
    
    throw error;
  }
}

/**
 * Fallback: Generate embedding using OpenAI
 * Note: OpenAI embeddings are 1536 dimensions, so we'll need to reduce
 */
async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('Neither GLM nor OpenAI API key is configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small', // 1536 dimensions
      input: text.trim(),
      dimensions: 1536, // OpenAI's default
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI embedding failed: ${errorText}`);
  }

  const data = await response.json();
  const embedding = data.data?.[0]?.embedding;
  
  if (!embedding) {
    throw new Error('Invalid embedding response from OpenAI');
  }

  // Reduce from 1536 to 1024 dimensions using PCA-like approach (simple truncation + normalization)
  // For production, use proper dimension reduction, but for now we'll use a simple approach
  if (embedding.length === 1536) {
    // Take first 1024 dimensions and normalize
    const reduced = embedding.slice(0, EMBEDDING_DIMENSION);
    const magnitude = Math.sqrt(reduced.reduce((sum: number, val: number) => sum + val * val, 0));
    return reduced.map((val: number) => val / magnitude);
  }

  return embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  const batches: string[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }

  const allEmbeddings: number[][] = [];

  for (const batch of batches) {
    const batchPromises = batch.map(text => generateEmbedding(text));
    const batchEmbeddings = await Promise.all(batchPromises);
    allEmbeddings.push(...batchEmbeddings);
    
    // Small delay between batches to avoid rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

/**
 * Split text into chunks for embedding
 * Preserves sentence boundaries and includes overlap
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 1000,
  overlapSize: number = 200
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Simple token estimation: ~4 characters per token
  const maxChars = maxChunkSize * 4;
  const overlapChars = overlapSize * 4;

  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length);
    
    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf('.', end);
      const paragraphEnd = text.lastIndexOf('\n\n', end);
      const bestBreak = Math.max(sentenceEnd, paragraphEnd);
      
      if (bestBreak > start + maxChars * 0.5) {
        // Only use break if it's not too early
        end = bestBreak + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap
    start = end - overlapChars;
    if (start < 0) start = end;
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

