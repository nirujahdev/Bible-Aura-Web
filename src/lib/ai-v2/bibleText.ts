// Bible Text: Verse resolver + verseText injector
// Fetches exact verse text from Bible JSON API

import type { Source } from './evidence.js';

export interface ValidatedVerse {
  reference: string;
  verseText: string;
  book: string;
  chapter: number;
  verse: number;
}

/**
 * Fetch verse text from Bible JSON API
 */
async function fetchVerseText(
  reference: string,
  language: 'en' | 'ta'
): Promise<ValidatedVerse | null> {
  try {
    // Determine API URL (server-side or client-side)
    const apiUrl = typeof window === 'undefined'
      ? `${process.env.VITE_APP_URL || 'http://localhost:5173'}/api/bible-verse-lookup`
      : '/api/bible-verse-lookup';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, language })
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[Bible Text] Verse not found: ${reference}`);
        return null;
      }
      throw new Error(`Bible API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      reference: data.reference,
      verseText: data.verseText,
      book: data.book,
      chapter: data.chapter,
      verse: data.verse
    };
  } catch (error) {
    console.error(`[Bible Text] Error fetching verse ${reference}:`, error);
    return null;
  }
}

/**
 * Inject verse texts for all references
 */
export async function injectVerseTexts(
  verseRefs: string[],
  lang: 'en' | 'ta'
): Promise<ValidatedVerse[]> {
  if (verseRefs.length === 0) {
    return [];
  }

  // Fetch all verses in parallel (but limit concurrency)
  const batchSize = 10;
  const results: ValidatedVerse[] = [];

  for (let i = 0; i < verseRefs.length; i += batchSize) {
    const batch = verseRefs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(ref => fetchVerseText(ref, lang))
    );
    
    // Filter out null results
    results.push(...batchResults.filter((v): v is ValidatedVerse => v !== null));
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < verseRefs.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`[Bible Text] Injected ${results.length} verse texts from ${verseRefs.length} references`);

  return results;
}

/**
 * Update sources with verseText from validatedVerses
 */
export function updateSourcesWithVerseText(
  sources: Source[],
  validatedVerses: ValidatedVerse[]
): Source[] {
  const verseMap = new Map<string, string>();
  validatedVerses.forEach(v => {
    verseMap.set(v.reference, v.verseText);
  });

  return sources.map(source => {
    if (source.reference && verseMap.has(source.reference)) {
      return {
        ...source,
        verseText: verseMap.get(source.reference)
      };
    }
    return source;
  });
}

