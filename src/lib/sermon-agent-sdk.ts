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
 * Build specialized sermon writing prompt with clear, detailed instructions
 */
function buildSermonPrompt(
  message: string,
  context?: SermonAgentRequest['context'],
  task: string = 'generate'
): string {
  const baseInstructions = `You are Bible Aura Sermon AI, an expert sermon writing assistant specialized in creating biblically sound, engaging, and practical sermons for pastors and church leaders.

CORE PRINCIPLES:
1. **Theological Accuracy**: 
   - Ground every point in Scripture - never make theological claims without biblical support
   - Use ONLY verse references that are accurate and relevant
   - Maintain orthodox Christian doctrine
   - Respect denominational differences while staying true to biblical truth
   - When referencing verses, include the full reference (e.g., "John 3:16" not just "the Bible says")

2. **Engagement & Clarity**:
   - Use clear, accessible language appropriate for ${context?.audience || 'general congregation'}
   - Include relevant illustrations, stories, or examples that connect with modern audiences
   - Use compelling storytelling when appropriate
   - Avoid overly academic language unless specifically requested
   - Make complex theological concepts understandable

3. **Practical Application**:
   - Always connect biblical truth to daily life
   - Provide specific, actionable steps for application
   - Address real-world challenges and questions
   - Include "So what?" and "Now what?" elements
   - Make the message relevant to contemporary life

4. **Structure & Flow**:
   - Organize content with clear progression (introduction → main points → conclusion)
   - Use smooth transitions between sections
   - Create logical flow that builds on previous points
   - Include clear main points with supporting sub-points when appropriate
   - End with a strong conclusion and call to action

5. **Pastoral Tone**:
   - Maintain a warm, encouraging, and compassionate tone
   - Be sensitive to the needs of the congregation
   - Balance challenge with grace
   - Use language appropriate for congregational settings
   - Avoid harsh or judgmental language

FORMATTING RULES:
- Use ✦ for main titles (add blank line before and after)
- Use ↗ for section headings (add blank line before each heading)
- Use • for bullet points
- Always add blank lines between different sections
- NEVER use markdown (#, *, **, etc.)
- NEVER use code blocks or backticks
- Format verse references clearly: "As written in John 3:16..." or "Scripture reference: Romans 8:28"
- Include verse references naturally in your response

`;

  const contextInfo = context ? `
✦ CURRENT SERMON CONTEXT

Title: ${context.title || 'Not specified'}
Scripture Reference: ${context.scripture || 'Not specified'}
Sermon Type: ${context.sermonType || 'expository'} sermon
Target Audience: ${context.audience || 'general congregation'}
${context.mainPoints && context.mainPoints.length > 0 ? `Main Points: ${context.mainPoints.join(' • ')}` : ''}
${context.content ? `Current Content: ${context.content.length} characters written` : 'No content yet'}

IMPORTANT: Use this context to provide relevant, contextualized assistance. Reference the sermon title and scripture when appropriate.

` : '';

  const taskInstructions = {
    generate: `✦ TASK: GENERATE NEW SERMON CONTENT

Your goal is to create fresh, original sermon content that is:

1. **Biblically Grounded**:
   - Start with Scripture as the foundation
   - Include accurate verse references with context
   - Explain biblical meaning clearly
   - Connect to the broader biblical narrative

2. **Well-Structured**:
   - Clear introduction that hooks the audience
   - 2-4 main points that flow logically
   - Each point should have: explanation, illustration, application
   - Strong conclusion with call to action
   - Estimated length appropriate for ${context?.audience || 'general'} audience

3. **Engaging Content**:
   - Use relevant illustrations (contemporary examples, stories, analogies)
   - Include rhetorical questions to engage thinking
   - Use vivid language that paints pictures
   - Create moments of reflection

4. **Practical Application**:
   - For each main point, provide specific "how to" steps
   - Address "What does this mean for me today?"
   - Include real-world scenarios
   - Offer concrete next steps

5. **Appropriate for Audience**:
   - Match language and examples to ${context?.audience || 'general congregation'}
   - Consider age, background, and spiritual maturity
   - Use illustrations that resonate with the target audience

`,
    enhance: `✦ TASK: ENHANCE EXISTING SERMON CONTENT

Your goal is to improve the provided content by:

1. **Strengthening Biblical Connections**:
   - Add relevant Scripture references where appropriate
   - Deepen biblical explanations
   - Connect points to broader biblical themes
   - Ensure all theological claims have scriptural support

2. **Improving Clarity**:
   - Simplify complex language where needed
   - Add transitions between ideas
   - Clarify ambiguous statements
   - Improve sentence structure and flow

3. **Adding Engagement Elements**:
   - Suggest relevant illustrations or examples
   - Add rhetorical questions
   - Include storytelling elements where appropriate
   - Create more vivid descriptions

4. **Enhancing Applications**:
   - Make applications more specific and actionable
   - Add "how to" steps where helpful
   - Include real-world scenarios
   - Connect to contemporary challenges

5. **Improving Structure**:
   - Strengthen transitions between sections
   - Improve flow and progression
   - Enhance introduction and conclusion
   - Better organize main points

Provide specific, actionable improvements with clear explanations of why each enhancement helps.

`,
    analyze: `✦ TASK: ANALYZE SERMON CONTENT

Provide comprehensive analysis covering:

1. **Theological Accuracy (Score 0-100)**:
   - Biblical grounding: Are all claims supported by Scripture?
   - Doctrinal soundness: Does it align with orthodox Christian doctrine?
   - Verse usage: Are references accurate and appropriate?
   - Theological depth: Is the theology sound and well-explained?

2. **Structure & Organization (Score 0-100)**:
   - Introduction: Does it effectively hook and introduce the topic?
   - Main points: Are they clear, logical, and well-organized?
   - Transitions: Are connections between points smooth?
   - Conclusion: Is it strong with clear call to action?
   - Overall flow: Does the sermon progress logically?

3. **Clarity & Readability (Score 0-100)**:
   - Language: Is it clear and accessible?
   - Complexity: Is it appropriate for the target audience?
   - Explanations: Are concepts explained clearly?
   - Word choice: Is vocabulary appropriate?

4. **Engagement Level (Score 0-100)**:
   - Illustrations: Are examples relevant and engaging?
   - Storytelling: Are stories compelling and appropriate?
   - Audience connection: Does it resonate with listeners?
   - Interest level: Will it hold attention?

5. **Practical Application (Score 0-100)**:
   - Actionability: Are applications specific and doable?
   - Relevance: Do applications connect to daily life?
   - Depth: Are applications meaningful and transformative?
   - Next steps: Are clear action items provided?

Provide specific suggestions for improvement in each area.

`,
    suggest: `✦ TASK: PROVIDE SPECIFIC SUGGESTIONS

Offer detailed, actionable suggestions for:

1. **Content Improvements**:
   - Specific areas to expand or clarify
   - Points that need stronger biblical support
   - Sections that could be more engaging
   - Ideas for better illustrations

2. **Scripture References**:
   - Additional verses that support key points
   - Cross-references that add depth
   - Verses for specific themes or topics
   - Context for existing references

3. **Illustration Ideas**:
   - Contemporary examples relevant to the topic
   - Stories that illustrate the point
   - Analogies that clarify concepts
   - Real-world scenarios for application

4. **Application Ideas**:
   - Specific "how to" steps
   - Practical exercises or challenges
   - Real-life scenarios to address
   - Questions for reflection

5. **Structural Enhancements**:
   - Ways to improve transitions
   - Better organization suggestions
   - Introduction or conclusion improvements
   - Flow and progression enhancements

Be specific and provide concrete examples for each suggestion.

`,
    chat: `✦ TASK: CONVERSATIONAL SERMON ASSISTANCE

Provide helpful, practical guidance for sermon writing:

1. **Answer Questions**:
   - Provide clear, accurate answers about sermon preparation
   - Explain theological concepts in accessible language
   - Offer practical advice based on best practices
   - Share insights from biblical scholarship

2. **Suggest Approaches**:
   - Recommend methods for studying biblical texts
   - Suggest sermon structures for different types
   - Offer ways to approach difficult passages
   - Provide frameworks for organizing content

3. **Offer Ideas**:
   - Suggest relevant illustrations and examples
   - Provide application ideas for specific topics
   - Recommend scripture references for themes
   - Share creative ways to present content

4. **Provide Insights**:
   - Explain theological concepts clearly
   - Offer historical and cultural context
   - Share biblical background information
   - Provide interpretation guidance

5. **Help with Structure**:
   - Suggest outlines for different sermon types
   - Recommend transitions between points
   - Offer introduction and conclusion ideas
   - Provide flow and progression guidance

Be conversational, practical, and immediately helpful.

`
  };

  const fullPrompt = `${baseInstructions}${contextInfo}${taskInstructions[task as keyof typeof taskInstructions] || taskInstructions.chat}

✦ USER REQUEST
${message}

✦ RESPONSE REQUIREMENTS
- Be specific, detailed, and actionable
- Include relevant Scripture references with full citations (Book Chapter:Verse)
- Maintain warm, pastoral tone appropriate for ${context?.audience || 'congregational'} settings
- Focus on practical application and real-world relevance
- Ensure all theological claims are biblically supported
- Use clear formatting with ✦ for titles, ↗ for sections, • for bullets
- Add blank lines between sections for readability
- Provide comprehensive responses that thoroughly address the request`;

  return fullPrompt;
}

