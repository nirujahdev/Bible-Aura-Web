// Tests for verse injection functionality

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { injectVerseTexts } from '../bibleText';

// Mock fetch
global.fetch = vi.fn();

describe('injectVerseTexts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch verse texts for multiple references', async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        reference: 'John 3:16',
        verseText: 'For God so loved the world...',
        book: 'John',
        chapter: 3,
        verse: 16
      })
    });

    const result = await injectVerseTexts(['John 3:16'], 'en');

    expect(result).toHaveLength(1);
    expect(result[0].reference).toBe('John 3:16');
    expect(result[0].verseText).toBe('For God so loved the world...');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle missing verses gracefully', async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await injectVerseTexts(['Invalid 99:99'], 'en');

    expect(result).toHaveLength(0);
  });

  it('should handle empty input', async () => {
    const result = await injectVerseTexts([], 'en');
    expect(result).toHaveLength(0);
  });

  it('should process multiple verses', async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'John 3:16',
          verseText: 'For God so loved the world...',
          book: 'John',
          chapter: 3,
          verse: 16
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reference: 'Romans 8:28',
          verseText: 'And we know that all things work together...',
          book: 'Romans',
          chapter: 8,
          verse: 28
        })
      });

    const result = await injectVerseTexts(['John 3:16', 'Romans 8:28'], 'en');

    expect(result).toHaveLength(2);
    expect(result[0].reference).toBe('John 3:16');
    expect(result[1].reference).toBe('Romans 8:28');
  });
});

