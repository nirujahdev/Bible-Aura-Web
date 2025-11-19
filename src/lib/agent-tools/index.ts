// Agent Tools / Function Calling System
// Provides tools that agents can call to perform specific Bible-related operations

// Dynamic import to avoid circular dependencies
const getLocalBible = async () => {
  return await import('../../lib/local-bible');
};

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      required?: boolean;
    }>;
    required?: string[];
  };
}

export interface ToolCall {
  tool: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Available tools for agents
export const AGENT_TOOLS: AgentTool[] = [
  {
    name: 'lookup_verse',
    description: 'Look up a specific Bible verse by reference. Returns the verse text and context.',
    parameters: {
      type: 'object',
      properties: {
        reference: {
          type: 'string',
          description: 'Bible verse reference (e.g., "John 3:16", "Genesis 1:1")',
        },
        translation: {
          type: 'string',
          description: 'Bible translation code (e.g., "KJV", "NIV", "TAMIL"). Defaults to KJV.',
        },
      },
      required: ['reference'],
    },
  },
  {
    name: 'search_verses',
    description: 'Search for Bible verses containing specific keywords or phrases. Returns matching verses with context.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query - keywords or phrases to find in Bible verses',
        },
        translation: {
          type: 'string',
          description: 'Bible translation code. Defaults to KJV.',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 50)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_chapter',
    description: 'Get all verses from a specific Bible chapter. Useful for understanding context around a verse.',
    parameters: {
      type: 'object',
      properties: {
        book: {
          type: 'string',
          description: 'Bible book name (e.g., "John", "Genesis", "Psalms")',
        },
        chapter: {
          type: 'number',
          description: 'Chapter number',
        },
        translation: {
          type: 'string',
          description: 'Bible translation code. Defaults to KJV.',
        },
      },
      required: ['book', 'chapter'],
    },
  },
  {
    name: 'validate_verse_reference',
    description: 'Validate if a verse reference is correct and exists in the Bible. Returns book, chapter, verse numbers.',
    parameters: {
      type: 'object',
      properties: {
        reference: {
          type: 'string',
          description: 'Verse reference to validate (e.g., "John 3:16")',
        },
      },
      required: ['reference'],
    },
  },
];

/**
 * Execute a tool call
 */
export async function executeTool(toolCall: ToolCall, language: 'en' | 'ta' = 'en'): Promise<ToolResult> {
  try {
    switch (toolCall.tool) {
      case 'lookup_verse':
        return await executeLookupVerse(toolCall.arguments, language);
      
      case 'search_verses':
        return await executeSearchVerses(toolCall.arguments, language);
      
      case 'get_chapter':
        return await executeGetChapter(toolCall.arguments, language);
      
      case 'validate_verse_reference':
        return await executeValidateVerse(toolCall.arguments);
      
      default:
        return {
          success: false,
          error: `Unknown tool: ${toolCall.tool}`,
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Tool execution failed',
    };
  }
}

/**
 * Look up a specific verse
 */
async function executeLookupVerse(args: any, language: 'en' | 'ta'): Promise<ToolResult> {
  const { reference, translation = 'KJV' } = args;
  
  if (!reference) {
    return { success: false, error: 'Verse reference is required' };
  }

  try {
    const { getChapterVerses } = await getLocalBible();
    
    // Parse reference (e.g., "John 3:16" -> book="John", chapter=3, verse=16)
    const match = reference.match(/^(\d*\s*[A-Za-z]+\.?)\s+(\d+):(\d+)$/i);
    if (!match) {
      return { success: false, error: 'Invalid verse reference format' };
    }

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = parseInt(match[3]);

    const lang = language === 'ta' ? 'tamil' : 'english';
    const verses = await getChapterVerses(bookName, chapter, lang, translation as any);
    
    if (!verses || verses.length === 0) {
      return { success: false, error: 'Chapter not found' };
    }

    const targetVerse = verses.find(v => v.verse === verse);
    if (!targetVerse) {
      return { success: false, error: 'Verse not found in chapter' };
    }

    return {
      success: true,
      data: {
        reference: `${bookName} ${chapter}:${verse}`,
        text: targetVerse.text,
        book: bookName,
        chapter,
        verse,
        context: verses.slice(Math.max(0, verse - 2), verse + 3).map(v => ({
          verse: v.verse,
          text: v.text,
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to lookup verse' };
  }
}

/**
 * Search for verses
 */
async function executeSearchVerses(args: any, language: 'en' | 'ta'): Promise<ToolResult> {
  const { query, translation = 'KJV', maxResults = 10 } = args;
  
  if (!query || query.trim().length < 2) {
    return { success: false, error: 'Search query must be at least 2 characters' };
  }

  try {
    const { searchVerses } = await getLocalBible();
    const lang = language === 'ta' ? 'tamil' : 'english';
    const results = await searchVerses(
      query.trim(),
      lang,
      undefined,
      translation as any,
      {
        maxResults: Math.min(maxResults, 50),
        fuzzyEnabled: false,
      }
    );

    return {
      success: true,
      data: {
        query,
        count: results.length,
        verses: results.slice(0, maxResults).map(v => ({
          reference: `${v.book_name} ${v.chapter}:${v.verse}`,
          text: v.text,
          book: v.book_name,
          chapter: v.chapter,
          verse: v.verse,
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search verses' };
  }
}

/**
 * Get all verses from a chapter
 */
async function executeGetChapter(args: any, language: 'en' | 'ta'): Promise<ToolResult> {
  const { book, chapter, translation = 'KJV' } = args;
  
  if (!book || !chapter) {
    return { success: false, error: 'Book and chapter are required' };
  }

  try {
    const { getChapterVerses } = await getLocalBible();
    const lang = language === 'ta' ? 'tamil' : 'english';
    const verses = await getChapterVerses(book, chapter, lang, translation as any);
    
    if (!verses || verses.length === 0) {
      return { success: false, error: 'Chapter not found' };
    }

    return {
      success: true,
      data: {
        book,
        chapter,
        verseCount: verses.length,
        verses: verses.map(v => ({
          verse: v.verse,
          text: v.text,
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get chapter' };
  }
}

/**
 * Validate verse reference
 */
async function executeValidateVerse(args: any): Promise<ToolResult> {
  const { reference } = args;
  
  if (!reference) {
    return { success: false, error: 'Verse reference is required' };
  }

  try {
    const match = reference.match(/^(\d*\s*[A-Za-z]+\.?)\s+(\d+):(\d+)$/i);
    if (!match) {
      return {
        success: false,
        error: 'Invalid format. Expected format: "Book Chapter:Verse" (e.g., "John 3:16")',
      };
    }

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = parseInt(match[3]);

    // Try to validate by attempting to fetch
    const { getChapterVerses } = await getLocalBible();
    const verses = await getChapterVerses(bookName, chapter, 'english', 'KJV' as any);
    const isValid = verses && verses.some(v => v.verse === verse);

    return {
      success: true,
      data: {
        reference,
        valid: isValid,
        book: bookName,
        chapter,
        verse,
        message: isValid ? 'Valid verse reference' : 'Verse not found in chapter',
      },
    };
  } catch (error: any) {
    return {
      success: true,
      data: {
        reference,
        valid: false,
        error: error.message || 'Validation failed',
      },
    };
  }
}

/**
 * Generate function calling schema for OpenAI
 */
export function getFunctionCallingSchema(): any[] {
  return AGENT_TOOLS.map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

