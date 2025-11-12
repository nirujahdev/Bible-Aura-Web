// Simplified OpenAI workflow using fetch API (browser-compatible)
// This avoids Node.js dependencies that cause issues in the browser

type WorkflowInput = { input_as_text: string };

export const runWorkflow = async (workflow: WorkflowInput): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    // Use fetch API directly instead of OpenAI SDK to avoid browser compatibility issues
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I apologize, but I could not generate a response. Please try again.";
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(error?.message || 'Failed to connect to AI service');
  }
};

