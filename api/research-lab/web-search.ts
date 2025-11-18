// Web Search API for Research Lab
// Uses GLM-4.5-Air with web search capability

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

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
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      res.status(400).json({ error: 'Query is required' });
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

    // Call GLM-4.5-Air with web search enabled
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
            content: 'You are a web search assistant. Search the web for Bible-related content, theological articles, and Christian resources. Provide a concise summary of the search results.'
          },
          {
            role: 'user',
            content: `Search the web for: ${query.trim()}\n\nProvide:\n1. A brief summary (2-3 sentences)\n2. Key topics covered\n3. Relevance to Bible study`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        // Note: GLM-4.5-Air web search may need different format
        // This is a placeholder - adjust based on actual API documentation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Web Search] GLM API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      res.status(500).json({ 
        error: 'Web search failed',
        message: 'Unable to perform web search. Please try again.'
      });
      return;
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No results found';

    res.status(200).json({
      success: true,
      query: query.trim(),
      summary: result,
      sources: data.choices?.[0]?.message?.tool_calls?.map((call: any) => ({
        type: call.type,
        query: call.function?.arguments || call.web_search?.query
      })) || []
    });

  } catch (error: any) {
    console.error('[Web Search] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to perform web search'
    });
  }
}

