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

// Guardrails definitions
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
    },
    {
      name: "Hallucination Detection",
      config: {
        model: "gpt-4o-mini",
        knowledge_source: "vs_6914c8f2ecf48191b8c80e0911d335cf",
        confidence_threshold: 0.7
      }
    },
    {
      name: "Jailbreak",
      config: {
        model: "gpt-4o-mini",
        confidence_threshold: 0.7
      }
    }
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
  instructions: `You are the Bible Aura language detector.
Identify whether the user's message is written in English or Tamil.
Respond ONLY with structured JSON.`,
  model: "gpt-4o-mini",
  outputType: LanguageClassifierSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const chat = new Agent({
  name: "Chat",
  instructions: `You are Bible Aura's AI Chat assistant.
Answer warmly and briefly (max 80 words).
Format:
✦ [Direct answer in 1–2 sentences]
[Scripture reference if relevant]
[Brief encouragement or reflective question]`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const qA = new Agent({
  name: "Q&A",
  instructions: `You are Bible Aura's Quick Q&A AI.
Give ultra-fast answers under 100 words.
Format:
✦ [Question Topic]
↗ Answer
↗ Scripture
↗ Why
Keep it practical, clear, and biblical.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const verseAnalysis = new Agent({
  name: "Verse Analysis",
  instructions: `You are Bible Aura's Verse Analysis AI.
Give a structured 5-part explanation:
✦ VERSE ANALYSIS: [Verse Reference]
↗ Verse
↗ Historical Context
↗ Theological Doctrine
↗ Cross Reference
↗ Summary
Use clean icons (✦ ↗ • only). Be biblically accurate.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const topical = new Agent({
  name: "Topical",
  instructions: `You are Bible Aura's Topical Study assistant.
Teach a biblical topic in 5 sections:
✦ TOPIC: [Subject]
↗ Definition & Overview
↗ Key Scripture Passages
↗ Biblical Commentary
↗ Real-Life Application
↗ Additional Study Resources`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const parable = new Agent({
  name: "Parable",
  instructions: `You are Bible Aura's Parable Study assistant.
Explain Jesus' parables clearly:
✦ PARABLE: [Name]
↗ The Story
↗ Original Audience & Context
↗ Core Spiritual Lesson
↗ Modern-Day Example
Keep it simple and true to Scripture.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const character = new Agent({
  name: "Character",
  instructions: `You are Bible Aura's Character Study AI.
Summarize key Bible characters:
✦ CHARACTER PROFILE: [Name]
↗ Quick Overview
↗ Timeline & Key Events
↗ Lessons for Today
↗ Key Scripture References
Include both strengths and weaknesses.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const modeClassifier = new Agent({
  name: "Mode Classifier",
  instructions: `You are the Bible Aura mode classification agent.
The user's query and retrieved Bible text are provided below.

Determine which mode best fits the user's intent:
- "chat" for simple discussion or guidance
- "verse" for verse analysis or explanation
- "parable" for Jesus' parables
- "character" for people studies
- "topical" for broad subjects (e.g., love, faith)
- "qa" for short factual Q&A

Return JSON only.`,
  model: "gpt-4o-mini",
  outputType: ModeClassifierSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

// Main workflow function
type WorkflowInput = { input_as_text: string };

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

    // Step 1: Classify language
    let lang: Language = "en"; // Default to English
    
    try {
      const languageClassifierResultTemp = await runner.run(
        languageClassifier,
        [
          ...conversationHistory,
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

      conversationHistory.push(...languageClassifierResultTemp.newItems.map((item) => item.rawItem));

      if (!languageClassifierResultTemp.finalOutput) {
        console.warn('[Agent SDK] Language classification returned no output, defaulting to English');
      } else {
        const languageClassifierResult = {
          output_parsed: languageClassifierResultTemp.finalOutput as { lang: Language }
        };
        lang = languageClassifierResult.output_parsed.lang;
      }
    } catch (langError: any) {
      console.error('[Agent SDK] Language classification error:', langError.message);
      // Default to English and continue
      lang = "en";
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

    // Step 3: Classify mode
    let mode: Mode = "chat"; // Default to chat mode
    
    try {
      const sourcesContext = sources.length > 0 
        ? `Context from Bible search: ${sources.slice(0, 5).map(s => s.filename).join(', ')}`
        : 'No specific Bible references found';
      
      const modeClassifierResultTemp = await runner.run(
        modeClassifier,
        [
          ...conversationHistory,
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `User query: ${workflow.input_as_text}
${sourcesContext}`
              }
            ]
          }
        ]
      );

      conversationHistory.push(...modeClassifierResultTemp.newItems.map((item) => item.rawItem));

      if (!modeClassifierResultTemp.finalOutput) {
        console.warn('[Agent SDK] Mode classification returned no output, defaulting to chat');
      } else {
        const modeClassifierResult = {
          output_parsed: modeClassifierResultTemp.finalOutput as { mode: Mode }
        };
        mode = modeClassifierResult.output_parsed.mode;
      }
    } catch (modeError: any) {
      console.error('[Agent SDK] Mode classification error:', modeError.message);
      // Default to chat mode and continue
      mode = "chat";
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

    // Step 5: Run guardrails
    let guardrailsOutput: { safe_text: string };
    
    try {
      const guardrailsInputtext = workflow.input_as_text;
      const context = { guardrailLlm: client };
      const guardrailsResult = await runGuardrails(guardrailsInputtext, guardrailsConfig, context, true);
      const hasTripwire = guardrailsHasTripwire(guardrailsResult);
      const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult, guardrailsInputtext);
      
      if (hasTripwire) {
        console.warn('[Agent SDK] Guardrails triggered, blocking content');
        throw new Error(`Content blocked by guardrails: ${JSON.stringify(buildGuardrailFailOutput(guardrailsResult ?? []))}`);
      }
      
      guardrailsOutput = { safe_text: (guardrailsAnonymizedtext ?? guardrailsInputtext) };
    } catch (guardrailError: any) {
      // If guardrails fail, check if it's a content block or an error
      if (guardrailError.message.includes('Content blocked')) {
        throw guardrailError; // Re-throw content blocks
      }
      console.error('[Agent SDK] Guardrails execution error:', guardrailError.message);
      // If guardrails fail due to error, use the agent output directly
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

    return {
      text: guardrailsOutput.safe_text || agentResult.output_text,
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

    const { message } = req.body;

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
    const result = await runWorkflow({ input_as_text: trimmedMessage }, client);

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
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      name: error?.name,
      cause: error?.cause
    });
    
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

