// Bible Aura ChatKit Workflow API Route
// Vercel Serverless Function for OpenAI ChatKit workflow integration
// This route handles POST requests to /api/bibleaura-chat
// Uses OpenAI Agents SDK to call the workflow

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default origin allowed for CORS (can be overridden via environment variables)
const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://bibleaura.xyz';

// Types for language and mode classification
type Language = 'en' | 'ta';
type Mode = 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';

// Workflow input/output types
type WorkflowInput = { input_as_text: string };

interface ChatKitConfig {
  workflowId: string;
  version: string;
  domainKey?: string;
  allowedOrigin: string;
  apiBaseUrl: string;
}

function resolveChatKitConfig(): ChatKitConfig {
  const workflowId =
    process.env.CHATKIT_WORKFLOW_ID ??
    process.env.VITE_CHATKIT_WORKFLOW_ID ??
    '';

  if (!workflowId) {
    throw new Error(
      'ChatKit workflow ID not configured. Please set CHATKIT_WORKFLOW_ID in your environment variables.'
    );
  }

  const version =
    process.env.CHATKIT_WORKFLOW_VERSION ??
    process.env.VITE_CHATKIT_WORKFLOW_VERSION ??
    '2';

  const domainKey =
    process.env.CHATKIT_DOMAIN_KEY ??
    process.env.VITE_CHATKIT_DOMAIN_KEY ??
    '';

  const allowedOrigin =
    process.env.CHATKIT_ALLOWED_ORIGIN ??
    process.env.VITE_APP_URL ??
    DEFAULT_ALLOWED_ORIGIN;

  // Fix: Handle empty strings and ensure we always have a valid base URL
  // If CHATKIT_API_BASE_URL is empty or undefined, use the default OpenAI API URL
  const apiBaseUrlRaw = process.env.CHATKIT_API_BASE_URL?.trim() || 'https://api.openai.com';
  const apiBaseUrl = apiBaseUrlRaw.replace(/\/+$/, '');

  return {
    workflowId,
    version,
    domainKey: domainKey || undefined,
    allowedOrigin,
    apiBaseUrl,
  };
}

