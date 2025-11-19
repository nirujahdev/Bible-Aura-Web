// Source Indexing API Endpoint
// Indexes a source in Pinecone for vector search

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { indexSource } from '../../src/lib/research-lab/vector-operations';
import type { Source } from '../../src/lib/research-lab/db-operations';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
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

    const { sourceId, notebookId, content } = req.body;

    if (!sourceId || !notebookId || !content) {
      res.status(400).json({ error: 'sourceId, notebookId, and content are required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Verify user owns the source
    const { data: source, error: sourceError } = await supabase
      .from('research_sources')
      .select('id, notebook_id, user_id, source_type, title, processed_content, content_text')
      .eq('id', sourceId)
      .eq('user_id', userId)
      .eq('notebook_id', notebookId)
      .single();

    if (sourceError || !source) {
      res.status(403).json({ error: 'Source not found or access denied' });
      return;
    }

    // Index source in Pinecone
    const { vectorCount, error: indexError } = await indexSource(
      source as Source,
      notebookId,
      content
    );

    if (indexError) {
      console.error('[Index Source API] Indexing error:', indexError);
      res.status(500).json({ 
        error: 'Failed to index source',
        message: indexError.message || 'Pinecone indexing failed',
        details: process.env.NODE_ENV === 'development' ? indexError.message : undefined
      });
      return;
    }

    res.status(200).json({
      success: true,
      vectorCount: vectorCount,
      sourceId: sourceId,
      message: `Successfully indexed ${vectorCount} vector(s)`,
    });

  } catch (error: any) {
    console.error('[Index Source API] Error:', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to index source',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

