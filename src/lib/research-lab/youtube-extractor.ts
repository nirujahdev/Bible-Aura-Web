// YouTube Content Extraction Utilities for Research Lab
// Extracts transcripts and metadata from YouTube videos

import { YoutubeTranscript } from 'youtube-transcript';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})/i,
    /youtube\.com\/watch\?.*v=([^"&?\/\s]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract content from YouTube video (transcript + metadata)
 */
export async function extractYouTubeContent(videoUrl: string): Promise<string> {
  try {
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL: Could not extract video ID');
    }

    // Fetch transcript
    let transcript = '';
    let transcriptItems: Array<{ text: string; offset: number; duration: number }> = [];

    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcriptItems && transcriptItems.length > 0) {
        // Combine transcript items into readable text
        transcript = transcriptItems
          .map(item => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } catch (transcriptError: any) {
      // Transcript might not be available (disabled, no captions, etc.)
      console.warn('[YouTube Extractor] Transcript not available:', transcriptError.message);
      // Continue with metadata only
    }

    // Try to get video metadata (title, description) from the page
    let title = '';
    let description = '';

    try {
      const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: AbortSignal.timeout(15000), // 15 seconds
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract title from meta tags or page title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].replace(/\s*-\s*YouTube\s*$/i, '').trim();
        }

        // Extract description from meta tag
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }
    } catch (metadataError) {
      console.warn('[YouTube Extractor] Failed to fetch metadata:', metadataError);
      // Continue without metadata
    }

    // Combine all content
    const parts: string[] = [];

    if (title) {
      parts.push(`Title: ${title}`);
    }

    if (description) {
      parts.push(`Description: ${description}`);
    }

    if (transcript) {
      parts.push(`Transcript:\n${transcript}`);
    } else {
      parts.push('Note: Transcript not available for this video. The video may not have captions enabled.');
    }

    let content = parts.join('\n\n');

    // If we have transcript, use GLM-4.5-Air to clean and structure it
    if (transcript && transcript.length > 500) {
      content = await structureTranscriptWithGLM(title, description, transcript);
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Could not extract any content from YouTube video');
    }

    return content;
  } catch (error: any) {
    if (error.message?.includes('Transcript not available') || error.message?.includes('captions')) {
      throw new Error('Video transcript not available. The video may not have captions enabled.');
    }
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('Request timeout: YouTube took too long to respond');
    }
    throw new Error(`Failed to extract YouTube content: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Structure and clean transcript using GLM-4.5-Air
 */
async function structureTranscriptWithGLM(
  title: string,
  description: string,
  transcript: string
): Promise<string> {
  const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
  
  if (!glmApiKey || glmApiKey.trim() === '') {
    // If no GLM key, return formatted content as-is
    const parts: string[] = [];
    if (title) parts.push(`Title: ${title}`);
    if (description) parts.push(`Description: ${description}`);
    parts.push(`Transcript:\n${transcript}`);
    return parts.join('\n\n');
  }

  try {
    // Truncate transcript if too long (keep first 50k chars)
    const truncatedTranscript = transcript.length > 50000 
      ? transcript.substring(0, 50000) + '\n\n[Transcript truncated...]'
      : transcript;

    const prompt = `Please structure and clean this YouTube video transcript. 
${title ? `Video Title: ${title}` : ''}
${description ? `Description: ${description}` : ''}

Transcript:
${truncatedTranscript}

Please provide:
1. A clean, well-formatted transcript with proper punctuation and paragraph breaks
2. Key topics and themes discussed
3. Important quotes or highlights
4. Summary of main points

Format the output clearly with sections.`;

    const response = await fetch(`${GLM_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${glmApiKey}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a content structuring assistant. Clean and organize transcripts, extract key information, and format content for easy reading and research.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
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
    console.error('[YouTube Extractor] GLM structuring failed:', error);
    // Fallback to formatted content
  }

  // Fallback: return formatted content
  const parts: string[] = [];
  if (title) parts.push(`Title: ${title}`);
  if (description) parts.push(`Description: ${description}`);
  parts.push(`Transcript:\n${transcript}`);
  return parts.join('\n\n');
}

