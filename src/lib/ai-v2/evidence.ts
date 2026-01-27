// Evidence Pack Builder: Convert reranked docs to sources[] format

import { RerankedChunk } from './rerank.js';

export interface Source {
  id: string;
  filename: string;
  score: number;
  url?: string;
  snippet?: string;
  reference?: string;
  verseText?: string;
}

/**
 * Build evidence pack from reranked chunks
 */
export function buildEvidencePack(reranked: RerankedChunk[]): { sources: Source[] } {
  const sources: Source[] = reranked.map(chunk => {
    const verseRef = chunk.metadata.verse_reference;
    
    return {
      id: chunk.id,
      filename: verseRef || chunk.id,
      score: chunk.score,
      reference: verseRef,
      snippet: chunk.text.substring(0, 300), // First 300 chars as snippet
      verseText: chunk.metadata.verse_text // Will be updated later with exact text
    };
  });

  return { sources };
}

