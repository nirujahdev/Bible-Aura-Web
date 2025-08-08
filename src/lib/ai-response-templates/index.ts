// ✦ Bible Aura AI Response Templates Index
// This file organizes all 6 response structure templates for different AI chat modes
// Each mode has specific formatting requirements with orange ✦ icon and biblical accuracy standards

import chatModeTemplate from './chat-mode.json';
import verseAnalysisTemplate from './verse-analysis.json';
import parableExplainerTemplate from './parable-explainer.json';
import characterProfilesTemplate from './character-profiles.json';
import topicalStudyTemplate from './topical-study.json';
import qaModeTemplate from './qa-mode.json';

// Enhanced Templates
import enhancedChatModeTemplate from './enhanced-chat-mode.json';
import enhancedCharacterProfilesTemplate from './enhanced-character-profiles.json';
import enhancedParableExplainerTemplate from './enhanced-parable-explainer.json';
import sermonGeneratorTemplate from './sermon-generator.json';

// Tamil Templates
import chatModeTamilTemplate from './chat-mode-tamil.json';
import verseAnalysisTamilTemplate from './verse-analysis-tamil.json';

// Import clean format templates
import verseAnalysisClean from './verse-analysis-clean.json';
import aiChatClean from './ai-chat-clean.json';
import parablesClean from './parables-clean.json';
import charactersClean from './characters-clean.json';
import topicalStudyClean from './topical-study-clean.json';
import qaClean from './qa-clean.json';

/**
 * ✦ THE 6 MAIN AI CHAT MODES:
 * 1. 💬 chat - AI Chat Mode (120 words) - General Bible guidance
 * 2. 📖 verse - Verse Analysis (5 sections) - Deep scripture examination  
 * 3. 🌱 parable - Parable Study (4 components) - Jesus' parables explained
 * 4. 👤 character - Character Study (4 sections) - Biblical character profiles
 * 5. 📚 topical - Topical Study (5 sections) - Comprehensive topic exploration
 * 6. ❓ qa - Quick Q&A (150 words) - Fast answers with scripture support
 */

export interface ResponseTemplate {
  mode: string;
  name: string;
  purpose: string;
  maxWords?: number;
  targetLength?: string;
  responseStructure: {
    format: string;
    mainTitle?: string;
    sections?: Array<{
      title: string;
      content: string;
      requirements: string[];
      icon?: string;
    }>;
    branches?: Array<{
      icon: string;
      title: string;
      content: string;
      requirements: string[];
    }>;
    requirements?: string[];
    template?: string[];
  };
  examples: {
    goodResponse?: any;
    goodResponses?: any[];
    badResponse?: any;
  };
  tone: string;
  restrictions: string[];
  visualFormat?: string;
  scriptureUsage?: string;
  commonQuestionTypes?: string[];
}

export const AI_RESPONSE_TEMPLATES: Record<string, ResponseTemplate> = {
  // ✦ THE 6 MAIN AI CHAT MODES
  chat: chatModeTemplate as ResponseTemplate,          // 💬 AI Chat Mode (120 words)
  verse: verseAnalysisTemplate as ResponseTemplate,    // 📖 Verse Analysis (5 sections)
  parable: parableExplainerTemplate as ResponseTemplate, // 🌱 Parable Study (4 components)
  character: characterProfilesTemplate as ResponseTemplate, // 👤 Character Study (4 sections)
  topical: topicalStudyTemplate as ResponseTemplate,   // 📚 Topical Study (5 sections)
  qa: qaModeTemplate as ResponseTemplate,              // ❓ Quick Q&A (150 words)
  
  // Enhanced Templates
  'enhanced-chat': enhancedChatModeTemplate as ResponseTemplate,
  'enhanced-character': enhancedCharacterProfilesTemplate as ResponseTemplate,
  'enhanced-parable': enhancedParableExplainerTemplate as ResponseTemplate,
  sermon: sermonGeneratorTemplate as ResponseTemplate,
  
  // Tamil Templates
  'chat-tamil': chatModeTamilTemplate as ResponseTemplate,
  'verse-tamil': verseAnalysisTamilTemplate as ResponseTemplate,
  
  // Clean formats with strict symbol rules
  'verse-clean': verseAnalysisClean as any,
  'chat-clean': aiChatClean as any,
  'parable-clean': parablesClean as any,
  'character-clean': charactersClean as any,
  'topical-clean': topicalStudyClean as any,
  'qa-clean': qaClean as any,
};

