// Bible Aura RAG Retriever (Node 1)
// Uses Pinecone for Bible content retrieval (replaces OpenAI Vector Stores)

import { OpenAI } from "openai";
import { retrieveBibleContextFromPinecone } from './pinecone-retrieval.js';

export interface RAGResult {
  lang: "en" | "ta";
  context: string;
  query: string;
  sources: Array<{
    id: string;
    filename: string;
    score: number;
  }>;
}

/**
 * RAG Retriever - Node 1
 * Searches Pinecone for Bible content and returns context
 * Falls back to OpenAI Vector Store if Pinecone is unavailable
 */
export async function retrieveBibleContext(
  userInput: string,
  client: OpenAI,
  preferredLanguage?: "en" | "ta"
): Promise<RAGResult> {
  try {
    // Try Pinecone first
    return await retrieveBibleContextFromPinecone(userInput, client, preferredLanguage);
  } catch (error: any) {
    console.warn("[RAG Retriever] Pinecone retrieval failed, using fallback:", error.message);
    
    // Fallback: return empty context (will use user input)
    const lang = preferredLanguage || (userInput.match(/[\u0B80-\u0BFF]/) ? "ta" : "en");
    return {
      lang,
      context: userInput,
      query: userInput,
      sources: []
    };
  }
}