// CORS headers helper - Security: Only allow specific origins
function setCORSHeaders(res: VercelResponse, origin?: string, allowedOrigin: string = DEFAULT_ALLOWED_ORIGIN) {
  // Security: Only allow requests from the configured origin or localhost in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Support both www and non-www versions
  const normalizedAllowedOrigin = allowedOrigin.replace(/^https?:\/\/(www\.)?/, 'https://');
  const normalizedOrigin = origin?.replace(/^https?:\/\/(www\.)?/, 'https://');
  
  const isAllowedOrigin = normalizedOrigin === normalizedAllowedOrigin || 
                          origin === allowedOrigin ||
                          (isDevelopment && origin && (origin.includes('localhost') || origin.includes('127.0.0.1')));
  
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Vary', 'Origin'); // Security: Prevent cache poisoning
  } else if (!origin) {
    // Same-origin requests (no Origin header)
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } else {
    // Log CORS rejection for debugging
    if (isDevelopment) {
      console.warn('[CORS] Request rejected:', {
        origin,
        allowedOrigin,
        normalizedOrigin,
        normalizedAllowedOrigin
      });
    }
  }
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigin = process.env.CHATKIT_ALLOWED_ORIGIN ?? DEFAULT_ALLOWED_ORIGIN;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin, allowedOrigin);
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin, allowedOrigin);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  setCORSHeaders(res, req.headers.origin, allowedOrigin);

  try {
    const chatKitConfig = resolveChatKitConfig();

    // Security: Validate API key (prefer server-side env var, never use client-side in production)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
      console.error('[Security] OpenAI API key not configured or invalid');
      console.error('[ChatKit] Environment check:', {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasWorkflowId: !!process.env.CHATKIT_WORKFLOW_ID,
        hasVersion: !!process.env.CHATKIT_WORKFLOW_VERSION,
        workflowId: process.env.CHATKIT_WORKFLOW_ID?.substring(0, 8) + '...' || 'MISSING'
      });
      return res.status(500).json({
        error: 'Service unavailable',
        message: 'API service is not configured. Please set OPENAI_API_KEY in Vercel environment variables.'
      });
    }

    // Security: API key format validation (supports both 'sk-' and 'sk-proj-' formats)
    const isValidKeyFormat = apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-');
    if (!isValidKeyFormat || apiKey.length < 20) {
      console.error('[Security] Invalid API key format detected');
      return res.status(500).json({
        error: 'Service unavailable',
        message: 'API service configuration error'
      });
    }

    // Parse and validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be a valid JSON object'
      });
    }

    const { message } = req.body;

    // Security: Input validation and sanitization
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a string'
      });
    }

    // Security: Length validation to prevent abuse
    const trimmedMessage = message.trim();
    if (trimmedMessage === '') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message cannot be empty'
      });
    }

    // Security: Maximum message length to prevent DoS
    const MAX_MESSAGE_LENGTH = 10000;
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: 'Invalid request',
        message: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
      });
    }

    const workflowResult = await executeWorkflow(
      apiKey,
      {
        input_as_text: trimmedMessage
      },
      chatKitConfig
    );

    // Extract response from workflow result
    let aiResponse = '';
    let mode: Mode = 'chat';
    let lang: Language = 'en';

    // Handle different response formats from the workflow
    if (typeof workflowResult === 'string') {
      aiResponse = workflowResult;
    } else if (workflowResult && typeof workflowResult === 'object') {
      const resultObj = workflowResult as any;
      // Check for safe_text (from guardrails) or output_text or text
      aiResponse = resultObj.safe_text || 
                   resultObj.output_text || 
                   resultObj.text || 
                   resultObj.response ||
                   (resultObj.output && (typeof resultObj.output === 'string' ? resultObj.output : JSON.stringify(resultObj.output))) ||
                   JSON.stringify(workflowResult);
      
      // Extract mode and lang if available
      if (resultObj.mode) mode = resultObj.mode;
      if (resultObj.lang) lang = resultObj.lang;
    } else {
      aiResponse = String(workflowResult || '');
    }

    // If we don't have mode/lang from workflow, classify them as fallback
    if (mode === 'chat' && lang === 'en' && !aiResponse.includes('✦')) {
      // Only classify if response doesn't look like it came from the workflow
      try {
        lang = await classifyLanguage(trimmedMessage, apiKey);
        mode = await classifyMode(trimmedMessage, lang, apiKey);
      } catch (classifyError) {
        console.error('Classification error:', classifyError);
        // Keep defaults
      }
    }

    // Return response in the expected format
    return res.status(200).json({
      text: aiResponse,
      mode: mode,
      lang: lang
    });

  } catch (error: any) {
    console.error('Bible Aura Chat API Error:', error);
    
    // Enhanced error handling
    let errorMessage = error?.message || 'Failed to process chat message';
    
    // Check for specific error types
    if (errorMessage.toLowerCase().includes('version')) {
      const chatKitConfig = resolveChatKitConfig();
      const versionNumber = parseInt(chatKitConfig.version, 10) || 1;
      errorMessage = `Workflow version ${versionNumber} error: ${errorMessage}. Please verify that version ${versionNumber} exists for your workflow, or try using version 1.`;
    } else if (errorMessage.toLowerCase().includes('workflow')) {
      errorMessage = 'Workflow execution failed. Please try again or contact support.';
    } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      errorMessage = 'API authentication failed. Please check your API key configuration.';
    } else if (errorMessage.includes('ChatKit workflow ID')) {
      errorMessage = 'Server configuration missing ChatKit workflow details. Please update environment variables.';
    }
    
    // Security: Don't leak sensitive error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return res.status(500).json({
      error: 'Internal server error',
      message: errorMessage,
      ...(isDevelopment && { details: error.stack })
    });
  }
}

