// Source Processing API Endpoint
// Extracts text content from uploaded files and updates source records

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { extractTextFromFile, cleanExtractedText } from '../../src/lib/research-lab/file-extractors.js';
import { extractLinkContent, isYouTubeUrl } from '../../src/lib/research-lab/link-extractors.js';
import { extractYouTubeContent } from '../../src/lib/research-lab/youtube-extractor.js';
import { transcribeMedia } from '../../src/lib/research-lab/media-transcriber.js';
import { indexSource } from '../../src/lib/research-lab/vector-operations.js';
import type { Source } from '../../src/lib/research-lab/db-operations.js';
import logger from '../../src/lib/research-lab/logger.js';
import { EnhancedRateLimiter } from '../../src/lib/enhancedRateLimiter.js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(authToken?: string) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  // If auth token provided, create authenticated client for RLS
  if (authToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  
  // Otherwise use shared client
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

// Rate limiter for process-source API (10 requests per minute per user)
const processRateLimiter = new EnhancedRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  burstLimit: 3,
  errorMessage: 'Rate limit exceeded. Please wait a moment before retrying source processing.'
});

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

    // Check rate limit
    const rateLimitResult = processRateLimiter.checkLimit(userId, 'process-source');
    if (!rateLimitResult.allowed) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: rateLimitResult.errorMessage || 'Too many requests. Please wait a moment.',
        retryAfter: Math.ceil((rateLimitResult.retryAfterMs || 0) / 1000),
      });
      res.setHeader('Retry-After', Math.ceil((rateLimitResult.retryAfterMs || 60000) / 1000));
      return;
    }

    const { sourceId, notebookId } = req.body;

    if (!sourceId || !notebookId) {
      res.status(400).json({ error: 'sourceId and notebookId are required' });
      return;
    }

    const supabase = getSupabaseClient(req.headers.authorization?.replace('Bearer ', ''));

    // Get source record
    const { data: source, error: sourceError } = await supabase
      .from('research_sources')
      .select('id, notebook_id, user_id, source_type, title, file_path, file_url, link_url, mime_type, processing_status, content_text, processed_content')
      .eq('id', sourceId)
      .eq('user_id', userId)
      .eq('notebook_id', notebookId)
      .single();

    if (sourceError || !source) {
      res.status(403).json({ error: 'Source not found or access denied' });
      return;
    }

    // Check if source already has content (link/text sources that were manually added)
    if (source.content_text && source.content_text.trim().length > 0 && source.source_type !== 'link') {
      // Content already exists, just trigger indexing if not already indexed
      if (source.processed_content && source.processed_content.trim().length > 0) {
        // Already processed, trigger indexing
        try {
          const { vectorCount, error: indexError } = await indexSource(
            source as Source,
            notebookId,
            source.processed_content
          );

          if (!indexError) {
            await supabase
              .from('research_sources')
              .update({ 
                indexing_status: 'completed',
                indexed_at: new Date().toISOString(),
                vector_count: vectorCount,
              })
              .eq('id', sourceId);
          }
        } catch (err) {
          logger.error('[Process Source API] Indexing error', err, 'process-source');
        }
      }

      res.status(200).json({
        success: true,
        message: 'Source already has content',
        extracted: false,
      });
      return;
    }

    // Determine extraction method based on source type
    const isLinkSource = source.source_type === 'link' || source.link_url;
    const isYouTubeSource = isLinkSource && source.link_url && isYouTubeUrl(source.link_url);
    const isMediaSource = source.source_type === 'video' || source.source_type === 'audio' || 
                         (source.mime_type && (source.mime_type.startsWith('video/') || source.mime_type.startsWith('audio/')));
    const isFileSource = source.file_path && !isLinkSource && !isMediaSource;

    // Check if this is a retry (source already has processing_status = 'failed')
    const isRetry = source.processing_status === 'failed';
    const maxRetries = 3;
    let retryAttempt = 0;
    let lastError: any = null;

    // Update processing status to 'processing'
    await supabase
      .from('research_sources')
      .update({ processing_status: 'processing' })
      .eq('id', sourceId);

    // Retry logic with exponential backoff
    while (retryAttempt <= maxRetries) {
      try {
        let extractedText = '';
        let cleanedText = '';

        // Route to appropriate extractor based on source type
        if (isYouTubeSource && source.link_url) {
          // Extract from YouTube
          extractedText = await extractYouTubeContent(source.link_url);
          cleanedText = extractedText.trim();
        } else if (isLinkSource && source.link_url) {
          // Extract from web URL
          extractedText = await extractLinkContent(source.link_url);
          cleanedText = extractedText.trim();
        } else if (isMediaSource && source.file_path && source.mime_type) {
          // Transcribe audio/video
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('research-lab-sources')
            .download(source.file_path);

          if (downloadError || !fileData) {
            throw new Error(`Failed to download media file: ${downloadError?.message || 'Unknown error'}`);
          }

          // Convert blob to buffer
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          extractedText = await transcribeMedia(buffer, source.mime_type);
          cleanedText = extractedText.trim();
        } else if (isFileSource && source.file_path) {
          // Download file from Supabase storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('research-lab-sources')
            .download(source.file_path);

          if (downloadError || !fileData) {
            throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
          }

          // Convert blob to buffer
          const arrayBuffer = await fileData.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Extract text from file
          extractedText = await extractTextFromFile(
            buffer,
            source.source_type,
            source.mime_type || undefined
          );

          // Clean and normalize text
          cleanedText = cleanExtractedText(extractedText);
        } else {
          throw new Error('Source type not supported or missing required fields (file_path or link_url)');
        }

        if (!cleanedText || cleanedText.trim().length === 0) {
          throw new Error('Extracted text is empty. The file may be corrupted or unsupported.');
        }

        // Update source record with extracted content
        const { error: updateError } = await supabase
          .from('research_sources')
          .update({
            content_text: cleanedText,
            processed_content: cleanedText,
            processing_status: 'completed',
          })
          .eq('id', sourceId);

        if (updateError) {
          throw new Error(`Failed to update source: ${updateError.message}`);
        }

        // Automatically trigger indexing
        try {
          const { vectorCount, error: indexError } = await indexSource(
            source as Source,
            notebookId,
            cleanedText
          );

          if (!indexError) {
            await supabase
              .from('research_sources')
              .update({ 
                indexing_status: 'completed',
                indexed_at: new Date().toISOString(),
                vector_count: vectorCount,
              })
              .eq('id', sourceId);
          } else {
            logger.warn('[Process Source API] Indexing failed but extraction succeeded', indexError, 'process-source');
            // Don't fail the whole request if indexing fails - extraction succeeded
          }
        } catch (indexErr: any) {
          logger.error('[Process Source API] Indexing error', indexErr, 'process-source');
          // Don't fail the whole request if indexing fails - extraction succeeded
        }

        res.status(200).json({
          success: true,
          sourceId: sourceId,
          message: `Successfully extracted and processed ${cleanedText.length} characters${isRetry ? ' (retry succeeded)' : ''}`,
          textLength: cleanedText.length,
          retryAttempt: retryAttempt > 0 ? retryAttempt : undefined,
        });
        return;

      } catch (error: any) {
        lastError = error;
        
        // If we've exhausted retries, break and handle failure
        if (retryAttempt >= maxRetries) {
          break;
        }
        
        // Check if error is retryable (network errors, timeouts)
        const isRetryable = 
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.message?.includes('ECONNREFUSED') ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ECONNREFUSED';

        if (isRetryable) {
          retryAttempt++;
          // Exponential backoff: 1s, 2s, 4s
          const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempt - 1), 4000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue; // Retry
        } else {
          // Non-retryable error (e.g., unsupported file type, corrupted file)
          break;
        }
      }
    }

    // All retries failed
    logger.error('[Process Source API] Processing error after retries', lastError, 'process-source');
    
    // Update processing status to 'failed'
    await supabase
      .from('research_sources')
      .update({ processing_status: 'failed' })
      .eq('id', sourceId);
    
    res.status(500).json({ 
      error: 'Failed to process source',
      message: lastError?.message || 'File processing failed after retries',
      details: process.env.NODE_ENV === 'development' ? lastError?.message : undefined,
      retryAttempt: retryAttempt,
    });
    return;

  } catch (error: any) {
    logger.error('[Process Source API] Error', error, 'process-source');
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to process source',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

