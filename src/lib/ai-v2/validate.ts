// Validators: Deterministic checks (no LLM)
// Ensures zero hallucinations and proper grounding

import { ValidatedVerse } from './bibleText.js';
import { Source } from './evidence.js';

export interface ValidationResult {
  status: 'verified' | 'partial' | 'failed';
  issues?: string[];
}

/**
 * Extract verse references from text
 */
function extractVerseReferences(text: string): string[] {
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const matches = text.match(versePattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Normalize verse reference for comparison
 */
function normalizeVerseReference(ref: string): string {
  return ref.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Check if a verse reference exists in validatedVerses
 */
function verseRefExists(ref: string, validatedVerses: ValidatedVerse[]): boolean {
  const normalizedRef = normalizeVerseReference(ref);
  
  return validatedVerses.some(v => {
    const normalizedValidated = normalizeVerseReference(v.reference);
    // Exact match or partial match (e.g., "John 3:16" matches "John 3:16")
    return normalizedValidated === normalizedRef || 
           normalizedValidated.includes(normalizedRef) ||
           normalizedRef.includes(normalizedValidated);
  });
}

/**
 * Validate response against strict rules
 */
export function validateResponse(
  text: string,
  validatedVerses: ValidatedVerse[],
  sources: Source[]
): ValidationResult {
  const issues: string[] = [];

  // Check 1: Every verse ref in text must exist in validatedVerses
  const verseRefsInText = extractVerseReferences(text);
  const validatedRefs = new Set(validatedVerses.map(v => normalizeVerseReference(v.reference)));
  
  const invalidRefs = verseRefsInText.filter(ref => !verseRefExists(ref, validatedVerses));
  if (invalidRefs.length > 0) {
    issues.push(`Verse references in text not found in validatedVerses: ${invalidRefs.join(', ')}`);
  }

  // Check 2: sources.length <= 5 (Bible only, web removed)
  if (sources.length > 5) {
    issues.push(`Too many sources: ${sources.length} (max 5)`);
  }

  // Check 3: At least one verse reference in text
  if (verseRefsInText.length === 0) {
    issues.push('No verse references found in response text');
  }

  // Check 4: At least one validated verse
  if (validatedVerses.length === 0) {
    issues.push('No validated verses available');
  }

  // Determine validation status
  if (issues.length === 0 && validatedVerses.length > 0 && verseRefsInText.length > 0) {
    return { status: 'verified' };
  } else if (validatedVerses.length > 0 && verseRefsInText.length > 0) {
    // Some issues but still has verses
    return { status: 'partial', issues };
  } else {
    // Cannot ground safely
    return { status: 'failed', issues };
  }
}

/**
 * Generate safe fallback message
 */
export function generateSafeFallback(verseRef?: string): string {
  const fallbackRef = verseRef || 'John 3:16';
  return `➤ Response Generation Error

⤷ I encountered an issue generating a complete response. Please try rephrasing your question or asking about a specific Bible verse.

⤷ Scripture reference: ${fallbackRef}

⤷ For accurate Bible answers, please:
• Ask about specific verses (e.g., "What does John 3:16 mean?")
• Use clear, Bible-related questions
• Try breaking complex questions into simpler parts`;
}

