// Web Search API for Research Lab
// Uses GLM-4.5-Air with web search capability and Tavily API fallback

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';
const TAVILY_API_URL = 'https://api.tavily.com/search';

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

    // Try Tavily API first for deep search (if available)
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    let tavilyResults: Array<{ title: string; url: string; content: string }> = [];
    
    if (tavilyApiKey) {
      try {
        const tavilyResponse = await fetch(TAVILY_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: query.trim(),
            search_depth: 'advanced', // Deep search
            max_results: 5,
            include_answer: true,
            include_raw_content: false,
          }),
        });
        
        if (tavilyResponse.ok) {
          const tavilyData = await tavilyResponse.json();
          tavilyResults = (tavilyData.results || []).map((r: any) => ({
            title: r.title || 'Web Result',
            url: r.url || '',
            content: r.content || r.snippet || '',
          }));
        }
      } catch (tavilyError: any) {
        console.error('[Web Search] Tavily API error:', tavilyError);
        // Continue with GLM if Tavily fails
      }
    }

    // Call GLM-4.5-Air for summary and analysis
    const glmPrompt = tavilyResults.length > 0
      ? `Based on these web search results, provide a comprehensive summary:\n\n${tavilyResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.content.substring(0, 500)}`).join('\n\n---\n\n')}\n\nProvide:\n1. A detailed summary (3-5 sentences)\n2. Key topics and themes\n3. Relevance to Bible study and theology\n4. Important insights`
      : `Search the web for: ${query.trim()}\n\nProvide:\n1. A brief summary (2-3 sentences)\n2. Key topics covered\n3. Relevance to Bible study`;

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
            content: glmPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    let summary = 'No results found';
    if (response.ok) {
      const data = await response.json();
      summary = data.choices?.[0]?.message?.content || summary;
    } else {
      console.error('[Web Search] GLM API error:', response.status, response.statusText);
      // If GLM fails but we have Tavily results, use them
      if (tavilyResults.length > 0) {
        summary = tavilyResults.map(r => `${r.title}: ${r.content.substring(0, 200)}...`).join('\n\n');
      }
    }

    res.status(200).json({
      success: true,
      query: query.trim(),
      summary: summary,
      results: tavilyResults.length > 0 ? tavilyResults : [],
      sources: tavilyResults.map((r, i) => ({
        id: i + 1,
        title: r.title,
        url: r.url,
        snippet: r.content.substring(0, 200),
      })),
    });

  } catch (error: any) {
    console.error('[Web Search] Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to perform web search'
    });
  }
}

