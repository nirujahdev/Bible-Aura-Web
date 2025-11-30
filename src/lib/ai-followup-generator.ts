// AI Follow-Up Question Generator
// Generates contextual follow-up questions using OpenAI

import { OpenAI } from "openai";

export interface FollowUpQuestion {
  question: string;
  relevance: number; // 0-1 score
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Generate contextual follow-up questions using AI
 * @param userQuery - The user's current question
 * @param aiResponse - The AI's response to the question
 * @param conversationHistory - Last 3-5 messages in the conversation
 * @param client - OpenAI client instance
 * @returns Array of follow-up questions with relevance scores
 */
export async function generateContextualFollowUps(
  userQuery: string,
  aiResponse: string,
  conversationHistory: ConversationMessage[],
  client: OpenAI
): Promise<FollowUpQuestion[]> {
  try {
    // Build conversation context summary
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const prompt = `You are a Bible study assistant helping generate relevant follow-up questions.

Current User Question: "${userQuery}"

AI Response:
${aiResponse}

${conversationHistory.length > 0 ? `Recent Conversation Context:\n${conversationContext}\n\n` : ''}

Generate 3-5 contextual follow-up questions that:
1. Are directly related to the AI response and user's question
2. Help deepen understanding of the biblical topic
3. Explore related themes, verses, or concepts mentioned in the response
4. Are natural next steps in the conversation
5. Are specific and actionable (not generic)

Consider:
- Key Bible verses mentioned in the response
- Theological concepts discussed
- Characters, stories, or parables referenced
- Practical applications suggested
- Related topics that would enhance understanding

Return JSON only:
{
  "questions": [
    {
      "question": "specific follow-up question here",
      "relevance": 0.0-1.0
    }
  ]
}

Prioritize questions with high relevance (0.7+) that directly relate to the response content.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a Bible study assistant. Always return valid JSON with contextual follow-up questions. Focus on questions that deepen biblical understanding and are directly relevant to the conversation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    if (!responseText) {
      return getFallbackQuestions(userQuery, aiResponse);
    }

    try {
      const parsed = JSON.parse(responseText);
      const questions = parsed.questions || [];
      
      // Validate and filter questions
      const validQuestions = questions
        .filter((q: any) => q.question && typeof q.question === 'string' && q.question.trim().length > 10)
        .map((q: any) => ({
          question: q.question.trim(),
          relevance: typeof q.relevance === 'number' ? Math.max(0, Math.min(1, q.relevance)) : 0.7
        }))
        .sort((a: FollowUpQuestion, b: FollowUpQuestion) => b.relevance - a.relevance)
        .slice(0, 5);

      // If we have at least 3 good questions, return them
      if (validQuestions.length >= 3) {
        return validQuestions;
      }

      // Otherwise, supplement with fallback questions
      const fallbackQuestions = getFallbackQuestions(userQuery, aiResponse);
      const combined = [...validQuestions, ...fallbackQuestions]
        .filter((q, index, self) => 
          index === self.findIndex((t) => t.question.toLowerCase() === q.question.toLowerCase())
        )
        .slice(0, 5);
      
      return combined;
    } catch (parseError) {
      console.error('[Follow-Up Generator] JSON parse error:', parseError);
      return getFallbackQuestions(userQuery, aiResponse);
    }
  } catch (error: any) {
    console.error('[Follow-Up Generator] Error:', error.message);
    return getFallbackQuestions(userQuery, aiResponse);
  }
}

/**
 * Fallback function to generate basic follow-up questions
 * Used when AI generation fails
 */
function getFallbackQuestions(userQuery: string, aiResponse: string): FollowUpQuestion[] {
  const questions: FollowUpQuestion[] = [];
  const responseLower = aiResponse.toLowerCase();
  const queryLower = userQuery.toLowerCase();

  // Extract verse references
  const versePattern = /\b(\d*\s*[A-Za-z]+\.?\s+\d+):(\d+)(?:-(\d+))?\b/g;
  const verseMatches = [...aiResponse.matchAll(versePattern)];
  const verses = [...new Set(verseMatches.map(m => m[0]))];

  if (verses.length > 0) {
    const verse = verses[0];
    questions.push({
      question: `What is the historical context of ${verse}?`,
      relevance: 0.8
    });
    questions.push({
      question: `How do scholars interpret ${verse}?`,
      relevance: 0.7
    });
  }

  // Topic-based questions
  if (responseLower.includes('salvation') || queryLower.includes('salvation')) {
    questions.push({
      question: 'What does the Bible say about how to be saved?',
      relevance: 0.8
    });
  }

  if (responseLower.includes('parable') || queryLower.includes('parable')) {
    questions.push({
      question: 'What are the main themes in Jesus\' parables?',
      relevance: 0.7
    });
  }

  if (responseLower.includes('character') || queryLower.includes('character')) {
    questions.push({
      question: 'What can we learn from biblical character studies?',
      relevance: 0.7
    });
  }

  // Generic questions to fill up to 5
  const genericQuestions: FollowUpQuestion[] = [
    { question: 'What are the key biblical passages about this topic?', relevance: 0.6 },
    { question: 'How does this relate to other biblical teachings?', relevance: 0.6 },
    { question: 'What is the practical application of this?', relevance: 0.6 },
    { question: 'How does this apply to modern life?', relevance: 0.5 },
    { question: 'What are the theological implications of this?', relevance: 0.5 }
  ];

  while (questions.length < 5) {
    const generic = genericQuestions[questions.length % genericQuestions.length];
    if (!questions.some(q => q.question === generic.question)) {
      questions.push(generic);
    } else {
      break;
    }
  }

  return questions.slice(0, 5);
}

