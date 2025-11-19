// Advanced Memory System for Agents
// Provides long-term memory, conversation context, and user preference learning

import { createClient } from '@supabase/supabase-js';
import { generateOpenAIEmbedding } from '../bible-rag/openai-embeddings.js';

interface MemoryEntry {
  id: string;
  userId: string;
  query: string;
  response: string;
  context: string;
  embedding?: number[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ConversationMemory {
  conversationId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  summary?: string;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

/**
 * Store conversation memory
 */
export async function storeConversationMemory(
  userId: string,
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  summary?: string
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate summary if not provided
    if (!summary && messages.length > 4) {
      summary = await generateConversationSummary(messages);
    }
    
    // Extract topics from conversation
    const topics = extractTopics(messages);
    
    const { error } = await supabase
      .from('ai_conversations')
      .upsert({
        id: conversationId,
        user_id: userId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
        })),
        summary,
        topics,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('[Memory] Error storing conversation:', error);
    }
  } catch (error) {
    console.error('[Memory] Error storing conversation memory:', error);
  }
}

/**
 * Retrieve relevant conversation memories
 */
export async function retrieveRelevantMemories(
  userId: string,
  query: string,
  limit: number = 5
): Promise<ConversationMemory[]> {
  try {
    const supabase = getSupabaseClient();
    
    // Generate query embedding for semantic search
    const queryEmbedding = await generateOpenAIEmbedding(query);
    
    // Search for similar conversations using vector similarity
    // Note: This requires a vector column in ai_conversations table
    // For now, use keyword search as fallback
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit * 2); // Get more for filtering
    
    if (error) {
      console.error('[Memory] Error retrieving memories:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filter and rank by relevance
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
    
    const scored = data.map(conv => {
      const content = JSON.stringify(conv.messages || []).toLowerCase();
      const summary = (conv.summary || '').toLowerCase();
      const topics = (conv.topics || []).join(' ').toLowerCase();
      const allText = `${content} ${summary} ${topics}`;
      
      // Calculate relevance score
      let score = 0;
      for (const term of queryTerms) {
        const matches = (allText.match(new RegExp(term, 'g')) || []).length;
        score += matches;
      }
      
      // Boost if query terms appear in summary or topics
      if (summary.includes(queryLower) || topics.includes(queryLower)) {
        score += 5;
      }
      
      return { ...conv, relevanceScore: score };
    });
    
    // Sort by relevance and return top results
    return scored
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(item => ({
        conversationId: item.id,
        userId: item.user_id,
        messages: item.messages || [],
        summary: item.summary,
        topics: item.topics || [],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
  } catch (error) {
    console.error('[Memory] Error retrieving memories:', error);
    return [];
  }
}

/**
 * Generate conversation summary
 */
async function generateConversationSummary(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  // Simple extraction-based summarization
  // In production, could use LLM for better summaries
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');
  
  // Extract key topics (simple keyword extraction)
  const words = userMessages.toLowerCase().split(/\s+/);
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where']);
  const keywords = words
    .filter(w => w.length > 4 && !commonWords.has(w))
    .slice(0, 5);
  
  return `Conversation about: ${keywords.join(', ')}`;
}

/**
 * Extract topics from conversation
 */
function extractTopics(messages: Array<{ role: 'user' | 'assistant'; content: string }>): string[] {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  
  // Bible-related topic keywords
  const bibleTopics = [
    'salvation', 'faith', 'love', 'prayer', 'worship', 'sin', 'grace', 'mercy',
    'jesus', 'christ', 'god', 'holy spirit', 'bible', 'scripture', 'verse',
    'parable', 'character', 'doctrine', 'theology', 'gospel', 'church'
  ];
  
  const foundTopics: string[] = [];
  for (const topic of bibleTopics) {
    if (allText.includes(topic)) {
      foundTopics.push(topic);
    }
  }
  
  return foundTopics.slice(0, 5);
}

/**
 * Get user preferences from conversation history
 */
export async function getUserPreferences(userId: string): Promise<{
  preferredLanguage: 'en' | 'ta' | null;
  preferredModes: string[];
  commonTopics: string[];
}> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('topics, messages, language, mode')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);
    
    if (error || !data || data.length === 0) {
      return {
        preferredLanguage: null,
        preferredModes: [],
        commonTopics: [],
      };
    }
    
    // Analyze preferences
    const languages: Record<string, number> = {};
    const modes: Record<string, number> = {};
    const allTopics: string[] = [];
    
    for (const conv of data) {
      if (conv.language) {
        languages[conv.language] = (languages[conv.language] || 0) + 1;
      }
      if (conv.mode) {
        modes[conv.mode] = (modes[conv.mode] || 0) + 1;
      }
      if (conv.topics) {
        allTopics.push(...(conv.topics || []));
      }
    }
    
    const preferredLanguage = Object.keys(languages).length > 0
      ? (Object.entries(languages).sort((a, b) => b[1] - a[1])[0][0] as 'en' | 'ta')
      : null;
    
    const preferredModes = Object.entries(modes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mode]) => mode);
    
    // Count topic frequency
    const topicCounts: Record<string, number> = {};
    for (const topic of allTopics) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
    
    const commonTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
    
    return {
      preferredLanguage,
      preferredModes,
      commonTopics,
    };
  } catch (error) {
    console.error('[Memory] Error getting user preferences:', error);
    return {
      preferredLanguage: null,
      preferredModes: [],
      commonTopics: [],
    };
  }
}

