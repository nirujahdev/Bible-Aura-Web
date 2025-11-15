// Advanced Search Utilities for Bible Verse Search

export interface SearchQuery {
  exactPhrases: string[];
  andTerms: string[];
  orTerms: string[];
  notTerms: string[];
  proximityTerms: { term: string; distance: number }[];
  rawQuery: string;
}

export interface SearchMatch {
  score: number;
  matches: { term: string; position: number; length: number; fuzzy?: boolean; matchedText?: string }[];
  matchCount: number;
}

/**
 * Parse advanced search query with support for:
 * - "exact phrases" in quotes
 * - AND, OR, NOT operators
 * - -term for exclusion (NOT)
 * - Fuzzy matching options
 */
export function parseSearchQuery(query: string): SearchQuery {
  const result: SearchQuery = {
    exactPhrases: [],
    andTerms: [],
    orTerms: [],
    notTerms: [],
    proximityTerms: [],
    rawQuery: query
  };

  // Extract exact phrases (quoted text)
  const phraseRegex = /"([^"]+)"/g;
  let match;
  const phrases: string[] = [];
  
  while ((match = phraseRegex.exec(query)) !== null) {
    phrases.push(match[1].trim().toLowerCase());
  }
  
  result.exactPhrases = phrases;
  
  // Remove quotes from query for further processing
  let processedQuery = query.replace(/"[^"]+"/g, '').trim();
  
  // Handle OR operator
  if (processedQuery.includes(' OR ')) {
    const orParts = processedQuery.split(' OR ').map(p => p.trim());
    result.orTerms = orParts
      .filter(part => !part.startsWith('-') && part.length > 0)
      .map(part => part.toLowerCase());
  } else {
    // Handle AND operator (explicit) or implicit AND (space-separated)
    const parts = processedQuery.split(/\s+(?:AND\s+)?/i);
    
    for (const part of parts) {
      const term = part.trim();
      if (!term) continue;
      
      if (term.startsWith('-')) {
        // NOT operator (exclusion)
        const notTerm = term.substring(1).trim().toLowerCase();
        if (notTerm) {
          result.notTerms.push(notTerm);
        }
      } else if (term.toLowerCase().includes('near:')) {
        // Proximity search: "term1 near:5 term2"
        const nearMatch = term.match(/^(.+?)\s+near:(\d+)\s+(.+)$/i);
        if (nearMatch) {
          result.proximityTerms.push({
            term: nearMatch[1].toLowerCase(),
            distance: parseInt(nearMatch[2])
          });
          result.proximityTerms.push({
            term: nearMatch[3].toLowerCase(),
            distance: parseInt(nearMatch[2])
          });
        } else {
          result.andTerms.push(term.toLowerCase());
        }
      } else {
        result.andTerms.push(term.toLowerCase());
      }
    }
  }
  
  return result;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Fuzzy match a word with typo tolerance - Enhanced for better name matching
 */
function fuzzyMatch(word: string, target: string, maxDistance: number = 2): boolean {
  const wordLower = word.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match (case-insensitive)
  if (wordLower === targetLower) return true;
  
  // Check if one contains the other (good for partial matches)
  if (wordLower.includes(targetLower) || targetLower.includes(wordLower)) {
    // Require at least 70% length match for partial contains
    const minLen = Math.min(wordLower.length, targetLower.length);
    const maxLen = Math.max(wordLower.length, targetLower.length);
    if (minLen / maxLen > 0.7) {
      return true;
    }
  }
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(wordLower, targetLower);
  const maxLen = Math.max(wordLower.length, targetLower.length);
  
  // For longer words (like names: Priscilla, Prisckilla), be more lenient
  // Allow 1-2 character differences for words 6+ chars, 1 difference for shorter
  const allowedDistance = maxLen >= 6 ? Math.max(2, Math.floor(maxLen / 4)) : 1;
  
  // Calculate similarity score
  const similarity = 1 - (distance / maxLen);
  
  // Allow matches if:
  // 1. Distance is within allowed threshold (more lenient for longer words)
  // 2. Similarity is above 75% (was 70%)
  // 3. For names/important words, be even more lenient
  return distance <= Math.min(maxDistance, allowedDistance) || similarity > 0.75;
}

