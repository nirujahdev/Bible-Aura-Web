// Media Transcription Utilities for Research Lab
// Transcribes audio and video files using OpenAI Whisper API

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const WHISPER_MODEL = 'whisper-1';

/**
 * Supported audio/video MIME types
 */
const SUPPORTED_MEDIA_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/aac',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo', // AVI
];

/**
 * Check if MIME type is a supported media format
 */
export function isSupportedMediaType(mimeType: string): boolean {
  return SUPPORTED_MEDIA_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Transcribe audio or video file using OpenAI Whisper API
 */
export async function transcribeMedia(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Validate media type
    if (!isSupportedMediaType(mimeType)) {
      throw new Error(`Unsupported media type: ${mimeType}. Supported types: MP3, WAV, MP4, WebM, OGG, M4A, AAC, AVI`);
    }

    // Check file size (Whisper API has 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (buffer.length > maxSize) {
      throw new Error(`Media file too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum size is 25MB.`);
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    // Create FormData for multipart/form-data request
    // In Node.js, we need to use form-data package
    const FormDataModule = await import('form-data');
    // @ts-expect-error - form-data module structure varies, handle both default and named exports
    const FormDataClass = (FormDataModule.default || FormDataModule) as any;
    const formData = new FormDataClass();
    
    // Append file as buffer with proper metadata
    formData.append('file', buffer, {
      filename: 'media-file',
      contentType: mimeType,
    });
    formData.append('model', WHISPER_MODEL);
    formData.append('language', 'en'); // Default to English, can be made configurable

    // Call OpenAI Whisper API
    const response = await fetch(`${OPENAI_API_BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...(formData.getHeaders ? formData.getHeaders() : {}), // Get proper headers for multipart/form-data
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      if (response.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      }
      if (response.status === 413) {
        throw new Error('File too large for transcription. Maximum size is 25MB.');
      }
      
      throw new Error(`Transcription failed: ${errorMessage}`);
    }

    const data = await response.json();
    const transcript = data.text || '';

    if (!transcript || transcript.trim().length === 0) {
      throw new Error('No transcript generated. The audio may be silent or unclear.');
    }

    // Clean and format transcript
    let cleanedTranscript = transcript
      .replace(/\s+/g, ' ') // Replace multiple spaces
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
      .trim();

    // Optionally use GLM-4.5-Air to structure long transcripts
    if (cleanedTranscript.length > 2000) {
      cleanedTranscript = await structureTranscriptWithGLM(cleanedTranscript);
    }

    return cleanedTranscript;
  } catch (error: any) {
    if (error.message?.includes('API key')) {
      throw error;
    }
    if (error.message?.includes('too large')) {
      throw error;
    }
    throw new Error(`Failed to transcribe media: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Structure transcript using GLM-4.5-Air
 */
async function structureTranscriptWithGLM(transcript: string): Promise<string> {
  const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
  
  if (!glmApiKey || glmApiKey.trim() === '') {
    // If no GLM key, return transcript as-is
    return transcript;
  }

  try {
    // Truncate if too long (keep first 30k chars for processing)
    const truncatedTranscript = transcript.length > 30000 
      ? transcript.substring(0, 30000) + '\n\n[Transcript truncated...]'
      : transcript;

    const prompt = `Please structure and format this audio/video transcript. 
Add proper punctuation, paragraph breaks, and organize the content for better readability.

Transcript:
${truncatedTranscript}

Please provide:
1. Well-formatted transcript with proper punctuation
2. Logical paragraph breaks
3. Key topics and sections if applicable
4. Preserve all spoken content`;

    const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [
          {
            role: 'system',
            content: 'You are a transcript formatting assistant. Structure and format audio/video transcripts with proper punctuation, paragraph breaks, and organization while preserving all spoken content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const structured = data.choices?.[0]?.message?.content || data.choices?.[0]?.content;
      if (structured && structured.trim().length > 100) {
        return structured;
      }
    }
  } catch (error) {
    console.error('[Media Transcriber] GLM structuring failed:', error);
    // Fallback to original transcript
  }

  // Fallback: return original transcript
  return transcript;
}

