// Research Lab Database Operations Helper
// This file contains all database operations for Research Lab feature

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_TTL = 30 * 1000; // 30 seconds cache TTL (increased for better performance)

// In-memory cache for notebooks (defined before Notebook interface to avoid forward reference)
interface NotebookCacheEntry {
  data: Notebook[];
  timestamp: number;
}

interface SingleNotebookCacheEntry {
  data: Notebook;
  timestamp: number;
}

const notebooksCache = new Map<string, NotebookCacheEntry>();
const singleNotebookCache = new Map<string, SingleNotebookCacheEntry>();

// Request deduplication: prevent multiple simultaneous requests for the same data
const pendingRequests = new Map<string, Promise<any>>();

// ============================================================================
// NOTEBOOK OPERATIONS
// ============================================================================

export interface Notebook {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  source_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new notebook
 */
export async function createNotebook(
  userId: string,
  title: string = 'Untitled notebook',
  description?: string
): Promise<{ data: Notebook | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('research_notebooks')
      .insert({
        user_id: userId,
        title,
        description: description || null,
        source_count: 0,
      })
      .select()
      .single();

    // Check if error is due to missing table
    if (error) {
      const errorMessage = error.message || String(error);
      if (
        errorMessage.includes('relation') && 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('PGRST116') ||
        error.code === 'PGRST116'
      ) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql'
          }
        };
      }
    }

    // Clear cache after creating notebook
    if (data) {
      clearNotebooksCache(userId);
    }

    return { data, error };
  } catch (err: any) {
    // Handle JSON parsing errors (when Supabase returns HTML)
    if (err.message?.includes('JSON') || err.message?.includes('DOCTYPE')) {
      return {
        data: null,
        error: {
          message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
          code: 'TABLE_NOT_FOUND',
          hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql',
          originalError: err.message
        }
      };
    }
    
    return {
      data: null,
      error: err
    };
  }
}

/**
 * Get all notebooks for a user
 * Optimized: Only select necessary fields, with caching and request deduplication for better performance
 */
export async function getUserNotebooks(
  userId: string,
  limit: number = 10
): Promise<{ data: Notebook[] | null; error: any }> {
  const cacheKey = `${userId}-${limit}`;
  
  // Check cache first
  const cached = notebooksCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached notebooks');
    return { data: cached.data, error: null };
  }

  // Check if there's already a pending request for this key
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log('Deduplicating request - waiting for existing request');
    return pendingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('research_notebooks')
        .select('id, user_id, title, description, thumbnail_url, source_count, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      const queryTime = performance.now() - startTime;
      console.log(`Database query took ${queryTime.toFixed(2)}ms`);

      // Check if error is due to missing table
      if (error) {
        const errorMessage = error.message || String(error);
        if (
          errorMessage.includes('relation') && 
          errorMessage.includes('does not exist') ||
          errorMessage.includes('PGRST116') ||
          error.code === 'PGRST116'
        ) {
          return {
            data: null,
            error: {
              message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
              code: 'TABLE_NOT_FOUND',
              hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql'
            }
          };
        }
      }

      // Cache the result
      if (data) {
        notebooksCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return { data, error };
    } catch (err: any) {
      // Handle JSON parsing errors (when Supabase returns HTML)
      if (err.message?.includes('JSON') || err.message?.includes('DOCTYPE')) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql',
            originalError: err.message
          }
        };
      }
      
      return {
        data: null,
        error: err
      };
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Clear notebooks cache (useful after creating/updating/deleting notebooks)
 */
export function clearNotebooksCache(userId?: string) {
  if (userId) {
    // Clear cache for specific user
    const keysToDelete: string[] = [];
    notebooksCache.forEach((_, key) => {
      if (key.startsWith(`${userId}-`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => notebooksCache.delete(key));
    
    // Also clear single notebook cache for this user
    singleNotebookCache.forEach((_, key) => {
      if (key.includes(`-${userId}`)) {
        singleNotebookCache.delete(key);
      }
    });
  } else {
    // Clear all cache
    notebooksCache.clear();
    singleNotebookCache.clear();
  }
}

/**
 * Get a single notebook by ID
 * Optimized: Caching and request deduplication for better performance
 */
export async function getNotebook(
  notebookId: string,
  userId: string
): Promise<{ data: Notebook | null; error: any }> {
  const cacheKey = `notebook-${notebookId}-${userId}`;
  
  // Check cache first
  const cached = singleNotebookCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached notebook');
    return { data: cached.data, error: null };
  }

  // Check if there's already a pending request for this key
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log('Deduplicating request - waiting for existing request');
    return pendingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('research_notebooks')
        .select('id, user_id, title, description, thumbnail_url, source_count, created_at, updated_at')
        .eq('id', notebookId)
        .eq('user_id', userId)
        .single();

      const queryTime = performance.now() - startTime;
      console.log(`getNotebook query took ${queryTime.toFixed(2)}ms`);

    // Check if error is due to missing table
    if (error) {
      console.error('Supabase error in getNotebook:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      const errorMessage = error.message || String(error);
      if (
        (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
        errorMessage.includes('PGRST116') ||
        error.code === 'PGRST116'
      ) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql'
          }
        };
      }
      
      // Check for RLS policy errors
      if (error.code === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
        return {
          data: null,
          error: {
            message: 'Permission denied. Please check Row Level Security policies.',
            code: 'RLS_ERROR',
            hint: 'The RLS policies may not be set up correctly. Please verify the migration was run completely.',
            originalError: error
          }
        };
      }
    }

      // Cache the result
      if (data) {
        singleNotebookCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return { data, error };
    } catch (err: any) {
      // Handle JSON parsing errors (when Supabase returns HTML)
      if (err.message?.includes('JSON') || err.message?.includes('DOCTYPE')) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql',
            originalError: err.message
          }
        };
      }
      
      return {
        data: null,
        error: err
      };
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Update notebook title
 */
