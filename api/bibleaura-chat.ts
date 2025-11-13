// Bible Aura ChatKit Workflow API Route
// Vercel Serverless Function for OpenAI ChatKit workflow integration
// This route handles POST requests to /api/bibleaura-chat
// Workflow ID: wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Workflow configuration constants
const WORKFLOW_ID = 'wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0';
const WORKFLOW_VERSION = '1';
const DOMAIN_KEY = 'pk_69156df484148193bde4d23dd08c12fc0d90a851713b0413';
const ALLOWED_ORIGIN = 'https://bibleaura.xyz';

// Types for language and mode classification
type Language = 'en' | 'ta';
type Mode = 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa';

// CORS headers helper
function setCORSHeaders(res: VercelResponse, origin?: string) {
  // Allow requests from the Bible Aura domain and localhost for development
  const isAllowedOrigin = origin === ALLOWED_ORIGIN || 
                          origin?.includes('bibleaura.xyz') || 
                          origin?.includes('localhost') ||
                          origin?.includes('127.0.0.1') ||
                          !origin;
  
  if (isAllowedOrigin) {
    // Use the origin if it's localhost, otherwise use the allowed origin
    const corsOrigin = origin?.includes('localhost') || origin?.includes('127.0.0.1') 
      ? origin 
      : ALLOWED_ORIGIN;
    
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
}

// Helper function to classify language using OpenAI API
async function classifyLanguage(text: string, apiKey: string): Promise<Language> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are the Bible Aura language detector. Identify whether the user\'s message is written in English or Tamil. Respond ONLY with JSON: {"lang": "en"} or {"lang": "ta"}'
          },
          {
            role: 'user',
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return 'en'; // Default to English if classification fails
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"lang":"en"}');
    return result.lang === 'ta' ? 'ta' : 'en';
  } catch (error) {
    console.error('Language classification error:', error);
    return 'en'; // Default to English
  }
}

