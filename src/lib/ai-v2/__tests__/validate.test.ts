// Tests for validator functionality

import { describe, it, expect } from 'vitest';
import { validateResponse, generateSafeFallback } from '../validate';
import type { ValidatedVerse } from '../bibleText';
import type { Source } from '../evidence';

describe('validateResponse', () => {
  const mockValidatedVerses: ValidatedVerse[] = [
    {
      reference: 'John 3:16',
      verseText: 'For God so loved the world...',
      book: 'John',
      chapter: 3,
      verse: 16
    }
  ];

  const mockSources: Source[] = [
    {
      id: 'bible:en:John:3:16:0',
      filename: 'John 3:16',
      score: 0.95,
      reference: 'John 3:16'
    }
  ];

  it('should return verified status when all checks pass', () => {
    const text = 'This verse John 3:16 shows God\'s love.';
    const result = validateResponse(text, mockValidatedVerses, mockSources);

    expect(result.status).toBe('verified');
    expect(result.issues).toBeUndefined();
  });

  it('should return partial status when verse refs exist but some missing', () => {
    const text = 'This verse John 3:16 and Romans 8:28 show God\'s love.';
    const result = validateResponse(text, mockValidatedVerses, mockSources);

    expect(result.status).toBe('partial');
    expect(result.issues).toBeDefined();
    expect(result.issues?.some(issue => issue.includes('Romans 8:28'))).toBe(true);
  });

  it('should return failed status when no verses found', () => {
    const text = 'This is a general statement without verse references.';
    const result = validateResponse(text, [], mockSources);

    expect(result.status).toBe('failed');
    expect(result.issues).toBeDefined();
    expect(result.issues?.some(issue => issue.includes('No verse references'))).toBe(true);
  });

  it('should flag too many sources', () => {
    const manySources: Source[] = Array(6).fill(null).map((_, i) => ({
      id: `source-${i}`,
      filename: `Source ${i}`,
      score: 0.8
    }));

    const text = 'This verse John 3:16 shows God\'s love.';
    const result = validateResponse(text, mockValidatedVerses, manySources);

    expect(result.status).toBe('partial');
    expect(result.issues?.some(issue => issue.includes('Too many sources'))).toBe(true);
  });

  it('should require at least one validated verse', () => {
    const text = 'This verse John 3:16 shows God\'s love.';
    const result = validateResponse(text, [], mockSources);

    expect(result.status).toBe('failed');
    expect(result.issues?.some(issue => issue.includes('No validated verses'))).toBe(true);
  });
});

describe('generateSafeFallback', () => {
  it('should generate fallback with default verse', () => {
    const fallback = generateSafeFallback();
    expect(fallback).toContain('John 3:16');
    expect(fallback).toContain('Response Generation Error');
  });

  it('should generate fallback with custom verse', () => {
    const fallback = generateSafeFallback('Romans 8:28');
    expect(fallback).toContain('Romans 8:28');
  });
});

