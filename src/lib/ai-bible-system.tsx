// ✦ Bible Aura - Comprehensive AI Bible System
// Complete implementation for Bible verse explanations with AI

import React, { useState, useEffect } from 'react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  language: 'english' | 'tamil' | 'sinhala';
}

export interface VerseExplanation {
  verse: string;
  historicalBackground: string;
  theology: string;
  explanation: string;
  language: 'english' | 'tamil' | 'sinhala';
}

export interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
}

export type SupportedLanguage = 'english' | 'tamil' | 'sinhala';

// =============================================================================
// AI CONFIGURATION
// =============================================================================

// AI Configuration
const AI_CONFIG = {
  model: "ai-chat",
  baseURL: "https://api.openai.com",
  apiKey: process.env.VITE_AI_API_KEY || 'demo-key'
};

// =============================================================================
// BIBLE VERSE EXTRACTION
// =============================================================================

/**
 * Extract Bible verse reference from user input
 * Examples: "John 3:16", "Explain Romans 8:28", "What does Psalm 23:1 mean?"
 */
export function extractVerseReference(input: string): VerseReference | null {
  // Common Bible book patterns
  const bookPatterns = [
    // New Testament
    'Matthew', 'Matt', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Rom',
    '1 Corinthians', '1 Cor', '2 Corinthians', '2 Cor', 'Galatians', 'Gal',
    'Ephesians', 'Eph', 'Philippians', 'Phil', 'Colossians', 'Col',
    '1 Thessalonians', '1 Thess', '2 Thessalonians', '2 Thess',
    '1 Timothy', '1 Tim', '2 Timothy', '2 Tim', 'Titus', 'Philemon', 'Phlm',
    'Hebrews', 'Heb', 'James', '1 Peter', '1 Pet', '2 Peter', '2 Pet',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation', 'Rev',
    
    // Old Testament
    'Genesis', 'Gen', 'Exodus', 'Ex', 'Leviticus', 'Lev', 'Numbers', 'Num',
    'Deuteronomy', 'Deut', 'Joshua', 'Josh', 'Judges', 'Judg', 'Ruth',
    '1 Samuel', '1 Sam', '2 Samuel', '2 Sam', '1 Kings', '2 Kings',
    '1 Chronicles', '1 Chr', '2 Chronicles', '2 Chr', 'Ezra', 'Nehemiah', 'Neh',
    'Esther', 'Job', 'Psalms', 'Ps', 'Psalm', 'Proverbs', 'Prov',
    'Ecclesiastes', 'Eccl', 'Song of Songs', 'Song', 'Isaiah', 'Isa',
    'Jeremiah', 'Jer', 'Lamentations', 'Lam', 'Ezekiel', 'Ezek', 'Daniel', 'Dan',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Obad', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Hab', 'Zephaniah', 'Zeph', 'Haggai', 'Hag', 'Zechariah', 'Zech', 'Malachi', 'Mal'
  ];

  // Create regex pattern for verse references
  const bookPattern = bookPatterns.join('|');
  const verseRegex = new RegExp(`(${bookPattern})\\s+(\\d+):(\\d+)`, 'i');
  
  const match = input.match(verseRegex);
  if (match) {
    return {
      book: match[1].trim(),
      chapter: parseInt(match[2]),
      verse: parseInt(match[3])
    };
  }
  
  return null;
}

/**
 * Normalize book name to match JSON file structure
 */
export function normalizeBookName(bookName: string): string {
  const bookMap: Record<string, string> = {
    // Common abbreviations to full names
    'Matt': 'Matthew',
    'Rom': 'Romans',
    '1 Cor': '1 Corinthians',
    '2 Cor': '2 Corinthians',
    'Gal': 'Galatians',
    'Eph': 'Ephesians',
    'Phil': 'Philippians',
    'Col': 'Colossians',
    '1 Thess': '1 Thessalonians',
    '2 Thess': '2 Thessalonians',
    '1 Tim': '1 Timothy',
    '2 Tim': '2 Timothy',
    'Phlm': 'Philemon',
    'Heb': 'Hebrews',
    '1 Pet': '1 Peter',
    '2 Pet': '2 Peter',
    'Rev': 'Revelation',
    'Gen': 'Genesis',
    'Ex': 'Exodus',
    'Lev': 'Leviticus',
    'Num': 'Numbers',
    'Deut': 'Deuteronomy',
    'Josh': 'Joshua',
    'Judg': 'Judges',
    '1 Sam': '1 Samuel',
    '2 Sam': '2 Samuel',
    '1 Chr': '1 Chronicles',
    '2 Chr': '2 Chronicles',
    'Neh': 'Nehemiah',
    'Ps': 'Psalms',
    'Psalm': 'Psalms',
    'Prov': 'Proverbs',
    'Eccl': 'Ecclesiastes',
    'Song': 'Song of Songs',
    'Isa': 'Isaiah',
    'Jer': 'Jeremiah',
    'Lam': 'Lamentations',
    'Ezek': 'Ezekiel',
    'Dan': 'Daniel',
    'Obad': 'Obadiah',
    'Hab': 'Habakkuk',
    'Zeph': 'Zephaniah',
    'Hag': 'Haggai',
    'Zech': 'Zechariah',
    'Mal': 'Malachi'
  };

  return bookMap[bookName] || bookName;
}

