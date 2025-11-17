// Sermon AI API Route - Server-side API for sermon AI operations
// Keeps API key secure on server (not exposed to client)
// Uses SERMON_AI_API_KEY environment variable and GPT-4.1 model

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';

// CORS headers helper
function setCORSHeaders(res: VercelResponse, origin?: string) {
  const allowedOrigin = process.env.SERMON_AI_ALLOWED_ORIGIN || 
                       process.env.VITE_APP_URL || 
                       origin || 
                       '*';
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  setCORSHeaders(res, req.headers.origin);

  try {
    console.log('[Sermon AI API] ===== Request Received =====');
    console.log('[Sermon AI API] Method:', req.method);
    console.log('[Sermon AI API] Origin:', req.headers.origin);
    console.log('[Sermon AI API] Body keys:', req.body ? Object.keys(req.body) : 'no body');
    
    // Security: Get API key from server-side environment variable (NOT exposed to client)
    const apiKey = process.env.Sermon_AI_API;
    
    console.log('[Sermon AI API] API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 7) || 'none'
    });
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_sermon_ai_api_key_here' || apiKey.trim() === '') {
      console.error('[Sermon AI API] ❌ Sermon_AI_API not configured');
      res.status(500).json({
        error: 'Service unavailable',
        message: 'Sermon AI API key not configured. Please set Sermon_AI_API in Vercel environment variables.'
      });
      return;
    }

    // Validate API key format
    const isValidKeyFormat = apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-');
    if (!isValidKeyFormat || apiKey.length < 20) {
      console.error('[Sermon AI] Invalid API key format');
      res.status(500).json({
        error: 'Service unavailable',
        message: 'Sermon AI API configuration error'
      });
      return;
    }

    // Parse request body
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be a valid JSON object'
      });
      return;
    }

    const { 
      prompt, 
      systemPrompt = 'You are an expert sermon writing assistant. Provide helpful, natural sermon content.',
      messages = [],
      maxTokens = 1000,
      temperature = 0.7
    } = req.body;

    // Validate prompt or messages
    if (!prompt && (!messages || messages.length === 0)) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Either prompt or messages array is required'
      });
      return;
    }

    // Security: Input validation
    const sanitizedPrompt = prompt ? prompt.trim().slice(0, 10000) : '';
    if (sanitizedPrompt === '' && messages.length === 0) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt cannot be empty'
      });
      return;
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: apiKey
    });

    // Build messages array
    const messageArray = messages.length > 0
      ? [
          { role: 'system' as const, content: systemPrompt },
          ...messages
        ]
      : [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: sanitizedPrompt }
        ];

    // Use gpt-4o for better performance and cost-effectiveness
    const modelName = 'gpt-4o';
    
    console.log('[Sermon AI API] Calling OpenAI API:', {
      model: modelName,
      messagesCount: messageArray.length,
      maxTokens: Math.min(maxTokens, 4000),
      temperature: Math.max(0, Math.min(2, temperature))
    });

    const startTime = Date.now();
    // Call OpenAI API with GPT-4o
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: messageArray,
      max_tokens: Math.min(maxTokens, 4000), // Cap at 4000 for safety
      temperature: Math.max(0, Math.min(2, temperature)) // Clamp between 0 and 2
    });

    const duration = Date.now() - startTime;
    console.log('[Sermon AI API] OpenAI response received:', {
      duration: `${duration}ms`,
      hasChoices: !!completion.choices,
      choicesCount: completion.choices?.length || 0,
      usage: completion.usage
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('[Sermon AI API] ❌ Invalid response from OpenAI');
      res.status(500).json({
        error: 'Invalid response',
        message: 'Invalid response from OpenAI API'
      });
      return;
    }

    const content = completion.choices[0].message.content || '';
    console.log('[Sermon AI API] ===== Success =====');
    console.log('[Sermon AI API] Content length:', content.length);

    res.status(200).json({
      content: content,
      model: modelName,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('[Sermon AI API] ===== Error =====');
    console.error('[Sermon AI API] Error type:', error?.constructor?.name);
    console.error('[Sermon AI API] Error message:', error?.message);
    console.error('[Sermon AI API] Error response status:', error?.response?.status);
    console.error('[Sermon AI API] Full error:', error);
    
    if (error.response?.status === 401) {
      console.error('[Sermon AI API] ❌ Authentication failed');
      res.status(401).json({
        error: 'Authentication failed',
        message: 'Sermon AI API authentication failed. Please check your API key.'
      });
      return;
    } else if (error.response?.status === 429) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait a moment and try again.'
      });
      return;
    } else if (error.response?.status >= 500) {
      res.status(502).json({
        error: 'Service unavailable',
        message: 'OpenAI service is temporarily unavailable. Please try again later.'
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Failed to process sermon AI request'
    });
  }
}

