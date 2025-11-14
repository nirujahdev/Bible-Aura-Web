// Feedback API - Store user feedback for AI responses
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Feedback] Supabase credentials not configured');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  try {
    const { messageId, feedback, message, response, userId, reportReason } = req.body;

    if (!messageId || !feedback || !['positive', 'negative'].includes(feedback)) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'messageId and feedback (positive/negative) are required'
      });
      return;
    }

    // Store feedback in Supabase
    const supabase = getSupabaseClient();
    
    if (supabase) {
      try {
        const feedbackData: any = {
          message_id: messageId,
          feedback: feedback,
          message: message || null,
          response: response || null,
          user_id: userId || null,
          created_at: new Date().toISOString()
        };

        // Add report reason if provided
        if (reportReason && reportReason.trim()) {
          feedbackData.report_reason = reportReason.trim();
        }

        const { error: insertError } = await supabase
          .from('ai_feedback')
          .insert(feedbackData);

        if (insertError) {
          console.error('[Feedback] Supabase insert error:', insertError);
          // Continue to return success even if DB insert fails (graceful degradation)
        } else {
          console.log('[Feedback] Successfully saved to Supabase:', { 
            messageId, 
            feedback, 
            hasReportReason: !!reportReason 
          });
        }
      } catch (dbError: any) {
        console.error('[Feedback] Database error:', dbError.message);
        // Continue to return success even if DB insert fails (graceful degradation)
      }
    } else {
      // Log feedback if Supabase is not configured
      console.log('[Feedback] Supabase not configured, logging only:', {
        messageId,
        feedback,
        message: message?.substring(0, 100),
        response: response?.substring(0, 100),
        hasReportReason: !!reportReason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback recorded'
    });

  } catch (error: any) {
    console.error('[Feedback] Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to record feedback'
    });
  }
}

