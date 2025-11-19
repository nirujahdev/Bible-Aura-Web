// OpenAI Embedding Generation for Bible Content
// Uses OpenAI embeddings for compatibility with OpenAI models

const OPENAI_EMBEDDING_DIMENSION = 1536; // text-embedding-3-small dimension

/**
 * Generate embedding using OpenAI API
 * Compatible with OpenAI models used in the chat
 */
export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured. Please set it in environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // 1536 dimensions
        input: text.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI embedding failed: ${errorText}`);
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;
    
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    return embedding;
  } catch (error: any) {
    console.error('[OpenAI Embeddings] Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * OpenAI supports up to 2048 inputs per request
 */
export async function generateBatchOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // OpenAI batch API supports up to 2048 inputs
  const batchSize = 100; // Process in smaller batches to avoid rate limits
  const batches: string[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }

  const allEmbeddings: number[][] = [];

  for (const batch of batches) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: batch.map(t => t.trim()),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI batch embedding failed: ${errorText}`);
      }

      const data = await response.json();
      const embeddings = data.data.map((item: any) => item.embedding);
      allEmbeddings.push(...embeddings);
      
      // Small delay between batches to avoid rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error: any) {
      console.error('[OpenAI Embeddings] Batch error:', error);
      // Fallback: generate embeddings one by one for this batch
      console.log('Falling back to individual embeddings for this batch...');
      for (const text of batch) {
        try {
          const embedding = await generateOpenAIEmbedding(text);
          allEmbeddings.push(embedding);
          await new Promise(resolve => setTimeout(resolve, 50)); // Rate limit protection
        } catch (err) {
          console.error(`Failed to generate embedding for text: ${text.substring(0, 50)}...`);
          // Push zero vector as fallback
          allEmbeddings.push(new Array(OPENAI_EMBEDDING_DIMENSION).fill(0));
        }
      }
    }
  }

  return allEmbeddings;
}

/**
 * Split text into chunks for embedding
 * Preserves verse boundaries
 */
export function chunkBibleText(
  text: string,
  maxChunkSize: number = 500, // tokens
  overlapSize: number = 50 // tokens
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
      const verseEnd = text.lastIndexOf('\n', end);
      const bestBreak = Math.max(sentenceEnd, verseEnd);
      
      if (bestBreak > start + maxChars * 0.5) {
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

