// Pinecone Client Utility for Research Lab
// Handles connection to Pinecone Serverless index

import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;
let pineconeIndex: ReturnType<Pinecone['index']> | null = null;

/**
 * Get or create Pinecone client instance
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY;
    
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not configured. Please set it in environment variables.');
    }

    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });
  }

  return pineconeClient;
}

/**
 * Get or create Pinecone index instance
 * Serverless indexes don't require environment/region configuration
 */
export function getPineconeIndex() {
  if (!pineconeIndex) {
    const client = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX_NAME || 'bible-aura-research-lab';
    
    pineconeIndex = client.index(indexName);
  }

  return pineconeIndex;
}

/**
 * Test connection to Pinecone
 */
export async function testPineconeConnection(): Promise<boolean> {
  try {
    const index = getPineconeIndex();
    // Simple query to test connection
    await index.query({
      vector: new Array(1024).fill(0), // Dummy vector
      topK: 1,
    });
    return true;
  } catch (error) {
    console.error('[Pinecone] Connection test failed:', error);
    return false;
  }
}

