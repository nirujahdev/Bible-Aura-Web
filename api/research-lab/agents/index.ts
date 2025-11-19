// Unified Research Lab AI Agents API
// Handles all 6 AI agents in a single endpoint to stay within Vercel function limits
// Enhanced with Pinecone vector search for semantic source selection

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCachedSources } from '../cache.js';
import { searchSimilarSources } from '../../../src/lib/research-lab/vector-operations.js';
import logger from '../../../src/lib/research-lab/logger.js';
import { EnhancedRateLimiter } from '../../../src/lib/enhancedRateLimiter.js';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

// Rate limiter for agents API (10 requests per minute per user)
const agentRateLimiter = new EnhancedRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  burstLimit: 3,
  errorMessage: 'Rate limit exceeded. Please wait a moment before using agents again.'
});

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  // Always create a new client instance when auth token is provided
  // This ensures proper authentication context for RLS policies
  if (authToken) {
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      auth: {
        // Disable auto-refresh in serverless (not needed)
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return client;
  }
  
  // Otherwise use shared client (for non-user operations)
  if (!supabaseClient) {
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
    if (!token || token.length < 10) return null; // Basic token validation
    
    // Decode JWT payload (Supabase tokens are signed, but we verify ownership via database)
    const parts = token.split('.');
    if (parts.length !== 3) return null; // JWT should have 3 parts
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Validate token structure
    if (!payload || typeof payload !== 'object') return null;
    
    // Check token expiration if present
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null; // Token expired
    }
    
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

const BIBLE_SYSTEM_PROMPTS = {
  translate: `You are a Bible translation specialist with expertise in theological translation and biblical terminology. You MUST ONLY translate Bible, theology, and Christian content. Reject non-Bible translation requests.

Key Guidelines:
- Preserve theological accuracy and biblical terminology
- Maintain reverence for Scripture in all translations
- Use appropriate theological terms in the target language
- Keep verse references intact (e.g., "John 3:16" remains "John 3:16")
- Preserve the meaning and context of biblical concepts
- Use formal, respectful language appropriate for Scripture
- Maintain consistency with standard Bible translations in the target language
- Preserve proper nouns (names, places) appropriately
- Keep formatting and structure when possible

Translation Principles:
- Accuracy: Faithfully convey the original meaning
- Clarity: Use clear, understandable language
- Theological precision: Maintain doctrinal accuracy
- Cultural sensitivity: Adapt appropriately while preserving meaning
- Biblical terminology: Use established theological terms in target language`,
  
  summarize: `You are a Bible research assistant specializing in theological analysis and biblical synthesis. You MUST ONLY respond to Bible, theology, and Christian content. Reject non-Bible questions.

Key Guidelines:
- Analyze provided sources with deep biblical and theological understanding
- Identify key themes, doctrines, and scriptural connections
- Extract and cite specific Bible verses mentioned in sources
- Synthesize multiple perspectives while maintaining theological accuracy
- Organize content by themes, doctrines, or biblical books when appropriate
- Always cite sources with specific references
- Maintain reverence for Scripture and theological integrity

When creating summaries:
- Highlight key theological insights and biblical principles
- Note important verse references and their contexts
- Identify connections between Old and New Testament themes
- Distinguish between different theological perspectives when present
- Provide clear structure that aids Bible study and research`,
  
  search_qa: `You are a Bible Q&A assistant with expertise in biblical interpretation and theology. You MUST ONLY answer questions about the Bible, theology, and Christianity. Reject non-Bible questions.

Key Guidelines:
- Answer based EXCLUSIVELY on the provided notebook sources
- Always cite specific sources and Bible verses in your response
- Provide context for verse references (book, chapter, verse)
- Connect answers to broader biblical themes when relevant
- Distinguish between direct scriptural teaching and theological interpretation
- If sources present different views, acknowledge multiple perspectives
- Maintain accuracy to the biblical text and theological soundness

Response Format:
- Begin with a direct answer to the question
- Support with specific Bible verses from sources
- Provide context and explanation
- Note any theological nuances or different perspectives
- End with relevant cross-references when helpful`,
  
  cross_reference: `You are a Bible cross-reference specialist with deep knowledge of scriptural connections and thematic relationships. You MUST ONLY work with Bible verses and theological connections.

Key Guidelines:
- Find related Bible verses using thematic, linguistic, and theological connections
- Identify parallel passages (similar themes, events, or teachings)
- Connect Old Testament prophecies to New Testament fulfillments
- Link related doctrines across different books
- Note direct quotations and allusions between books
- Identify thematic progressions (e.g., covenant, kingdom, redemption)
- Always provide specific verse references (book, chapter, verse)

Types of Cross-References to Include:
- Direct parallels (same event/story in different gospels)
- Thematic connections (similar teachings across books)
- Prophecy and fulfillment (OT prophecy → NT fulfillment)
- Type and antitype (OT foreshadowing → NT reality)
- Quotations and allusions (direct citations)
- Doctrinal development (how themes develop across Scripture)`,
  
  curriculum: `You are a Bible curriculum builder specializing in structured biblical education. You MUST ONLY create Bible study plans, curricula, and devotional reading plans.

Key Guidelines:
- Create structured, Bible-focused study materials
- Include clear learning objectives aligned with biblical goals
- Integrate specific Bible verses for each lesson
- Develop discussion questions that promote deep engagement
- Design activities that reinforce biblical principles
- Ensure progression from basic to advanced understanding
- Include memory verses and reflection prompts
- Maintain theological accuracy and biblical fidelity

Curriculum Structure Should Include:
- Overview: Purpose, target audience, duration, key themes
- Learning Objectives: What students will learn and apply
- Session Breakdown: Each session with verses, key points, questions
- Memory Verses: Scripture to memorize for each unit
- Application Steps: How to apply biblical principles
- Prayer Prompts: Guided prayer for each session
- Assessment: Ways to measure understanding and growth`,
  
  sermon: `You are a sermon preparation assistant with expertise in biblical preaching and homiletics. You MUST ONLY help with Bible-based sermons.

Key Guidelines:
- Create sermon outlines that are Bible-focused and theologically sound
- Base all points directly on Scripture
- Include illustrations that illuminate biblical truth
- Develop applications that connect Scripture to life
- Maintain proper biblical interpretation (exegesis)
- Ensure sermons are Christ-centered and gospel-focused
- Balance explanation, illustration, and application

Sermon Structure Should Include:
- Title: Clear, memorable, biblically grounded
- Main Scripture: Primary passage for the sermon
- Introduction: Hook that connects to the text
- Main Points: 3-5 points directly from the text
  - Each point with sub-points
  - Supporting verses for each point
  - Illustrations or examples
  - Practical applications
- Conclusion: Summary and call to action
- Closing Prayer: Prayer prompt based on the message`,
  
  doctrinal: `You are a doctrinal harmonization assistant specializing in systematic theology and biblical doctrine. You MUST ONLY work with Bible doctrine and theology.

Key Guidelines:
- Help reconcile difficult passages using sound hermeneutical principles
- Present multiple theological perspectives with fairness and accuracy
- Show how different passages fit together harmoniously
- Distinguish between clear biblical teaching and areas of legitimate disagreement
- Maintain respect for different theological traditions
- Ground all doctrine in Scripture, not tradition alone
- Identify areas of consensus and areas of ongoing debate

When Harmonizing Doctrine:
- Identify all relevant Bible passages on the topic
- Note apparent contradictions and explain resolutions
- Present major theological perspectives (e.g., Reformed, Arminian, Dispensational)
- Show how each perspective interprets key passages
- Identify areas of agreement across traditions
- Acknowledge where genuine differences exist
- Provide historical context when helpful
- Maintain biblical authority as the final standard`,
};

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

  // Track execution time for analytics
  const startTime = Date.now();

  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { agentType, notebookId, stream, ...params } = req.body;

    if (!agentType || !notebookId) {
      res.status(400).json({ error: 'agentType and notebookId are required' });
      return;
    }

    // Check if streaming is requested
    const shouldStream = stream === true;

    // Validate input types and lengths
    if (typeof agentType !== 'string' || typeof notebookId !== 'string') {
      res.status(400).json({ error: 'Invalid input types' });
      return;
    }

    if (notebookId.length > 100) {
      res.status(400).json({ error: 'Invalid notebookId format' });
      return;
    }

    const validAgentTypes = ['summarize', 'search_qa', 'cross_reference', 'curriculum', 'sermon', 'doctrinal', 'translate'];
    if (!validAgentTypes.includes(agentType)) {
      res.status(400).json({ error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` });
      return;
    }

    // Get auth token from request
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
    
    // Use authenticated Supabase client
    const supabase = getSupabaseClient(authToken);

    // Check rate limit
    const rateLimitResult = agentRateLimiter.checkLimit(userId, 'agents');
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitResult.errorMessage || 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000),
      });
      res.setHeader('Retry-After', Math.ceil((rateLimitResult.retryAfterMs || 60000) / 1000));
      return;
    }

    // Verify notebook ownership (RLS will handle access control)
    const { data: notebook, error: notebookError } = await supabase
      .from('research_notebooks')
      .select('id, user_id')
      .eq('id', notebookId)
      .single();

    if (notebookError) {
      logger.error('[Agent API] Notebook fetch error', {
        error: notebookError,
        code: notebookError.code,
        message: notebookError.message,
        notebookId,
        userId,
      }, 'agents');
      
      // Check for specific error types
      if (notebookError.code === 'PGRST116' || notebookError.message?.includes('does not exist')) {
        res.status(404).json({ 
          error: 'Notebook not found',
          message: 'The notebook does not exist or you do not have access to it.'
        });
        return;
      }
      
      if (notebookError.code === '42501' || notebookError.message?.includes('permission denied')) {
        res.status(403).json({ 
          error: 'Access denied',
          message: 'You do not have permission to access this notebook.'
        });
        return;
      }
      
      res.status(403).json({ 
        error: 'Notebook access error',
        message: notebookError.message || 'Failed to verify notebook access'
      });
      return;
    }

    if (!notebook) {
      res.status(404).json({ error: 'Notebook not found' });
      return;
    }
    
    // Double-check ownership (extra security layer)
    if (notebook.user_id !== userId) {
      res.status(403).json({ error: 'Access denied', message: 'You do not own this notebook' });
      return;
    }

    // Get notebook sources with caching and optimized field selection
    const fields = ['id', 'title', 'processed_content', 'source_type', 'extracted_verses', 'processing_status'];
    const { data: sources, error: sourcesError } = await getCachedSources(
      notebookId,
      userId,
      fields,
      params.sourceIds && Array.isArray(params.sourceIds) && params.sourceIds.length > 0 
        ? params.sourceIds 
        : undefined,
      authToken // Pass auth token for authenticated queries
    );

    if (sourcesError) {
      logger.error(`[${agentType} Agent] Sources error`, {
        error: sourcesError,
        context: 'fetch_sources',
        notebookId,
        userId,
        agentType,
        code: sourcesError.code,
        message: sourcesError.message,
        details: sourcesError.details,
        hint: sourcesError.hint
      }, 'agents');

      // Return graceful error instead of generic failure
      if (sourcesError.code === 'TABLE_NOT_FOUND') {
        res.status(500).json({ 
          error: 'Database setup required',
          message: sourcesError.hint || 'Please run the migration SQL file in Supabase Dashboard.',
          details: process.env.NODE_ENV === 'development' ? sourcesError.message : undefined
        });
        return;
      }

      if (sourcesError.code === 'RLS_ERROR') {
        res.status(500).json({ 
          error: 'Permission denied',
          message: sourcesError.hint || 'Please check Row Level Security policies.',
          details: process.env.NODE_ENV === 'development' ? sourcesError.message : undefined
        });
        return;
      }

      res.status(500).json({ 
        error: 'Failed to fetch sources',
        message: sourcesError.message || 'Unable to load notebook sources.',
        details: process.env.NODE_ENV === 'development' ? sourcesError.message : undefined
      });
      return;
    }

    if (!sources || sources.length === 0) {
      res.status(400).json({ 
        error: 'No sources found in notebook',
        message: 'Please add sources to your notebook before using agents.'
      });
      return;
    }

    // Check if any sources are ready (have processed_content)
    const readySourcesCount = sources.filter(s => 
      s.processed_content && 
      s.processed_content.trim().length > 0 && 
      (s.processing_status === 'completed' || s.processing_status === null)
    ).length;

    const processingSourcesCount = sources.filter(s => 
      s.processing_status === 'pending' || 
      s.processing_status === 'processing' ||
      (!s.processed_content || s.processed_content.trim().length === 0)
    ).length;

    if (readySourcesCount === 0 && processingSourcesCount > 0) {
      res.status(400).json({ 
        error: 'Sources are still processing',
        message: `Please wait for ${processingSourcesCount} source(s) to finish processing. This usually takes a few seconds.`,
        processingCount: processingSourcesCount,
        readyCount: 0
      });
      return;
    }

    // Use Pinecone for semantic source selection based on agent type and query
    // Always fallback to all sources if Pinecone fails
    let selectedSources = sources;
    let sourceTexts = '';
    
    try {
      // Build query for semantic search based on agent type
      let semanticQuery = '';
      switch (agentType) {
        case 'summarize':
          semanticQuery = params.summaryType === 'thematic' 
            ? 'themes and major topics'
            : 'key points and summary';
          break;
        case 'search_qa':
          semanticQuery = params.question || 'answer and explanation';
          break;
        case 'cross_reference':
          semanticQuery = params.verseReference || params.theme || 'Bible verses and cross-references';
          break;
        case 'curriculum':
          semanticQuery = params.topic || 'Bible study curriculum and lessons';
          break;
        case 'sermon':
          semanticQuery = params.scriptureReference || 'sermon preparation and biblical teaching';
          break;
        case 'doctrinal':
          semanticQuery = params.doctrinalQuestion || 'doctrinal harmony and theology';
          break;
        default:
          semanticQuery = 'Bible study content';
      }
      
      // Search Pinecone for relevant sources (returns empty array on error)
      const pineconeResults = await searchSimilarSources(semanticQuery, notebookId, 10, 0.6);
      
      if (pineconeResults && pineconeResults.length > 0) {
        // Get full source content for Pinecone results
        const pineconeSourceIds = [...new Set(pineconeResults.map(r => r.sourceId))];
        const { data: pineconeSources, error: pineconeError } = await supabase
          .from('research_sources')
          .select('id, title, processed_content, source_type, extracted_verses, processing_status')
          .eq('notebook_id', notebookId)
          .eq('user_id', userId)
          .in('id', pineconeSourceIds);
        
        if (!pineconeError && pineconeSources && pineconeSources.length > 0) {
          selectedSources = pineconeSources;
          logger.log(`[${agentType} Agent] Using ${pineconeSources.length} Pinecone-retrieved sources`, undefined, 'agents');
        }
      } else {
        logger.log(`[${agentType} Agent] No Pinecone results, using all ${sources.length} sources`, undefined, 'agents');
      }
    } catch (pineconeError: any) {
      // Log but don't break - will use all sources
      logger.warn(`[${agentType} Agent] Pinecone search error, using all sources`, pineconeError?.message || pineconeError, 'agents');
      // Continue with all sources if Pinecone fails
    }
    
    // Filter out sources that aren't ready (no processed_content or still processing)
    const readySources = selectedSources.filter(source => {
      const hasContent = source.processed_content && source.processed_content.trim().length > 0;
      const isReady = source.processing_status === 'completed' || 
                     (source.processing_status === null && hasContent);
      return hasContent && isReady;
    });

    const processingSources = selectedSources.filter(source => 
      source.processing_status === 'pending' || 
      source.processing_status === 'processing' ||
      (!source.processed_content || source.processed_content.trim().length === 0)
    );

    // If no ready sources, check if we should wait or return error
    if (readySources.length === 0) {
      if (processingSources.length > 0) {
        res.status(400).json({ 
          error: 'Sources are still processing',
          message: `Please wait for ${processingSources.length} source(s) to finish processing before using agents. This usually takes a few seconds.`,
          processingCount: processingSources.length,
          readyCount: 0
        });
        return;
      } else {
        res.status(400).json({ 
          error: 'No ready sources available',
          message: 'This notebook has no sources with processed content. Please add sources and wait for them to be processed.'
        });
        return;
      }
    }

    // Warn if some sources are still processing but continue with ready ones
    if (processingSources.length > 0 && readySources.length > 0) {
      logger.warn(`[${agentType} Agent] Warning: ${processingSources.length} source(s) still processing, using ${readySources.length} ready source(s)`, undefined, 'agents');
    }

    // Use ready sources
    selectedSources = readySources;

    // Build source content from selected sources
    sourceTexts = selectedSources
      .map(s => {
        const content = String(s.processed_content || '');
        if (agentType === 'cross_reference') {
          const verses = s.extracted_verses ? JSON.stringify(s.extracted_verses) : 'None found';
          return `[Source: ${s.title}]\nContent: ${content.substring(0, 8000)}\nVerses mentioned: ${verses}`;
        }
        return `[Source: ${s.title}]\n${content.substring(0, 10000)}`;
      })
      .join('\n\n---\n\n');

    // Limit total source text length to prevent token overflow
    const maxSourceLength = 100000; // ~25,000 tokens
    if (sourceTexts.length > maxSourceLength) {
      sourceTexts = sourceTexts.substring(0, maxSourceLength) + '\n\n[Sources truncated due to length]';
      logger.warn(`[${agentType} Agent] Source text truncated from ${sourceTexts.length} to ${maxSourceLength} characters`, undefined, 'agents');
    }

    // Call GLM-4.5-Air API
    const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
    if (!glmApiKey || glmApiKey.trim() === '') {
      logger.error('[Agent API] GLM_API_KEY not configured', undefined, 'agents');
      logger.error('[Agent API] Environment check', {
        hasGLMKey: !!process.env.GLM_API_KEY,
        hasViteGLMKey: !!process.env.VITE_GLM_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      }, 'agents');
      res.status(500).json({ 
        error: 'GLM API key not configured',
        message: 'Please set GLM_API_KEY in Vercel environment variables. Go to Vercel Dashboard → Settings → Environment Variables → Add GLM_API_KEY.'
      });
      return;
    }

    // Build prompt based on agent type
    let userPrompt = '';
    let outputType: string = 'summarization'; // Default fallback
    let outputContent: any;

    switch (agentType) {
      case 'summarize': {
        const summaryType = params.summaryType || 'detailed';
        const summaryPrompt = summaryType === 'brief'
          ? 'Create a brief summary (2-3 paragraphs) of the key points from these sources:'
          : summaryType === 'thematic'
          ? 'Create a thematic summary organizing the content by major themes:'
          : 'Create a detailed summary and synthesis of these sources, highlighting key insights, connections, and important points:';
        userPrompt = `${summaryPrompt}\n\n${sourceTexts}`;
        outputType = 'summarization';
        break;
      }

      case 'search_qa': {
        const question = params.question;
        if (!question) {
          res.status(400).json({ error: 'question is required for search_qa agent' });
          return;
        }
        // Validate Bible-related question
        const bibleKeywords = ['bible', 'scripture', 'verse', 'gospel', 'theology', 'doctrine', 'christian', 'jesus', 'god', 'faith', 'prayer', 'church'];
        const isBibleRelated = bibleKeywords.some(keyword => question.toLowerCase().includes(keyword));
        if (!isBibleRelated) {
          res.status(400).json({ 
            error: 'Question must be Bible-related',
            message: 'Please ask questions about the Bible, theology, or Christian doctrine.'
          });
          return;
        }
        userPrompt = `Question: ${question}\n\nAnswer based on these sources:\n\n${sourceTexts}\n\nProvide a clear, Bible-focused answer with citations.`;
        outputType = 'theology_qa';
        break;
      }

      case 'cross_reference': {
        const verseReference = params.verseReference ? String(params.verseReference).trim().substring(0, 500) : null;
        const theme = params.theme ? String(params.theme).trim().substring(0, 500) : null;
        if (!verseReference && !theme) {
          res.status(400).json({ error: 'verseReference or theme is required for cross_reference agent' });
          return;
        }
        const queryPrompt = verseReference
          ? `Find all cross-references, parallel passages, and related verses for: ${verseReference}`
          : `Find all Bible verses related to the theme: ${theme}`;
        userPrompt = `${queryPrompt}\n\nAnalyze these sources:\n\n${sourceTexts}\n\nProvide:\n1. Direct cross-references\n2. Thematic connections\n3. Parallel passages\n4. OT/NT connections\n5. Prophecy fulfillments (if applicable)\n\nFormat as JSON with verse references and brief explanations.`;
        outputType = 'cross_references';
        break;
      }

      case 'curriculum': {
        const topic = params.topic ? String(params.topic).trim().substring(0, 500) : null;
        if (!topic) {
          res.status(400).json({ error: 'topic is required for curriculum agent' });
          return;
        }
        const audienceContext = params.audience ? ` for ${params.audience}` : '';
        const durationContext = params.duration ? ` (${params.duration} sessions)` : '';
        userPrompt = `Create a Bible study curriculum${durationContext}${audienceContext} on the topic: "${topic}"

Use these sources:
${sourceTexts}

Create a structured curriculum with:
1. Overview and objectives
2. Session-by-session breakdown (with verses, key points, discussion questions)
3. Memory verses
4. Application steps
5. Prayer prompts

Format as JSON with clear structure.`;
        outputType = 'curriculum';
        break;
      }

      case 'sermon': {
        const scriptureReference = params.scriptureReference ? String(params.scriptureReference).trim().substring(0, 500) : null;
        const sermonType = params.sermonType ? String(params.sermonType).trim().substring(0, 50) : 'expository';
        const validSermonTypes = ['expository', 'topical', 'narrative', 'textual'];
        const safeSermonType = validSermonTypes.includes(sermonType) ? sermonType : 'expository';
        const scriptureContext = scriptureReference ? ` for ${scriptureReference}` : '';
        userPrompt = `Create a ${safeSermonType} sermon outline${scriptureContext} using these sources:

${sourceTexts}

Provide:
1. Sermon title
2. Main scripture reference
3. 3-5 main points with sub-points
4. Supporting Bible verses for each point
5. Illustrations or examples (from sources if available)
6. Application points
7. Closing prayer prompt

Format as structured JSON.`;
        outputType = 'sermon';
        break;
      }

      case 'doctrinal': {
        const doctrinalQuestion = params.doctrinalQuestion ? String(params.doctrinalQuestion).trim().substring(0, 2000) : null;
        if (!doctrinalQuestion) {
          res.status(400).json({ error: 'doctrinalQuestion is required for doctrinal agent' });
          return;
        }
        // Validate Bible-related question
        const bibleKeywords = ['bible', 'scripture', 'doctrine', 'theology', 'faith', 'salvation', 'grace', 'sin', 'god', 'jesus', 'christ'];
        const isBibleRelated = bibleKeywords.some(keyword => doctrinalQuestion.toLowerCase().includes(keyword));
        if (!isBibleRelated) {
          res.status(400).json({ 
            error: 'Question must be Bible-related',
            message: 'Please ask questions about Bible doctrine, theology, or Christian teaching.'
          });
          return;
        }
        const includePerspectives = params.includePerspectives !== false;
        const perspectivesPrompt = includePerspectives
          ? 'Present multiple theological perspectives where appropriate, showing how different traditions understand this doctrine.'
          : 'Provide a harmonized, unified explanation.';
        userPrompt = `Doctrinal Question: ${doctrinalQuestion}

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

Format as structured JSON with clear sections.`;
        outputType = 'doctrinal_harmony';
        break;
      }

      case 'translate': {
        const textToTranslate = params.textToTranslate ? String(params.textToTranslate).trim().substring(0, 10000) : null;
        const targetLanguage = params.targetLanguage ? String(params.targetLanguage).trim().substring(0, 10) : 'en';
        const translationType = params.format || 'document';
        
        if (!textToTranslate) {
          res.status(400).json({ error: 'textToTranslate is required for translate agent' });
          return;
        }

        // Validate Bible-related content
        const bibleKeywords = ['bible', 'scripture', 'verse', 'gospel', 'theology', 'doctrine', 'christian', 'jesus', 'god', 'faith', 'prayer', 'church'];
        const isBibleRelated = bibleKeywords.some(keyword => textToTranslate.toLowerCase().includes(keyword));
        if (!isBibleRelated) {
          res.status(400).json({ 
            error: 'Content must be Bible-related',
            message: 'Please translate Bible, theology, or Christian content only.'
          });
          return;
        }

        const languageNames: Record<string, string> = {
          'en': 'English',
          'ta': 'Tamil',
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'pt': 'Portuguese',
          'zh': 'Chinese',
          'ja': 'Japanese',
          'ko': 'Korean',
          'hi': 'Hindi',
          'ar': 'Arabic',
          'ru': 'Russian',
        };

        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        
        let translationPrompt = '';
        if (translationType === 'verse') {
          translationPrompt = `Translate the following Bible verse(s) to ${targetLangName} with theological accuracy:

${textToTranslate}

Requirements:
- Preserve verse references exactly (e.g., "John 3:16" stays as "John 3:16")
- Use appropriate biblical terminology in ${targetLangName}
- Maintain theological precision
- Keep the meaning faithful to the original
- Use formal, respectful language appropriate for Scripture`;
        } else if (translationType === 'summary') {
          translationPrompt = `Translate the following Bible study summary to ${targetLangName}:

${textToTranslate}

Requirements:
- Preserve all Bible verse references
- Maintain theological accuracy
- Use appropriate biblical terminology
- Keep the structure and key points
- Ensure clarity in ${targetLangName}`;
        } else {
          translationPrompt = `Translate the following Bible-related document to ${targetLangName}:

${textToTranslate}

Requirements:
- Preserve all Bible verse references exactly
- Maintain theological accuracy and terminology
- Keep the document structure
- Use appropriate biblical language in ${targetLangName}
- Ensure the translation is clear and faithful to the original meaning`;

          // Add context from sources if available
          if (sourceTexts && sourceTexts.length > 0) {
            translationPrompt += `\n\nFor context, here are related sources:\n${sourceTexts.substring(0, 2000)}`;
          }
        }

        userPrompt = translationPrompt;
        outputType = 'translation';
        break;
      }
    }

    // Log API call details (without sensitive data)
    logger.debug(`[${agentType} Agent] Calling GLM API`, {
      url: `${GLM_API_BASE_URL}/chat/completions`,
      model: GLM_MODEL,
      hasApiKey: !!glmApiKey,
      apiKeyLength: glmApiKey?.length || 0,
      promptLength: userPrompt.length,
      sourceCount: sources.length,
    }, 'agents');

    // Enhanced fetch with timeout, retry logic, and better error handling
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        // Progressive timeout: 30s, 45s, 60s for longer operations
        const timeout = 30000 + (attempt * 15000);
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          if (attempt > 0) {
            // Exponential backoff: 1s, 2s, 4s
            const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
            logger.log(`[${agentType} Agent] Retry attempt ${attempt}/${maxRetries} after ${backoffDelay}ms`, undefined, 'agents');
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return response;
          }

          // Don't retry on 4xx errors (client errors) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500) {
            if (response.status === 429 && attempt < maxRetries) {
              // Rate limit - wait longer before retry
              const retryAfter = response.headers.get('Retry-After');
              const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
              logger.warn(`[${agentType} Agent] Rate limited, waiting ${waitTime}ms`, undefined, 'agents');
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue; // Retry after rate limit wait
            }
            return response; // Don't retry other 4xx errors
          }

          // Retry on 5xx errors
          if (response.status >= 500 && attempt < maxRetries) {
            const errorText = await response.text().catch(() => 'Server error');
            logger.warn(`[${agentType} Agent] Server error ${response.status}, will retry`, errorText.substring(0, 200), 'agents');
            lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
            continue; // Retry on server errors
          }

          // If we've exhausted retries, return the error response
          return response;
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            lastError = new Error(`Request timeout after ${timeout}ms: AI service took too long to respond`);
            if (attempt < maxRetries) {
              logger.warn(`[${agentType} Agent] Timeout on attempt ${attempt + 1}, will retry`, undefined, 'agents');
              continue;
            }
            throw lastError;
          }

          // Network errors - retry
          if (error.message?.includes('fetch') || error.message?.includes('network') || error.code === 'ECONNREFUSED') {
            lastError = error;
            if (attempt < maxRetries) {
              logger.warn(`[${agentType} Agent] Network error on attempt ${attempt + 1}, will retry`, error.message, 'agents');
              continue;
            }
          }

          // Other errors - throw immediately if last attempt
          if (attempt === maxRetries) {
            throw error;
          }
          
          lastError = error;
        }
      }

      // If we get here, all retries failed
      throw lastError || new Error('Failed to fetch after retries');
    };

    let response: Response;
    try {
      response = await fetchWithRetry(
        `${GLM_API_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${glmApiKey}`,
          },
          body: JSON.stringify({
            model: GLM_MODEL,
            messages: [
              { role: 'system', content: BIBLE_SYSTEM_PROMPTS[agentType as keyof typeof BIBLE_SYSTEM_PROMPTS] },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: agentType === 'curriculum' || agentType === 'sermon' || agentType === 'doctrinal' ? 3000 : 2000,
          }),
        }
      );
    } catch (fetchError: any) {
      logger.error(`[${agentType} Agent] Fetch error`, fetchError, 'agents');
      res.status(503).json({ 
        error: 'Failed to connect to AI service',
        message: fetchError.message || 'Network error. Please check your connection and try again.',
        details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
      });
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[${agentType} Agent] GLM API error`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      }, 'agents');
      
      let errorMessage = 'GLM API error';
      if (response.status === 401) {
        errorMessage = 'GLM API authentication failed. Please check API key.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (response.status >= 500) {
        errorMessage = 'GLM API service error. Please try again later.';
      }
      
      res.status(500).json({ 
        error: errorMessage, 
        details: process.env.NODE_ENV === 'development' ? errorText : undefined 
      });
      return;
    }

    let glmData: any;
    try {
      glmData = await response.json();
    } catch (jsonError: any) {
      logger.error(`[${agentType} Agent] JSON parse error`, jsonError, 'agents');
      const errorText = await response.text().catch(() => 'Unable to read error response');
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an invalid response. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
      return;
    }

    // Validate response structure
    if (!glmData) {
      logger.error(`[${agentType} Agent] No response data`, { status: response.status, statusText: response.statusText }, 'agents');
      res.status(500).json({ 
        error: 'No response from AI service',
        message: 'The AI service did not return any data. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 'Response was null or undefined' : undefined
      });
      return;
    }

    if (!glmData.choices || !Array.isArray(glmData.choices) || glmData.choices.length === 0) {
      logger.error(`[${agentType} Agent] Invalid response structure`, { 
        hasChoices: !!glmData.choices,
        choicesType: typeof glmData.choices,
        choicesLength: Array.isArray(glmData.choices) ? glmData.choices.length : 'not an array',
        responseKeys: Object.keys(glmData),
        fullResponse: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData).substring(0, 500) : undefined
      }, 'agents');
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an unexpected response format. Please try again.',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData) : undefined
      });
      return;
    }

    // Extract response content - handle different response formats
    const firstChoice = glmData.choices[0];
    const result = firstChoice?.message?.content || 
                   firstChoice?.content || 
                   firstChoice?.text ||
                   (typeof firstChoice === 'string' ? firstChoice : null) ||
                   'No output generated';
    
    if (!result || result === 'No output generated' || (typeof result === 'string' && result.trim().length === 0)) {
      logger.error(`[${agentType} Agent] Empty response from GLM API`, {
        firstChoice,
        hasMessage: !!firstChoice?.message,
        messageContent: firstChoice?.message?.content,
        fullResponse: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData).substring(0, 1000) : undefined
      }, 'agents');
      res.status(500).json({ 
        error: 'Empty response from AI service',
        message: 'The AI service did not generate any content. Please try again.',
        details: process.env.NODE_ENV === 'development' ? 'Response structure: ' + JSON.stringify(firstChoice).substring(0, 200) : undefined
      });
      return;
    }

    // Build output content based on agent type
    switch (agentType) {
      case 'summarize':
        outputContent = {
          summary: result,
          summaryType: params.summaryType || 'detailed',
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'search_qa':
        outputContent = {
          question: params.question,
          answer: result,
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'cross_reference':
        outputContent = {
          verseReference: params.verseReference,
          theme: params.theme,
          crossReferences: result,
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'curriculum':
        outputContent = {
          topic: params.topic,
          duration: params.duration,
          audience: params.audience,
          curriculum: result,
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'sermon':
        outputContent = {
          scriptureReference: params.scriptureReference,
          sermonType: params.sermonType || 'expository',
          sermon: result,
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'doctrinal':
        outputContent = {
          doctrinalQuestion: params.doctrinalQuestion,
          includePerspectives: params.includePerspectives !== false,
          harmonization: result,
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'translate':
        outputContent = {
          originalText: params.textToTranslate,
          targetLanguage: params.targetLanguage || 'en',
          translation: result,
          translationType: params.format || 'document',
          sourceIds: selectedSources.map(s => s.id),
          sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
    }

    // Save to database with status tracking
    let savedOutput: any = null;
    let saveError: any = null;
    
    try {
      // First, try to find existing output
      const { data: existingOutput, error: findError } = await supabase
        .from('research_studio_outputs')
        .select('id')
        .eq('notebook_id', notebookId)
        .eq('user_id', userId)
        .eq('output_type', outputType)
        .maybeSingle(); // Use maybeSingle() to avoid error when no row found

      // If find error is not a "not found" error, log it but continue
      if (findError && findError.code !== 'PGRST116') {
        logger.warn(`[${agentType} Agent] Error finding existing output (will try insert)`, findError.message, 'agents');
      }

      if (existingOutput && !findError) {
        // Update existing output
        logger.log(`[${agentType} Agent] Updating existing output: ${existingOutput.id}`, undefined, 'agents');
        
        // Ensure content is valid JSON (Supabase expects JSONB)
        let contentToSave = outputContent;
        if (typeof outputContent !== 'object') {
          contentToSave = { text: String(outputContent) };
        }
        
        // Build update data - only include metadata if column exists
        const updateData: any = {
          content: contentToSave, // Ensure it's a valid object for JSONB
          updated_at: new Date().toISOString(),
        };
        
        // Try to include metadata (will fail gracefully if column doesn't exist)
        try {
          updateData.metadata = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            agentType: agentType,
            format: params.format || 'detailed',
            language: params.language || 'en',
          };
        } catch (e) {
          // Metadata column might not exist, continue without it
          logger.warn(`[${agentType} Agent] Could not add metadata`, e, 'agents');
        }
        
        const updateResult = await supabase
          .from('research_studio_outputs')
          .update(updateData)
          .eq('id', existingOutput.id)
          .select()
          .single();
        
        savedOutput = updateResult.data;
        saveError = updateResult.error;
        
        if (saveError) {
          logger.error(`[${agentType} Agent] Update error`, {
            error: saveError,
            code: saveError.code,
            message: saveError.message,
            details: saveError.details,
            hint: saveError.hint,
          }, 'agents');
        } else {
          logger.log(`[${agentType} Agent] Output updated successfully: ${savedOutput?.id}`, undefined, 'agents');
        }
      } else {
        // Insert new output
        logger.log(`[${agentType} Agent] Creating new output`, undefined, 'agents');
        
        // Ensure content is valid JSON (Supabase expects JSONB)
        let contentToSave = outputContent;
        if (typeof outputContent !== 'object') {
          contentToSave = { text: String(outputContent) };
        }
        
        // Build insert data - only include metadata if column exists
        const insertData: any = {
          notebook_id: notebookId,
          user_id: userId,
          output_type: outputType as any,
          content: contentToSave, // Ensure it's a valid object for JSONB
        };
        
        // Try to include metadata (will fail gracefully if column doesn't exist)
        try {
          insertData.metadata = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            agentType: agentType,
            format: params.format || 'detailed',
            language: params.language || 'en',
          };
        } catch (e) {
          // Metadata column might not exist, continue without it
          logger.warn(`[${agentType} Agent] Could not add metadata`, e, 'agents');
        }
        
        const insertResult = await supabase
          .from('research_studio_outputs')
          .insert(insertData)
          .select()
          .single();

        savedOutput = insertResult.data;
        saveError = insertResult.error;

        if (saveError) {
          logger.error(`[${agentType} Agent] Insert error`, {
            error: saveError,
            code: saveError.code,
            message: saveError.message,
            details: saveError.details,
            hint: saveError.hint,
            outputType,
            notebookId,
            userId,
          }, 'agents');

          // Check for specific error types
          if (saveError.code === '23505') { // Unique violation - try update instead
            logger.warn(`[${agentType} Agent] Unique constraint violation, attempting update...`, undefined, 'agents');
            // Ensure content is valid JSON (Supabase expects JSONB)
            let contentToSave = outputContent;
            if (typeof outputContent !== 'object') {
              contentToSave = { text: String(outputContent) };
            }
            
            // Build update data - only include metadata if column exists
            const updateData: any = {
              content: contentToSave, // Ensure it's a valid object for JSONB
              updated_at: new Date().toISOString(),
            };
            
            // Try to include metadata (will fail gracefully if column doesn't exist)
            try {
              updateData.metadata = {
                status: 'completed',
                completedAt: new Date().toISOString(),
                agentType: agentType,
                format: params.format || 'detailed',
                language: params.language || 'en',
              };
            } catch (e) {
              // Metadata column might not exist, continue without it
              logger.warn(`[${agentType} Agent] Could not add metadata`, e, 'agents');
            }
            
            const updateResult = await supabase
              .from('research_studio_outputs')
              .update(updateData)
              .eq('notebook_id', notebookId)
              .eq('user_id', userId)
              .eq('output_type', outputType)
              .select()
              .single();
            
            if (updateResult.error) {
              logger.error(`[${agentType} Agent] Update also failed`, updateResult.error, 'agents');
              saveError = updateResult.error;
            } else {
              savedOutput = updateResult.data;
              saveError = null;
              logger.log(`[${agentType} Agent] Output updated successfully after conflict: ${savedOutput?.id}`, undefined, 'agents');
            }
          } else if (saveError.code === '42501' || saveError.message?.includes('permission denied') || saveError.message?.includes('row-level security')) {
            // RLS error - log but don't fail the request
            logger.error(`[${agentType} Agent] RLS permission error`, saveError, 'agents');
            saveError = {
              ...saveError,
              code: 'RLS_ERROR',
              message: 'Permission denied. Please check Row Level Security policies.',
            };
          } else if (saveError.code === 'PGRST116' || saveError.message?.includes('does not exist')) {
            // Table doesn't exist
            res.status(500).json({
              error: 'Database setup required',
              message: 'The research_studio_outputs table does not exist. Please run the migration SQL file in Supabase Dashboard.',
              hint: 'Go to Supabase Dashboard → SQL Editor → Run the migration from supabase/migrations/20241118000002_update_studio_outputs_for_agents.sql'
            });
            return;
          }
        } else {
          logger.log(`[${agentType} Agent] Output saved successfully: ${savedOutput?.id}`, undefined, 'agents');
        }
      }
    } catch (saveException: any) {
      logger.error(`[${agentType} Agent] Save exception`, saveException, 'agents');
      saveError = saveException;
    }

    // If save failed critically, return error (but still log the generated content)
    if (saveError && saveError.code !== '23505') {
      // Only fail if it's not a unique constraint violation (we tried to handle that above)
      logger.error(`[${agentType} Agent] Critical save error, but returning generated content`, saveError, 'agents');
    }

    // Return response based on agent type
    const responseData: any = {
      success: true,
      status: 'completed',
      sourcesUsed: selectedSources.map(s => ({ id: s.id, title: s.title })),
      outputId: savedOutput?.id || null,
    };

    // Add warning if save failed but content was generated
    if (saveError && !savedOutput) {
      logger.error(`[${agentType} Agent] Save failed - detailed error`, {
        error: saveError,
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        notebookId,
        userId,
        outputType,
        hasAuthToken: !!authToken,
        authTokenLength: authToken?.length || 0,
        outputContentKeys: outputContent ? Object.keys(outputContent) : [],
        outputContentSize: outputContent ? JSON.stringify(outputContent).length : 0,
      }, 'agents');
      
      responseData.warning = 'Content generated but failed to save to database. Please try again.';
      responseData.saveError = process.env.NODE_ENV === 'development' ? saveError.message : undefined;
      responseData.errorCode = saveError.code;
      responseData.errorHint = saveError.hint || saveError.details;
    }

    switch (agentType) {
      case 'summarize':
        responseData.summary = result;
        break;
      case 'search_qa':
        responseData.question = params.question;
        responseData.answer = result;
        break;
      case 'cross_reference':
        responseData.verseReference = params.verseReference;
        responseData.theme = params.theme;
        responseData.crossReferences = result;
        break;
      case 'curriculum':
        responseData.topic = params.topic;
        responseData.curriculum = result;
        break;
      case 'sermon':
        responseData.scriptureReference = params.scriptureReference;
        responseData.sermonType = params.sermonType || 'expository';
        responseData.sermon = result;
        break;
      case 'doctrinal':
        responseData.doctrinalQuestion = params.doctrinalQuestion;
        responseData.harmonization = result;
        break;
      case 'translate':
        responseData.originalText = params.textToTranslate;
        responseData.targetLanguage = params.targetLanguage || 'en';
        responseData.translation = result;
        responseData.translationType = params.format || 'document';
        break;
    }

    // Track successful execution for analytics
    const executionTime = Date.now() - startTime;
    logger.log(`[${agentType} Agent] Execution completed in ${executionTime}ms`, undefined, 'agents');

    res.status(200).json(responseData);
    return;

  } catch (error: any) {
    // Track failed execution for analytics
    const executionTime = Date.now() - startTime;
    logger.error(`[Agent API] Execution failed after ${executionTime}ms`, error.message, 'agents');
    logger.error('[Agent API] Error', error, 'agents');
    logger.error('[Agent API] Error stack', error.stack, 'agents');
    logger.debug('[Agent API] Request body', req.body, 'agents');
    
    // Provide more detailed error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message?.includes('GLM API key')) {
      errorMessage = 'GLM API key not configured. Please set GLM_API_KEY environment variable.';
      statusCode = 500;
    } else if (error.message?.includes('Supabase')) {
      errorMessage = 'Database connection error. Please try again.';
      statusCode = 500;
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorMessage = 'Failed to connect to AI service. Please try again.';
      statusCode = 503;
    } else {
      errorMessage = error.message || 'Internal server error';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage, 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
    return;
  }
}

