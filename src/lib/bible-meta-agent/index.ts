// Bible Aura Meta-Agent (Node 2)
// Single agent that handles language detection, mode detection, and response generation

import { OpenAI } from "openai";
import { z } from "zod";

// Response schema for Meta-Agent
const MetaAgentResponseSchema = z.object({
  lang: z.enum(["en", "ta"]),
  mode: z.enum(["chat", "verse", "qa", "topical", "parable", "character"]),
  response: z.string()
});

export type MetaAgentResponse = z.infer<typeof MetaAgentResponseSchema>;

/**
 * Bible Meta-Agent Prompt Template
 */
function getMetaAgentPrompt(ragContext: string, userQuery: string): string {
  return `You are the Bible Aura Meta-Agent.

Your responsibilities:
1. Detect language (English/Tamil) - respond in the same language as the user
2. Detect user mode:
   - chat → short conversational answer (max 60 words)
   - verse → verse analysis format (structured explanation)
   - parable → parable explainer format (story, context, lesson)
   - character → character study (overview, timeline, lessons)
   - topical → topic overview (definition, scriptures, application)
   - qa → short Q&A format (max 50 words)
3. Use the Bible context provided. NEVER hallucinate verses. Only reference verses that exist in the context.
4. Strict formatting rules:
   - Use ✦ for title
   - Use ↗ for section headings
   - Use • for bullet points
   - Never use markdown (#, *, **, etc.)
   - Never use code blocks or backticks
5. Produce a clean final answer.

Bible Context:
${ragContext}

User Query: ${userQuery}

Return JSON only:
{
  "lang": "en" or "ta",
  "mode": "chat" | "verse" | "qa" | "topical" | "parable" | "character",
  "response": "your formatted answer here"
}`;
}

/**
 * Bible Meta-Agent - Node 2
 * Single agent that does everything: language detection, mode detection, response generation
 */
export async function runMetaAgent(
  ragResult: { lang: "en" | "ta"; context: string; query: string },
  client: OpenAI
): Promise<MetaAgentResponse> {
  try {
    // Build prompt with RAG context
    const prompt = getMetaAgentPrompt(ragResult.context, ragResult.query);

    // Call OpenAI API with structured output
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are the Bible Aura Meta-Agent. Always return valid JSON matching the required schema."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      top_p: 0.7,
      max_tokens: 512, // Optimized for speed
      stream: false
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    if (!responseText) {
      throw new Error("Meta-Agent returned empty response");
    }

    // Parse JSON response
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse Meta-Agent JSON response");
      }
    }

    // Validate and return structured response
    const validated = MetaAgentResponseSchema.parse(parsedResponse);
    return validated;
  } catch (error: any) {
    console.error("[Meta-Agent] Error:", error.message);
    
    // Return fallback response
    return {
      lang: ragResult.lang,
      mode: "chat",
      response: "I apologize, but I encountered an error processing your request. Please try again."
    };
  }
}

