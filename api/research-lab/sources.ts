// Research Lab Sources API
// Optimized Vercel Serverless Function for Research Lab source operations

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Cache configuration
const CACHE_TTL = 20; // 20 seconds for sources
const cache = new Map<string, { data: any; timestamp: number }>();

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Client-Info': 'research-lab-api' } },
    });
  }
  return supabaseClient;
}

function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL * 1000) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return;
  }

  setCORSHeaders(res);

  try {
    const supabase = getSupabaseClient();
    const authHeader = req.headers.authorization;
    
    let userId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (e) {
        // Token invalid
      }
    }

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notebookId = req.query.notebookId as string;
    if (!notebookId) {
      res.status(400).json({ error: 'notebookId is required' });
      return;
    }

    // GET - List sources
    if (req.method === 'GET') {
      const cacheKey = `sources:${notebookId}:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      const { data, error } = await supabase
        .from('research_sources')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sources:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      const response = { data: data || [] };
      setCache(cacheKey, response);
      res.status(200).json(response);
      return;
    }

    // POST - Create source
    if (req.method === 'POST') {
      const { source_type, title, file_path, file_url, link_url, content_text, file_size, mime_type } = req.body;

      if (!source_type || !title) {
        res.status(400).json({ error: 'source_type and title are required' });
        return;
      }

      const { data, error } = await supabase
        .from('research_sources')
        .insert({
          notebook_id: notebookId,
          user_id: userId,
          source_type,
          title,
          file_path,
          file_url,
          link_url,
          content_text,
          file_size,
          mime_type,
          processing_status: 'pending',
          is_included: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating source:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`sources:${notebookId}:${userId}`);

      res.status(201).json({ data });
      return;
    }

    // PUT - Update source (toggle include/exclude, update status)
    if (req.method === 'PUT' && req.query.id) {
      const sourceId = req.query.id as string;
      const { is_included, processing_status } = req.body;

      const updateData: any = {};
      if (is_included !== undefined) updateData.is_included = is_included;
      if (processing_status !== undefined) updateData.processing_status = processing_status;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const { data, error } = await supabase
        .from('research_sources')
        .update(updateData)
        .eq('id', sourceId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating source:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`sources:${notebookId}:${userId}`);

      res.status(200).json({ data });
      return;
    }

    // DELETE - Delete source
    if (req.method === 'DELETE' && req.query.id) {
      const sourceId = req.query.id as string;

      const { error } = await supabase
        .from('research_sources')
        .delete()
        .eq('id', sourceId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting source:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`sources:${notebookId}:${userId}`);

      res.status(200).json({ success: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
    return;
  }
}

