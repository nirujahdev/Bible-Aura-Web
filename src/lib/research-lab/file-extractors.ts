// File Extraction Utilities for Research Lab
// Extracts text content from various file types (PDF, DOCX, TXT, etc.)

// @ts-ignore - pdf-parse doesn't have type definitions
import pdfParse from 'pdf-parse';
// @ts-ignore - mammoth doesn't have type definitions
import mammoth from 'mammoth';
import { extractImageText } from './image-extractor.js';

/**
 * Extract text from PDF file
 */
export async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error: any) {
    throw new Error(`Failed to extract PDF text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractDOCXText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error: any) {
    throw new Error(`Failed to extract DOCX text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract text from plain text file (TXT, MD, etc.)
 */
export function extractTextFromPlainText(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8');
  } catch (error: any) {
    throw new Error(`Failed to extract text: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Main router function to extract text based on source type
 */
export async function extractTextFromFile(
  buffer: Buffer,
  sourceType: string,
  mimeType?: string
): Promise<string> {
  // Normalize source type
  const normalizedType = sourceType.toLowerCase();

  // PDF files
  if (normalizedType === 'pdf' || mimeType === 'application/pdf') {
    return await extractPDFText(buffer);
  }

  // DOCX files
  if (normalizedType === 'docx' || 
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword') {
    return await extractDOCXText(buffer);
  }

  // Plain text files (TXT, Markdown, etc.)
  if (normalizedType === 'txt' || 
      normalizedType === 'markdown' || 
      normalizedType === 'text' ||
      mimeType?.startsWith('text/')) {
    return extractTextFromPlainText(buffer);
  }

  // Image files (PNG, JPEG, GIF, WebP, BMP)
  if (normalizedType === 'image' || 
      (mimeType && mimeType.startsWith('image/'))) {
    return await extractImageText(buffer, mimeType);
  }

  // For link and text sources, content should already be in content_text
  if (normalizedType === 'link' || normalizedType === 'text') {
    throw new Error('Link and text sources should already have content_text set');
  }

  // Unsupported file type
  throw new Error(`Unsupported file type: ${sourceType}. Supported types: PDF, DOCX, TXT, Markdown, Images`);
}

/**
 * Clean and normalize extracted text
 */
export function cleanExtractedText(text: string): string {
  if (!text) return '';

  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();

  // Remove excessive newlines (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}

