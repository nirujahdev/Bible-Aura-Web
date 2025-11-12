import { OpenAI } from "openai";
import { z } from "zod";

// Simplified OpenAI client (without guardrails for browser compatibility)
const client = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
});

if (!import.meta.env.VITE_OPENAI_API_KEY && !process.env.VITE_OPENAI_API_KEY) {
  console.warn('OpenAI API key not found in environment variables');
}

// Simplified workflow without guardrails (browser-compatible)
export const runWorkflow = async (workflow: { input_as_text: string }): Promise<string> => {
  try {
    if (!client.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Simple direct API call instead of complex workflow
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Bible Aura's AI Chat assistant.
Answer warmly and briefly (max 80 words).
Format:
✦ [Direct answer in 1–2 sentences]
[Scripture reference if relevant]
[Brief encouragement or reflective question]`
        },
        {
          role: "user",
          content: workflow.input_as_text
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || "I apologize, but I could not generate a response. Please try again.";
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(error?.message || 'Failed to connect to AI service');
  }
};

