// Bible Aura AI - Ultra-Fast 3-Node RAG System
// Node 1: RAG Retriever → Node 2: Meta-Agent → Node 3: Guardrails

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { z } from "zod";

// Default origin allowed for CORS
const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

// Vector Store IDs
const ENGLISH_VECTOR_STORE = "vs_6914c8f2ecf48191b8c80e0911d335cf";
const TAMIL_VECTOR_STORE = "vs_6914ce9d39b4819188024077258a0db3";
const MAX_CHUNKS = 5;

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
    url?: string;
    snippet?: string;
  }>;
  crossReferences?: string[];
}

interface RAGResult {
  lang: "en" | "ta";
  context: string;
  query: string;
  sources: Array<{
    id: string;
    filename: string;
    score: number;
  }>;
}

const MetaAgentResponseSchema = z.object({
  lang: z.enum(["en", "ta"]),
  mode: z.enum(["chat", "verse", "qa", "topical", "parable", "character"]),
  response: z.string()
});

// Guardrails configuration
const guardrailsConfig = {
  guardrails: [
    {
      name: "Contains PII",
      config: {
        block: true,
        entities: ["CREDIT_CARD", "US_BANK_NUMBER", "US_PASSPORT", "US_SSN"]
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
  ]
};

// Shared client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

// Node 1: RAG Retriever
function detectLanguage(text: string): "en" | "ta" {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? "ta" : "en";
}

// Web search function using Tavily API (or fallback to simple search)
async function searchWeb(query: string): Promise<Array<{ title: string; url: string; snippet: string }>> {
  try {
    // Try Tavily API if available
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (tavilyApiKey) {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: query,
          search_depth: 'basic',
          max_results: 3
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return (data.results || []).map((r: any) => ({
          title: r.title || 'Web Result',
          url: r.url || '',
          snippet: r.content || r.snippet || ''
        }));
      }
    }
    
    // Fallback: Return empty array if no web search available
    return [];
  } catch (error: any) {
    console.error("[Web Search] Error:", error.message);
    return [];
  }
}

async function retrieveBibleContext(
  userInput: string,
  client: OpenAI,
  preferredLanguage?: "en" | "ta"
): Promise<RAGResult> {
  const lang = preferredLanguage || detectLanguage(userInput);
  const vectorStoreId = lang === "en" ? ENGLISH_VECTOR_STORE : TAMIL_VECTOR_STORE;

  try {
    // Parallel: Vector store search + Web search
    const [vectorSearchResults, webResults] = await Promise.all([
      client.vectorStores.search(vectorStoreId, {
        query: userInput,
        max_num_results: MAX_CHUNKS
      }).catch(() => ({ data: [] })),
      searchWeb(userInput)
    ]);

    // Extract Bible sources
    const bibleSources = vectorSearchResults.data.map((result) => ({
      id: result.file_id,
      filename: result.filename || "Unknown",
      score: result.score || 0
    }));

    // Add web sources
    const webSources = webResults.map((result, idx) => ({
      id: `web-${idx}`,
      filename: result.title || result.url || "Web Result",
      score: 0.8, // Default score for web results
      url: result.url,
      snippet: result.snippet
    }));

    // Combine all sources
    const allSources = [...bibleSources, ...webSources].slice(0, MAX_CHUNKS + 3);

    // Build context: Bible chunks + Web snippets
    const bibleContext = vectorSearchResults.data
      .map((result) => {
        const text = (result as any).text || result.filename || "";
        return text;
      })
      .filter(Boolean)
      .join("\n---\n");

    const webContext = webResults
      .map((result) => `${result.title}\n${result.snippet}`)
      .join("\n---\n");

    const combinedContext = [bibleContext, webContext].filter(Boolean).join("\n\n[Web Sources]\n---\n");

    return {
      lang,
      context: combinedContext || userInput,
      query: userInput,
      sources: allSources
    };
  } catch (error: any) {
    console.error("[RAG Retriever] Error:", error.message);
    return {
      lang,
      context: userInput,
      query: userInput,
      sources: []
    };
  }
}

// Node 2: Meta-Agent
function getMetaAgentPrompt(ragContext: string, userQuery: string): string {
  return `You are the Bible Aura Meta-Agent.

Your responsibilities:
1. Detect language (English/Tamil) - respond in the same language as the user
2. Detect user mode:
   - chat → short conversational answer (max 60 words)
   - verse → verse analysis format (structured explanation)
   - parable → parable explainer format (story, context, lesson)
   - character → character study (overview, timeline, lessons)
   - topical → topic overview (definition, scriptures, application)
   - qa → short Q&A format (max 50 words)
3. Use the Bible context and web sources provided. NEVER hallucinate verses. Only reference verses that exist in the context.
4. Strict formatting rules:
   - Use ✦ for main title (add a blank line before and after each title)
   - Use ↗ for section headings (add a blank line before each heading)
   - Use • for bullet points
   - Always add a blank line between different sections/titles
   - Never use markdown (#, *, **, etc.)
   - Never use code blocks or backticks
   - Format titles with blank lines: \n\n✦ Title\n\n
5. Produce a clean final answer with proper spacing between titles and sections.

Bible Context & Web Sources:
${ragContext}

User Query: ${userQuery}

Return JSON only:
{
  "lang": "en" or "ta",
  "mode": "chat" | "verse" | "qa" | "topical" | "parable" | "character",
  "response": "your formatted answer here with blank lines between titles"
}`;
}

async function runMetaAgent(
  ragResult: RAGResult,
  client: OpenAI
): Promise<z.infer<typeof MetaAgentResponseSchema>> {
  try {
    const prompt = getMetaAgentPrompt(ragResult.context, ragResult.query);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are the Bible Aura Meta-Agent. Always return valid JSON matching the required schema."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      top_p: 0.7,
      max_tokens: 512,
      stream: false
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("Meta-Agent returned empty response");
    }

    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse Meta-Agent JSON response");
      }
    }

    return MetaAgentResponseSchema.parse(parsedResponse);
  } catch (error: any) {
    console.error("[Meta-Agent] Error:", error.message);
    return {
      lang: ragResult.lang,
      mode: "chat",
      response: "I apologize, but I encountered an error processing your request. Please try again."
    };
  }
}

