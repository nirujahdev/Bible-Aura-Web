// Vector Search API Endpoint
// Searches for similar sources using Pinecone vector similarity

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchSimilarSources } from '../../src/lib/research-lab/vector-operations';
import { createClient } from '@supabase/supabase-js';

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

    const { query, notebookId, topK = 5, minScore = 0.7, sourceTypes } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Query is required and cannot be empty' });
      return;
    }

    if (!notebookId || typeof notebookId !== 'string') {
      res.status(400).json({ error: 'notebookId is required' });
      return;
    }

    // Verify user owns the notebook
    const supabase = getSupabaseClient();
    const { data: notebook, error: notebookError } = await supabase
      .from('research_notebooks')
      .select('id, user_id')
      .eq('id', notebookId)
      .eq('user_id', userId)
      .single();

    if (notebookError || !notebook) {
      res.status(403).json({ error: 'Notebook not found or access denied' });
      return;
    }

    // Search for similar sources
    const searchResults = await searchSimilarSources(
      query.trim(),
      notebookId,
      topK,
      minScore
    );

    // Filter by source types if provided
    let filteredResults = searchResults;
    if (sourceTypes && Array.isArray(sourceTypes) && sourceTypes.length > 0) {
      filteredResults = searchResults.filter(result => 
        sourceTypes.includes(result.sourceType)
      );
    }

    // Fetch full source content from Supabase for the results
    const sourceIds = [...new Set(filteredResults.map(r => r.sourceId))];
    const { data: sources, error: sourcesError } = await supabase
      .from('research_sources')
      .select('id, title, processed_content, source_type')
      .eq('notebook_id', notebookId)
      .eq('user_id', userId)
      .in('id', sourceIds);

    if (sourcesError) {
      console.error('[Vector Search API] Error fetching sources:', sourcesError);
    }

    // Enrich results with full source data
    const enrichedResults = filteredResults.map(result => {
      const source = sources?.find(s => s.id === result.sourceId);
      return {
        ...result,
        fullContent: source?.processed_content || null,
        sourceTitle: source?.title || result.title,
      };
    });

    res.status(200).json({
      success: true,
      query: query.trim(),
      results: enrichedResults,
      count: enrichedResults.length,
    });

  } catch (error: any) {
    console.error('[Vector Search API] Error:', error);
    
    let errorMessage = 'Failed to perform vector search';
    let statusCode = 500;
    
    if (error.message?.includes('Pinecone') || error.message?.includes('API key')) {
      errorMessage = 'Vector search service not configured';
      statusCode = 500;
    } else {
      errorMessage = error.message || 'Internal server error';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