// =============================================================================
// BIBLE JSON LOADER
// =============================================================================

/**
 * Load Bible verse from local JSON files
 */
export async function loadBibleVerse(
  reference: VerseReference, 
  language: SupportedLanguage = 'english'
): Promise<BibleVerse | null> {
  try {
    const normalizedBook = normalizeBookName(reference.book);
    
    if (language === 'english') {
      // Load from KJV Bible JSON
      const response = await fetch('/Bible/KJV_bible.json');
      const bible = await response.json();
      
      const bookData = bible[normalizedBook];
      if (!bookData) return null;
      
      const chapterData = bookData[reference.chapter.toString()];
      if (!chapterData) return null;
      
      const verseText = chapterData[reference.verse.toString()];
      if (!verseText) return null;
      
      return {
        book: normalizedBook,
        chapter: reference.chapter,
        verse: reference.verse,
        text: verseText,
        language: 'english'
      };
      
    } else if (language === 'tamil') {
      // Load from Tamil Bible JSON files
      const response = await fetch(`/Bible/Tamil bible/${normalizedBook}.json`);
      const bookData = await response.json();
      
      const chapterData = bookData[reference.chapter.toString()];
      if (!chapterData) return null;
      
      const verseText = chapterData[reference.verse.toString()];
      if (!verseText) return null;
      
      return {
        book: normalizedBook,
        chapter: reference.chapter,
        verse: reference.verse,
        text: verseText,
        language: 'tamil'
      };
      
    } else {
      // Sinhala - fallback to English for now
      return await loadBibleVerse(reference, 'english');
    }
    
  } catch (error) {
    console.error('Error loading Bible verse:', error);
    return null;
  }
}

// =============================================================================
// AI PROMPT TEMPLATES
// =============================================================================

/**
 * Create structured Bible explanation prompt
 */
export function createVerseExplanationPrompt(
  verse: BibleVerse,
  language: SupportedLanguage = 'english'
): string {
  const languageInstruction = language === 'english' ? 'English' :
                             language === 'tamil' ? 'Tamil' :
                             'Sinhala';

  return `You are a Bible study assistant and theological scholar.

Your task is to explain the Bible verse: ${verse.book} ${verse.chapter}:${verse.verse}

Verse Text: "${verse.text}"

Please provide a structured explanation following this exact format:

Verse:
${verse.book} ${verse.chapter}:${verse.verse} - "${verse.text}"

Historical Background:
[Provide 2-3 sentences about the historical context, time period, and circumstances when this verse was written]

Theology:
[Explain the key theological concepts, doctrines, and spiritual meaning in 2-3 sentences]

Explanation:
[Give a clear, practical explanation of what this verse means for believers today in 3-4 sentences]

Important guidelines:
- Write in ${languageInstruction} language
- Keep the total response under 300 words
- Use simple, clear language that anyone can understand
- Do not use special formatting symbols like *, #, or markdown
- Focus on practical application and spiritual insight
- Be respectful of all Christian denominations
- If the verse has multiple interpretations, mention the most widely accepted one

Respond with the structured explanation now.`;
}

// =============================================================================
// AI API INTEGRATION
// =============================================================================

/**
 * Call AI API to get verse explanation
 */
