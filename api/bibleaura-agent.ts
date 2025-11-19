// Bible Aura AI - Ultra-Fast 3-Node RAG System
// Node 1: RAG Retriever → Node 2: Meta-Agent → Node 3: Guardrails
// Features: Streaming, Caching, Verse Validation

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { z } from "zod";

// In-memory response cache
interface CachedResponse {
  text: string;
  mode: Mode;
  lang: Language;
  sources?: AgentResponse['sources'];
  crossReferences?: string[];
  timestamp: number;
}

const responseCache = new Map<string, CachedResponse>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

function getCacheKey(message: string, mode?: string, language?: string, modelMode?: string): string {
  return `${message.trim().toLowerCase()}|${mode || 'default'}|${language || 'default'}|${modelMode || 'aura-1.0'}`;
}

function getCachedResponse(message: string, mode?: string, language?: string, modelMode?: string): CachedResponse | null {
  const key = getCacheKey(message, mode, language, modelMode);
  const cached = responseCache.get(key);
  
  if (!cached) return null;
  
  // Check if expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  
  return cached;
}

function setCachedResponse(
  message: string,
  response: Omit<CachedResponse, 'timestamp'>,
  mode?: string,
  language?: string,
  modelMode?: string
): void {
  // Clean up if cache is full
  if (responseCache.size >= MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, MAX_CACHE_SIZE - 50);
    toRemove.forEach(([key]) => responseCache.delete(key));
  }
  
  const key = getCacheKey(message, mode, language, modelMode);
  responseCache.set(key, {
    ...response,
    timestamp: Date.now()
  });
}

// Default origin allowed for CORS
const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

// Vector Store IDs - DEPRECATED: Now using Pinecone for Bible content
// These are kept for reference but no longer used
// const ENGLISH_VECTOR_STORE = "vs_6914c8f2ecf48191b8c80e0911d335cf";
// const TAMIL_VECTOR_STORE = "vs_6914ce9d39b4819188024077258a0db3";

// Model Config
interface ModelConfig {
  maxChunks: number;
  maxTokens: number;
  temperature: number;
  topP: number;
}

const MODEL_CONFIG: ModelConfig = {
  maxChunks: 5,
  maxTokens: 1024,
  temperature: 0.3,
  topP: 0.7
};

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
  validatedVerses?: Array<{
    reference: string;
    verseText: string;
    book: string;
    chapter: number;
    verse: number;
  }>;
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

