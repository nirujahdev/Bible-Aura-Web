// Sermon Agent System - Agent-based tool execution (SermonAI-style)
// Use dynamic import to prevent circular dependency issues
import { checkAndIncrementUsage } from './ai-limits';

export interface SermonContext {
  title?: string;
  scripture?: string;
  content?: string;
  mainPoints?: string[];
  audience?: string;
  sermonType?: 'expository' | 'topical' | 'narrative' | 'devotional';
}

export interface AgentResult {
  content: string;
  citations?: string[];
  sources?: string[];
  action: 'insert' | 'replace' | 'append' | 'show';
  metadata?: Record<string, any>;
}

export interface SermonAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'writing' | 'analysis';
  execute: (context: SermonContext, params?: Record<string, any>) => Promise<AgentResult>;
}

/**
 * Historical Context Agent
 * Provides historical background for biblical passages
 */
export const historicalContextAgent: SermonAgent = {
  id: 'historical-context',
  name: 'Historical Context',
  description: 'Get historical background for any passage',
  icon: 'Globe',
  category: 'research',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const passage = params?.passage || context.scripture || 'Not specified';
    
    const prompt = `Provide comprehensive historical context for this biblical passage: ${passage}

Include:
1. Historical setting and time period
2. Cultural background
3. Political/social context
4. Relevant historical events
5. How this context helps understand the passage

Sermon Title: ${context.title || 'Not specified'}

Format your response clearly with sections.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'suggest'
    });

    return {
      content: result,
      action: 'show',
      metadata: { passage, type: 'historical-context' }
    };
  }
};

/**
 * Passage Guide Agent
 * Detailed analysis of scripture passages
 */
export const passageGuideAgent: SermonAgent = {
  id: 'passage-guide',
  name: 'Passage Guide',
  description: 'Detailed passage analysis with commentary',
  icon: 'BookOpen',
  category: 'research',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const passage = params?.passage || context.scripture || 'Not specified';
    
    const prompt = `Provide a comprehensive passage guide for: ${passage}

Include:
1. Verse-by-verse explanation
2. Key theological themes
3. Cross-references to related passages
4. Commentary insights
5. Application points
6. Questions for reflection

Sermon Title: ${context.title || 'Not specified'}

Format clearly with headings for each section.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'analyze'
    });

    return {
      content: result,
      action: 'show',
      metadata: { passage, type: 'passage-guide' }
    };
  }
};

/**
 * Topic Explorer Agent
 * Finds related scriptures by topic/theme
 */
export const topicExplorerAgent: SermonAgent = {
  id: 'topic-explorer',
  name: 'Topic Explorer',
  description: 'Find related scriptures by theme',
  icon: 'Search',
  category: 'research',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const topic = params?.topic || context.title || 'Not specified';
    
    const prompt = `Find and list relevant Bible verses for this topic: ${topic}

For each verse, provide:
1. Full reference (book, chapter, verse)
2. Verse text
3. Brief explanation of relevance
4. How it relates to the topic

Current Scripture: ${context.scripture || 'Not specified'}

List at least 5-10 relevant verses, organized by theme or relevance.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'suggest'
    });

    return {
      content: result,
      action: 'show',
      metadata: { topic, type: 'topic-explorer' }
    };
  }
};

/**
 * Quote Finder Agent
 * Finds relevant quotes from theologians and authors
 */
export const quoteFinderAgent: SermonAgent = {
  id: 'quote-finder',
  name: 'Quote Finder',
  description: 'Find relevant quotes from theologians',
  icon: 'Quote',
  category: 'research',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const topic = params?.topic || context.title || 'Not specified';
    
    const prompt = `Find relevant quotes from Christian theologians, pastors, and authors for this sermon topic: ${topic}

For each quote, provide:
1. The quote text
2. Author name
3. Brief context about the author
4. How it relates to the sermon topic

Scripture: ${context.scripture || 'Not specified'}

Provide 3-5 relevant quotes with proper attribution.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'suggest'
    });

    return {
      content: result,
      action: 'show',
      metadata: { topic, type: 'quote-finder' }
    };
  }
};

