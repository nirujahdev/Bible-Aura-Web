// Embedding Generation API Endpoint
// Generates embeddings for source content (server-side for API key security)

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateEmbedding } from '../../src/lib/research-lab/embeddings';

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getUserIdFromToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  setCORSHeaders(res);

  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { text, sourceId } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required and cannot be empty' });
      return;
    }

    // Generate embedding
    const embedding = await generateEmbedding(text.trim());

    res.status(200).json({
      success: true,
      embedding: embedding,
      dimension: embedding.length,
      sourceId: sourceId || null,
    });

  } catch (error: any) {
    console.error('[Generate Embeddings API] Error:', error);
    
    let errorMessage = 'Failed to generate embedding';
    let statusCode = 500;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Embedding API key not configured';
      statusCode = 500;
    } else if (error.message?.includes('empty')) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error.message || 'Internal server error';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