// Node 3: Guardrails
function guardrailsHasTripwire(results: any[]): boolean {
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

async function runGlobalGuardrails(
  text: string,
  client: OpenAI,
  timeoutMs: number = 1000
): Promise<string> {
  const context = { guardrailLlm: client };

  try {
    const guardrailsPromise = runGuardrails(text, guardrailsConfig, context, true);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Guardrails timeout')), timeoutMs)
    );

    const guardrailsResult = await Promise.race([guardrailsPromise, timeoutPromise]) as any;
    const hasTripwire = guardrailsHasTripwire(guardrailsResult);
    const safeText = getGuardrailSafeText(guardrailsResult, text);

    if (hasTripwire) {
      console.warn('[Guardrails] Content blocked');
      throw new Error(`Content blocked by guardrails`);
    }

    return safeText;
  } catch (error: any) {
    if (error.message && error.message.includes('Content blocked')) {
      throw error;
    }
    if (error.message && error.message.includes('timeout')) {
      console.warn('[Guardrails] Timeout, using original text');
    } else {
      console.error('[Guardrails] Error:', error.message);
    }
    return text;
  }
}

// Extract cross-references
function extractCrossReferences(sources: Array<{ filename: string }>): string[] {
  return sources
    .filter(s => {
      const filename = s.filename;
      return /^\d*\s*[A-Za-z]+\s+\d+/.test(filename) ||
             /^[A-Za-z]+\s+\d+/.test(filename);
    })
    .map(s => s.filename)
    .slice(0, 5);
}

/**
 * Ultra-Fast 3-Node RAG Pipeline
 */
async function runFastRAGPipeline(
  userInput: string,
  preferredMode?: string,
  preferredLanguage?: string
): Promise<AgentResponse> {
  const client = getOpenAIClient();

  // Node 1: RAG Retriever
  const ragResult = await retrieveBibleContext(
    userInput,
    client,
    preferredLanguage as "en" | "ta" | undefined
  );

  // Node 2: Meta-Agent
  const metaAgentResult = await runMetaAgent(ragResult, client);

  // Node 3: Global Guardrails
  const safeText = await runGlobalGuardrails(
    metaAgentResult.response,
    client,
    1000
  );

  const crossReferences = extractCrossReferences(ragResult.sources);

  return {
    text: safeText,
    mode: metaAgentResult.mode,
    lang: metaAgentResult.lang,
    sources: ragResult.sources.slice(0, 5),
    crossReferences: crossReferences
  };
}

/**
 * Main API Handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const origin = req.headers.origin || req.headers.referer || '';
  const allowedOrigins = [
    DEFAULT_ALLOWED_ORIGIN,
    DEFAULT_ALLOWED_ORIGIN.replace('www.', ''),
    DEFAULT_ALLOWED_ORIGIN.replace('https://', 'https://www.'),
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const isAllowedOrigin = allowedOrigins.some(allowed => 
    origin.includes(allowed.replace('https://', '').replace('http://', '').replace('www.', ''))
  );

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', isAllowedOrigin ? origin : allowedOrigins[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
      console.error('[Bible Aura AI] OPENAI_API_KEY not configured');
      res.status(500).json({
        error: 'Internal server error',
        message: 'OpenAI API key not configured. Please contact support.'
      });
      return;
    }

    const { message, mode: preferredMode, language: preferredLanguage } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a non-empty string'
      });
      return;
    }

    const sanitizedMessage = message.trim().slice(0, 2000);

    console.log('[Bible Aura AI] Processing request:', {
      messageLength: sanitizedMessage.length,
      preferredMode,
      preferredLanguage
    });

    const result = await runFastRAGPipeline(
      sanitizedMessage,
      preferredMode,
      preferredLanguage
    );

    res.status(200).json(result);

  } catch (error: any) {
    console.error('[Bible Aura AI] Error:', error.message);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment 
      ? error.message 
      : 'An error occurred processing your request. Please try again.';

    res.status(500).json({
      error: 'Internal server error',
      message: errorMessage
    });
  }
}