/**
 * Illustration Finder Agent
 * Finds sermon illustrations and stories
 */
export const illustrationFinderAgent: SermonAgent = {
  id: 'illustration-finder',
  name: 'Illustration Finder',
  description: 'Find sermon illustrations and stories',
  icon: 'Lightbulb',
  category: 'writing',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const topic = params?.topic || context.title || 'Not specified';
    
    const prompt = `Suggest relevant illustrations, stories, or examples for this sermon:

Topic: ${topic}
Scripture: ${context.scripture || 'Not specified'}

For each illustration, provide:
1. The illustration/story
2. How it relates to the scripture
3. Application point
4. When to use it in the sermon

Provide 2-3 illustrations that are engaging, relatable, and biblically sound.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'suggest'
    });

    return {
      content: result,
      action: 'insert',
      metadata: { topic, type: 'illustration' }
    };
  }
};

/**
 * Call to Action Agent
 * Generates impactful conclusions and calls to action
 */
export const callToActionAgent: SermonAgent = {
  id: 'call-to-action',
  name: 'Call to Action',
  description: 'Generate impactful conclusions',
  icon: 'Target',
  category: 'writing',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const prompt = `Generate a powerful call to action for this sermon:

Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}
Main Points: ${context.mainPoints?.join(', ') || 'Not specified'}

Create:
1. A compelling summary of key points
2. A clear, actionable call to action
3. Practical next steps
4. A closing prayer or benediction

Make it inspiring, specific, and applicable to daily life.`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'generate'
    });

    return {
      content: result,
      action: 'append',
      metadata: { type: 'call-to-action' }
    };
  }
};

/**
 * Sermon Sculptor Agent
 * Refines structure and flow
 */
export const sermonSculptorAgent: SermonAgent = {
  id: 'sermon-sculptor',
  name: 'Sermon Sculptor',
  description: 'Refine structure and flow',
  icon: 'Wand2',
  category: 'writing',
  execute: async (context, params) => {
    // Dynamically import to prevent circular dependency
    const { generateSermonContent } = await import('./sermon-agent-sdk');
    
    const content = params?.content || context.content || '';
    
    const prompt = `Improve the structure and flow of this sermon content:

${content.substring(0, 2000)}

Provide:
1. Improved version with better structure
2. Suggestions for transitions
3. Recommendations for flow
4. Areas that need development

Title: ${context.title || 'Not specified'}
Scripture: ${context.scripture || 'Not specified'}`;

    const result = await generateSermonContent({
      message: prompt,
      context,
      task: 'enhance'
    });

    return {
      content: result,
      action: 'replace',
      metadata: { type: 'sermon-sculptor' }
    };
  }
};

/**
 * Get all available agents
 */
export function getAllAgents(): SermonAgent[] {
  return [
    historicalContextAgent,
    passageGuideAgent,
    topicExplorerAgent,
    quoteFinderAgent,
    illustrationFinderAgent,
    callToActionAgent,
    sermonSculptorAgent,
  ];
}

/**
 * Get agent by ID
 */
export function getAgentById(id: string): SermonAgent | undefined {
  return getAllAgents().find(agent => agent.id === id);
}

/**
 * Execute an agent with usage checking
 */
export async function executeAgent(
  agentId: string,
  context: SermonContext,
  userId: string,
  params?: Record<string, any>
): Promise<AgentResult> {
  const agent = getAgentById(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  // Check usage limit
  const usageResult = await checkAndIncrementUsage(userId, 'ai_message');
  if (!usageResult.allowed) {
    throw new Error(`AI message limit reached: ${usageResult.limit}`);
  }

  return await agent.execute(context, params);
}

