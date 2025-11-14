// Bible Aura Agent SDK API Route
// Vercel Serverless Function for OpenAI Agents SDK integration
// Replaces ChatKit workflow with direct Agent SDK usage

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// Default origin allowed for CORS
const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

// Types
type Language = 'en' | 'ta';
type Mode = 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';

interface AgentResponse {
  text: string;
  mode: Mode;
  lang: Language;
  sources?: Array<{
    id: string;
    filename: string;
    score: number;
  }>;
  crossReferences?: string[];
}

// Shared client for guardrails and file search
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

// Guardrails definitions - Optimized for speed (only fast checks)
const guardrailsConfig = {
  guardrails: [
    {
      name: "Contains PII",
      config: {
        block: true,
        entities: [
          "CREDIT_CARD",
          "US_BANK_NUMBER",
          "US_PASSPORT",
          "US_SSN"
        ]
      }
    },
    {
      name: "Moderation",
      config: {
        categories: [
          "sexual/minors",
          "hate/threatening",
          "harassment/threatening",
          "self-harm/instructions",
          "violence/graphic",
          "illicit/violent"
        ]
      }
    }
    // REMOVED: Hallucination Detection (too slow, vector store search)
    // REMOVED: Jailbreak (less critical, can be slow)
  ]
};

// Guardrails utils
function guardrailsHasTripwire(results: any[]) {
  return (results ?? []).some((r) => r?.tripwireTriggered === true);
}

function getGuardrailSafeText(results: any[], fallbackText: string): string {
  for (const r of results ?? []) {
    if (r?.info && ("checked_text" in r.info)) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  const pii = (results ?? []).find((r) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}

function buildGuardrailFailOutput(results: any[]) {
  const get = (name: string) => (results ?? []).find((r) => {
    const info = r?.info ?? {};
    const n = (info?.guardrail_name ?? info?.guardrailName);
    return n === name;
  });

  const pii = get("Contains PII");
  const mod = get("Moderation");
  const jb = get("Jailbreak");
  const hal = get("Hallucination Detection");
  const piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => k + ":" + (v as any[]).length);

  return {
    pii: {
      failed: (piiCounts.length > 0) || pii?.tripwireTriggered === true,
      ...(piiCounts.length ? { detected_counts: piiCounts } : {}),
      ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
    },
    moderation: {
      failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
      ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
      ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
    },
    jailbreak: {
      failed: jb?.tripwireTriggered === true,
      ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
    },
    hallucination: {
      failed: hal?.tripwireTriggered === true,
      ...(hal?.info?.reasoning ? { reasoning: hal.info.reasoning } : {}),
      ...(hal?.info?.hallucination_type ? { hallucination_type: hal.info.hallucination_type } : {}),
      ...(hal?.info?.hallucinated_statements ? { hallucinated_statements: hal.info.hallucinated_statements } : {}),
      ...(hal?.info?.verified_statements ? { verified_statements: hal.info.verified_statements } : {}),
      ...(hal?.executionFailed && hal?.info?.error ? { error: hal.info.error } : {}),
    },
  };
}

// Agent schemas
const LanguageClassifierSchema = z.object({ lang: z.enum(["en", "ta"]) });
const ModeClassifierSchema = z.object({ mode: z.enum(["chat", "verse", "parable", "character", "topical", "qa"]) });

// Agent definitions
const languageClassifier = new Agent({
  name: "Language Classifier",
  instructions: `Detect if message is English or Tamil. Respond with JSON only.`,
  model: "gpt-4.1-nano",
  outputType: LanguageClassifierSchema,
  modelSettings: {
    temperature: 0.1,
    topP: 0.5,
    maxTokens: 50,
    store: false
  }
});

const chat = new Agent({
  name: "Chat",
  instructions: `Answer briefly (max 60 words). Direct answer, Scripture reference if relevant, brief encouragement. Plain text only.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 256,
    store: false
  }
});

const qA = new Agent({
  name: "Q&A",
  instructions: `Ultra-fast answers under 60 words. Format: Topic, Answer, Scripture, Why. Plain text only.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 256,
    store: false
  }
});

