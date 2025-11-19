// Validation Utilities for Research Lab Agent Outputs
// Validates outputs for quality, accuracy, and Bible verse correctness

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 quality score
}

/**
 * Validate Bible verse references in text
 */
export function validateVerseReferences(text: string): { valid: boolean; verses: string[]; invalid: string[] } {
  // Common Bible verse patterns
  const versePattern = /\b([1-3]?\s?[A-Z][a-z]+)\s+(\d+):(\d+)(?:-(\d+))?(?:\s*\(([A-Z]+)\))?/g;
  const books = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  const verses: string[] = [];
  const invalid: string[] = [];
  let match;

  while ((match = versePattern.exec(text)) !== null) {
    const fullReference = match[0];
    const book = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = parseInt(match[3]);
    const endVerse = match[4] ? parseInt(match[4]) : null;

    // Basic validation
    const isValidBook = books.some(b => 
      b.toLowerCase() === book.toLowerCase() || 
      b.toLowerCase().replace(/\s+/g, '') === book.toLowerCase().replace(/\s+/g, '')
    );

    if (isValidBook && chapter > 0 && verse > 0) {
      if (endVerse && endVerse < verse) {
        invalid.push(fullReference);
      } else {
        verses.push(fullReference);
      }
    } else {
      invalid.push(fullReference);
    }
  }

  return {
    valid: invalid.length === 0,
    verses: [...new Set(verses)], // Remove duplicates
    invalid: [...new Set(invalid)],
  };
}

/**
 * Validate agent output content
 */
export function validateAgentOutput(output: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Check if output has content
  if (!output || !output.content) {
    errors.push('Output has no content');
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Extract text content
  let contentText = '';
  if (typeof output.content === 'string') {
    contentText = output.content;
  } else if (output.content && typeof output.content === 'object') {
    contentText = JSON.stringify(output.content);
  }

  // Validate content length
  if (contentText.length < 50) {
    warnings.push('Output content is very short (less than 50 characters)');
    score -= 10;
  }

  if (contentText.length > 50000) {
    warnings.push('Output content is very long (over 50,000 characters)');
    score -= 5;
  }

  // Validate Bible verse references
  const verseValidation = validateVerseReferences(contentText);
  if (verseValidation.invalid.length > 0) {
    warnings.push(`Found ${verseValidation.invalid.length} potentially invalid verse reference(s)`);
    score -= verseValidation.invalid.length * 2;
  }

  if (verseValidation.verses.length === 0 && output.output_type !== 'summarization') {
    warnings.push('No Bible verse references found in output');
    score -= 5;
  }

  // Check for common errors
  if (contentText.toLowerCase().includes('error') || contentText.toLowerCase().includes('failed')) {
    warnings.push('Output may contain error messages');
    score -= 5;
  }

  // Validate structure for JSON outputs
  if (output.output_type === 'curriculum' || output.output_type === 'sermon') {
    try {
      const content = typeof output.content === 'string' 
        ? JSON.parse(output.content) 
        : output.content;
      
      if (!content || typeof content !== 'object') {
        errors.push('Structured output (curriculum/sermon) should be a JSON object');
        score -= 20;
      }
    } catch (e) {
      // Not JSON, that's okay for some outputs
    }
  }

  // Check for sources
  if (!output.content?.sourcesUsed && !output.content?.sourceIds) {
    warnings.push('No source information found in output');
    score -= 5;
  }

  // Final score adjustment
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Check if output needs regeneration based on quality
 */
export function shouldRegenerate(output: any, threshold: number = 70): boolean {
  const validation = validateAgentOutput(output);
  return validation.score < threshold;
}

/**
 * Get quality assessment message
 */
export function getQualityMessage(score: number): string {
  if (score >= 90) {
    return 'Excellent quality';
  } else if (score >= 75) {
    return 'Good quality';
  } else if (score >= 60) {
    return 'Acceptable quality';
  } else if (score >= 40) {
    return 'Low quality - consider regenerating';
  } else {
    return 'Poor quality - should be regenerated';
  }
}

