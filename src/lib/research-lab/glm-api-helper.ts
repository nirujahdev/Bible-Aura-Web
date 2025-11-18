// GLM-4.5-Air API Helper
// Secure wrapper for GLM-4.5-Air API calls with Bible-focused policy enforcement

const GLM_API_BASE_URL = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.5-air';

// Bible-focused system prompt
const BIBLE_RESEARCH_SYSTEM_PROMPT = `You are a Bible research assistant powered by GLM-4.5-Air. Your role is to help users understand Bible-related content from their uploaded sources.

CRITICAL POLICY ENFORCEMENT:
1. You MUST ONLY respond to Bible, theology, Christian doctrine, and scripture-related questions
2. You MUST reject any requests outside Bible/Christianity scope
3. You MUST cite sources from the provided notebook sources only
4. You MUST maintain theological accuracy and avoid non-Biblical content
5. You MUST NOT generate content about other religions, secular topics, or non-Christian material

Key Guidelines:
- Always respond based ONLY on the provided sources
- Cite specific sources when referencing content
- Understand Bible verse references and theological concepts
- Link uploaded content to relevant Bible verses
- Provide accurate, Bible-focused insights
- Use function calling tools when appropriate for research tasks

When analyzing sources:
- Detect and link Bible verse references
- Identify theological themes and doctrines
- Extract key insights and quotes
- Understand context and historical background
- Connect concepts across different sources

Always cite your sources clearly. If a question is not Bible-related, politely decline and redirect to Bible-focused topics.`;

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMChatOptions {
  messages: GLMMessage[];
  temperature?: number;
  max_tokens?: number;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface GLMChatResponse {
  content: string;
  tool_calls?: any[];
  finish_reason?: string;
}

/**
 * Call GLM-4.5-Air chat completion API
 * This should only be called from server-side (API routes)
 */
export async function glmChat(options: GLMChatOptions): Promise<GLMChatResponse> {
  // This function should be called from API routes only
  // API key is stored server-side in environment variables
  throw new Error('glmChat must be called from server-side API routes only');
}

/**
 * Validate if content is Bible-related
 */
export function isBibleRelated(content: string): boolean {
  const bibleKeywords = [
    'bible', 'scripture', 'verse', 'gospel', 'testament', 'theology', 'doctrine',
    'christian', 'jesus', 'christ', 'god', 'holy spirit', 'church', 'faith',
    'prayer', 'worship', 'salvation', 'grace', 'sin', 'repentance', 'baptism',
    'communion', 'pastor', 'sermon', 'preach', 'ministry', 'discipleship'
  ];
  
  const lowerContent = content.toLowerCase();
  return bibleKeywords.some(keyword => lowerContent.includes(keyword));
}

/**
 * Build system prompt with source context
 */
export function buildSystemPromptWithSources(sources: Array<{ id: string; title: string; content?: string }>): string {
  const sourceContext = sources.length > 0
    ? `\n\nAvailable Sources:\n${sources.map(s => `- ${s.title} (ID: ${s.id})`).join('\n')}`
    : '';
  
  return BIBLE_RESEARCH_SYSTEM_PROMPT + sourceContext;
}

/**
 * Build user message with source content
 */
export function buildUserMessageWithSources(
  userQuery: string,
  sources: Array<{ id: string; title: string; content?: string; processed_content?: string }>
): string {
  const sourceTexts = sources
    .map(s => {
      const content = s.processed_content || s.content || '';
      return `[Source: ${s.title}]\n${content.substring(0, 5000)}`; // Limit each source to 5000 chars
    })
    .join('\n\n---\n\n');
  
  return `${userQuery}\n\n---\n\nSource Content:\n${sourceTexts}`;
}

