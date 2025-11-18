// Generate Summary API for Research Lab Sources
// Uses GLM-4.5-Air to generate summaries when resources are added

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

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
    const { sourceId } = req.body;

    if (!sourceId) {
      res.status(400).json({ error: 'sourceId is required' });
      return;
    }

    const supabase = getSupabaseClient();

    // Get source
    const { data: source, error: sourceError } = await supabase
      .from('research_sources')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (sourceError || !source) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    // Extract content for summarization
    let contentToSummarize = '';
    if (source.content_text) {
      contentToSummarize = source.content_text;
    } else if (source.processed_content) {
      contentToSummarize = String(source.processed_content);
    } else if (source.content) {
      contentToSummarize = String(source.content);
    }

    if (!contentToSummarize || contentToSummarize.trim() === '') {
      // No content to summarize
      res.status(200).json({
        success: true,
        summary: null,
        message: 'No content to summarize'
      });
      return;
    }

    const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
    if (!glmApiKey || glmApiKey.trim() === '') {
      res.status(500).json({ 
        error: 'GLM API key not configured',
        message: 'Please set GLM_API_KEY in Vercel environment variables.'
      });
      return;
    }

    // Generate summary using GLM-4.5-Air
    const prompt = `Provide a brief 2-3 sentence summary of this ${source.source_type} source titled "${source.title}".

Content:
${contentToSummarize.substring(0, 5000)}

Summary:`;

    const response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a Bible research assistant. Provide concise, accurate summaries of Bible-related content, theological articles, and Christian resources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Generate Summary] GLM API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      res.status(500).json({ 
        error: 'Summary generation failed',
        message: 'Unable to generate summary. Please try again.'
      });
      return;
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || null;

    // Update source with summary
    if (summary) {
      const { error: updateError } = await supabase
        .from('research_sources')
        .update({ 
          key_insights: summary,
          processing_status: 'completed'
        })
        .eq('id', sourceId);

      if (updateError) {
        console.error('[Generate Summary] Update error:', updateError);
        // Still return the summary even if update fails
      }
    }

    res.status(200).json({
      success: true,
      summary: summary,
      sourceId: sourceId
    });

  } catch (error: any) {
    console.error('[Generate Summary] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to generate summary'
    });
  }
}

