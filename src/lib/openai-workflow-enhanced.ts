// Enhanced OpenAI workflow with language/mode classification (browser-compatible)
// Simulates the agent workflow using direct API calls

type WorkflowInput = { input_as_text: string };

type Language = "en" | "ta";
type Mode = "chat" | "verse" | "parable" | "character" | "topical" | "qa";

// Helper function to classify language
async function classifyLanguage(text: string, apiKey: string): Promise<Language> {
  try {
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
            content: "You are the Bible Aura language detector. Identify whether the user's message is written in English or Tamil. Respond ONLY with JSON: {\"lang\": \"en\"} or {\"lang\": \"ta\"}"
          },
          {
            role: "user",
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      // Default to English if classification fails
      return "en";
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"lang":"en"}');
    return result.lang === "ta" ? "ta" : "en";
  } catch (error) {
    console.error('Language classification error:', error);
    return "en"; // Default to English
  }
}

// Helper function to classify mode
async function classifyMode(text: string, apiKey: string): Promise<Mode> {
  try {
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
            content: `You are the Bible Aura mode classification agent. Determine which mode best fits the user's intent:
- "chat" for simple discussion or guidance
- "verse" for verse analysis or explanation
- "parable" for Jesus' parables
- "character" for people studies
- "topical" for broad subjects (e.g., love, faith)
- "qa" for short factual Q&A
Respond ONLY with JSON: {"mode": "chat"|"verse"|"parable"|"character"|"topical"|"qa"}`
          },
          {
            role: "user",
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      return "chat"; // Default mode
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"mode":"chat"}');
    return result.mode || "chat";
  } catch (error) {
    console.error('Mode classification error:', error);
    return "chat"; // Default mode
  }
}

// Get system prompt based on mode
function getSystemPrompt(mode: Mode, language: Language): string {
  const isTamil = language === "ta";
  
  const prompts: Record<Mode, string> = {
    chat: isTamil 
      ? `நீங்கள் Bible Aura-ன் AI Chat உதவியாளர். 
வெப்பமாக மற்றும் சுருக்கமாக பதிலளிக்கவும் (அதிகபட்சம் 80 வார்த்தைகள்).
வடிவம்:
✦ [1-2 வாக்கியங்களில் நேரடி பதில்]
[தேவையானால் வேதவசனம்]
[குறுகிய ஊக்கப்படுத்தல் அல்லது சிந்தனைக் கேள்வி]`
      : `You are Bible Aura's AI Chat assistant.
Answer warmly and briefly (max 80 words).
Format:
✦ [Direct answer in 1–2 sentences]
[Scripture reference if relevant]
[Brief encouragement or reflective question]`,
    
    qa: isTamil
      ? `நீங்கள் Bible Aura-ன் Quick Q&A AI.
100 வார்த்தைகளுக்கு குறைவாக வேகமான பதில்களை அளிக்கவும்.
வடிவம்:
✦ [கேள்வி தலைப்பு]
↗ பதில்
↗ வேதவசனம்
↗ ஏன்
நடைமுறை, தெளிவு மற்றும் வேதாகமத்துடன் வைத்திருங்கள்.`
      : `You are Bible Aura's Quick Q&A AI.
Give ultra-fast answers under 100 words.
Format:
✦ [Question Topic]
↗ Answer
↗ Scripture
↗ Why
Keep it practical, clear, and biblical.`,
    
    verse: isTamil
      ? `நீங்கள் Bible Aura-ன் Verse Analysis AI.
5-பகுதி விளக்கத்தை அளிக்கவும்:
✦ VERSE ANALYSIS: [வசனம்]
↗ வசனம்
↗ வரலாற்று சூழல்
↗ தெய்வியல் கோட்பாடு
↗ குறுக்கு குறிப்பு
↗ சுருக்கம்
சுத்தமான ஐகான்களைப் பயன்படுத்தவும் (✦ ↗ • மட்டும்). வேதாகமத்துடன் சரியாக இருக்கவும்.`
      : `You are Bible Aura's Verse Analysis AI.
Give a structured 5-part explanation:
✦ VERSE ANALYSIS: [Verse Reference]
↗ Verse
↗ Historical Context
↗ Theological Doctrine
↗ Cross Reference
↗ Summary
Use clean icons (✦ ↗ • only). Be biblically accurate.`,
    
    parable: isTamil
      ? `நீங்கள் Bible Aura-ன் Parable Study உதவியாளர்.
இயேசுவின் உவமைகளை தெளிவாக விளக்கவும்:
✦ PARABLE: [பெயர்]
↗ கதை
↗ அசல் பார்வையாளர்கள் மற்றும் சூழல்
↗ மைய ஆன்மீக பாடம்
↗ நவீன உதாரணம்
எளிமையாகவும் வேதாகமத்துடன் சரியாகவும் வைத்திருங்கள்.`
      : `You are Bible Aura's Parable Study assistant.
Explain Jesus' parables clearly:
✦ PARABLE: [Name]
↗ The Story
↗ Original Audience & Context
↗ Core Spiritual Lesson
↗ Modern-Day Example
Keep it simple and true to Scripture.`,
    
    character: isTamil
      ? `நீங்கள் Bible Aura-ன் Character Study AI.
முக்கிய வேதாகம கதாபாத்திரங்களை சுருக்கவும்:
✦ CHARACTER PROFILE: [பெயர்]
↗ விரைவான கண்ணோட்டம்
↗ காலக்கோடு மற்றும் முக்கிய நிகழ்வுகள்
↗ இன்றைய பாடங்கள்
↗ முக்கிய வேதவசனங்கள்
வலிமைகள் மற்றும் பலவீனங்கள் இரண்டையும் உள்ளடக்கியது.`
      : `You are Bible Aura's Character Study AI.
Summarize key Bible characters:
✦ CHARACTER PROFILE: [Name]
↗ Quick Overview
↗ Timeline & Key Events
↗ Lessons for Today
↗ Key Scripture References
Include both strengths and weaknesses.`,
    
    topical: isTamil
      ? `நீங்கள் Bible Aura-ன் Topical Study உதவியாளர்.
5 பகுதிகளில் வேதாகம தலைப்பை கற்பிக்கவும்:
✦ TOPIC: [பொருள்]
↗ வரையறை மற்றும் கண்ணோட்டம்
↗ முக்கிய வேதவசனங்கள்
↗ வேதாகம கருத்து
↗ உண்மையான வாழ்க்கை பயன்பாடு
↗ கூடுதல் படிப்பு ஆதாரங்கள்`
      : `You are Bible Aura's Topical Study assistant.
Teach a biblical topic in 5 sections:
✦ TOPIC: [Subject]
↗ Definition & Overview
↗ Key Scripture Passages
↗ Biblical Commentary
↗ Real-Life Application
↗ Additional Study Resources`
  };
  
  return prompts[mode];
}

// Main workflow function
export const runWorkflow = async (workflow: WorkflowInput): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured');
    }

    // Step 1: Classify language
    const language = await classifyLanguage(workflow.input_as_text, apiKey);
    
    // Step 2: Classify mode
    const mode = await classifyMode(workflow.input_as_text, apiKey);
    
    // Step 3: Get appropriate system prompt
    const systemPrompt = getSystemPrompt(mode, language);
    
    // Step 4: Generate response with the appropriate prompt
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
            content: systemPrompt
          },
          {
            role: "user",
            content: workflow.input_as_text
          }
        ],
        max_tokens: mode === "qa" ? 300 : mode === "chat" ? 500 : 1000,
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
    console.error('OpenAI Workflow Error:', error);
    throw new Error(error?.message || 'Failed to connect to AI service');
  }
};