export async function updateNotebookTitle(
  notebookId: string,
  userId: string,
  title: string
): Promise<{ data: Notebook | null; error: any }> {
  const { data, error } = await supabase
    .from('research_notebooks')
    .update({ title })
    .eq('id', notebookId)
    .eq('user_id', userId)
    .select()
    .single();

  // Clear cache after updating notebook
  if (data) {
    clearNotebooksCache(userId);
    // Also clear single notebook cache
    const singleCacheKey = `notebook-${notebookId}-${userId}`;
    singleNotebookCache.delete(singleCacheKey);
  }

  return { data, error };
}

/**
 * Delete a notebook
 */
export async function deleteNotebook(
  notebookId: string,
  userId: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('research_notebooks')
    .delete()
    .eq('id', notebookId)
    .eq('user_id', userId);

  // Clear cache after deleting notebook
  if (!error) {
    clearNotebooksCache(userId);
    // Also clear single notebook cache
    const singleCacheKey = `notebook-${notebookId}-${userId}`;
    singleNotebookCache.delete(singleCacheKey);
  }

  return { error };
}

// ============================================================================
// SOURCE OPERATIONS
// ============================================================================

export interface Source {
  id: string;
  notebook_id: string;
  user_id: string;
  source_type: 'pdf' | 'docx' | 'txt' | 'markdown' | 'link' | 'text' | 'image' | 'audio' | 'video';
  title: string;
  file_path: string | null;
  file_url: string | null;
  link_url: string | null;
  content_text: string | null;
  processed_content: string | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  file_size: number | null;
  mime_type: string | null;
  is_included: boolean;
  metadata: any;
  extracted_verses: any;
  key_insights: any;
  toc_structure: any;
  created_at: string;
  updated_at: string;
}

/**
 * Get all sources for a notebook
 * Optimized: Caching, request deduplication, and error handling
 */
