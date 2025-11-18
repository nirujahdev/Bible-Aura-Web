// Vercel Serverless Function for Research Lab Sharing Operations
// Handles sharing notebooks with users and link generation

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory cache for GET requests
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 20 * 1000; // 20 seconds

// Reuse Supabase client across invocations
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

function getUserIdFromToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    // Decode JWT to get user ID (simple base64 decode, no verification needed for user_id extraction)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const supabase = getSupabaseClient();
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Set auth header for Supabase client
    const authHeader = req.headers.authorization;
    if (authHeader) {
      supabase.auth.setSession({
        access_token: authHeader.substring(7),
        refresh_token: '',
      } as any);
    }

    switch (req.method) {
      case 'GET': {
        const { notebookId } = req.query;

        if (!notebookId || typeof notebookId !== 'string') {
          return res.status(400).json({ error: 'notebookId is required' });
        }

        // Check cache
        const cacheKey = `shares:${notebookId}:${userId}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return res.status(200).json(cached.data);
        }

        // Verify user owns the notebook or has access
        const { data: notebook, error: notebookError } = await supabase
          .from('research_notebooks')
          .select('id, user_id')
          .eq('id', notebookId)
          .single();

        if (notebookError || !notebook) {
          return res.status(404).json({ error: 'Notebook not found' });
        }

        // Check if user owns notebook or has share access
        const isOwner = notebook.user_id === userId;
        const { data: shareAccess } = await supabase
          .from('research_notebook_shares')
          .select('id')
          .eq('notebook_id', notebookId)
          .eq('shared_with', userId)
          .single();

        if (!isOwner && !shareAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Get all shares
        const { data: shares, error: sharesError } = await supabase
          .from('research_notebook_shares')
          .select('*')
          .eq('notebook_id', notebookId)
          .order('created_at', { ascending: false });

        if (sharesError) {
          console.error('Error fetching shares:', sharesError);
          return res.status(500).json({ error: 'Failed to fetch shares' });
        }

        // Get notebook settings
        const { data: notebookSettings } = await supabase
          .from('research_notebooks')
          .select('is_public, share_settings')
          .eq('id', notebookId)
          .single();

        const result = {
          shares: shares || [],
          settings: notebookSettings || { is_public: false, share_settings: {} },
          isOwner,
        };

        // Cache result
        cache.set(cacheKey, { data: result, timestamp: Date.now() });

        return res.status(200).json(result);
      }

      case 'POST': {
        const { notebookId, email, permission = 'viewer', notifyUser = true } = req.body;

        if (!notebookId || !email) {
          return res.status(400).json({ error: 'notebookId and email are required' });
        }

        // Verify user owns the notebook
        const { data: notebook, error: notebookError } = await supabase
          .from('research_notebooks')
          .select('id, user_id')
          .eq('id', notebookId)
          .eq('user_id', userId)
          .single();

        if (notebookError || !notebook) {
          return res.status(403).json({ error: 'Only notebook owners can share' });
        }

        // Find user by email
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('user_id, email')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (userError || !userProfile) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (userProfile.user_id === userId) {
          return res.status(400).json({ error: 'Cannot share with yourself' });
        }

        // Create share
        const { data: share, error: shareError } = await supabase
          .from('research_notebook_shares')
          .insert({
            notebook_id: notebookId,
            shared_by: userId,
            shared_with: userProfile.user_id,
            permission,
            access_type: 'user',
            notify_user: notifyUser,
          })
          .select()
          .single();

        if (shareError) {
          if (shareError.code === '23505') {
            return res.status(409).json({ error: 'User already has access' });
          }
          console.error('Error creating share:', shareError);
          return res.status(500).json({ error: 'Failed to create share' });
        }

        // Invalidate cache
        cache.delete(`shares:${notebookId}:${userId}`);

        return res.status(201).json(share);
      }

      case 'PUT': {
        const { id, permission } = req.body;

        if (!id || !permission) {
          return res.status(400).json({ error: 'id and permission are required' });
        }

        // Get share to verify ownership
        const { data: share, error: shareError } = await supabase
          .from('research_notebook_shares')
          .select('notebook_id, shared_by')
          .eq('id', id)
          .single();

        if (shareError || !share) {
          return res.status(404).json({ error: 'Share not found' });
        }

        // Verify user owns the notebook
        const { data: notebook } = await supabase
          .from('research_notebooks')
          .select('user_id')
          .eq('id', share.notebook_id)
          .eq('user_id', userId)
          .single();

        if (!notebook) {
          return res.status(403).json({ error: 'Only notebook owners can update shares' });
        }

        // Update share
        const { data: updatedShare, error: updateError } = await supabase
          .from('research_notebook_shares')
          .update({ permission })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating share:', updateError);
          return res.status(500).json({ error: 'Failed to update share' });
        }

        // Invalidate cache
        cache.delete(`shares:${share.notebook_id}:${userId}`);

        return res.status(200).json(updatedShare);
      }

      case 'DELETE': {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'id is required' });
        }

        // Get share to verify ownership
        const { data: share, error: shareError } = await supabase
          .from('research_notebook_shares')
          .select('notebook_id, shared_by, shared_with')
          .eq('id', id)
          .single();

        if (shareError || !share) {
          return res.status(404).json({ error: 'Share not found' });
        }

        // Verify user owns the notebook or is removing their own access
        const isOwner = await supabase
          .from('research_notebooks')
          .select('user_id')
          .eq('id', share.notebook_id)
          .eq('user_id', userId)
          .single();

        const canDelete = isOwner.data || share.shared_with === userId;

        if (!canDelete) {
          return res.status(403).json({ error: 'Access denied' });
        }

        // Delete share
        const { error: deleteError } = await supabase
          .from('research_notebook_shares')
          .delete()
          .eq('id', id);

        if (deleteError) {
          console.error('Error deleting share:', deleteError);
          return res.status(500).json({ error: 'Failed to delete share' });
        }

        // Invalidate cache
        cache.delete(`shares:${share.notebook_id}:${userId}`);

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Share API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

