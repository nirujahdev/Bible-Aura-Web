// Bible Aura RAG Retriever (Node 1)
// Fast vector store search with language detection

import { OpenAI } from "openai";

// Vector Store IDs
const ENGLISH_VECTOR_STORE = "vs_6914c8f2ecf48191b8c80e0911d335cf";
const TAMIL_VECTOR_STORE = "vs_6914ce9d39b4819188024077258a0db3";

// Maximum chunks to retrieve (optimized for speed)
const MAX_CHUNKS = 5;

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
 * Detect language using simple Unicode heuristic
 * Tamil Unicode range: 0B80-0BFF
 */
function detectLanguage(text: string): "en" | "ta" {
  // Check for Tamil Unicode characters
  const tamilRegex = /[\u0B80-\u0BFF]/;
  return tamilRegex.test(text) ? "ta" : "en";
}

/**
 * RAG Retriever - Node 1
 * Searches vector store and returns Bible context
 */
export async function retrieveBibleContext(
  userInput: string,
  client: OpenAI,
  preferredLanguage?: "en" | "ta"
): Promise<RAGResult> {
  // Detect language (use preference if provided, otherwise detect)
  const lang = preferredLanguage || detectLanguage(userInput);
  
  // Select vector store based on language
  const vectorStoreId = lang === "en" 
    ? ENGLISH_VECTOR_STORE 
    : TAMIL_VECTOR_STORE;

  try {
    // Search vector store (max 5 chunks for speed)
    const searchResults = await client.vectorStores.search(vectorStoreId, {
      query: userInput,
      max_num_results: MAX_CHUNKS
    });

    // Extract sources and context
    const sources = searchResults.data.map((result) => ({
      id: result.file_id,
      filename: result.filename || "Unknown",
      score: result.score || 0
    }));

    // Combine chunks into one context string (separated by \n---\n)
    const context = searchResults.data
      .map((result) => {
        // Extract text from result (may be in different formats)
        const text = (result as any).text || result.filename || "";
        return text;
      })
      .filter(Boolean)
      .join("\n---\n");

    return {
      lang,
      context: context || userInput, // Fallback to user input if no context
      query: userInput,
      sources: sources.slice(0, MAX_CHUNKS) // Ensure max 5
    };
  } catch (error: any) {
    console.error("[RAG Retriever] Vector store search error:", error.message);
    
    // Return fallback result if search fails
    return {
      lang,
      context: userInput, // Use user input as fallback context
      query: userInput,
      sources: []
    };
  }
}

