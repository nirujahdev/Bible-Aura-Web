// Link Content Extraction Utilities for Research Lab
// Extracts text content from web URLs using cheerio and GLM-4.5-Air

import * as cheerio from 'cheerio';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

/**
 * Check if URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const youtubePattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  return youtubePattern.test(url);
}

/**
 * Extract main content from a web page
 */
export async function extractLinkContent(url: string): Promise<string> {
  try {
    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Fetch the page with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    if (!html || html.trim().length === 0) {
      throw new Error('Empty response from URL');
    }

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, [class*="ad-"], [id*="ad-"]').remove();

    // Try to extract main content using common selectors
    let content = '';

    // Try article tag first (most common for blog posts/articles)
    const article = $('article').first();
    if (article.length > 0) {
      content = article.text();
    } else {
      // Try main tag
      const main = $('main').first();
      if (main.length > 0) {
        content = main.text();
      } else {
        // Try common content class names
        const contentSelectors = [
          '.content',
          '.post-content',
          '.article-content',
          '.entry-content',
          '.post-body',
          '.article-body',
          '#content',
          '#main-content',
          '.main-content',
        ];

        for (const selector of contentSelectors) {
          const element = $(selector).first();
          if (element.length > 0) {
            content = element.text();
            break;
          }
        }

        // Fallback to body if no specific content found
        if (!content || content.trim().length < 100) {
          content = $('body').text();
        }
      }
    }

    // Clean up the extracted text
    content = content
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .trim();

    if (!content || content.length < 50) {
      // If content is too short, try to get at least title and meta description
      const title = $('title').text() || '';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const h1 = $('h1').first().text() || '';
      
      content = [title, metaDescription, h1].filter(Boolean).join('\n\n');
    }

    // If content is very long (>50k chars), use GLM-4.5-Air to summarize
    if (content.length > 50000) {
      content = await summarizeWithGLM(content);
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Could not extract meaningful content from URL');
    }

    return content;
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('Request timeout: URL took too long to respond');
    }
    if (error.message?.includes('CORS') || error.message?.includes('403')) {
      throw new Error('Access denied: Website blocked the request');
    }
    throw new Error(`Failed to extract content from URL: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Summarize long content using GLM-4.5-Air
 */
async function summarizeWithGLM(content: string): Promise<string> {
  const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
  
  if (!glmApiKey || glmApiKey.trim() === '') {
    // If no GLM key, just truncate
    return content.substring(0, 50000) + '\n\n[Content truncated due to length]';
  }

  try {
    // Truncate to first 100k chars for the summary request
    const truncatedContent = content.substring(0, 100000);
    
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
            content: 'You are a content summarizer. Extract and preserve the main content, key points, and important information from the provided text. Maintain the original meaning and structure as much as possible.'
          },
          {
            role: 'user',
            content: `Please summarize and extract the main content from this web page text while preserving all important information:\n\n${truncatedContent}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content || data.choices?.[0]?.content;
      if (summary && summary.trim().length > 100) {
        return summary;
      }
    }
  } catch (error) {
    console.error('[Link Extractor] GLM summarization failed:', error);
    // Fallback to truncation
  }

  // Fallback: return truncated content
  return content.substring(0, 50000) + '\n\n[Content truncated due to length]';
}

