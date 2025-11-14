// Verse Reference Validator
// Validates Bible verse references and retrieves full verse text

import { getVerse } from './local-bible';
import { normalizeBookName } from './ai-bible-system';

export interface VerseValidationResult {
  valid: boolean;
  reference: string;
  verseText?: string;
  book?: string;
  chapter?: number;
  verse?: number;
  error?: string;
}

/**
 * Parse verse reference (e.g., "John 3:16", "1 Corinthians 13:4")
 */
function parseVerseReference(ref: string): { book: string; chapter: number; verse: number } | null {
  // Pattern: "Book Chapter:Verse" or "1 Book Chapter:Verse"
  const pattern = /^(\d*\s*[A-Za-z]+\.?)\s+(\d+):(\d+)(?:-(\d+))?$/i;
  const match = ref.trim().match(pattern);
  
  if (!match) return null;
  
  const book = match[1].trim();
  const chapter = parseInt(match[2]);
  const verse = parseInt(match[3]);
  
  return { book, chapter, verse };
}

/**
 * Validate verse reference and get full verse text
 */
export async function validateVerseReference(
  reference: string,
  language: 'english' | 'tamil' = 'english'
): Promise<VerseValidationResult> {
  try {
    const parsed = parseVerseReference(reference);
    
    if (!parsed) {
      return {
        valid: false,
        reference,
        error: 'Invalid verse reference format'
      };
    }
    
    // Normalize book name
    const normalizedBook = normalizeBookName(parsed.book);
    
    // Get verse text
    const verse = await getVerse(
      normalizedBook,
      parsed.chapter,
      parsed.verse,
      language,
      'KJV'
    );
    
    if (!verse) {
      return {
        valid: false,
        reference,
        book: normalizedBook,
        chapter: parsed.chapter,
        verse: parsed.verse,
        error: 'Verse not found'
      };
    }
    
    return {
      valid: true,
      reference: `${normalizedBook} ${parsed.chapter}:${parsed.verse}`,
      verseText: verse.text,
      book: normalizedBook,
      chapter: parsed.chapter,
      verse: parsed.verse
    };
  } catch (error: any) {
    return {
      valid: false,
      reference,
      error: error.message || 'Error validating verse'
    };
  }
}

/**
 * Extract and validate all verse references from text
 */
export async function validateVerseReferencesInText(
  text: string,
  language: 'english' | 'tamil' = 'english'
): Promise<VerseValidationResult[]> {
  // Extract verse references
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const matches = text.match(versePattern);
  
  if (!matches) return [];
  
  // Remove duplicates
  const uniqueRefs = [...new Set(matches)];
  
  // Validate each reference
  const results = await Promise.all(
    uniqueRefs.map(ref => validateVerseReference(ref, language))
  );
  
  return results;
}

