// Image OCR Extraction Utilities for Research Lab
// Extracts text from images using Tesseract.js OCR

import { createWorker } from 'tesseract.js';

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

/**
 * Supported image MIME types
 */
const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/bmp',
];

/**
 * Check if MIME type is a supported image format
 */
export function isSupportedImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType.toLowerCase());
}

/**
 * Extract text from image using OCR
 */
export async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // Validate image type
    if (!isSupportedImageType(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}. Supported types: PNG, JPEG, GIF, WebP, BMP`);
    }

    // Check file size (max 10MB for OCR)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (buffer.length > maxSize) {
      throw new Error(`Image file too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
    }

    // Initialize Tesseract worker
    const worker = await createWorker('eng'); // English language

    try {
      // Perform OCR
      const { data: { text } } = await worker.recognize(buffer);

      // Terminate worker
      await worker.terminate();

      if (!text || text.trim().length === 0) {
        throw new Error('No text found in image. The image may not contain readable text.');
      }

      // Clean extracted text
      let cleanedText = text
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
        .trim();

      // If text is long, optionally use GLM-4.5-Air to clean and structure it
      if (cleanedText.length > 1000) {
        cleanedText = await cleanOCRTextWithGLM(cleanedText);
      }

      return cleanedText;
    } catch (ocrError: any) {
      // Make sure to terminate worker even on error
      try {
        await worker.terminate();
      } catch {
        // Ignore termination errors
      }
      throw ocrError;
    }
  } catch (error: any) {
    if (error.message?.includes('No text found')) {
      throw error;
    }
    throw new Error(`Failed to extract text from image: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Clean and structure OCR text using GLM-4.5-Air
 */
async function cleanOCRTextWithGLM(text: string): Promise<string> {
  const glmApiKey = process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY;
  
  if (!glmApiKey || glmApiKey.trim() === '') {
    // If no GLM key, return text as-is
    return text;
  }

  try {
    // Truncate if too long (keep first 30k chars for processing)
    const truncatedText = text.length > 30000 
      ? text.substring(0, 30000) + '\n\n[Text truncated...]'
      : text;

    const prompt = `Please clean and structure this OCR-extracted text from an image. 
Fix any obvious OCR errors, improve formatting, and organize the content for better readability.

OCR Text:
${truncatedText}

Please provide:
1. Cleaned text with corrected OCR errors
2. Proper formatting and paragraph breaks
3. Organized structure if applicable
4. Preserve all important information`;

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
            content: 'You are an OCR text cleaning assistant. Fix OCR errors, improve formatting, and structure text extracted from images while preserving all important information.'
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
      const cleaned = data.choices?.[0]?.message?.content || data.choices?.[0]?.content;
      if (cleaned && cleaned.trim().length > 50) {
        return cleaned;
      }
    }
  } catch (error) {
    console.error('[Image Extractor] GLM cleaning failed:', error);
    // Fallback to original text
  }

  // Fallback: return original text
  return text;
}