// Helper function to get system prompt based on template
export const generateSystemPrompt = (mode: keyof typeof AI_RESPONSE_TEMPLATES): string => {
  const template = AI_RESPONSE_TEMPLATES[mode];
  
  if (!template) {
    console.warn(`Template not found for mode: ${mode}. Using default chat mode.`);
    return generateSystemPrompt('chat');
  }

  // Check if this is a clean format template
  if (mode.includes('-clean')) {
    const cleanTemplate = template as any;
    return cleanTemplate.system_prompt || 'You are a biblical assistant providing clean, formatted responses.';
  }

  let systemPrompt = `You are Bible Aura AI, a ${template.purpose}

MODE: ${template.name}
TONE: ${template.tone}

SPEED PRIORITY: Generate fast, accurate, biblically sound responses.

CRITICAL FORMATTING REQUIREMENTS:
- Start ALL responses with the orange ✦ icon (no background shapes)
- Use ↗ for section headers exactly as specified
- Use • for bullet points within sections
- NO hashtags, asterisks, or markdown symbols
- NO decorative background shapes around icons
- Always maintain biblical accuracy and orthodox interpretation
- Include specific scripture references with chapter:verse format
- Prioritize concise, direct answers
- Focus on essential biblical truth

`;

  // Add mode-specific formatting based on responseStructure
  if (template.responseStructure.format === 'conversational') {
    systemPrompt += `
RESPONSE FORMAT (Conversational - FAST):
${template.responseStructure.requirements?.join('\n') || ''}

TEMPLATE STRUCTURE:
${template.responseStructure.template?.join('\n') || ''}
`;
  } else if (template.responseStructure.format === 'structured_sections') {
    systemPrompt += `
RESPONSE FORMAT (Structured Sections - EFFICIENT):
${template.responseStructure.sections?.map(section => 
  `${section.title}\n${section.requirements.join('\n')}`
).join('\n\n') || ''}
`;
  } else if (template.responseStructure.format === 'tree_structure') {
    systemPrompt += `
RESPONSE FORMAT (Tree Structure - CONCISE):
${template.responseStructure.mainTitle}

${template.responseStructure.branches?.map(branch => 
  `${branch.icon} ${branch.title}\n${branch.requirements.join('\n')}`
).join('\n\n') || ''}
`;
  } else if (template.responseStructure.format === 'profile_structure') {
    systemPrompt += `
RESPONSE FORMAT (Character Profile - FOCUSED):
${template.responseStructure.mainTitle}

${template.responseStructure.sections?.map(section => 
  `${section.icon} ${section.title}\n${section.requirements.join('\n')}`
).join('\n\n') || ''}
`;
  } else if (template.responseStructure.format === 'comprehensive_study') {
    systemPrompt += `
RESPONSE FORMAT (Comprehensive Study - STREAMLINED):
${template.responseStructure.mainTitle}

${template.responseStructure.sections?.map(section => 
  `${section.icon} ${section.title}\n${section.requirements.join('\n')}`
).join('\n\n') || ''}
`;
  } else if (template.responseStructure.format === 'simple_qa') {
    systemPrompt += `
RESPONSE FORMAT (Q&A - ULTRA-FAST):
${template.responseStructure.sections?.map(section => 
  `${section.title}\n${section.requirements?.join('\n') || ''}`
).join('\n\n') || ''}
`;
  }

  // Add word limits with speed emphasis
  if (template.maxWords) {
    systemPrompt += `\nWORD LIMIT: Maximum ${template.maxWords} words for FAST responses.`;
  }

  // Add scripture usage guidelines
  if (template.scriptureUsage) {
    systemPrompt += `\nSCRIPTURE USAGE: ${template.scriptureUsage}`;
  }

  // Add restrictions with speed focus
  systemPrompt += `\nRESTRICTIONS (SPEED OPTIMIZED):
${template.restrictions.join('\n')}
- Generate responses quickly and efficiently
- Avoid unnecessary elaboration
- Focus on core biblical truth
- Maintain accuracy while prioritizing speed

EXAMPLE OUTPUT FORMAT:
${template.examples.goodResponse?.fullResponse || template.examples.goodResponse?.answer || 'See template for examples'}

Remember: Always start with the orange ✦ icon, maintain exact formatting, and prioritize FAST, accurate biblical responses.`;

  return systemPrompt;
};

// Helper function to validate response against template
export const validateResponse = (response: string, mode: keyof typeof AI_RESPONSE_TEMPLATES): boolean => {
  const template = AI_RESPONSE_TEMPLATES[mode];
  
  if (!template) return false;
  
  // Check word count if specified
  if (template.maxWords) {
    const wordCount = response.split(/\s+/).length;
    if (wordCount > template.maxWords) return false;
  }
  
  // Additional validation logic can be added here
  return true;
};

// Helper function to get all available modes
export const getAvailableModes = (): Array<{key: string, name: string, purpose: string}> => {
  return Object.entries(AI_RESPONSE_TEMPLATES).map(([key, template]) => ({
    key,
    name: template.name,
    purpose: template.purpose
  }));
};

// Helper function to get template by mode
export const getTemplate = (mode: string): ResponseTemplate | null => {
  return AI_RESPONSE_TEMPLATES[mode] || null;
};

export default AI_RESPONSE_TEMPLATES; 

// Mode configurations for UI components - optimized for speed
export const MODE_CONFIGS = {
  chat: {
    name: 'AI Chat',
    description: 'Fast Bible questions and spiritual guidance',
    maxWords: 80, // Reduced for speed
    sections: 1,
    color: 'orange',
    priority: 'speed'
  },
  verse: {
    name: 'Verse Analysis',
    description: 'Quick examination of specific verses',
    sections: 5,
    color: 'blue',
    priority: 'accuracy'
  },
  parable: {
    name: 'Parable Study',
    description: 'Fast understanding of Jesus\' parables',
    sections: 4,
    color: 'green',
    priority: 'clarity'
  },
  character: {
    name: 'Character Study',
    description: 'Quick biblical character profiles',
    sections: 4,
    color: 'purple',
    priority: 'insight'
  },
  topical: {
    name: 'Topical Study',
    description: 'Efficient topic-based Bible exploration',
    sections: 5,
    color: 'pink',
    priority: 'comprehensive'
  },
  qa: {
    name: 'Quick Q&A',
    description: 'Ultra-fast answers with scripture support',
    maxWords: 100, // Reduced for speed
    sections: 3,
    color: 'indigo',
    priority: 'ultra-fast'
  }
} as const; 