export async function getNotebookSources(
  notebookId: string,
  userId: string
): Promise<{ data: Source[] | null; error: any }> {
  const cacheKey = `sources-${notebookId}-${userId}`;
  
  // Check cache first
  const cached = notebooksCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached sources');
    return { data: cached.data as any, error: null };
  }

  // Check if there's already a pending request for this key
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log('Deduplicating request - waiting for existing request');
    return pendingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const startTime = performance.now();
      
      // Optimized field selection: only fetch fields needed for SourcesPanel display
      const { data, error } = await supabase
        .from('research_sources')
        .select('id, notebook_id, user_id, source_type, title, file_path, file_url, link_url, processed_content, processing_status, is_included, key_insights, created_at, updated_at')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const queryTime = performance.now() - startTime;
      console.log(`getNotebookSources query took ${queryTime.toFixed(2)}ms`);

      // Check if error is due to missing table
      if (error) {
        const errorMessage = error.message || String(error);
        if (
          (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
          errorMessage.includes('PGRST116') ||
          error.code === 'PGRST116'
        ) {
          return {
            data: null,
            error: {
              message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
              code: 'TABLE_NOT_FOUND',
              hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql'
            }
          };
        }
        
        // Check for RLS policy errors
        if (error.code === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('row-level security')) {
          return {
            data: null,
            error: {
              message: 'Permission denied. Please check Row Level Security policies.',
              code: 'RLS_ERROR',
              hint: 'The RLS policies may not be set up correctly. Please verify the migration was run completely.',
              originalError: error
            }
          };
        }
      }

      // Cache the result
      if (data) {
        notebooksCache.set(cacheKey, { data: data as any, timestamp: Date.now() });
      }

      return { data, error };
    } catch (err: any) {
      // Handle JSON parsing errors (when Supabase returns HTML)
      if (err.message?.includes('JSON') || err.message?.includes('DOCTYPE')) {
        return {
          data: null,
          error: {
            message: 'Database tables not found. Please run the migration SQL file in Supabase Dashboard.',
            code: 'TABLE_NOT_FOUND',
            hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000000_create_research_lab_tables.sql',
            originalError: err.message
          }
        };
      }
      
      return {
        data: null,
        error: err
      };
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Create a source
 */
export async function createSource(
  sourceData: {
    notebook_id: string;
    user_id: string;
    source_type: Source['source_type'];
    title: string;
    file_path?: string;
    file_url?: string;
    link_url?: string;
    content_text?: string;
    file_size?: number;
    mime_type?: string;
  }
): Promise<{ data: Source | null; error: any }> {
  const { data, error } = await supabase
    .from('research_sources')
    .insert({
      ...sourceData,
      processing_status: 'pending',
      is_included: true,
    })
    .select()
    .single();

  // Clear sources cache after creating source
  if (data) {
    const cacheKey = `sources-${sourceData.notebook_id}-${sourceData.user_id}`;
    notebooksCache.delete(cacheKey);
    // Also clear any filtered cache keys
    for (const key of notebooksCache.keys()) {
      if (key.startsWith(`sources-${sourceData.notebook_id}-${sourceData.user_id}:`)) {
        notebooksCache.delete(key);
      }
    }
  }

  return { data, error };
}

/**
 * Toggle source include/exclude
 */
export async function toggleSourceInclude(
  sourceId: string,
  userId: string,
  isIncluded: boolean
): Promise<{ error: any }> {
  // First get the source to know which notebook it belongs to
  const { data: source } = await supabase
    .from('research_sources')
    .select('notebook_id')
    .eq('id', sourceId)
    .eq('user_id', userId)
    .single();

  const { error } = await supabase
    .from('research_sources')
    .update({ is_included: isIncluded })
    .eq('id', sourceId)
    .eq('user_id', userId);

  // Clear sources cache after updating source
  if (!error && source) {
    const cacheKey = `sources-${source.notebook_id}-${userId}`;
    notebooksCache.delete(cacheKey);
    // Also clear any filtered cache keys
    for (const key of notebooksCache.keys()) {
      if (key.startsWith(`sources-${source.notebook_id}-${userId}:`)) {
        notebooksCache.delete(key);
      }
    }
  }

  return { error };
}

/**
 * Delete a source
 */
export async function deleteSource(
  sourceId: string,
  userId: string
): Promise<{ error: any }> {
  // First get the source to know which notebook it belongs to
  const { data: source } = await supabase
    .from('research_sources')
    .select('notebook_id')
    .eq('id', sourceId)
    .eq('user_id', userId)
    .single();

  const { error } = await supabase
    .from('research_sources')
    .delete()
    .eq('id', sourceId)
    .eq('user_id', userId);

  // Update notebook source count and clear cache
  if (!error && source) {
    await updateNotebookSourceCount(source.notebook_id, userId, -1);
    // Clear sources cache after deleting source
    const cacheKey = `sources-${source.notebook_id}-${userId}`;
    notebooksCache.delete(cacheKey);
    // Also clear any filtered cache keys
    for (const key of notebooksCache.keys()) {
      if (key.startsWith(`sources-${source.notebook_id}-${userId}:`)) {
        notebooksCache.delete(key);
      }
    }
  }

  return { error };
}

/**
 * Update source processing status
 */
export async function updateSourceProcessingStatus(
  sourceId: string,
  userId: string,
  status: Source['processing_status'],
  processedContent?: string,
  metadata?: any
): Promise<{ error: any }> {
  // First get the source to know which notebook it belongs to
  const { data: source } = await supabase
    .from('research_sources')
    .select('notebook_id')
    .eq('id', sourceId)
    .eq('user_id', userId)
    .single();

  const updateData: any = { processing_status: status };
  if (processedContent) updateData.processed_content = processedContent;
  if (metadata) updateData.metadata = metadata;

  const { error } = await supabase
    .from('research_sources')
    .update(updateData)
    .eq('id', sourceId)
    .eq('user_id', userId);

  // Clear sources cache after updating processing status (processed_content may have changed)
  if (!error && source) {
    const cacheKey = `sources-${source.notebook_id}-${userId}`;
    notebooksCache.delete(cacheKey);
    // Also clear any filtered cache keys
    for (const key of notebooksCache.keys()) {
      if (key.startsWith(`sources-${source.notebook_id}-${userId}:`)) {
        notebooksCache.delete(key);
      }
    }
  }

  return { error };
}

// ============================================================================
// CHAT MESSAGE OPERATIONS
// ============================================================================

export interface ChatMessage {
  id: string;
  notebook_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources_used: string[] | null;
  citations: any;
  tool_calls: any;
  confidence_score: number | null;
  created_at: string;
}

/**
 * Get chat messages for a notebook
 */
export async function getChatMessages(
  notebookId: string,
  userId: string
): Promise<{ data: ChatMessage[] | null; error: any }> {
  const { data, error } = await supabase
    .from('research_chat_messages')
    .select('*')
    .eq('notebook_id', notebookId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Create a chat message
 */
export async function createChatMessage(
  messageData: {
    notebook_id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources_used?: string[];
    citations?: any;
    tool_calls?: any;
    confidence_score?: number;
  }
): Promise<{ data: ChatMessage | null; error: any }> {
  const { data, error } = await supabase
    .from('research_chat_messages')
    .insert(messageData)
    .select()
    .single();

  return { data, error };
}

// ============================================================================
// STUDIO OUTPUT OPERATIONS
// ============================================================================

export interface StudioOutput {
  id: string;
  notebook_id: string;
  user_id: string;
  output_type: 'summary' | 'audio_overview' | 'mind_map' | 'flashcards' | 'quiz' | 'report' | 'study_guide' | 'sermon' | 'timeline' | 'glossary' | 'summarization' | 'theology_qa' | 'cross_references' | 'curriculum' | 'doctrinal_harmony' | 'manual_note';
  content: any;
  metadata?: any; // Optional - may not exist if migration not run
  generated_at: string;
  updated_at: string;
}

/**
 * Get studio outputs for a notebook
 */
export async function getStudioOutputs(
  notebookId: string,
  userId: string
): Promise<{ data: StudioOutput[] | null; error: any }> {
  try {
    // Try to select with metadata first (if column exists)
    const { data, error } = await supabase
      .from('research_studio_outputs')
      .select('id, notebook_id, user_id, output_type, content, generated_at, updated_at, metadata')
      .eq('notebook_id', notebookId)
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    // If error is about missing column, try without metadata
    if (error && (error.message?.includes('column') && error.message?.includes('metadata'))) {
      console.warn('Metadata column not found, querying without it');
      const { data: dataWithoutMetadata, error: errorWithoutMetadata } = await supabase
        .from('research_studio_outputs')
        .select('id, notebook_id, user_id, output_type, content, generated_at, updated_at')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .order('generated_at', { ascending: false });
      
      return { data: dataWithoutMetadata, error: errorWithoutMetadata };
    }

    return { data, error };
  } catch (err: any) {
    console.error('Error in getStudioOutputs:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update studio output
 */
export async function upsertStudioOutput(
  outputData: {
    notebook_id: string;
    user_id: string;
    output_type: StudioOutput['output_type'];
    content: any;
  }
): Promise<{ data: StudioOutput | null; error: any }> {
  const { data, error } = await supabase
    .from('research_studio_outputs')
    .upsert(outputData, {
      onConflict: 'notebook_id,output_type',
    })
    .select()
    .single();

  return { data, error };
}

// ============================================================================
// AGENTIC ACTION OPERATIONS
// ============================================================================

export interface AgenticAction {
  id: string;
  notebook_id: string;
  user_id: string;
  action_type: 'search' | 'synthesize' | 'extract' | 'generate' | 'build';
  tool_name: string;
  parameters: any;
  result: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

/**
 * Create an agentic action
 */
export async function createAgenticAction(
  actionData: {
    notebook_id: string;
    user_id: string;
    action_type: AgenticAction['action_type'];
    tool_name: string;
    parameters: any;
  }
): Promise<{ data: AgenticAction | null; error: any }> {
  const { data, error } = await supabase
    .from('research_agentic_actions')
    .insert({
      ...actionData,
      status: 'pending',
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update agentic action status and result
 */
export async function updateAgenticAction(
  actionId: string,
  userId: string,
  updates: {
    status?: AgenticAction['status'];
    result?: any;
    completed_at?: string;
  }
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('research_agentic_actions')
    .update(updates)
    .eq('id', actionId)
    .eq('user_id', userId);

  return { error };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Update notebook source count
 */
export async function updateNotebookSourceCount(
  notebookId: string,
  userId: string,
  increment: number
): Promise<{ error: any }> {
  try {
    // Use atomic increment with RPC or direct update
    // First, get current count
    const { data: notebook, error: fetchError } = await supabase
      .from('research_notebooks')
      .select('source_count')
      .eq('id', notebookId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !notebook) {
      return { error: fetchError || new Error('Notebook not found') };
    }

    // Calculate new count (ensure it doesn't go below 0)
    const newCount = Math.max(0, (notebook.source_count || 0) + increment);

    // Update count atomically
    const { error } = await supabase
      .from('research_notebooks')
      .update({ source_count: newCount })
      .eq('id', notebookId)
      .eq('user_id', userId);

    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

