// Doctrinal Harmonization & Multi-Perspective Agent API
// Harmonizes doctrine and presents multiple theological viewpoints

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

const BIBLE_SYSTEM_PROMPT = `You are a doctrinal harmonization assistant. You MUST ONLY work with Bible doctrine and theology. Help reconcile difficult passages, present multiple theological perspectives, and harmonize doctrine. All content must be Bible-based and theologically sound.`;

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

    const { notebookId, doctrinalQuestion, includePerspectives = true, sourceIds } = req.body;

    if (!notebookId || !doctrinalQuestion) {
      return res.status(400).json({ error: 'notebookId and doctrinalQuestion are required' });
    }

    // Validate Bible-related question
    const bibleKeywords = ['bible', 'scripture', 'doctrine', 'theology', 'faith', 'salvation', 'grace', 'sin', 'god', 'jesus', 'christ'];
    const isBibleRelated = bibleKeywords.some(keyword => doctrinalQuestion.toLowerCase().includes(keyword));
    
    if (!isBibleRelated) {
      return res.status(400).json({ 
        error: 'Question must be Bible-related',
        message: 'Please ask questions about Bible doctrine, theology, or Christian teaching.'
      });
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
      console.error('[Doctrinal Agent] Sources error:', sourcesError);
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

    const perspectivesPrompt = includePerspectives
      ? 'Present multiple theological perspectives where appropriate, showing how different traditions understand this doctrine.'
      : 'Provide a harmonized, unified explanation.';

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
          { role: 'user', content: `Doctrinal Question: ${doctrinalQuestion}

${perspectivesPrompt}

Use these sources:
${sourceTexts}

Provide:
1. Relevant Bible passages
2. Key theological points
3. ${includePerspectives ? 'Multiple perspectives (if applicable)' : 'Harmonized explanation'}
4. How passages fit together
5. Historical context (if relevant)
6. Practical application

Format as structured JSON with clear sections.` }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Doctrinal Agent] GLM API error:', errorText);
      return res.status(500).json({ error: 'GLM API error', details: errorText });
    }

    const glmData = await response.json();
    const harmonization = glmData.choices?.[0]?.message?.content || 'No harmonization generated';

    // Save to database
    const outputData = {
      notebook_id: notebookId,
      user_id: userId,
      output_type: 'doctrinal_harmony' as const,
      content: {
        doctrinalQuestion,
        includePerspectives,
        harmonization,
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
      console.error('[Doctrinal Agent] Save error:', saveError);
    } else {
      console.log('[Doctrinal Agent] Output saved successfully:', savedOutput?.id);
    }

    return res.status(200).json({
      success: true,
      doctrinalQuestion,
      harmonization,
      sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
    });

  } catch (error: any) {
    console.error('[Doctrinal Agent] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

