// Feedback API - Store user feedback for AI responses
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_ALLOWED_ORIGIN =
  process.env.CHATKIT_ALLOWED_ORIGIN ??
  process.env.VITE_APP_URL ??
  'https://www.bibleaura.xyz';

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
    const { messageId, feedback, message, response } = req.body;

    if (!messageId || !feedback || !['positive', 'negative'].includes(feedback)) {
      res.status(400).json({
        error: 'Invalid request',
        message: 'messageId and feedback (positive/negative) are required'
      });
      return;
    }

    // Store feedback in database (or log for now)
    // In production, use Supabase or another database
    console.log('[Feedback]', {
      messageId,
      feedback,
      message: message?.substring(0, 100),
      response: response?.substring(0, 100)
    });

    // TODO: Store in database
    // await supabase.from('ai_feedback').insert({
    //   message_id: messageId,
    //   feedback,
    //   message,
    //   response,
    //   created_at: new Date().toISOString()
    // });

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