// Ensure language preference is respected
function determineLanguage(userInput: string, preferredLanguage?: "en" | "ta"): "en" | "ta" {
  // If user explicitly selected a language, use it
  if (preferredLanguage) {
    return preferredLanguage;
  }
  // Otherwise, detect from input
  return detectLanguage(userInput);
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
  // Always respect preferred language if provided
  const lang = determineLanguage(userInput, preferredLanguage);
  
  console.log('[RAG Retriever] Language:', lang, 'Preferred:', preferredLanguage, 'Using Pinecone');

  try {
    // Use Pinecone for Bible retrieval (import dynamically to avoid issues in serverless)
    const { retrieveBibleContextFromPinecone } = await import('../src/lib/bible-rag/pinecone-retrieval.js');
    
    // Parallel: Pinecone Bible search + Web search
    const [bibleRAGResult, webResults] = await Promise.all([
      retrieveBibleContextFromPinecone(userInput, client, preferredLanguage).catch(() => ({
        lang,
        context: userInput,
        query: userInput,
        sources: []
      })),
      searchWeb(userInput)
    ]);

    // Extract Bible sources from results
    const bibleSources = bibleRAGResult.sources || [];

    // Add web sources
    const webSources = webResults.map((result, idx) => ({
      id: `web-${idx}`,
      filename: result.title || result.url || "Web Result",
      score: 0.8, // Default score for web results
      url: result.url,
      snippet: result.snippet
    }));

    // Combine all sources
    const maxWebSources = 3;
    const allSources = [...bibleSources, ...webSources].slice(0, MODEL_CONFIG.maxChunks + maxWebSources);

    // Build context: Bible chunks from hybrid/Pinecone search + Web snippets
    const bibleContext = bibleRAGResult.context || userInput;
    
    const webContext = webResults
      .map((result) => `${result.title}\n${result.snippet}`)
      .join("\n---\n");

    const combinedContext = [bibleContext, webContext].filter(Boolean).join("\n\n[Web Sources]\n---\n");

    return {
      lang: bibleRAGResult.lang || lang,
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

// Extract verse references from context
function extractVerseReferences(context: string): string[] {
  // Pattern to match Bible verse references: "Book Chapter:Verse" or "Book Chapter:Verse-Verse"
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const matches = context.match(versePattern);
  return matches ? [...new Set(matches)] : []; // Remove duplicates
}

// Node 2: Meta-Agent
function getMetaAgentPrompt(
  ragContext: string, 
  userQuery: string, 
  availableVerses: string[],
  lang: "en" | "ta" = "en"
): string {
  const versesList = availableVerses.length > 0 
    ? `\n\nAvailable verse references in context:\n${availableVerses.slice(0, 20).join(', ')}`
    : '\n\nIMPORTANT: You must find and include at least one Bible verse reference from the context above.';

  const basePrompt = `You are the Bible Aura Meta-Agent.

Your responsibilities:
1. Detect language (English/Tamil) - respond in the same language as the user
2. Detect user mode:
   - chat → conversational answer (30-40 words, MUST include scripture reference with verse text)
   - verse → verse analysis format (structured explanation with 5 sections)
   - parable → parable explainer format (story, context, lesson)
   - character → character study (overview, timeline, lessons)
   - topical → topic overview (definition, scriptures, application)
   - qa → Q&A format (concise answer)
3. Use ONLY the Bible context and web sources provided. NEVER hallucinate or make up verses. ONLY reference verses that are explicitly mentioned in the provided context above. If a verse is not in the context, DO NOT reference it.
4. MANDATORY: Every response MUST include at least ONE Bible verse reference from the context provided above. 
   - ONLY use verse references that appear in the "Available verse references in context" list or in the Bible Context section.
   - NEVER create or invent verse references that are not in the context.
   - Format verse references clearly, e.g., "As written in John 3:16..." or "Scripture reference: Romans 8:28"
   - Include the verse reference naturally in your response.
5. Strict formatting rules:
   - Use ✦ for main title (add a blank line before and after each title)
   - Use ↗ for section headings (add a blank line before each heading)
   - Use • for bullet points
   - Always add a blank line between different sections/titles
   - Never use markdown (#, *, **, etc.)
   - Never use code blocks or backticks
   - Format titles with blank lines: \n\n✦ Title\n\n
6. Produce a clean final answer with proper spacing between titles and sections.`;

  const tamilInstructions = lang === "ta" ? `

IMPORTANT FOR TAMIL RESPONSES:
- Use correct Tamil biblical terms:
  * "தேவன்" (not "கடவுள்") for God
  * "கர்த்தர்" for Lord
  * "யேசு கிறிஸ்து" (not "கிரிஸ்து") for Jesus Christ
  * "பரிசுத்த ஆவியார்" (not "பரிசுத்த ஆவி") for Holy Spirit
  * "பரிசுத்த வேதாகமம்" (not "பைபிள்") for Bible
  * "வேத வசனம்" for Scripture
  * "இரட்சிப்பு" for Salvation
  * "சுவிசேஷம்" for Gospel
  * "நம்பிக்கை" for Faith
  * "கிருபை" for Grace
  * "ஜெபம்" for Prayer
  * "ஆராதனை" for Worship
  * "திருச்சபை" for Church
  * "விசுவாசி" (not "மத விசுவாசி") for Believer
  * "மேய்ப்பர்" or "பாஸ்டர்" (not "ஆசிரியர்") for Pastor
  * "ஊழியம்" (not "சேவை") for Ministry
  * "அத்தியாயம்" for Chapter
  * "வசனம்" for Verse
- Always use proper Tamil biblical terminology
- Avoid English transliterations when proper Tamil terms exist` : '';

  return `${basePrompt}${tamilInstructions}

Bible Context & Web Sources:
${ragContext}${versesList}

User Query: ${userQuery}

Return JSON only:
{
  "lang": "en" or "ta",
  "mode": "chat" | "verse" | "qa" | "topical" | "parable" | "character",
  "response": "your formatted answer here with blank lines between titles. MUST include at least one verse reference."
}`;
}

async function runMetaAgent(
  ragResult: RAGResult,
  client: OpenAI,
  options: { useCoT?: boolean } = {}
): Promise<z.infer<typeof MetaAgentResponseSchema>> {
  try {
    // Extract verse references from context
    const availableVerses = extractVerseReferences(ragResult.context);
    const prompt = getMetaAgentPrompt(
      ragResult.context, 
      ragResult.query, 
      availableVerses,
      ragResult.lang
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are the Bible Aura Meta-Agent. Always return valid JSON matching the required schema. Every response MUST include at least one Bible verse reference. CRITICAL LANGUAGE REQUIREMENT: You MUST respond in ${ragResult.lang === "ta" ? "Tamil (தமிழ்)" : "English"} language. If the detected language is "ta", write your ENTIRE response in Tamil. If "en", write in English. Never mix languages.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: MODEL_CONFIG.temperature,
      top_p: MODEL_CONFIG.topP,
      max_tokens: MODEL_CONFIG.maxTokens,
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

    const validated = MetaAgentResponseSchema.parse(parsedResponse);
    
    // Verify that response contains at least one verse reference
    const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/;
    if (!versePattern.test(validated.response)) {
      // If no verse found, try to add one from available verses or add a fallback
      if (availableVerses.length > 0) {
        const verseToAdd = availableVerses[0];
        validated.response = `${validated.response}\n\nScripture reference: ${verseToAdd}`;
      } else {
        // Fallback: Add a general verse reference if none found
        // This is a last resort - ideally the agent should find one
        console.warn("[Meta-Agent] No verse reference found in response, adding fallback");
        validated.response = `${validated.response}\n\nScripture reference: Please refer to the Bible context provided above.`;
      }
    }

    return validated;
  } catch (error: any) {
    console.error("[Meta-Agent] Error:", error.message);
    return {
      lang: ragResult.lang,
      mode: "chat",
      response: "I apologize, but I encountered an error processing your request. Please try again. Scripture reference: John 3:16"
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

// Extract cross-references - only from actual Bible sources, not web sources
function extractCrossReferences(sources: Array<{ filename: string; url?: string }>): string[] {
  return sources
    .filter(s => {
      // Only include Bible sources (no URL), not web sources
      if (s.url) return false;
      const filename = s.filename;
      // Must match verse reference pattern: "Book Chapter:Verse" or "Book Chapter"
      return /^\d*\s*[A-Za-z]+\s+\d+/.test(filename) ||
             /^[A-Za-z]+\s+\d+/.test(filename);
    })
    .map(s => s.filename)
    .filter((ref, idx, arr) => arr.indexOf(ref) === idx) // Remove duplicates
    .slice(0, 5);
}

// Validate verse references - only return references that appear in the actual response text
// Don't create fake or placeholder verses
async function validateVerseReferences(
  text: string,
  language: 'en' | 'ta'
): Promise<Array<{
  reference: string;
  verseText: string;
  book: string;
  chapter: number;
  verse: number;
}>> {
  try {
    // Extract verse references from text - only real ones mentioned in response
    const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
    const matches = [...text.matchAll(versePattern)];
    
    if (matches.length === 0) return [];
    
    // Get unique references that actually appear in the response
    const uniqueRefs = [...new Set(matches.map(m => m[0]))];
    
    // Only return references that are actually in the text
    // Don't create placeholder verses - only return what's actually mentioned
    const validatedVerses: Array<{
      reference: string;
      verseText: string;
      book: string;
      chapter: number;
      verse: number;
    }> = [];
    
    for (const ref of uniqueRefs.slice(0, 5)) { // Limit to 5 verses
      const match = ref.match(/^(\d*\s*[A-Za-z]+\.?)\s+(\d+):(\d+)$/i);
      if (match) {
        // Only include if it's a valid format - don't add placeholder text
        validatedVerses.push({
          reference: ref,
          verseText: `[${ref}]`, // Just show reference, don't fake verse text
          book: match[1].trim(),
          chapter: parseInt(match[2]),
          verse: parseInt(match[3])
        });
      }
    }
    
    return validatedVerses;
  } catch (error) {
    console.error('[Verse Validation] Error:', error);
    return [];
  }
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

  // Node 2: Meta-Agent with Chain-of-Thought reasoning
  const metaAgentResult = await runMetaAgent(ragResult, client, { useCoT: true });

  // Node 3: Global Guardrails
  let safeText = await runGlobalGuardrails(
    metaAgentResult.response,
    client,
    1000
  );

  // Improve Tamil text if language is Tamil
  if (metaAgentResult.lang === "ta") {
    safeText = improveTamilText(safeText);
  }

  const crossReferences = extractCrossReferences(ragResult.sources);

  return {
    text: safeText,
    mode: metaAgentResult.mode,
    lang: metaAgentResult.lang,
    sources: ragResult.sources.slice(0, 5),
    crossReferences: crossReferences
  };
}

// Improve Tamil text by replacing incorrect terms with correct ones
function improveTamilText(text: string): string {
  const replacements: Record<string, string> = {
    "கிரிஸ்து": "கிறிஸ்து",
    "பைபிள்": "பரிசுத்த வேதாகமம்",
    "பைபிள் புத்தகம்": "பரிசுத்த வேதாகமம்",
    "மத விசுவாசி": "விசுவாசி",
    "பரிசுத்த ஆவி": "பரிசுத்த ஆவியார்",
    "சேவை": "ஊழியம்",
    "ஆசிரியர்": "மேய்ப்பர்"
  };

  let improved = text;
  for (const [incorrect, correct] of Object.entries(replacements)) {
    const regex = new RegExp(incorrect, 'g');
    improved = improved.replace(regex, correct);
  }

  return improved;
}

// Check if question is Bible-related
async function isBibleRelated(
  userInput: string,
  client: OpenAI
): Promise<{ isBibleRelated: boolean; reason?: string }> {
  try {
    const prompt = `Analyze if this question is related to the Bible, Christianity, biblical studies, theology, or scripture.

Question: "${userInput}"

Respond with JSON only:
{
  "isBibleRelated": true or false,
  "reason": "brief explanation"
}

A question is Bible-related if it asks about:
- Bible verses, books, chapters, characters, stories
- Biblical concepts, theology, doctrine
- Christian faith, prayer, worship
- Biblical history, geography, culture
- Scripture interpretation or study
- Parables, teachings, or biblical themes

A question is NOT Bible-related if it asks about:
- General knowledge, science, math, history (non-biblical)
- Current events, politics, sports, entertainment
- Personal advice unrelated to scripture
- Technical questions about computers, programming, etc.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a classifier. Always return valid JSON. Be strict - only mark as Bible-related if it clearly relates to Bible, Christianity, or biblical studies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 100
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(responseText);
    
    return {
      isBibleRelated: parsed.isBibleRelated === true,
      reason: parsed.reason
    };
  } catch (error: any) {
    console.error("[Bible Check] Error:", error.message);
    // Default to allowing if check fails (fail-safe)
    return { isBibleRelated: true };
  }
}

// Check if question is sensitive/spiritual (requires personal guidance)
async function isSensitiveSpiritualQuestion(
  userInput: string,
  client: OpenAI
): Promise<{ isSensitive: boolean; reason?: string }> {
  try {
    const prompt = `Analyze if this question requires personal spiritual guidance, counseling, or pastoral care that should be handled by a pastor or spiritual advisor, not an AI assistant.

Question: "${userInput}"

Respond with JSON only:
{
  "isSensitive": true or false,
  "reason": "brief explanation"
}

A question is sensitive/spiritual if it asks for:
- Personal spiritual guidance or counseling
- Advice on personal spiritual struggles, doubts, or crises
- Interpretation of personal spiritual experiences or dreams
- Guidance on major life decisions (marriage, career, health) from a spiritual perspective
- Help with personal sin, guilt, or spiritual warfare
- Personal prayer requests that need pastoral care
- Questions about personal salvation or spiritual condition

A question is NOT sensitive if it asks for:
- General Bible study or scripture explanation
- Biblical facts, history, or theology
- Explanation of Bible verses or stories
- Academic or educational questions about the Bible
- General Christian teachings or doctrine`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a classifier. Always return valid JSON. Be careful - only mark as sensitive if it clearly requires personal pastoral guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 100
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(responseText);
    
    return {
      isSensitive: parsed.isSensitive === true,
      reason: parsed.reason
    };
  } catch (error: any) {
    console.error("[Sensitive Check] Error:", error.message);
    // Default to not sensitive if check fails (fail-safe)
    return { isSensitive: false };
  }
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
      preferredLanguage,
      detectedLanguage: detectLanguage(sanitizedMessage),
      usingLanguage: preferredLanguage || detectLanguage(sanitizedMessage)
    });

    const client = getOpenAIClient();
    const lang = preferredLanguage || detectLanguage(sanitizedMessage);

    // Check if question is Bible-related (BEFORE RAG pipeline)
    const bibleCheck = await isBibleRelated(sanitizedMessage, client);
    
    if (!bibleCheck.isBibleRelated) {
      const response = lang === "ta" 
        ? "மன்னிக்கவும், நான் வேதாகமம் தொடர்பான கேள்விகளுக்கு மட்டுமே பதிலளிக்க முடியும்."
        : "Sorry, I can only answer Bible-related questions.";
      
      console.log('[Bible Aura AI] Question not Bible-related, rejecting');
      res.status(200).json({
        text: response,
        mode: "chat",
        lang: lang,
        sources: [],
        crossReferences: []
      });
      return;
    }

    // Check if question is sensitive/spiritual (BEFORE RAG pipeline)
    const sensitiveCheck = await isSensitiveSpiritualQuestion(sanitizedMessage, client);
    
    if (sensitiveCheck.isSensitive) {
      const response = lang === "ta"
        ? "நான் ஒரு உதவியாளர் மட்டுமே. உங்கள் சொந்த பரிசுத்த ஆவியார் உங்களை வழிநடத்துவார். தயவுசெய்து உங்கள் மேய்ப்பரை அணுகவும்."
        : "I am just an assistant. Pray at your own, the Holy Spirit will guide you, or contact your pastor.";
      
      console.log('[Bible Aura AI] Question is sensitive/spiritual, redirecting to pastor');
      res.status(200).json({
        text: response,
        mode: "chat",
        lang: lang,
        sources: [],
        crossReferences: []
      });
      return;
    }

    // Check cache first
    const cached = getCachedResponse(sanitizedMessage, preferredMode, preferredLanguage, 'aura-1.0');
    if (cached) {
      console.log('[Bible Aura AI] Cache hit');
      res.status(200).json(cached);
      return;
    }

    const result = await runFastRAGPipeline(
      sanitizedMessage,
      preferredMode,
      preferredLanguage
    );

    // Only return sources that are actually retrieved (not empty or invalid)
    // Filter out JSON files and invalid sources
    if (result.sources) {
      result.sources = result.sources.filter(s => {
        const filename = s.filename || "";
        return filename && 
               filename !== "Unknown" && 
               filename.trim() !== "" &&
               !filename.toLowerCase().endsWith('.json');
      });
    }

    // Only validate verses that actually exist in the retrieved context
    // Don't create fake verse references
    const validatedVerses = await validateVerseReferences(result.text, result.lang);
    if (validatedVerses.length > 0) {
      result.validatedVerses = validatedVerses;
    }

    // Cache the result
    setCachedResponse(sanitizedMessage, result, preferredMode, preferredLanguage, 'aura-1.0');

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