async function executeWorkflow(apiKey: string, workflowInput: WorkflowInput, config: ChatKitConfig) {
  // Convert version to number if it's a string, default to 2 if invalid
  const versionNumber = parseInt(config.version, 10) || 2;
  
  // OpenAI Workflows API format: /v1/workflows/{workflow_id}/runs
  // Version can be specified as query parameter: ?version={version}
  const baseEndpoint = `${config.apiBaseUrl}/v1/workflows/${config.workflowId}/runs`;
  const workflowEndpoint = versionNumber > 1 
    ? `${baseEndpoint}?version=${versionNumber}` 
    : baseEndpoint;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'workflows=1'
  };

  if (config.domainKey) {
    headers['OpenAI-Organization'] = config.domainKey;
  }
  
  // Log version being used for debugging (without exposing full workflow ID)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[ChatKit] Executing workflow ${config.workflowId.substring(0, 8)}... with version ${versionNumber}`);
    console.log(`[ChatKit] Request URL: ${workflowEndpoint}`);
  }

  // Build request body - OpenAI Workflows API only accepts 'input' in the body
  // workflow_id is in the URL path, version is in query parameter
  const requestBody = {
    input: workflowInput
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`[ChatKit] Request body:`, JSON.stringify(requestBody, null, 2));
  }

  const initialResponse = await fetch(workflowEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });

  if (!initialResponse.ok) {
    const errorData = await initialResponse.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || `Workflow API error: ${initialResponse.status}`;
    
    // Enhanced error logging for debugging
    console.error(`[ChatKit] Workflow execution failed:`, {
      status: initialResponse.status,
      statusText: initialResponse.statusText,
      error: errorMessage,
      errorData: process.env.NODE_ENV === 'development' ? errorData : undefined,
      workflowId: process.env.NODE_ENV === 'development' ? config.workflowId : config.workflowId.substring(0, 8) + '...',
      version: versionNumber,
      endpoint: process.env.NODE_ENV === 'development' ? workflowEndpoint : 'hidden'
    });
    
    // Provide more specific error messages for version-related issues
    if (errorMessage.toLowerCase().includes('version') || errorMessage.toLowerCase().includes('not found')) {
      throw new Error(
        `Workflow version ${versionNumber} error: ${errorMessage}. ` +
        `Please verify that version ${versionNumber} exists for workflow ${config.workflowId}. ` +
        `You may need to check your workflow configuration or use version 1.`
      );
    }
    
    throw new Error(errorMessage);
  }

  const initialData = await initialResponse.json();

  if (!initialData.run_id) {
    return initialData.output || initialData;
  }

  let attempts = 0;
  const maxAttempts = 60; // 30 seconds max (500ms * 60)
  let currentRun = initialData;

  while ((currentRun.status === 'queued' || currentRun.status === 'in_progress') && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Poll endpoint uses base endpoint without version query parameter
    const pollEndpoint = `${baseEndpoint}/${currentRun.run_id}`;
    const pollResponse = await fetch(pollEndpoint, {
      method: 'GET',
      headers
    });

    if (!pollResponse.ok) {
      const errorData = await pollResponse.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `Workflow poll error: ${pollResponse.status}`;
      throw new Error(errorMessage);
    }

    currentRun = await pollResponse.json();
    attempts++;
  }

  if (currentRun.status === 'completed' && currentRun.output) {
    return currentRun.output;
  }

  if (currentRun.status === 'failed') {
    throw new Error(currentRun.error || 'Workflow execution failed');
  }

  throw new Error('Workflow execution timed out');
}

// Helper function to classify language using OpenAI API (fallback)
async function classifyLanguage(text: string, apiKey: string): Promise<Language> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are the Bible Aura language detector. Identify whether the user\'s message is written in English or Tamil. Respond ONLY with JSON: {"lang": "en"} or {"lang": "ta"}'
          },
          {
            role: 'user',
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return 'en'; // Default to English if classification fails
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"lang":"en"}');
    return result.lang === 'ta' ? 'ta' : 'en';
  } catch (error) {
    console.error('Language classification error:', error);
    return 'en'; // Default to English
  }
}

// Helper function to classify mode using OpenAI API (fallback)
async function classifyMode(text: string, language: Language, apiKey: string): Promise<Mode> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the Bible Aura mode classification agent. The user's query is provided below. Determine which mode best fits the user's intent:
- "chat" for simple discussion or guidance
- "verse" for verse analysis or explanation
- "parable" for Jesus' parables
- "character" for people studies
- "topical" for broad subjects (e.g., love, faith)
- "qa" for short factual Q&A
Respond ONLY with JSON: {"mode": "chat"}`
          },
          {
            role: 'user',
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return 'chat'; // Default to chat if classification fails
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"mode":"chat"}');
    const validModes: Mode[] = ['chat', 'verse', 'parable', 'character', 'topical', 'qa'];
    return validModes.includes(result.mode) ? result.mode : 'chat';
  } catch (error) {
    console.error('Mode classification error:', error);
    return 'chat'; // Default to chat
  }
}
