// Source Indexing API Endpoint
// Indexes a source in Pinecone for vector search

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { indexSource } from '../../src/lib/research-lab/vector-operations.js';
import type { Source } from '../../src/lib/research-lab/db-operations.js';
import logger from '../../src/lib/research-lab/logger.js';
import { EnhancedRateLimiter } from '../../src/lib/enhancedRateLimiter.js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  // If auth token provided, create authenticated client for RLS
  if (authToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  // Otherwise use shared client
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Rate limiter for index-source API (5 requests per minute per user)
const indexRateLimiter = new EnhancedRateLimiter({
  maxRequests: 5,
  windowMs: 60000, // 1 minute
  burstLimit: 2,
  errorMessage: 'Rate limit exceeded. Please wait a moment before retrying source indexing.'
});

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

    // Check rate limit
    const rateLimitResult = indexRateLimiter.checkLimit(userId, 'index-source');
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitResult.errorMessage || 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000),
      });
      res.setHeader('Retry-After', Math.ceil((rateLimitResult.retryAfterMs || 60000) / 1000));
      return;
    }

    const { sourceId, notebookId, content } = req.body;

    if (!sourceId || !notebookId || !content) {
      res.status(400).json({ error: 'sourceId, notebookId, and content are required' });
      return;
    }

    const supabase = getSupabaseClient(req.headers.authorization?.replace('Bearer ', ''));

    // Verify user owns the source
    const { data: source, error: sourceError } = await supabase
      .from('research_sources')
      .select('id, notebook_id, user_id, source_type, title, processed_content, content_text, indexing_status, indexed_at, vector_count')
      .eq('id', sourceId)
      .eq('user_id', userId)
      .eq('notebook_id', notebookId)
      .single();

    if (sourceError || !source) {
      res.status(403).json({ error: 'Source not found or access denied' });
      return;
    }

    // Check if this is a retry (source already has indexing_status = 'failed')
    const isRetry = source.indexing_status === 'failed';
    const maxRetries = 3;
    let retryAttempt = 0;
    let lastError: any = null;

    // Update indexing status to 'indexing'
    await supabase
      .from('research_sources')
      .update({ indexing_status: 'indexing' })
      .eq('id', sourceId);

    // Retry logic with exponential backoff
    while (retryAttempt <= maxRetries) {
      try {
        // Index source in Pinecone
        const { vectorCount, error: indexError } = await indexSource(
          source as Source,
          notebookId,
          content
        );

        if (indexError) {
          lastError = indexError;
          
          // Check if error is retryable (network errors, timeouts, rate limits)
          const isRetryable = 
            indexError.message?.includes('network') ||
            indexError.message?.includes('timeout') ||
            indexError.message?.includes('rate limit') ||
            indexError.message?.includes('ECONNREFUSED') ||
            indexError.code === 'ETIMEDOUT' ||
            indexError.code === 'ECONNREFUSED';

          if (isRetryable && retryAttempt < maxRetries) {
            retryAttempt++;
            // Exponential backoff: 1s, 2s, 4s
            const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempt - 1), 4000);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue; // Retry
          } else {
            // Non-retryable error or max retries reached
            throw indexError;
          }
        }

        // Success - update indexing status to 'completed'
        await supabase
          .from('research_sources')
          .update({ 
            indexing_status: 'completed',
            indexed_at: new Date().toISOString(),
            vector_count: vectorCount,
          })
          .eq('id', sourceId);

        res.status(200).json({
          success: true,
          vectorCount: vectorCount,
          sourceId: sourceId,
          message: `Successfully indexed ${vectorCount} vector(s)${isRetry ? ' (retry succeeded)' : ''}`,
          retryAttempt: retryAttempt > 0 ? retryAttempt : undefined,
        });
        return;

      } catch (error: any) {
        lastError = error;
        
        // If we've exhausted retries, break and handle failure
        if (retryAttempt >= maxRetries) {
          break;
        }
        
        // Check if error is retryable
        const isRetryable = 
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('rate limit') ||
          error.message?.includes('ECONNREFUSED') ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED';

        if (isRetryable) {
          retryAttempt++;
          // Exponential backoff
          const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempt - 1), 4000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue; // Retry
        } else {
          // Non-retryable error
          break;
        }
      }
    }

    // All retries failed
    logger.error('[Index Source API] Indexing error after retries', lastError, 'index-source');
    
    // Update indexing status to 'failed'
    await supabase
      .from('research_sources')
      .update({ indexing_status: 'failed' })
      .eq('id', sourceId);
    
    res.status(500).json({ 
      error: 'Failed to index source',
      message: lastError?.message || 'Pinecone indexing failed after retries',
      details: process.env.NODE_ENV === 'development' ? lastError?.message : undefined,
      retryAttempt: retryAttempt,
    });
    return;


  } catch (error: any) {
    logger.error('[Index Source API] Error', error, 'index-source');
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to index source',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