// Helper function to classify mode using OpenAI API
async function classifyMode(text: string, language: Language, apiKey: string): Promise<Mode> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are the Bible Aura mode classification agent. The user's query is provided below. Determine which mode best fits the user's intent:
- "chat" for simple discussion or guidance
- "verse" for verse analysis or explanation
- "parable" for Jesus' parables
- "character" for people studies
- "topical" for broad subjects (e.g., love, faith)
- "qa" for short factual Q&A
Respond ONLY with JSON: {"mode": "chat"}`
          },
          {
            role: 'user',
            content: `User query: ${text}`
          }
        ],
        max_tokens: 50,
        temperature: 1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      return 'chat'; // Default to chat if classification fails
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content || '{"mode":"chat"}');
    const validModes: Mode[] = ['chat', 'verse', 'parable', 'character', 'topical', 'qa'];
    return validModes.includes(result.mode) ? result.mode : 'chat';
  } catch (error) {
    console.error('Mode classification error:', error);
    return 'chat'; // Default to chat
  }
}

// Helper function to get system prompt based on mode and language
function getSystemPrompt(mode: Mode, language: Language): string {
  if (language === 'ta') {
    // Tamil prompts
    switch (mode) {
      case 'chat':
        return 'நீங்கள் பைபிள் ஆரா AI சாட் உதவியாளர்.\nஅன்பாகவும் சுருக்கமாகவும் பதிலளிக்கவும் (அதிகபட்சம் 80 வார்த்தைகள்).\nவடிவம்:\n✦ [1-2 வாக்கியங்களில் நேரடி பதில்]\n[சம்பந்தப்பட்ட வேத குறிப்பு]\n[சுருக்கமான ஊக்கம் அல்லது சிந்தனை கேள்வி]';
      case 'verse':
        return 'நீங்கள் பைபிள் ஆரா வசன பகுப்பாய்வு AI.\nஒரு கட்டமைக்கப்பட்ட 5-பகுதி விளக்கத்தை வழங்கவும்:\n✦ வசன பகுப்பாய்வு: [வசன குறிப்பு]\n↗ வசனம்\n↗ வரலாற்று சூழல்\n↗ இறையியல் கோட்பாடு\n↗ குறுக்கு குறிப்பு\n↗ சுருக்கம்\nசுத்தமான ஐகான்களைப் பயன்படுத்தவும் (✦ ↗ • மட்டும்). வேதாகம ரீதியாக துல்லியமாக இருங்கள்.';
      case 'parable':
        return 'நீங்கள் பைபிள் ஆரா உவமை ஆய்வு உதவியாளர்.\nஇயேசுவின் உவமைகளை தெளிவாக விளக்குங்கள்:\n✦ உவமை: [பெயர்]\n↗ கதை\n↗ அசல் பார்வையாளர்கள் மற்றும் சூழல்\n↗ முக்கிய ஆன்மீக பாடம்\n↗ நவீன கால உதாரணம்\nஎளிமையாகவும் வேதத்திற்கு உண்மையாகவும் இருங்கள்.';
      case 'character':
        return 'நீங்கள் பைபிள் ஆரா கதாபாத்திர ஆய்வு AI.\nமுக்கிய பைபிள் கதாபாத்திரங்களை சுருக்கமாகக் கூறுங்கள்:\n✦ கதாபாத்திர விவரம்: [பெயர்]\n↗ விரைவான கண்ணோட்டம்\n↗ காலவரிசை மற்றும் முக்கிய நிகழ்வுகள்\n↗ இன்றைய பாடங்கள்\n↗ முக்கிய வேத குறிப்புகள்\nபலங்கள் மற்றும் பலவீனங்கள் இரண்டையும் சேர்க்கவும்.';
      case 'topical':
        return 'நீங்கள் பைபிள் ஆரா தலைப்பு ஆய்வு உதவியாளர்.\nஒரு வேதாகம தலைப்பை 5 பிரிவுகளில் கற்பிக்கவும்:\n✦ தலைப்பு: [பொருள்]\n↗ வரையறை மற்றும் கண்ணோட்டம்\n↗ முக்கிய வேத பகுதிகள்\n↗ வேதாகம வர்ணனை\n↗ நிஜ வாழ்க்கை பயன்பாடு\n↗ கூடுதல் ஆய்வு ஆதாரங்கள்';
      case 'qa':
        return 'நீங்கள் பைபிள் ஆரா விரைவு கேள்வி பதில் AI.\n100 வார்த்தைகளுக்குள் மிக விரைவான பதில்களைக் கொடுங்கள்.\nவடிவம்:\n✦ [கேள்வி தலைப்பு]\n↗ பதில்\n↗ வேதாகமம்\n↗ ஏன்\nநடைமுறை, தெளிவான மற்றும் வேதாகம ரீதியாக இருங்கள்.';
      default:
        return 'நீங்கள் பைபிள் ஆரா AI சாட் உதவியாளர்.\nஅன்பாகவும் சுருக்கமாகவும் பதிலளிக்கவும் (அதிகபட்சம் 80 வார்த்தைகள்).';
    }
  } else {
    // English prompts
    switch (mode) {
      case 'chat':
        return 'You are Bible Aura\'s AI Chat assistant.\nAnswer warmly and briefly (max 80 words).\nFormat:\n✦ [Direct answer in 1–2 sentences]\n[Scripture reference if relevant]\n[Brief encouragement or reflective question]';
      case 'verse':
        return 'You are Bible Aura\'s Verse Analysis AI.\nGive a structured 5-part explanation:\n✦ VERSE ANALYSIS: [Verse Reference]\n↗ Verse\n↗ Historical Context\n↗ Theological Doctrine\n↗ Cross Reference\n↗ Summary\nUse clean icons (✦ ↗ • only). Be biblically accurate.';
      case 'parable':
        return 'You are Bible Aura\'s Parable Study assistant.\nExplain Jesus\' parables clearly:\n✦ PARABLE: [Name]\n↗ The Story\n↗ Original Audience & Context\n↗ Core Spiritual Lesson\n↗ Modern-Day Example\nKeep it simple and true to Scripture.';
      case 'character':
        return 'You are Bible Aura\'s Character Study AI.\nSummarize key Bible characters:\n✦ CHARACTER PROFILE: [Name]\n↗ Quick Overview\n↗ Timeline & Key Events\n↗ Lessons for Today\n↗ Key Scripture References\nInclude both strengths and weaknesses.';
      case 'topical':
        return 'You are Bible Aura\'s Topical Study assistant.\nTeach a biblical topic in 5 sections:\n✦ TOPIC: [Subject]\n↗ Definition & Overview\n↗ Key Scripture Passages\n↗ Biblical Commentary\n↗ Real-Life Application\n↗ Additional Study Resources';
      case 'qa':
        return 'You are Bible Aura\'s Quick Q&A AI.\nGive ultra-fast answers under 100 words.\nFormat:\n✦ [Question Topic]\n↗ Answer\n↗ Scripture\n↗ Why\nKeep it practical, clear, and biblical.';
      default:
        return 'You are Bible Aura\'s AI Chat assistant.\nAnswer warmly and briefly (max 80 words).';
    }
  }
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    setCORSHeaders(res, req.headers.origin);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  setCORSHeaders(res, req.headers.origin);

  try {
    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '') {
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in your environment variables'
      });
    }

    // Parse request body
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Step 1: Classify Language
    const language = await classifyLanguage(message.trim(), apiKey);

    // Step 2: Classify Mode
    const mode = await classifyMode(message.trim(), language, apiKey);

    // Step 3: Get Mode-specific System Prompt
    const systemPrompt = getSystemPrompt(mode, language);

    // Step 4: Call OpenAI Chat Completion with appropriate prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Return response in the expected format
    return res.status(200).json({
      text: aiResponse,
      mode: mode,
      lang: language
    });

  } catch (error: any) {
    console.error('Bible Aura Chat API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