/**
 * Find all word matches in text with fuzzy support - Enhanced
 */
function findWordMatches(
  text: string,
  searchTerm: string,
  fuzzy: boolean = false
): { position: number; length: number; fuzzy: boolean; matchedText?: string }[] {
  const matches: { position: number; length: number; fuzzy: boolean; matchedText?: string }[] = [];
  const textLower = text.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  const textOriginal = text; // Keep original for highlighting exact matched text
  
  // Exact word match first (word boundaries)
  const exactRegex = new RegExp(`\\b${searchLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  let match;
  
  while ((match = exactRegex.exec(text)) !== null) {
    matches.push({
      position: match.index,
      length: match[0].length,
      fuzzy: false,
      matchedText: match[0]
    });
  }
  
  // Fuzzy match if enabled (even if exact matches exist, add fuzzy ones too)
  if (fuzzy) {
    // Split text into words while preserving positions
    const wordPattern = /\b\w+\b/g;
    let wordMatch;
    
    while ((wordMatch = wordPattern.exec(text)) !== null) {
      const word = wordMatch[0].toLowerCase();
      const wordPosition = wordMatch.index;
      
      // Skip if exact match already found at this position
      const exactMatchExists = matches.some(m => 
        m.position === wordPosition && !m.fuzzy
      );
      
      if (!exactMatchExists && fuzzyMatch(word, searchLower)) {
        // Get the actual matched word from original text
        const matchedWord = textOriginal.substring(wordPosition, wordPosition + wordMatch[0].length);
        matches.push({
          position: wordPosition,
          length: wordMatch[0].length,
          fuzzy: true,
          matchedText: matchedWord
        });
      }
    }
  }
  
  // Remove duplicates (same position)
  const uniqueMatches = matches.filter((m, idx, arr) => 
    arr.findIndex(other => other.position === m.position) === idx
  );
  
  return uniqueMatches;
}

/**
 * Check if text matches the search query
 */
export function matchSearchQuery(
  text: string,
  query: SearchQuery,
  fuzzyEnabled: boolean = false
): SearchMatch | null {
  const textLower = text.toLowerCase();
  const allMatches: { term: string; position: number; length: number; fuzzy: boolean }[] = [];
  let score = 0;
  let matchCount = 0;

  // Check exact phrases (highest priority)
  for (const phrase of query.exactPhrases) {
    const phraseIndex = textLower.indexOf(phrase);
    if (phraseIndex !== -1) {
      matchCount++;
      score += 100; // High score for exact phrase match
      allMatches.push({
        term: phrase,
        position: phraseIndex,
        length: phrase.length,
        fuzzy: false
      });
    } else {
      // If exact phrase not found, return null (AND logic)
      return null;
    }
  }

  // Check AND terms (all must match)
  for (const term of query.andTerms) {
    const matches = findWordMatches(text, term, fuzzyEnabled);
    if (matches.length === 0) {
      return null; // AND logic: all terms must match
    }
    
    matchCount += matches.length;
    // Higher score for earlier matches and exact matches
    matches.forEach((m, idx) => {
      score += m.fuzzy ? 10 : 20; // Exact match scores higher
      score += Math.max(0, 100 - m.position / 10); // Earlier matches score higher
      allMatches.push({
        term: term,
        position: m.position,
        length: m.length,
        fuzzy: m.fuzzy
      });
    });
  }

  // Check OR terms (at least one must match)
  if (query.orTerms.length > 0) {
    let orMatchFound = false;
    for (const term of query.orTerms) {
      const matches = findWordMatches(text, term, fuzzyEnabled);
      if (matches.length > 0) {
        orMatchFound = true;
        matchCount += matches.length;
        matches.forEach((m) => {
          score += m.fuzzy ? 10 : 20;
          score += Math.max(0, 100 - m.position / 10);
          allMatches.push({
            term: term,
            position: m.position,
            length: m.length,
            fuzzy: m.fuzzy
          });
        });
      }
    }
    if (!orMatchFound) {
      return null; // OR logic: at least one must match
    }
  }

  // Check NOT terms (none should match)
  for (const term of query.notTerms) {
    const matches = findWordMatches(text, term, fuzzyEnabled);
    if (matches.length > 0) {
      return null; // NOT logic: term should not be present
    }
  }

  // Check proximity terms
  if (query.proximityTerms.length >= 2) {
    // Group proximity terms by distance
    const proximityGroups = new Map<number, string[]>();
    for (const pt of query.proximityTerms) {
      if (!proximityGroups.has(pt.distance)) {
        proximityGroups.set(pt.distance, []);
      }
      proximityGroups.get(pt.distance)!.push(pt.term);
    }
    
    for (const [distance, terms] of proximityGroups) {
      const termMatches: { term: string; positions: number[] }[] = [];
      
      for (const term of terms) {
        const matches = findWordMatches(text, term, fuzzyEnabled);
        if (matches.length === 0) {
          return null; // All proximity terms must be present
        }
        termMatches.push({
          term,
          positions: matches.map(m => m.position)
        });
      }
      
      // Check if terms are within proximity distance
      let proximityMatch = false;
      const requestedDistance = distance * 10; // Convert word distance to character distance (approx 10 chars per word)
      for (let i = 0; i < termMatches[0].positions.length && !proximityMatch; i++) {
        for (let j = 0; j < termMatches[1].positions.length; j++) {
          const actualDistance = Math.abs(termMatches[0].positions[i] - termMatches[1].positions[j]);
          if (actualDistance <= requestedDistance) {
            proximityMatch = true;
            score += 30; // Bonus for proximity match
            break;
          }
        }
      }
      
      if (!proximityMatch) {
        return null;
      }
    }
  }

  // Calculate final relevance score
  // Normalize by text length (shorter verses with matches score higher)
  const lengthPenalty = Math.min(1, 100 / text.length);
  score = score * lengthPenalty + matchCount * 5;

  return {
    score,
    matches: allMatches.sort((a, b) => a.position - b.position),
    matchCount
  };
}

/**
 * Highlight search terms in text - Enhanced to handle fuzzy matches
 */
export function highlightSearchTerms(
  text: string,
  matches: { term: string; position: number; length: number; fuzzy?: boolean; matchedText?: string }[],
  className: string = 'bg-yellow-200 font-semibold'
): string {
  if (matches.length === 0) return text;

  // Sort matches by position (reverse for proper replacement to avoid position shifting)
  const sortedMatches = [...matches].sort((a, b) => b.position - a.position);
  
  let highlightedText = text;
  
  for (const match of sortedMatches) {
    const startPos = match.position;
    const endPos = match.position + match.length;
    
    // Use matchedText if available (for fuzzy matches), otherwise use substring
    const matchedText = match.matchedText || highlightedText.substring(startPos, endPos);
    
    const before = highlightedText.substring(0, startPos);
    const after = highlightedText.substring(endPos);
    
    // Add a visual indicator for fuzzy matches (dotted underline)
    const fuzzyClass = match.fuzzy ? ' underline decoration-dotted' : '';
    highlightedText = `${before}<mark class="${className}${fuzzyClass}" title="${match.fuzzy ? 'Fuzzy match' : 'Exact match'}">${matchedText}</mark>${after}`;
  }
  
  return highlightedText;
}

/**
 * Calculate simple relevance score for sorting
 */
export function calculateRelevanceScore(
  verse: { text: string; book_name: string; chapter: number; verse: number },
  searchMatch: SearchMatch,
  bookPopularity: Map<string, number> = new Map()
): number {
  let score = searchMatch.score;
  
  // Bonus for popular books (like Psalms, Proverbs, Gospels)
  const popularityBonus = bookPopularity.get(verse.book_name) || 0;
  score += popularityBonus;
  
  // Slight penalty for very long verses (prefer concise matches)
  if (verse.text.length > 200) {
    score *= 0.9;
  }
  
  return score;
}

