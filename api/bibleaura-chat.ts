// Bible Aura ChatKit Workflow API Route
// Vercel Serverless Function for OpenAI ChatKit workflow integration
// This route handles POST requests to /api/bibleaura-chat
// Uses OpenAI Agents SDK to call the workflow

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';
import { Runner, withTrace, AgentInputItem } from '@openai/agents';

// Workflow configuration constants
const WORKFLOW_ID = 'wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0';
const WORKFLOW_VERSION = '1';
const DOMAIN_KEY = 'pk_69156df484148193bde4d23dd08c12fc0d90a851713b0413';
const ALLOWED_ORIGIN = 'https://bibleaura.xyz';

// Types for language and mode classification
type Language = 'en' | 'ta';
type Mode = 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';

// Workflow input/output types
type WorkflowInput = { input_as_text: string };

// CORS headers helper
function setCORSHeaders(res: VercelResponse, origin?: string) {
  // Allow requests from the Bible Aura domain and localhost for development
  const isAllowedOrigin = origin === ALLOWED_ORIGIN || 
                          origin?.includes('bibleaura.xyz') || 
                          origin?.includes('localhost') ||
                          origin?.includes('127.0.0.1') ||
                          !origin;
  
  if (isAllowedOrigin) {
    // Use the origin if it's localhost, otherwise use the allowed origin
    const corsOrigin = origin?.includes('localhost') || origin?.includes('127.0.0.1') 
      ? origin 
      : ALLOWED_ORIGIN;
    
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  setCORSHeaders(res, req.headers.origin);

  try {
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in your environment variables'
      });
    }

    // Parse request body
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Prepare workflow input
    const workflowInput: WorkflowInput = {
      input_as_text: message.trim()
    };

    // Call the workflow using OpenAI Workflows API
    // The workflow is executed via HTTP API since the SDK doesn't have workflows support yet
    const workflowResult = await withTrace('Bible Aura AI', async () => {
      // Execute workflow via HTTP API
      const workflowResponse = await fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'workflows=1'
        },
        body: JSON.stringify({
          input: workflowInput
        })
      });

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Workflow API error: ${workflowResponse.status}`);
      }

      const workflowData = await workflowResponse.json();
      
      // If the response has a run_id, poll for completion
      if (workflowData.run_id) {
        let run = workflowData;
        let attempts = 0;
        const maxAttempts = 60; // 30 seconds max (500ms * 60)

        while ((run.status === 'queued' || run.status === 'in_progress') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const runResponse = await fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs/${run.run_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'OpenAI-Beta': 'workflows=1'
            }
          });

          if (runResponse.ok) {
            run = await runResponse.json();
          } else {
            break; // Stop polling if we can't retrieve the run
          }
          attempts++;
        }

        if (run.status === 'completed' && run.output) {
          return run.output;
        } else if (run.status === 'failed') {
          throw new Error(run.error || 'Workflow execution failed');
        } else if (run.status === 'queued' || run.status === 'in_progress') {
          throw new Error('Workflow execution timed out');
        }

        return run.output || run;
      }

      // If no run_id, return the response directly
      return workflowData.output || workflowData;
    });

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
        lang = await classifyLanguage(message.trim(), apiKey);
        mode = await classifyMode(message.trim(), lang, apiKey);
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
    if (errorMessage.includes('workflow') || errorMessage.includes('Workflow')) {
      errorMessage = 'Workflow execution failed. Please try again or contact support.';
    } else if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      errorMessage = 'API authentication failed. Please check your API key configuration.';
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
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
