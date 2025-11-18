// Research Lab Chat Messages API
// Optimized Vercel Serverless Function for Research Lab chat operations

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Cache configuration
const CACHE_TTL = 10; // 10 seconds for messages (shorter since they change frequently)
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
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

    // GET - List messages
    if (req.method === 'GET') {
      const cacheKey = `messages:${notebookId}:${userId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      const { data, error } = await supabase
        .from('research_chat_messages')
        .select('*')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      const response = { data: data || [] };
      setCache(cacheKey, response);
      res.status(200).json(response);
      return;
    }

    // POST - Create message
    if (req.method === 'POST') {
      const { role, content, sources_used, citations, tool_calls, confidence_score } = req.body;

      if (!role || !content) {
        res.status(400).json({ error: 'role and content are required' });
        return;
      }

      if (role !== 'user' && role !== 'assistant') {
        res.status(400).json({ error: 'role must be "user" or "assistant"' });
        return;
      }

      const { data, error } = await supabase
        .from('research_chat_messages')
        .insert({
          notebook_id: notebookId,
          user_id: userId,
          role,
          content,
          sources_used,
          citations,
          tool_calls,
          confidence_score,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`messages:${notebookId}:${userId}`);

      res.status(201).json({ data });
      return;
    }

    // DELETE - Delete message
    if (req.method === 'DELETE' && req.query.id) {
      const messageId = req.query.id as string;

      const { error } = await supabase
        .from('research_chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: error.message });
        return;
      }

      // Invalidate cache
      cache.delete(`messages:${notebookId}:${userId}`);

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

