// Research Lab Notebooks API
// Optimized Vercel Serverless Function for Research Lab notebook operations
// Features: Caching, Connection Pooling, Fast Response Times

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Cache configuration
const CACHE_TTL = 30; // 30 seconds for GET requests
const cache = new Map<string, { data: any; timestamp: number }>();

// Initialize Supabase client (reused across invocations)
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Serverless functions don't need session persistence
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Client-Info': 'research-lab-api',
        },
      },
    });
  }
  return supabaseClient;
}

// CORS helper
function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Cache helper
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

// Clean old cache entries periodically
function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 1000) {
      cache.delete(key);
    }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return;
  }

  setCORSHeaders(res);

  try {
    const supabase = getSupabaseClient();
    const authHeader = req.headers.authorization;
    
    // Extract user ID from JWT token
    let userId: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      } catch (e) {
        // Token might be invalid, continue without user
      }
    }

    // GET /api/research-lab/notebooks - List notebooks
    if (req.method === 'GET' && !req.query.id) {
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      cleanCache();
      const cacheKey = `notebooks:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const { data, error } = await supabase
        .from('research_notebooks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notebooks:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      const response = { data: data || [] };
      setCache(cacheKey, response);
      res.status(200).json(response);
      return;
    }

    // GET /api/research-lab/notebooks?id=xxx - Get single notebook
    if (req.method === 'GET' && req.query.id) {
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const notebookId = req.query.id as string;
      const cacheKey = `notebook:${notebookId}:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      const { data, error } = await supabase
        .from('research_notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notebook:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      if (!data) {
        res.status(404).json({ error: 'Notebook not found' });
        return;
      }

      const response = { data };
      setCache(cacheKey, response);
      res.status(200).json(response);
      return;
    }

    // POST /api/research-lab/notebooks - Create notebook
    if (req.method === 'POST') {
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { title, description } = req.body;

      if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const { data, error } = await supabase
        .from('research_notebooks')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description || null,
          source_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notebook:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      const cacheKey = `notebooks:${userId}`;
      cache.delete(cacheKey);

      res.status(201).json({ data });
      return;
    }

    // PUT /api/research-lab/notebooks?id=xxx - Update notebook
    if (req.method === 'PUT' && req.query.id) {
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const notebookId = req.query.id as string;
      const { title, description } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }

      const { data, error } = await supabase
        .from('research_notebooks')
        .update(updateData)
        .eq('id', notebookId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating notebook:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`notebook:${notebookId}:${userId}`);
      cache.delete(`notebooks:${userId}`);

      res.status(200).json({ data });
      return;
    }

    // DELETE /api/research-lab/notebooks?id=xxx - Delete notebook
    if (req.method === 'DELETE' && req.query.id) {
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const notebookId = req.query.id as string;

      const { error } = await supabase
        .from('research_notebooks')
        .delete()
        .eq('id', notebookId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting notebook:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`notebook:${notebookId}:${userId}`);
      cache.delete(`notebooks:${userId}`);

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

