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
): Promise<void> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    return res.status(200).end();
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
    if (req.method === 'GET') {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      cleanCache();
      const cacheKey = `notebooks:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
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
        return res.status(500).json({ error: error.message });
      }

      const response = { data: data || [] };
      setCache(cacheKey, response);
      return res.status(200).json(response);
    }

    // GET /api/research-lab/notebooks?id=xxx - Get single notebook
    if (req.method === 'GET' && req.query.id) {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notebookId = req.query.id as string;
      const cacheKey = `notebook:${notebookId}:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }

      const { data, error } = await supabase
        .from('research_notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notebook:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Notebook not found' });
      }

      const response = { data };
      setCache(cacheKey, response);
      return res.status(200).json(response);
    }

    // POST /api/research-lab/notebooks - Create notebook
    if (req.method === 'POST') {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description } = req.body;

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
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
        return res.status(500).json({ error: error.message });
      }

      // Invalidate cache
      const cacheKey = `notebooks:${userId}`;
      cache.delete(cacheKey);

      return res.status(201).json({ data });
    }

    // PUT /api/research-lab/notebooks?id=xxx - Update notebook
    if (req.method === 'PUT' && req.query.id) {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notebookId = req.query.id as string;
      const { title, description } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
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
        return res.status(500).json({ error: error.message });
      }

      // Invalidate cache
      cache.delete(`notebook:${notebookId}:${userId}`);
      cache.delete(`notebooks:${userId}`);

      return res.status(200).json({ data });
    }

    // DELETE /api/research-lab/notebooks?id=xxx - Delete notebook
    if (req.method === 'DELETE' && req.query.id) {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const notebookId = req.query.id as string;

      const { error } = await supabase
        .from('research_notebooks')
        .delete()
        .eq('id', notebookId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting notebook:', error);
        return res.status(500).json({ error: error.message });
      }

      // Invalidate cache
      cache.delete(`notebook:${notebookId}:${userId}`);
      cache.delete(`notebooks:${userId}`);

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

