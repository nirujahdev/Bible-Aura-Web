// Research Lab Chat API
// GLM-4.5-Air integration with notebook sources and Bible guardrails
// Enhanced with Pinecone vector search for semantic source retrieval

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCachedSources } from './cache.js';
import { searchSimilarSources } from '../../src/lib/research-lab/vector-operations.js';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  // Always create a new client instance when auth token is provided
  // This ensures proper authentication context
  if (authToken) {
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    });
    // Verify the token is valid by getting the user
    // This ensures auth.uid() will work in RLS policies
    try {
      const { data: { user }, error: userError } = await client.auth.getUser(authToken);
      if (userError || !user) {
        console.warn('[Supabase Client] Token validation warning:', userError?.message || 'No user found');
        // Continue anyway - the token in headers might still work for RLS
      } else {
        console.log('[Supabase Client] Token validated for user:', user.id);
      }
    } catch (verifyError: any) {
      console.warn('[Supabase Client] Token verification error:', verifyError?.message);
      // Continue anyway - headers should work
    }
    return client;
  }
  
  // Otherwise use shared client (for non-user operations)
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

function getUserIdFromToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 10) return null; // Basic token validation
    
    // Decode JWT payload (Supabase tokens are signed, but we verify ownership via database)
    const parts = token.split('.');
    if (parts.length !== 3) return null; // JWT should have 3 parts
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Validate token structure
    if (!payload || typeof payload !== 'object') return null;
    
    // Check token expiration if present
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null; // Token expired
    }
    
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

// Bible-related validation
function isBibleRelated(question: string): boolean {
  const bibleKeywords = [
    'bible', 'scripture', 'verse', 'gospel', 'theology', 'doctrine', 
    'christian', 'jesus', 'god', 'faith', 'prayer', 'church', 'christ',
    'biblical', 'testament', 'prophet', 'apostle', 'salvation', 'grace',
    'sin', 'holy', 'spirit', 'trinity', 'covenant', 'worship'
  ];
  const lowerQuestion = question.toLowerCase();
  return bibleKeywords.some(keyword => lowerQuestion.includes(keyword));
}

