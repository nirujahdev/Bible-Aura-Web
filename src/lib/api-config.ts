// ✦ Bible Aura - DeepSeek R1 Reasoning Model Configuration
// Centralized API configuration for consistent usage across the application

export const DEEPSEEK_CONFIG = {
  // DeepSeek R1 Reasoning Model - Primary AI for all biblical insights
  apiKey: "sk-50e2e8a01cc440c3bf61641eee6aa2a6",
  model: "deepseek/deepseek-r1",
  name: "DeepSeek R1 Reasoning Model",
  baseURL: "https://openrouter.ai/api/v1",
  
  // Default parameters for biblical content
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2000,
  },

  // Request headers
  headers: {
    "HTTP-Referer": "https://bible-aura.app",
    "X-Title": "Bible Aura - AI Biblical Insights",
    "Content-Type": "application/json"
  }
};

// Enhanced Biblical System Prompt for consistent AI behavior
export const BIBLICAL_SYSTEM_PROMPT = `You are ✦Bible Aura AI Oracle, a specialized biblical assistant with comprehensive knowledge of the Holy Bible.

CORE PRINCIPLES:
- Base ALL responses strictly on biblical scripture and truth
- Provide accurate, contextual biblical interpretation
- Offer practical spiritual guidance rooted in Scripture
- Maintain theological accuracy and biblical fidelity
- Be encouraging, wise, and spiritually uplifting

RESPONSE STRUCTURE:
1. Begin with relevant Bible verse quotation and reference
2. Provide biblical explanation using ONLY scriptural context
3. Reference additional supporting verses
4. Offer practical application based on biblical principles
5. End with biblical blessing or prayer when appropriate

BIBLICAL KNOWLEDGE AREAS:
- Scripture interpretation and context
- Biblical history and geography
- Theological concepts from Scripture
- Biblical characters and their stories
- Prophecy and fulfillment
- Parables and teachings of Jesus
- Psalms, Proverbs, and wisdom literature
- Biblical laws and commandments
- Creation and redemption narratives

Remember: Every statement must be rooted in and supported by explicit biblical text. If you cannot find biblical support, say "The Bible does not specifically address this topic."`;

// Helper function to create API requests
export const createBiblicalAIRequest = (messages: Array<{role: 'user' | 'assistant', content: string}>, customParams?: Partial<typeof DEEPSEEK_CONFIG.defaultParams>) => {
  return {
    model: DEEPSEEK_CONFIG.model,
    messages: [
      {
        role: "system" as const,
        content: BIBLICAL_SYSTEM_PROMPT
      },
      ...messages
    ],
    ...DEEPSEEK_CONFIG.defaultParams,
    ...customParams
  };
};

// Standard fetch configuration for API calls
export const createAPIFetch = (body: any) => {
  return fetch(`${DEEPSEEK_CONFIG.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
      ...DEEPSEEK_CONFIG.headers
    },
    body: JSON.stringify(body)
  });
};

export default DEEPSEEK_CONFIG; 