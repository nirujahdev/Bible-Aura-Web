// Sermon Agent SDK - Specialized AI for sermon writing using Agent SDK
import { sendBibleAuraMessage, AgentSDKResponse } from './agent-sdk';

export interface SermonAgentRequest {
  message: string;
  context?: {
    title?: string;
    scripture?: string;
    content?: string;
    mainPoints?: string[];
    sermonType?: 'expository' | 'topical' | 'narrative' | 'devotional';
    audience?: string;
  };
  task?: 'generate' | 'enhance' | 'analyze' | 'suggest' | 'chat';
}

/**
 * Generate sermon content using Agent SDK with specialized sermon instructions
 */
export async function generateSermonContent(
  request: SermonAgentRequest
): Promise<string> {
  const { message, context, task = 'generate' } = request;

  // Build comprehensive sermon-specific prompt
  const sermonPrompt = buildSermonPrompt(message, context, task);

  try {
    // Use agent SDK with 'topical' mode for comprehensive responses
    // or 'chat' mode for conversational assistance
    const mode = task === 'chat' ? 'chat' : 'topical';
    
    const response: AgentSDKResponse = await sendBibleAuraMessage(sermonPrompt, {
      mode,
      language: 'en'
    });

    return response.text || '';
  } catch (error: any) {
    console.error('Sermon Agent SDK error:', error);
    throw error;
  }
}

/**
 * Build specialized sermon writing prompt with clear instructions
 */
function buildSermonPrompt(
  message: string,
  context?: SermonAgentRequest['context'],
  task: string = 'generate'
): string {
  const baseInstructions = `You are an expert sermon writing assistant specialized in creating biblically sound, engaging, and practical sermons. Your responses must be:

1. **Theologically Accurate**: Grounded in Scripture, doctrinally sound, and faithful to biblical truth
2. **Engaging**: Use clear language, relevant illustrations, and compelling storytelling
3. **Practical**: Provide actionable applications that connect biblical truth to daily life
4. **Structured**: Well-organized with clear points, transitions, and flow
5. **Pastoral**: Warm, encouraging, and appropriate for congregational settings

`;

  const contextInfo = context ? `
**Current Sermon Context:**
- Title: ${context.title || 'Not specified'}
- Scripture: ${context.scripture || 'Not specified'}
- Sermon Type: ${context.sermonType || 'expository'}
- Target Audience: ${context.audience || 'general congregation'}
${context.mainPoints && context.mainPoints.length > 0 ? `- Main Points: ${context.mainPoints.join(', ')}` : ''}
${context.content ? `- Current Content Length: ${context.content.length} characters` : ''}
` : '';

  const taskInstructions = {
    generate: `**Task: Generate New Content**
Create fresh, original sermon content that is:
- Biblically grounded and theologically sound
- Engaging and relevant to modern audiences
- Well-structured with clear progression
- Practical with real-life applications
- Appropriate for ${context?.audience || 'general'} audience

`,
    enhance: `**Task: Enhance Existing Content**
Improve the provided content by:
- Strengthening biblical connections
- Adding relevant illustrations or examples
- Improving clarity and flow
- Enhancing practical applications
- Making transitions smoother

`,
    analyze: `**Task: Analyze Content**
Provide detailed analysis of the sermon content including:
- Theological accuracy and biblical grounding
- Structure and organization
- Clarity and readability
- Engagement level
- Practical application strength
- Areas for improvement

`,
    suggest: `**Task: Provide Suggestions**
Offer specific, actionable suggestions for:
- Content improvements
- Additional illustrations
- Scripture references
- Application ideas
- Structural enhancements

`,
    chat: `**Task: Conversational Assistance**
Provide helpful, practical guidance for sermon writing including:
- Answering questions about sermon preparation
- Suggesting approaches to biblical texts
- Offering illustration ideas
- Providing theological insights
- Helping with structure and flow

`
  };

  const fullPrompt = `${baseInstructions}${contextInfo}${taskInstructions[task as keyof typeof taskInstructions] || taskInstructions.chat}

**User Request:**
${message}

**Response Guidelines:**
- Be specific and actionable
- Include relevant Scripture references when appropriate
- Maintain a warm, pastoral tone
- Focus on practical application
- Ensure theological accuracy
- Keep responses focused and concise unless generating full content`;

  return fullPrompt;
}

/**
 * Analyze sermon content for quality and improvements
 */
export async function analyzeSermonContent(
  content: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Analyze this sermon content and provide detailed feedback:\n\n${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}`,
    context,
    task: 'analyze'
  });
}

/**
 * Get enhancement suggestions for sermon content
 */
export async function getSermonEnhancements(
  content: string,
  focus: 'clarity' | 'illustration' | 'application' | 'structure' | 'theology',
  context?: SermonAgentRequest['context']
): Promise<string> {
  const focusMap = {
    clarity: 'improve clarity and readability',
    illustration: 'add relevant illustrations and examples',
    application: 'strengthen practical applications',
    structure: 'improve organization and flow',
    theology: 'enhance biblical grounding and theological depth'
  };

  return generateSermonContent({
    message: `Provide specific suggestions to ${focusMap[focus]} for this sermon content:\n\n${content.substring(0, 1500)}${content.length > 1500 ? '...' : ''}`,
    context,
    task: 'suggest'
  });
}

/**
 * Generate sermon outline
 */
export async function generateSermonOutline(
  topic: string,
  scripture: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Create a detailed sermon outline for:\nTopic: ${topic}\nScripture: ${scripture}\n\nInclude main points, sub-points, introduction ideas, and conclusion suggestions.`,
    context: {
      ...context,
      title: topic,
      scripture: scripture
    },
    task: 'generate'
  });
}

/**
 * Find relevant scriptures for sermon topic
 */
export async function findSermonScriptures(
  topic: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Find 5-7 relevant Bible verses for this sermon topic: ${topic}\n\nProvide verse references, brief context, and explain how each verse relates to the topic.`,
    context,
    task: 'suggest'
  });
}

