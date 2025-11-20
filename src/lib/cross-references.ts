// Cross-Reference Utility
// Loads and queries Bible verse cross-references from JSON files

import { normalizeBookName } from './ai-bible-system';

// Cross-reference data structure from JSON files
interface CrossReferenceData {
  [verseId: string]: {
    v: string; // Verse reference in format "GEN 1 1"
    r?: {
      [refId: string]: string; // Cross-reference IDs mapped to verse references
    };
  };
}

// Book name to abbreviation mapping (KJV standard)
const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Psalm': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Songs': 'SOS',
  'Song of Solomon': 'SOS',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZE',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOE',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAH',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',
  'Matthew': 'MAT',
  'Mark': 'MAR',
  'Luke': 'LUK',
  'John': 'JOH',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAM',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JO',
  '2 John': '2JO',
  '3 John': '3JO',
  'Jude': 'JDE',
  'Revelation': 'REV',
};

// Reverse mapping: abbreviation to full name
const ABBREVIATION_TO_BOOK: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_ABBREVIATIONS).map(([book, abbrev]) => [abbrev, book])
);

// Cache for loaded cross-reference data
let crossReferenceCache: Map<string, CrossReferenceData> = new Map();
let loadingPromises: Map<string, Promise<CrossReferenceData>> = new Map();

/**
 * Convert verse reference from "Book Chapter:Verse" to "BOOK CH V" format
 * Example: "Genesis 1:1" -> "GEN 1 1"
 */
export function convertToCrossRefFormat(book: string, chapter: number, verse: number): string {
  const normalizedBook = normalizeBookName(book);
  const abbrev = BOOK_ABBREVIATIONS[normalizedBook] || normalizedBook.toUpperCase().slice(0, 3);
  return `${abbrev} ${chapter} ${verse}`;
}

/**
 * Convert verse reference from "BOOK CH V" to "Book Chapter:Verse" format
 * Example: "GEN 1 1" -> "Genesis 1:1"
 */
export function convertFromCrossRefFormat(ref: string): string | null {
  const parts = ref.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  
  const [abbrev, chapter, verse] = parts;
  const bookName = ABBREVIATION_TO_BOOK[abbrev];
  
  if (!bookName) return null;
  
  return `${bookName} ${chapter}:${verse}`;
}

/**
 * Load a specific cross-reference JSON file
 */
async function loadCrossReferenceFile(fileNumber: number): Promise<CrossReferenceData> {
  const cacheKey = fileNumber.toString();
  
  // Check cache first
  if (crossReferenceCache.has(cacheKey)) {
    return crossReferenceCache.get(cacheKey)!;
  }
  
  // Check if already loading
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)!;
  }
  
  // Load the file
  const loadPromise = (async () => {
    try {
      const response = await fetch(`/Bible/CrossReferences/${fileNumber}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load cross-reference file ${fileNumber}.json: ${response.status}`);
      }
      const data = await response.json() as CrossReferenceData;
      crossReferenceCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading cross-reference file ${fileNumber}.json:`, error);
      return {} as CrossReferenceData;
    } finally {
      loadingPromises.delete(cacheKey);
    }
  })();
  
  loadingPromises.set(cacheKey, loadPromise);
  return loadPromise;
}

/**
 * Find which file contains a verse ID
 * Verse IDs are sequential (1-31102), distributed across 32 files (1000 verses each)
 */
function getFileNumberForVerseId(verseId: number): number {
  // Files are numbered 1-32, each containing ~1000 verses
  // Verse ID 1 is in file 1, verse ID 1001 is in file 2, etc.
  return Math.ceil(verseId / 1000);
}

/**
 * Find verse ID from cross-reference format
 * Searches through all files to find matching verse
 */
async function findVerseIdByReference(ref: string): Promise<string | null> {
  // Search through all 32 files
  const searchPromises = Array.from({ length: 32 }, (_, i) => i + 1).map(async (fileNum) => {
    const data = await loadCrossReferenceFile(fileNum);
    for (const [verseId, verseData] of Object.entries(data)) {
      if (verseData.v === ref) {
        return verseId;
      }
    }
    return null;
  });
  
  const results = await Promise.all(searchPromises);
  return results.find(id => id !== null) || null;
}

/**
 * Get cross-references for a verse
 * @param book - Book name (e.g., "Genesis")
 * @param chapter - Chapter number
 * @param verse - Verse number
 * @returns Array of cross-reference verse references in "Book Chapter:Verse" format
 */
export async function getCrossReferences(
  book: string,
  chapter: number,
  verse: number
): Promise<string[]> {
  try {
    // Convert to cross-reference format
    const crossRefFormat = convertToCrossRefFormat(book, chapter, verse);
    
    // Find the verse ID
    const verseId = await findVerseIdByReference(crossRefFormat);
    if (!verseId) {
      return [];
    }
    
    // Determine which file contains this verse
    const fileNumber = getFileNumberForVerseId(parseInt(verseId));
    const data = await loadCrossReferenceFile(fileNumber);
    
    // Get cross-references
    const verseData = data[verseId];
    if (!verseData || !verseData.r) {
      return [];
    }
    
    // Convert cross-references to readable format
    const crossRefs = Object.values(verseData.r)
      .map(ref => convertFromCrossRefFormat(ref))
      .filter((ref): ref is string => ref !== null);
    
    return crossRefs;
  } catch (error) {
    console.error('Error getting cross-references:', error);
    return [];
  }
}

/**
 * Get cross-references for a verse reference string
 * @param reference - Verse reference in format "Book Chapter:Verse" (e.g., "Genesis 1:1")
 * @returns Array of cross-reference verse references
 */
export async function getCrossReferencesFromString(reference: string): Promise<string[]> {
  // Parse the reference
  const pattern = /^(\d*\s*[A-Za-z]+\.?)\s+(\d+):(\d+)(?:-(\d+))?$/i;
  const match = reference.trim().match(pattern);
  
  if (!match) {
    return [];
  }
  
  const book = match[1].trim();
  const chapter = parseInt(match[2]);
  const verse = parseInt(match[3]);
  
  return getCrossReferences(book, chapter, verse);
}

/**
 * Get cross-references for multiple verses
 * @param references - Array of verse references
 * @returns Map of verse reference to its cross-references
 */
export async function getCrossReferencesForVerses(
  references: string[]
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();
  
  // Process in parallel
  const promises = references.map(async (ref) => {
    const crossRefs = await getCrossReferencesFromString(ref);
    results.set(ref, crossRefs);
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Expand query with cross-references for better RAG retrieval
 * @param query - Original query
 * @param verseReferences - Array of verse references found in the query
 * @returns Expanded query with cross-references included
 */
export async function expandQueryWithCrossReferences(
  query: string,
  verseReferences: string[]
): Promise<string> {
  if (verseReferences.length === 0) {
    return query;
  }
  
  // Get cross-references for all verses
  const crossRefMap = await getCrossReferencesForVerses(verseReferences);
  
  // Collect all unique cross-references
  const allCrossRefs = new Set<string>();
  crossRefMap.forEach((crossRefs) => {
    crossRefs.forEach(ref => allCrossRefs.add(ref));
  });
  
  if (allCrossRefs.size === 0) {
    return query;
  }
  
  // Limit to top 10 most relevant cross-references to avoid overwhelming the query
  const crossRefsArray = Array.from(allCrossRefs).slice(0, 10);
  
  // Append to query
  const expandedQuery = `${query}\n\nRelated verses: ${crossRefsArray.join(', ')}`;
  
  return expandedQuery;
}

