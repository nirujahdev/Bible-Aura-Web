// gpt-4o-mini wrapper with structured output support
// All LLM calls in V2 pipeline use this module

import { OpenAI } from 'openai';
import { z } from 'zod';

const MODEL_NAME = 'gpt-4o-mini';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey });
}

/**
 * Call gpt-4o-mini with structured JSON output
 */
export async function callGPT4oMini<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T,
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<z.infer<T>> {
  const client = getOpenAIClient();
  
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });

  const completion = await client.chat.completions.create({
    model: MODEL_NAME,
    messages,
    response_format: { type: 'json_object' },
    temperature: options.temperature ?? 0.35,
    max_tokens: options.maxTokens ?? 2048,
  });

  const responseText = completion.choices[0]?.message?.content || '';
  
  if (!responseText) {
    throw new Error('Empty response from gpt-4o-mini');
  }

  try {
    const parsed = JSON.parse(responseText);
    return schema.parse(parsed);
  } catch (error) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return schema.parse(parsed);
      } catch {
        throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call gpt-4o-mini for text generation (non-structured)
 */
export async function callGPT4oMiniText(
  prompt: string,
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const client = getOpenAIClient();
  
  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });

  const completion = await client.chat.completions.create({
    model: MODEL_NAME,
    messages,
    temperature: options.temperature ?? 0.35,
    max_tokens: options.maxTokens ?? 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