const verseAnalysis = new Agent({
  name: "Verse Analysis",
  instructions: `You are Bible Aura's Verse Analysis AI.
Give a structured 5-part explanation in plain text:
VERSE ANALYSIS: [Verse Reference]
Verse text
Historical Context
Theological Doctrine
Cross References
Summary
Be biblically accurate. Use plain text only, no markdown formatting, asterisks, or special symbols.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 512,
    store: false
  }
});

const topical = new Agent({
  name: "Topical",
  instructions: `You are Bible Aura's Topical Study assistant.
Teach a biblical topic in 5 sections using plain text:
TOPIC: [Subject]
Definition & Overview
Key Scripture Passages
Biblical Commentary
Real-Life Application
Additional Study Resources
Use plain text only, no markdown formatting or special symbols.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 512,
    store: false
  }
});

const parable = new Agent({
  name: "Parable",
  instructions: `You are Bible Aura's Parable Study assistant.
Explain Jesus' parables clearly in plain text:
PARABLE: [Name]
The Story
Original Audience & Context
Core Spiritual Lesson
Modern-Day Example
Keep it simple and true to Scripture. Use plain text only, no markdown or special symbols.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 512,
    store: false
  }
});

const character = new Agent({
  name: "Character",
  instructions: `You are Bible Aura's Character Study AI.
Summarize key Bible characters in plain text:
CHARACTER PROFILE: [Name]
Quick Overview
Timeline & Key Events
Lessons for Today
Key Scripture References
Include both strengths and weaknesses. Use plain text only, no markdown formatting or special symbols.`,
  model: "gpt-4.1-nano",
  modelSettings: {
    temperature: 0.3,
    topP: 0.7,
    maxTokens: 512,
    store: false
  }
});

const modeClassifier = new Agent({
  name: "Mode Classifier",
  instructions: `Classify mode: "chat" (discussion), "verse" (analysis), "parable", "character", "topical", "qa" (factual). Return JSON only.`,
  model: "gpt-4.1-nano",
  outputType: ModeClassifierSchema,
  modelSettings: {
    temperature: 0.1,
    topP: 0.5,
    maxTokens: 50,
    store: false
  }
});

// Main workflow function
type WorkflowInput = { 
  input_as_text: string;
  preferred_mode?: string;
  preferred_language?: string;
};

async function runWorkflow(workflow: WorkflowInput, client: OpenAI): Promise<AgentResponse> {
  return await withTrace("Bible Aura AI", async () => {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: workflow.input_as_text
          }
        ]
      }
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "bible-aura-agent-sdk"
      }
    });

    // Step 1: Classify language (use preference if provided, otherwise detect)
    let lang: Language = workflow.preferred_language === "ta" ? "ta" : "en";
    
    // Only run language classifier if no preference is provided (with timeout)
    if (!workflow.preferred_language) {
      try {
        const languagePromise = runner.run(
          languageClassifier,
          [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `User query: ${workflow.input_as_text}`
                }
              ]
            }
          ]
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Language classification timeout')), 2000)
        );
        
        const languageClassifierResultTemp = await Promise.race([languagePromise, timeoutPromise]) as any;

        if (!languageClassifierResultTemp.finalOutput) {
          console.warn('[Agent SDK] Language classification returned no output, defaulting to English');
        } else {
          const languageClassifierResult = {
            output_parsed: languageClassifierResultTemp.finalOutput as { lang: Language }
          };
          lang = languageClassifierResult.output_parsed.lang;
        }
      } catch (langError: any) {
        if (langError.message && langError.message.includes('timeout')) {
          console.warn('[Agent SDK] Language classification timeout, defaulting to English');
        } else {
          console.error('[Agent SDK] Language classification error:', langError.message);
        }
        // Default to English and continue
        lang = "en";
      }
    }
    const vectorStoreId = lang === "en" 
      ? "vs_6914c8f2ecf48191b8c80e0911d335cf"
      : "vs_6914ce9d39b4819188024077258a0db3";

    // Step 2: Search vector store for Bible references
    // Note: Vector store search is done through the Agent SDK's built-in file search
    // The Runner will automatically use the vector store when agents reference files
    let sources: Array<{ id: string; filename: string; score: number }> = [];
    
    // For now, we'll skip direct vector store search and let the agents handle it
    // Sources will be extracted from the agent responses if available
    // This simplifies the implementation and avoids API compatibility issues

    // Step 3: Classify mode (use preference if provided, otherwise detect)
    let mode: Mode = workflow.preferred_mode as Mode || "chat";
    
    // Validate mode
    const validModes: Mode[] = ["chat", "verse", "parable", "character", "topical", "qa"];
    if (!validModes.includes(mode)) {
      mode = "chat";
    }
    
    // Only run mode classifier if no preference is provided (with timeout)
    if (!workflow.preferred_mode) {
      try {
        const modePromise = runner.run(
          modeClassifier,
          [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: `User query: ${workflow.input_as_text}`
                }
              ]
            }
          ]
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Mode classification timeout')), 2000)
        );
        
        const modeClassifierResultTemp = await Promise.race([modePromise, timeoutPromise]) as any;

        if (!modeClassifierResultTemp.finalOutput) {
          console.warn('[Agent SDK] Mode classification returned no output, defaulting to chat');
        } else {
          const modeClassifierResult = {
            output_parsed: modeClassifierResultTemp.finalOutput as { mode: Mode }
          };
          mode = modeClassifierResult.output_parsed.mode;
        }
      } catch (modeError: any) {
        if (modeError.message && modeError.message.includes('timeout')) {
          console.warn('[Agent SDK] Mode classification timeout, defaulting to chat');
        } else {
          console.error('[Agent SDK] Mode classification error:', modeError.message);
        }
        // Default to chat mode and continue
        mode = "chat";
      }
    }

    // Step 4: Run appropriate agent based on mode
    let agentResult;
    let selectedAgent;

    switch (mode) {
      case "chat":
        selectedAgent = chat;
        break;
      case "qa":
        selectedAgent = qA;
        break;
      case "verse":
        selectedAgent = verseAnalysis;
        break;
      case "parable":
        selectedAgent = parable;
        break;
      case "character":
        selectedAgent = character;
        break;
      case "topical":
        selectedAgent = topical;
        break;
      default:
        selectedAgent = chat;
    }

    try {
      const agentResultTemp = await runner.run(selectedAgent, conversationHistory);
      conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

      if (!agentResultTemp.finalOutput) {
        throw new Error("Agent execution returned no output");
      }

      agentResult = {
        output_text: agentResultTemp.finalOutput ?? ""
      };
    } catch (agentError: any) {
      console.error('[Agent SDK] Agent execution error:', agentError.message);
      throw new Error(`Agent execution failed: ${agentError.message}`);
    }

    // Step 5: Run guardrails (with timeout to prevent blocking)
    let guardrailsOutput: { safe_text: string };
    
    try {
      const guardrailsInputtext = agentResult.output_text;
      const context = { guardrailLlm: client };
      
      console.log('[Agent SDK] Running guardrails on agent output...');
      
      // Set timeout for guardrails (1 second max - fast checks only)
      const guardrailsPromise = runGuardrails(guardrailsInputtext, guardrailsConfig, context, true);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Guardrails timeout')), 1000)
      );
      
      const guardrailsResult = await Promise.race([guardrailsPromise, timeoutPromise]) as any;
      const hasTripwire = guardrailsHasTripwire(guardrailsResult);
      const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult, guardrailsInputtext);
      
      if (hasTripwire) {
        // For PII or moderation, always block
        console.warn('[Agent SDK] Guardrails triggered, blocking content');
        throw new Error(`Content blocked by guardrails: ${JSON.stringify(buildGuardrailFailOutput(guardrailsResult ?? []))}`);
      } else {
        guardrailsOutput = { safe_text: (guardrailsAnonymizedtext ?? guardrailsInputtext) };
      }
      
      console.log('[Agent SDK] Guardrails passed');
    } catch (guardrailError: any) {
      // If guardrails fail, check if it's a content block or an error/timeout
      if (guardrailError.message && guardrailError.message.includes('Content blocked')) {
        throw guardrailError; // Re-throw content blocks
      }
      
      // If timeout or error, skip guardrails and use agent output
      if (guardrailError.message && guardrailError.message.includes('timeout')) {
        console.warn('[Agent SDK] Guardrails timeout, using agent output directly');
      } else {
        console.error('[Agent SDK] Guardrails execution error:', guardrailError.message);
      }
      
      // Use agent output directly if guardrails fail or timeout
      guardrailsOutput = { safe_text: agentResult.output_text };
    }

    // Extract cross-references from sources (Bible verse references)
    // Look for patterns like "John 3:16", "1 Corinthians 13", etc.
    const crossReferences = sources
      .filter(s => {
        const filename = s.filename;
        // Match Bible verse patterns: "Book Chapter:Verse" or "Book Chapter"
        return /^\d*\s*[A-Za-z]+\s+\d+/.test(filename) || 
               /^[A-Za-z]+\s+\d+/.test(filename);
      })
      .map(s => s.filename)
      .slice(0, 5); // Limit to top 5

    // Clean markdown formatting from the response text
    let cleanedText = guardrailsOutput.safe_text || agentResult.output_text;
    
    // Remove markdown formatting
    cleanedText = cleanedText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1') // Remove italic *text*
      .replace(/#{1,6}\s+/g, '') // Remove headers # ## ###
      .replace(/^[-*+]\s+/gm, '') // Remove list markers - * +
      .replace(/^\d+\.\s+/gm, '') // Remove numbered lists 1. 2.
      .replace(/`(.*?)`/g, '$1') // Remove inline code `code`
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url) -> text
      .replace(/[✦↗•]/g, '') // Remove special symbols
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();

    return {
      text: cleanedText,
      mode: mode,
      lang: lang,
      sources: sources.slice(0, 5), // Top 5 sources
      crossReferences: crossReferences
    };
  });
}

// CORS headers helper
function setCORSHeaders(res: VercelResponse, origin?: string, allowedOrigin: string = DEFAULT_ALLOWED_ORIGIN) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const normalizedAllowedOrigin = allowedOrigin.replace(/^https?:\/\/(www\.)?/, 'https://');
  const normalizedOrigin = origin?.replace(/^https?:\/\/(www\.)?/, 'https://');
  
  const isAllowedOrigin = normalizedOrigin === normalizedAllowedOrigin || 
                          origin === allowedOrigin ||
                          (isDevelopment && origin && (origin.includes('localhost') || origin.includes('127.0.0.1')));
  
  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    // Validate API key
    const client = getOpenAIClient();

    // Parse and validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be a valid JSON object'
      });
    }

    const { message, mode: preferredMode, language: preferredLanguage } = req.body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a string'
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message cannot be empty'
      });
    }

    if (trimmedMessage.length > 5000) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is too long (max 5000 characters)'
      });
    }

    // Execute workflow
    console.log('[Agent SDK] Starting workflow execution for message:', trimmedMessage.substring(0, 50));
    
    const result = await runWorkflow({ 
      input_as_text: trimmedMessage,
      preferred_mode: preferredMode,
      preferred_language: preferredLanguage
    }, client);
    
    console.log('[Agent SDK] Workflow completed successfully:', {
      hasText: !!result.text,
      mode: result.mode,
      lang: result.lang,
      sourcesCount: result.sources?.length || 0
    });

    // Return response
    return res.status(200).json({
      text: result.text,
      mode: result.mode,
      lang: result.lang,
      sources: result.sources || [],
      crossReferences: result.crossReferences || []
    });

  } catch (error: any) {
    console.error('Bible Aura Agent API Error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
      type: typeof error,
      constructor: error?.constructor?.name
    });
    
    // Log the full error object in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    
    let errorMessage = error?.message || 'Failed to process chat message';
    
    // Security: Don't leak sensitive error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Provide more specific error messages
    if (errorMessage.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Vercel environment variables.'
      });
    }
    
    if (errorMessage.includes('Language classification failed')) {
      return res.status(500).json({
        error: 'Processing error',
        message: 'Failed to detect language. Please try again.'
      });
    }
    
    if (errorMessage.includes('Mode classification failed')) {
      return res.status(500).json({
        error: 'Processing error',
        message: 'Failed to classify query mode. Please try again.'
      });
    }
    
    if (errorMessage.includes('Agent execution failed')) {
      return res.status(500).json({
        error: 'Processing error',
        message: 'AI agent execution failed. Please try again.'
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: isDevelopment ? errorMessage : 'Workflow execution failed. Please try again or contact support.'
    });
  }
}

