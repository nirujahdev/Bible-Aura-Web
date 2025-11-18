// Research Lab Database Operations Helper
// This file contains all database operations for Research Lab feature

import { supabase } from '@/integrations/supabase/client';

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

  return { data, error };
}

/**
 * Get all notebooks for a user
 */
export async function getUserNotebooks(
  userId: string,
  limit: number = 10
): Promise<{ data: Notebook[] | null; error: any }> {
  const { data, error } = await supabase
    .from('research_notebooks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Get a single notebook by ID
 */
export async function getNotebook(
  notebookId: string,
  userId: string
): Promise<{ data: Notebook | null; error: any }> {
  const { data, error } = await supabase
    .from('research_notebooks')
    .select('*')
    .eq('id', notebookId)
    .eq('user_id', userId)
    .single();

  return { data, error };
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
 */
export async function getNotebookSources(
  notebookId: string,
  userId: string
): Promise<{ data: Source[] | null; error: any }> {
  const { data, error } = await supabase
    .from('research_sources')
    .select('*')
    .eq('notebook_id', notebookId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
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
  const { error } = await supabase
    .from('research_sources')
    .update({ is_included: isIncluded })
    .eq('id', sourceId)
    .eq('user_id', userId);

  return { error };
}

/**
 * Delete a source
 */
export async function deleteSource(
  sourceId: string,
  userId: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('research_sources')
    .delete()
    .eq('id', sourceId)
    .eq('user_id', userId);

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
  const updateData: any = { processing_status: status };
  if (processedContent) updateData.processed_content = processedContent;
  if (metadata) updateData.metadata = metadata;

  const { error } = await supabase
    .from('research_sources')
    .update(updateData)
    .eq('id', sourceId)
    .eq('user_id', userId);

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
  output_type: 'summary' | 'audio_overview' | 'mind_map' | 'flashcards' | 'quiz' | 'report' | 'study_guide' | 'sermon' | 'timeline' | 'glossary';
  content: any;
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
  const { data, error } = await supabase
    .from('research_studio_outputs')
    .select('*')
    .eq('notebook_id', notebookId)
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  return { data, error };
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
  // Get current count
  const { data: notebook, error: fetchError } = await supabase
    .from('research_notebooks')
    .select('source_count')
    .eq('id', notebookId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !notebook) {
    return { error: fetchError || new Error('Notebook not found') };
  }

  // Update count
  const { error } = await supabase
    .from('research_notebooks')
    .update({ source_count: (notebook.source_count || 0) + increment })
    .eq('id', notebookId)
    .eq('user_id', userId);

  return { error };
}

