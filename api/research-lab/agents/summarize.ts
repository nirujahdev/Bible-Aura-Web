// Summarization & Synthesis Agent API
// Analyzes notebook sources and generates summaries/synthesis

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

// Cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 20; // 20 seconds

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

const BIBLE_SYSTEM_PROMPT = `You are a Bible research assistant. You MUST ONLY respond to Bible, theology, and Christian content. Reject non-Bible questions. Analyze the provided sources and create comprehensive summaries and synthesis. Always cite sources.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    setCORSHeaders(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCORSHeaders(res);

  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notebookId, summaryType = 'detailed', sourceIds } = req.body;

    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId is required' });
    }

    const supabase = getSupabaseClient();

    // Get notebook sources
    let query = supabase
      .from('research_sources')
      .select('id, title, content, processed_content, source_type')
      .eq('notebook_id', notebookId)
      .eq('user_id', userId)
      .eq('is_included', true);

    if (sourceIds && Array.isArray(sourceIds) && sourceIds.length > 0) {
      query = query.in('id', sourceIds);
    }

    const { data: sources, error: sourcesError } = await query;

    if (sourcesError) {
      console.error('[Summarize Agent] Sources error:', sourcesError);
      return res.status(500).json({ error: 'Failed to fetch sources', details: sourcesError.message });
    }

    if (!sources || sources.length === 0) {
      return res.status(400).json({ error: 'No sources found in notebook' });
    }

    // Build source content
    const sourceTexts = sources
      .map(s => {
        const content = s.processed_content || s.content || '';
        return `[Source: ${s.title}]\n${content.substring(0, 10000)}`;
      })
      .join('\n\n---\n\n');

    // Call GLM-4.5-Air API
    const glmApiKey = process.env.GLM_API_KEY;
    if (!glmApiKey) {
      return res.status(500).json({ error: 'GLM API key not configured' });
    }

    const summaryPrompt = summaryType === 'brief'
      ? 'Create a brief summary (2-3 paragraphs) of the key points from these sources:'
      : summaryType === 'thematic'
      ? 'Create a thematic summary organizing the content by major themes:'
      : 'Create a detailed summary and synthesis of these sources, highlighting key insights, connections, and important points:';

    const response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages: [
          { role: 'system', content: BIBLE_SYSTEM_PROMPT },
          { role: 'user', content: `${summaryPrompt}\n\n${sourceTexts}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Summarize Agent] GLM API error:', errorText);
      return res.status(500).json({ error: 'GLM API error', details: errorText });
    }

    const glmData = await response.json();
    const summary = glmData.choices?.[0]?.message?.content || 'No summary generated';

    // Save to database
    const outputData = {
      notebook_id: notebookId,
      user_id: userId,
      output_type: 'summarization' as const,
      content: {
        summary,
        summaryType,
        sourceIds: sources.map(s => s.id),
        sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
        generatedAt: new Date().toISOString(),
      },
    };

    const { data: savedOutput, error: saveError } = await supabase
      .from('research_studio_outputs')
      .upsert(outputData, {
        onConflict: 'notebook_id,output_type',
      })
      .select()
      .single();

    if (saveError) {
      console.error('[Summarize Agent] Save error:', saveError);
      // Continue even if save fails - user still gets the result
    } else {
      console.log('[Summarize Agent] Output saved successfully:', savedOutput?.id);
    }

    return res.status(200).json({
      success: true,
      summary,
      sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
    });

  } catch (error: any) {
    console.error('[Summarize Agent] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

