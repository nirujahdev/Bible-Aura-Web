// Context Compression & Optimization
// Reduces context size while preserving important information

export interface CompressedContext {
  originalLength: number;
  compressedLength: number;
  compressionRatio: number;
  chunks: string[];
  summary?: string;
}

/**
 * Compress context by summarizing and prioritizing important information
 */
export function compressContext(
  context: string,
  maxLength: number = 2000,
  preserveVerses: boolean = true
): CompressedContext {
  const originalLength = context.length;
  
  if (context.length <= maxLength) {
    return {
      originalLength,
      compressedLength: context.length,
      compressionRatio: 1,
      chunks: [context],
    };
  }

  // Split into chunks (by verse references or paragraphs)
  const chunks = splitIntoChunks(context, preserveVerses);
  
  // Prioritize chunks with verse references
  const prioritized = prioritizeChunks(chunks, preserveVerses);
  
  // Select chunks until we reach max length
  const selected: string[] = [];
  let currentLength = 0;
  
  for (const chunk of prioritized) {
    if (currentLength + chunk.length <= maxLength) {
      selected.push(chunk);
      currentLength += chunk.length;
    } else {
      // Try to fit partial chunk if it's a verse
      if (preserveVerses && chunk.match(/^\d*\s*[A-Za-z]+\s+\d+:\d+/)) {
        // Verse references are important, try to fit
        const remaining = maxLength - currentLength;
        if (remaining > 100) {
          selected.push(chunk.substring(0, remaining) + '...');
        }
      }
      break;
    }
  }
  
  const compressed = selected.join('\n---\n');
  
  return {
    originalLength,
    compressedLength: compressed.length,
    compressionRatio: compressed.length / originalLength,
    chunks: selected,
  };
}

/**
 * Split context into meaningful chunks
 */
function splitIntoChunks(context: string, preserveVerses: boolean): string[] {
  if (preserveVerses) {
    // Split by verse references (each verse is a chunk)
    const versePattern = /(\d*\s*[A-Za-z]+\s+\d+:\d+[^\n]*)/g;
    const matches = [...context.matchAll(versePattern)];
    
    if (matches.length > 0) {
      const chunks: string[] = [];
      let lastIndex = 0;
      
      for (const match of matches) {
        if (match.index !== undefined && match.index > lastIndex) {
          // Add text before verse
          const before = context.substring(lastIndex, match.index).trim();
          if (before) chunks.push(before);
        }
        chunks.push(match[0]);
        lastIndex = (match.index || 0) + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < context.length) {
        const remaining = context.substring(lastIndex).trim();
        if (remaining) chunks.push(remaining);
      }
      
      return chunks;
    }
  }
  
  // Fallback: split by paragraphs or double newlines
  return context.split(/\n\n+/).filter(chunk => chunk.trim().length > 0);
}

/**
 * Prioritize chunks based on importance
 */
function prioritizeChunks(chunks: string[], preserveVerses: boolean): string[] {
  return chunks.sort((a, b) => {
    // Verse references get highest priority
    const aHasVerse = /^\d*\s*[A-Za-z]+\s+\d+:\d+/.test(a);
    const bHasVerse = /^\d*\s*[A-Za-z]+\s+\d+:\d+/.test(b);
    
    if (aHasVerse && !bHasVerse) return -1;
    if (!aHasVerse && bHasVerse) return 1;
    
    // Longer chunks (more information) get priority
    return b.length - a.length;
  });
}

/**
 * Hierarchical summarization for very long contexts
 */
export function hierarchicalSummarize(
  context: string,
  levels: number = 2,
  targetLength: number = 2000
): string {
  if (context.length <= targetLength) {
    return context;
  }
  
  // Level 1: Split into major sections
  const sections = context.split(/\n---\n|\n\n\n+/);
  
  if (sections.length === 1) {
    // Single section, just truncate intelligently
    return truncateIntelligently(context, targetLength);
  }
  
  // Level 2: Summarize each section
  const summarizedSections = sections.map(section => {
    if (section.length <= targetLength / sections.length) {
      return section;
    }
    return truncateIntelligently(section, targetLength / sections.length);
  });
  
  return summarizedSections.join('\n---\n');
}

/**
 * Intelligently truncate text while preserving important parts
 */
function truncateIntelligently(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to find a good breaking point (sentence end, verse end)
  const sentenceEnd = text.lastIndexOf('.', maxLength);
  const verseEnd = text.lastIndexOf('\n', maxLength);
  const bestBreak = Math.max(sentenceEnd, verseEnd);
  
  if (bestBreak > maxLength * 0.7) {
    // Good breaking point found
    return text.substring(0, bestBreak + 1) + '...';
  }
  
  // Fallback: hard truncate
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract key information from context
 */
export function extractKeyInformation(context: string): {
  verseReferences: string[];
  keyTerms: string[];
  summary: string;
} {
  // Extract verse references
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const verseMatches = [...context.matchAll(versePattern)];
  const verseReferences = [...new Set(verseMatches.map(m => m[0]))];
  
  // Extract key terms (words that appear frequently)
  const words = context.toLowerCase().split(/\s+/);
  const wordCounts: Record<string, number> = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'this', 'that', 'these', 'those']);
  
  for (const word of words) {
    const clean = word.replace(/[^\w]/g, '');
    if (clean.length > 4 && !stopWords.has(clean)) {
      wordCounts[clean] = (wordCounts[clean] || 0) + 1;
    }
  }
  
  const keyTerms = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([term]) => term);
  
  // Simple summary (first 200 chars)
  const summary = context.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
  
  return {
    verseReferences,
    keyTerms,
    summary,
  };
}

