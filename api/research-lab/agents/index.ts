// Unified Research Lab AI Agents API
// Handles all 6 AI agents in a single endpoint to stay within Vercel function limits

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getCachedSources } from '../cache';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
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
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
}

const BIBLE_SYSTEM_PROMPTS = {
  summarize: `You are a Bible research assistant. You MUST ONLY respond to Bible, theology, and Christian content. Reject non-Bible questions. Analyze the provided sources and create comprehensive summaries and synthesis. Always cite sources.`,
  search_qa: `You are a Bible Q&A assistant. You MUST ONLY answer questions about the Bible, theology, and Christianity. Reject non-Bible questions. Answer based ONLY on the provided sources. Always cite specific sources and verses.`,
  cross_reference: `You are a Bible cross-reference assistant. You MUST ONLY work with Bible verses and theological connections. Find related Bible verses, thematic connections, and parallel passages. Always cite specific verse references.`,
  curriculum: `You are a Bible curriculum builder. You MUST ONLY create Bible study plans, curricula, and devotional reading plans. Create structured, Bible-focused study materials with clear objectives, verses, and discussion questions.`,
  sermon: `You are a sermon preparation assistant. You MUST ONLY help with Bible-based sermons. Create sermon outlines, illustrations, applications, and supporting verses. All content must be Bible-focused and theologically sound.`,
  doctrinal: `You are a doctrinal harmonization assistant. You MUST ONLY work with Bible doctrine and theology. Help reconcile difficult passages, present multiple theological perspectives, and harmonize doctrine. All content must be Bible-based and theologically sound.`,
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

  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { agentType, notebookId, ...params } = req.body;

    if (!agentType || !notebookId) {
      res.status(400).json({ error: 'agentType and notebookId are required' });
      return;
    }

    const validAgentTypes = ['summarize', 'search_qa', 'cross_reference', 'curriculum', 'sermon', 'doctrinal'];
    if (!validAgentTypes.includes(agentType)) {
      res.status(400).json({ error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` });
      return;
    }

    const supabase = getSupabaseClient();

    // Get notebook sources with caching and optimized field selection
    const fields = ['id', 'title', 'processed_content', 'source_type', 'extracted_verses'];
    const { data: sources, error: sourcesError } = await getCachedSources(
      notebookId,
      userId,
      fields,
      params.sourceIds && Array.isArray(params.sourceIds) && params.sourceIds.length > 0 
        ? params.sourceIds 
        : undefined
    );

    if (sourcesError) {
      console.error(`[${agentType} Agent] Sources error:`, {
        error: sourcesError,
        context: 'fetch_sources',
        notebookId,
        userId,
        agentType,
        code: sourcesError.code,
        message: sourcesError.message,
        details: sourcesError.details,
        hint: sourcesError.hint
      });

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
      res.status(400).json({ error: 'No sources found in notebook' });
      return;
    }

    // Build source content (use processed_content only, no 'content' field)
    const sourceTexts = sources
      .map(s => {
        const content = String(s.processed_content || '');
        if (agentType === 'cross_reference') {
          const verses = s.extracted_verses ? JSON.stringify(s.extracted_verses) : 'None found';
          return `[Source: ${s.title}]\nContent: ${content.substring(0, 8000)}\nVerses mentioned: ${verses}`;
        }
        return `[Source: ${s.title}]\n${content.substring(0, 10000)}`;
      })
      .join('\n\n---\n\n');

    // Call GLM-4.5-Air API
    const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
    if (!glmApiKey || glmApiKey.trim() === '') {
      console.error('[Agent API] GLM_API_KEY not configured');
      console.error('[Agent API] Environment check:', {
        hasGLMKey: !!process.env.GLM_API_KEY,
        hasViteGLMKey: !!process.env.VITE_GLM_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      });
      res.status(500).json({ 
        error: 'GLM API key not configured',
        message: 'Please set GLM_API_KEY in Vercel environment variables. Go to Vercel Dashboard → Settings → Environment Variables → Add GLM_API_KEY.'
      });
      return;
    }

    // Build prompt based on agent type
    let userPrompt = '';
    let outputType: string;
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
        const verseReference = params.verseReference;
        const theme = params.theme;
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
        const topic = params.topic;
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
        const scriptureReference = params.scriptureReference;
        const sermonType = params.sermonType || 'expository';
        const scriptureContext = scriptureReference ? ` for ${scriptureReference}` : '';
        userPrompt = `Create a ${sermonType} sermon outline${scriptureContext} using these sources:

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
        const doctrinalQuestion = params.doctrinalQuestion;
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
    }

    // Log API call details (without sensitive data)
    console.log(`[${agentType} Agent] Calling GLM API:`, {
      url: `${GLM_API_BASE_URL}/chat/completions`,
      model: GLM_MODEL,
      hasApiKey: !!glmApiKey,
      apiKeyLength: glmApiKey?.length || 0,
      promptLength: userPrompt.length,
      sourceCount: sources.length,
    });

    // Fetch with timeout and retry logic
    const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for agents (longer than chat)

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`[${agentType} Agent] Retry attempt ${attempt}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000)); // Exponential backoff
          }

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return response;
          }

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            return response;
          }

          // Retry on 5xx errors or network errors
          if (attempt === maxRetries) {
            return response;
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timeout: AI service took too long to respond');
          }

          if (attempt === maxRetries) {
            throw error;
          }
        }
      }

      throw new Error('Failed to fetch after retries');
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
      console.error(`[${agentType} Agent] Fetch error:`, fetchError);
      res.status(503).json({ 
        error: 'Failed to connect to AI service',
        message: fetchError.message || 'Network error. Please check your connection and try again.',
        details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
      });
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${agentType} Agent] GLM API error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
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
      console.error(`[${agentType} Agent] JSON parse error:`, jsonError);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an invalid response. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorText : undefined
      });
      return;
    }

    // Validate response structure
    if (!glmData || !glmData.choices || !Array.isArray(glmData.choices) || glmData.choices.length === 0) {
      console.error(`[${agentType} Agent] Invalid response structure:`, glmData);
      res.status(500).json({ 
        error: 'Invalid response from AI service',
        message: 'The AI service returned an unexpected response format. Please try again.',
        details: process.env.NODE_ENV === 'development' ? JSON.stringify(glmData) : undefined
      });
      return;
    }

    const result = glmData.choices[0]?.message?.content || 'No output generated';
    
    if (!result || result === 'No output generated') {
      console.warn(`[${agentType} Agent] Empty response from GLM API`);
      res.status(500).json({ 
        error: 'Empty response from AI service',
        message: 'The AI service did not generate any content. Please try again.',
      });
      return;
    }

    // Build output content based on agent type
    switch (agentType) {
      case 'summarize':
        outputContent = {
          summary: result,
          summaryType: params.summaryType || 'detailed',
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'search_qa':
        outputContent = {
          question: params.question,
          answer: result,
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'cross_reference':
        outputContent = {
          verseReference: params.verseReference,
          theme: params.theme,
          crossReferences: result,
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'curriculum':
        outputContent = {
          topic: params.topic,
          duration: params.duration,
          audience: params.audience,
          curriculum: result,
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'sermon':
        outputContent = {
          scriptureReference: params.scriptureReference,
          sermonType: params.sermonType || 'expository',
          sermon: result,
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
      case 'doctrinal':
        outputContent = {
          doctrinalQuestion: params.doctrinalQuestion,
          includePerspectives: params.includePerspectives !== false,
          harmonization: result,
          sourceIds: sources.map(s => s.id),
          sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
          generatedAt: new Date().toISOString(),
        };
        break;
    }

    // Save to database with status tracking
    const { data: savedOutput, error: saveError } = await supabase
      .from('research_studio_outputs')
      .upsert({
        notebook_id: notebookId,
        user_id: userId,
        output_type: outputType as any,
        content: outputContent,
        metadata: {
          status: 'completed',
          completedAt: new Date().toISOString(),
          agentType: agentType,
        },
      }, {
        onConflict: 'notebook_id,output_type',
      })
      .select()
      .single();

    if (saveError) {
      console.error(`[${agentType} Agent] Save error:`, saveError);
      // Continue even if save fails - still return the result
    } else {
      console.log(`[${agentType} Agent] Output saved successfully:`, savedOutput?.id);
    }

    // Return response based on agent type
    const responseData: any = {
      success: true,
      status: 'completed',
      sourcesUsed: sources.map(s => ({ id: s.id, title: s.title })),
      outputId: savedOutput?.id || null,
    };

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
    }

    res.status(200).json(responseData);
    return;

  } catch (error: any) {
    console.error('[Agent API] Error:', error);
    console.error('[Agent API] Error stack:', error.stack);
    console.error('[Agent API] Request body:', req.body);
    
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