const BIBLE_CHAT_SYSTEM_PROMPT = `You are a Bible research assistant. You MUST ONLY respond to Bible, theology, and Christian content. Reject non-Bible questions. Answer questions based on the provided notebook sources. Always cite specific sources and verses when available.`;

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

    const { notebookId, message } = req.body;

    if (!notebookId || !message) {
      res.status(400).json({ error: 'notebookId and message are required' });
      return;
    }

    // Validate input length to prevent abuse
    if (typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    if (message.length > 5000) {
      res.status(400).json({ error: 'Message too long. Maximum 5000 characters.' });
      return;
    }

    if (typeof notebookId !== 'string' || notebookId.length > 100) {
      res.status(400).json({ error: 'Invalid notebookId format' });
      return;
    }

    // Validate Bible-related question
    if (!isBibleRelated(message)) {
      res.status(400).json({ 
        error: 'Question must be Bible-related',
        message: 'Please ask questions about the Bible, theology, or Christian doctrine.'
      });
      return;
    }

    // Get auth token from request
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    
    // Use authenticated Supabase client
    const supabase = getSupabaseClient(authToken);

    // Verify notebook ownership (RLS will handle access control)
    const { data: notebook, error: notebookError } = await supabase
      .from('research_notebooks')
      .select('id, user_id')
      .eq('id', notebookId)
      .single();

    if (notebookError) {
      console.error('[Chat API] Notebook fetch error:', {
        error: notebookError,
        code: notebookError.code,
        message: notebookError.message,
        notebookId,
        userId,
      });
      
      // Check for specific error types
      if (notebookError.code === 'PGRST116' || notebookError.message?.includes('does not exist')) {
        res.status(404).json({ 
          error: 'Notebook not found',
          message: 'The notebook does not exist or you do not have access to it.'
        });
        return;
      }
      
      if (notebookError.code === '42501' || notebookError.message?.includes('permission denied')) {
        res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to access this notebook.'
        });
        return;
      }
      
      res.status(403).json({ 
        error: 'Notebook access error',
        message: notebookError.message || 'Failed to verify notebook access'
      });
      return;
    }

    if (!notebook) {
      res.status(404).json({ error: 'Notebook not found' });
      return;
    }
    
    // Double-check ownership (extra security layer)
    if (notebook.user_id !== userId) {
      res.status(403).json({ error: 'Access denied', message: 'You do not own this notebook' });
      return;
    }

    // Get notebook sources with caching and optimized field selection
    const { data: sources, error: sourcesError } = await getCachedSources(
      notebookId,
      userId,
      ['id', 'title', 'processed_content', 'source_type'], // Optimized: removed 'content' field
      undefined, // sourceIds
      authToken // Pass auth token for authenticated queries
    );

    if (sourcesError) {
      console.error('[Chat API] Sources error:', {
        error: sourcesError,
        context: 'fetch_sources',
        notebookId,
        userId,
        code: sourcesError.code,
        message: sourcesError.message,
        details: sourcesError.details,
        hint: sourcesError.hint
      });

      // Return graceful fallback instead of error
      if (sourcesError.code === 'TABLE_NOT_FOUND') {
        res.status(500).json({ 
          error: 'Database setup required',
          message: sourcesError.hint || 'Please run the migration SQL file in Supabase Dashboard.',
          details: process.env.NODE_ENV === 'development' ? sourcesError.message : undefined
        });
        return;
      }

      if (sourcesError.code === 'RLS_ERROR') {
        res.status(500).json({ 
          error: 'Permission denied',
          message: sourcesError.hint || 'Please check Row Level Security policies.',
          details: process.env.NODE_ENV === 'development' ? sourcesError.message : undefined
        });
        return;
      }

      // For other errors, return empty sources array (graceful degradation)
      console.warn('[Chat API] Returning empty sources due to error');
    }

    // Use Pinecone for semantic source retrieval (with graceful fallback)
    let sourceContext = 'No sources available in this notebook.';
    let selectedSources: any[] = [];
    
    // Always fallback to all included sources if Pinecone fails
    const validSources = sources && !sourcesError ? sources : [];
    
    try {
      // Search Pinecone for similar sources (top 5-10)
      // searchSimilarSources returns empty array on error, so it won't throw
      const pineconeResults = await searchSimilarSources(message, notebookId, 8, 0.6);
      
      if (pineconeResults && pineconeResults.length > 0) {
        // Fetch full content for Pinecone results from Supabase
        const pineconeSourceIds = [...new Set(pineconeResults.map(r => r.sourceId))];
        const { data: pineconeSources, error: pineconeError } = await supabase
          .from('research_sources')
          .select('id, title, processed_content, source_type')
          .eq('notebook_id', notebookId)
          .eq('user_id', userId)
          .in('id', pineconeSourceIds);
        
        if (!pineconeError && pineconeSources && pineconeSources.length > 0) {
          // Build context from Pinecone-retrieved sources (semantically relevant)
          selectedSources = pineconeSources;
          sourceContext = pineconeSources
            .map(s => {
              const content = String(s.processed_content || '');
              const result = pineconeResults.find(r => r.sourceId === s.id);
              return `[Source: ${s.title}${result ? ` (Relevance: ${(result.score * 100).toFixed(0)}%)` : ''}]\n${content.substring(0, 5000)}`;
            })
            .join('\n\n---\n\n');
          
          console.log(`[Chat API] Using ${pineconeSources.length} Pinecone-retrieved sources`);
        }
      }
    } catch (pineconeError: any) {
      // Log but don't break - will use fallback
      console.warn('[Chat API] Pinecone search error, using fallback:', pineconeError?.message || pineconeError);
    }
    
    // Fallback: If Pinecone returns no results or fails, use all included sources
    if (selectedSources.length === 0 && validSources.length > 0) {
      selectedSources = validSources;
      sourceContext = validSources
        .map(s => {
          const content = String(s.processed_content || '');
          return `[Source: ${s.title}]\n${content.substring(0, 5000)}`;
        })
        .join('\n\n---\n\n');
      console.log(`[Chat API] Using ${validSources.length} included sources (Pinecone unavailable or no matches)`);
    }

    // Ensure we have sources or provide a helpful message
    if (selectedSources.length === 0) {
      res.status(400).json({ 
        error: 'No sources available',
        message: 'This notebook has no sources. Please add sources before asking questions.'
      });
      return;
    }

    // Call GLM-4.5-Air API
    const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
    if (!glmApiKey || glmApiKey.trim() === '') {
      res.status(500).json({ 
        error: 'GLM API key not configured',
        message: 'Please set GLM_API_KEY in Vercel environment variables.'
      });
      return;
    }

    // Sanitize message and ensure sourceContext is not empty
    const sanitizedMessage = message.trim().substring(0, 5000);
    const safeSourceContext = sourceContext || 'No sources available in this notebook.';
    
    // Limit total prompt length to prevent token overflow
    const maxContextLength = 50000; // ~12,500 tokens
    const truncatedContext = safeSourceContext.length > maxContextLength 
      ? safeSourceContext.substring(0, maxContextLength) + '\n\n[Context truncated due to length]'
      : safeSourceContext;

    const userPrompt = `Question: ${sanitizedMessage}\n\nAnswer based on these notebook sources:\n\n${truncatedContext}\n\nProvide a clear, Bible-focused answer with citations from the sources.`;

    // Fetch with timeout and retry logic
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`[Chat API] Retry attempt ${attempt}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
          }

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return response;
          }

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            return response;
          }

          // Retry on 5xx errors or network errors
          if (attempt === maxRetries) {
            return response;
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout: AI service took too long to respond');
          }

          if (attempt === maxRetries) {
            throw error;
          }
        }
      }

      throw new Error('Failed to fetch after retries');
    };

    const response = await fetchWithRetry(
      `${GLM_API_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${glmApiKey}`,
        },
        body: JSON.stringify({
          model: GLM_MODEL,
          messages: [
            { role: 'system', content: BIBLE_CHAT_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] GLM API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      let errorMessage = 'AI service error';
      if (response.status === 401) {
        errorMessage = 'GLM API authentication failed. Please check API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status >= 500) {
        errorMessage = 'AI service temporarily unavailable. Please try again later.';
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
      return;
    }

    let glmData: any;
    try {
      glmData = await response.json();
    } catch (jsonError: any) {
      console.error('[Chat API] JSON parse error:', jsonError);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an invalid response. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
      return;
    }

    // Validate response structure
    if (!glmData || !glmData.choices || !Array.isArray(glmData.choices) || glmData.choices.length === 0) {
      console.error('[Chat API] Invalid response structure:', glmData);
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an unexpected response format. Please try again.',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData) : undefined
      });
      return;
    }

    const aiResponse = glmData.choices[0]?.message?.content || glmData.choices[0]?.content || 'No response generated';

    if (!aiResponse || aiResponse.trim().length === 0 || aiResponse === 'No response generated') {
      console.error('[Chat API] Empty response from AI:', { glmData });
      res.status(500).json({ 
        error: 'Empty response from AI service',
        message: 'The AI service did not generate a response. Please try again.',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData) : undefined
      });
      return;
    }

    // Save chat messages to database
    const { error: userMsgError } = await supabase
      .from('research_chat_messages')
      .insert({
        notebook_id: notebookId,
        user_id: userId,
        role: 'user',
        content: message,
        sources_used: selectedSources.map(s => ({ id: s.id, title: s.title })),
      });

    if (userMsgError) {
      console.error('[Chat API] Error saving user message:', userMsgError);
    }

    const { data: aiMessage, error: aiMsgError } = await supabase
      .from('research_chat_messages')
      .insert({
        notebook_id: notebookId,
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        sources_used: selectedSources.map(s => ({ id: s.id, title: s.title })),
      })
      .select()
      .single();

    if (aiMsgError) {
      console.error('[Chat API] Error saving AI message:', aiMsgError);
    }

    res.status(200).json({
      success: true,
      message: aiResponse,
      sourcesUsed: sources?.map(s => ({ id: s.id, title: s.title })) || [],
      messageId: aiMessage?.id || null,
    });

  } catch (error: any) {
    console.error('[Chat API] Error:', error);
    console.error('[Chat API] Error stack:', error.stack);
    console.error('[Chat API] Request body:', req.body);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('GLM API key')) {
      errorMessage = 'GLM API key not configured. Please set GLM_API_KEY environment variable.';
      statusCode = 500;
    } else if (error.message?.includes('Supabase')) {
      errorMessage = 'Database connection error. Please try again.';
      statusCode = 500;
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorMessage = 'Failed to connect to AI service. Please try again.';
      statusCode = 503;
    } else {
      errorMessage = error.message || 'Internal server error';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage, 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
    return;
  }
}