export async function getVerseExplanationFromAI(
  verse: BibleVerse,
  language: SupportedLanguage = 'english'
): Promise<string> {
  try {
    const prompt = createVerseExplanationPrompt(verse, language);
    
    const response = await fetch(`${AI_CONFIG.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        ...AI_CONFIG.headers
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        ...AI_CONFIG.defaultParams
      })
    });

    if (!response.ok) {
      throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid AI response structure');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

/**
 * Parse AI response into structured explanation
 */
export function parseAIResponse(response: string, language: SupportedLanguage): VerseExplanation {
  const sections = {
    verse: '',
    historicalBackground: '',
    theology: '',
    explanation: ''
  };

  // Split response into sections
  const lines = response.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith('Verse:')) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] = currentContent.join(' ');
      }
      currentSection = 'verse';
      currentContent = [line.substring(6).trim()];
    } else if (line.startsWith('Historical Background:')) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] = currentContent.join(' ');
      }
      currentSection = 'historicalBackground';
      currentContent = [line.substring(22).trim()];
    } else if (line.startsWith('Theology:')) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] = currentContent.join(' ');
      }
      currentSection = 'theology';
      currentContent = [line.substring(9).trim()];
    } else if (line.startsWith('Explanation:')) {
      if (currentSection && currentContent.length > 0) {
        sections[currentSection as keyof typeof sections] = currentContent.join(' ');
      }
      currentSection = 'explanation';
      currentContent = [line.substring(12).trim()];
    } else if (currentSection && line) {
      currentContent.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection as keyof typeof sections] = currentContent.join(' ');
  }

  return {
    verse: sections.verse,
    historicalBackground: sections.historicalBackground,
    theology: sections.theology,
    explanation: sections.explanation,
    language
  };
}

// =============================================================================
// MAIN API FUNCTION
// =============================================================================

/**
 * Complete verse explanation pipeline
 */
export async function explainVerse(
  query: string,
  language: SupportedLanguage = 'english'
): Promise<VerseExplanation | null> {
  try {
    // Step 1: Extract verse reference from query
    const reference = extractVerseReference(query);
    if (!reference) {
      throw new Error('Could not extract verse reference from query');
    }

    // Step 2: Load verse from Bible JSON
    const verse = await loadBibleVerse(reference, language);
    if (!verse) {
      throw new Error('Could not find verse in Bible data');
    }

    // Step 3: Get AI explanation
    const aiResponse = await getVerseExplanationFromAI(verse, language);

    // Step 4: Parse and structure the response
    const explanation = parseAIResponse(aiResponse, language);

    return explanation;

  } catch (error) {
    console.error('Error explaining verse:', error);
    return null;
  }
}

// =============================================================================
// REACT COMPONENTS
// =============================================================================

/**
 * Language Selector Component
 */
export const LanguageSelector: React.FC<{
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}> = ({ value, onChange }) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as SupportedLanguage)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="english">English</option>
      <option value="tamil">Tamil</option>
      <option value="sinhala">Sinhala</option>
    </select>
  );
};

/**
 * Verse Input Component
 */
export const VerseInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}> = ({ value, onChange, onSubmit, loading }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter verse reference (e.g., John 3:16)"
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Explaining...' : 'Explain'}
      </button>
    </div>
  );
};

/**
 * Explanation Display Component
 */
export const ExplanationDisplay: React.FC<{
  explanation: VerseExplanation;
}> = ({ explanation }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Verse */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Verse</h3>
        <p className="text-gray-700 leading-relaxed">{explanation.verse}</p>
      </div>

      {/* Historical Background */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Historical Background</h3>
        <p className="text-gray-700 leading-relaxed">{explanation.historicalBackground}</p>
      </div>

      {/* Theology */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Theology</h3>
        <p className="text-gray-700 leading-relaxed">{explanation.theology}</p>
      </div>

      {/* Explanation */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Explanation</h3>
        <p className="text-gray-700 leading-relaxed">{explanation.explanation}</p>
      </div>
    </div>
  );
};

/**
 * Complete Verse Explanation Widget
 */
export const VerseExplanationWidget: React.FC = () => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('english');
  const [explanation, setExplanation] = useState<VerseExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await explainVerse(query, language);
      if (result) {
        setExplanation(result);
      } else {
        setError('Could not explain this verse. Please check the reference and try again.');
      }
    } catch (err) {
      setError('An error occurred while explaining the verse.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bible Verse Explanation</h1>
        <p className="text-gray-600">Get detailed explanations of Bible verses with historical context and theological insights</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>
        
        <VerseInput
          value={query}
          onChange={setQuery}
          onSubmit={handleExplain}
          loading={loading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Explanation Display */}
      {explanation && <ExplanationDisplay explanation={explanation} />}

      {/* Example Queries */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Try these examples:</h3>
        <div className="flex flex-wrap gap-2">
          {['John 3:16', 'Psalm 23:1', 'Romans 8:28', 'Philippians 4:13'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// BACKEND API ROUTE (Express.js example)
// =============================================================================

/**
 * Express route handler for verse explanation
 * Usage: POST /api/explain-verse
 */
export const explainVerseRoute = async (req: any, res: any) => {
  try {
    const { query, language = 'english' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const explanation = await explainVerse(query, language);

    if (!explanation) {
      return res.status(404).json({ error: 'Could not explain verse' });
    }

    res.json({ success: true, explanation });

  } catch (error) {
    console.error('Verse explanation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 