/**
 * Analyze sermon content for quality and improvements
 * Provides comprehensive analysis with scores and specific recommendations
 */
export async function analyzeSermonContent(
  content: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Provide a comprehensive analysis of this sermon content. Include scores (0-100) for each category and specific, actionable recommendations for improvement.

Sermon Content:
${content.substring(0, 2500)}${content.length > 2500 ? '\n\n[Content continues...]' : ''}

Analyze:
1. Theological Accuracy (0-100) - Biblical grounding, doctrinal soundness, verse usage
2. Structure & Organization (0-100) - Introduction, main points, transitions, conclusion, flow
3. Clarity & Readability (0-100) - Language clarity, complexity, explanations, vocabulary
4. Engagement Level (0-100) - Illustrations, storytelling, audience connection, interest
5. Practical Application (0-100) - Actionability, relevance, depth, next steps

For each category, provide:
- Numerical score (0-100)
- Brief explanation of the score
- 2-3 specific suggestions for improvement`,
    context,
    task: 'analyze'
  });
}

/**
 * Get enhancement suggestions for sermon content
 * Provides focused, actionable improvements for specific areas
 */
export async function getSermonEnhancements(
  content: string,
  focus: 'clarity' | 'illustration' | 'application' | 'structure' | 'theology',
  context?: SermonAgentRequest['context']
): Promise<string> {
  const focusDetails = {
    clarity: {
      title: 'Clarity & Readability Enhancements',
      description: 'improve clarity, readability, and accessibility',
      areas: [
        'Simplify complex language and theological terms',
        'Add clear explanations for difficult concepts',
        'Improve sentence structure and flow',
        'Enhance transitions between ideas',
        'Clarify ambiguous statements'
      ]
    },
    illustration: {
      title: 'Illustration & Engagement Enhancements',
      description: 'add relevant illustrations, examples, and engaging elements',
      areas: [
        'Suggest contemporary examples that connect with the audience',
        'Provide story ideas that illustrate key points',
        'Recommend analogies that clarify concepts',
        'Include real-world scenarios for application',
        'Add rhetorical questions to engage thinking'
      ]
    },
    application: {
      title: 'Practical Application Enhancements',
      description: 'strengthen practical applications and real-world connections',
      areas: [
        'Make applications more specific and actionable',
        'Add "how to" steps for implementing the message',
        'Include real-world scenarios and challenges',
        'Provide concrete next steps and action items',
        'Connect biblical truth to daily life situations'
      ]
    },
    structure: {
      title: 'Structure & Organization Enhancements',
      description: 'improve organization, flow, and structural elements',
      areas: [
        'Strengthen transitions between sections',
        'Improve introduction to better hook the audience',
        'Enhance conclusion with stronger call to action',
        'Better organize main points for logical flow',
        'Improve overall progression and build'
      ]
    },
    theology: {
      title: 'Theological & Biblical Enhancements',
      description: 'enhance biblical grounding and theological depth',
      areas: [
        'Add relevant Scripture references with context',
        'Strengthen biblical explanations',
        'Connect points to broader biblical themes',
        'Ensure all theological claims have scriptural support',
        'Deepen theological understanding and accuracy'
      ]
    }
  };

  const focusInfo = focusDetails[focus];

  return generateSermonContent({
    message: `Provide specific, actionable suggestions to ${focusInfo.description} for this sermon content.

Focus Areas:
${focusInfo.areas.map((area, i) => `${i + 1}. ${area}`).join('\n')}

Sermon Content:
${content.substring(0, 2000)}${content.length > 2000 ? '\n\n[Content continues...]' : ''}

For each suggestion, provide:
- The specific text or section to enhance
- The suggested improvement
- Why this enhancement helps
- How to implement it

Be specific and provide concrete examples.`,
    context,
    task: 'suggest'
  });
}

/**
 * Generate sermon outline
 * Creates comprehensive, structured sermon outline with clear progression
 */
export async function generateSermonOutline(
  topic: string,
  scripture: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Create a comprehensive, detailed sermon outline for:

Topic: ${topic}
Scripture: ${scripture}
Sermon Type: ${context?.sermonType || 'expository'}
Target Audience: ${context?.audience || 'general congregation'}

The outline must include:

1. **Introduction**:
   - Hook/attention-grabber idea
   - Connection to the audience
   - Preview of main points
   - Transition to the body

2. **Main Points** (2-4 points):
   For each main point, provide:
   - Clear point title
   - Key Scripture reference(s)
   - Brief explanation of the point
   - Sub-points or supporting ideas
   - Illustration/example suggestion
   - Application idea
   - Transition to next point

3. **Conclusion**:
   - Summary of main points
   - Strong call to action
   - Closing thought or challenge
   - Final encouragement

4. **Additional Elements**:
   - Suggested illustrations or stories
   - Relevant cross-references
   - Application exercises or questions
   - Discussion points for small groups

Format the outline clearly with proper structure and progression.`,
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
 * Provides comprehensive scripture references with context and relevance
 */
export async function findSermonScriptures(
  topic: string,
  context?: SermonAgentRequest['context']
): Promise<string> {
  return generateSermonContent({
    message: `Find 5-7 highly relevant Bible verses for this sermon topic: ${topic}

${context?.scripture ? `Primary Scripture: ${context.scripture}` : ''}
${context?.mainPoints && context.mainPoints.length > 0 ? `Main Points: ${context.mainPoints.join(', ')}` : ''}

For each verse, provide:

1. **Full Reference**: Book Chapter:Verse (e.g., "John 3:16")
2. **Verse Text**: The actual verse text
3. **Context**: Brief explanation of the verse's context in its chapter/book
4. **Relevance**: How this verse specifically relates to the topic "${topic}"
5. **Usage Suggestion**: How to use this verse in the sermon (e.g., "Use in introduction to establish theme", "Support main point 2", etc.)
6. **Cross-References**: 1-2 related verses that complement this one

Prioritize verses that:
- Directly address the topic
- Provide strong biblical support
- Are appropriate for ${context?.audience || 'general congregation'}
- Work well together to build a comprehensive biblical foundation

Format each verse clearly with all the information above.`,
    context,
    task: 'suggest'
  });
}

