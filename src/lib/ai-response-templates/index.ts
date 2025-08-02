// AI Response Templates Index
// This file organizes all the response structure templates for different AI chat modes

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
  // Standard Templates
  chat: chatModeTemplate as ResponseTemplate,
  verse: verseAnalysisTemplate as ResponseTemplate,
  parable: parableExplainerTemplate as ResponseTemplate,
  character: characterProfilesTemplate as ResponseTemplate,
  topical: topicalStudyTemplate as ResponseTemplate,
  qa: qaModeTemplate as ResponseTemplate,
  
  // Enhanced Templates
  'enhanced-chat': enhancedChatModeTemplate as ResponseTemplate,
  'enhanced-character': enhancedCharacterProfilesTemplate as ResponseTemplate,
  'enhanced-parable': enhancedParableExplainerTemplate as ResponseTemplate,
  sermon: sermonGeneratorTemplate as ResponseTemplate,
  
  // Tamil Templates
  'chat-tamil': chatModeTamilTemplate as ResponseTemplate,
  'verse-tamil': verseAnalysisTamilTemplate as ResponseTemplate,
};

// Helper function to get system prompt based on template
export const generateSystemPrompt = (mode: keyof typeof AI_RESPONSE_TEMPLATES): string => {
  const template = AI_RESPONSE_TEMPLATES[mode];
  
  if (!template) {
    return "You are Bible Aura AI, a specialized biblical assistant.";
  }

  let prompt = `You are Bible Aura AI, a specialized biblical assistant for ${template.name}.

PURPOSE: ${template.purpose}

RESPONSE STRUCTURE:`;

  // Add structure details based on format
  if (template.responseStructure.format === 'conversational' || template.responseStructure.format === 'structured_conversation') {
    prompt += `
- Format: ${template.responseStructure.format}
- Max Words: ${template.maxWords || 'No limit'}
- Requirements: ${template.responseStructure.requirements?.join(', ')}

TEMPLATE:
${template.responseStructure.template?.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
  } else if (template.responseStructure.format === 'structured_sections') {
    prompt += `
Follow this EXACT section format:
${template.responseStructure.sections?.map(section => 
  `\n${section.title}:\n- ${section.requirements.join('\n- ')}`
).join('\n')}

CRITICAL FORMATTING REQUIREMENTS:
- Use ✮ for main title only (verse reference)
- Use ↗ for section headers exactly as specified: ↗ Verse, ↗ Historical Context, ↗ Theological Doctrine, ↗ Cross Reference, ↗ Summary
- Use • for bullet points within sections
- Base ALL information on biblical sources and orthodox interpretation
- Include specific biblical references with chapter and verse numbers
- Maintain theological accuracy and biblical authority
- NO modern speculation - stick to biblical truth only`;
  } else if (template.responseStructure.format === 'tree_structure') {
    prompt += `
Use this tree structure format:
${template.responseStructure.mainTitle}
${template.responseStructure.branches?.map(branch => 
  `├── ${branch.icon} ${branch.title}: ${branch.content}\n    Requirements: ${branch.requirements.join(', ')}`
).join('\n')}`;
  } else if (template.responseStructure.format === 'profile_structure' || template.responseStructure.format === 'comprehensive_profile') {
    prompt += `
Follow this profile structure:
${template.responseStructure.mainTitle}
${template.responseStructure.sections?.map(section => 
  `├── ${section.icon} ${section.title}: ${section.content}\n    Requirements: ${section.requirements.join(', ')}`
).join('\n')}`;
  } else if (template.responseStructure.format === 'comprehensive_study') {
    prompt += `
Use this comprehensive study format:
${template.responseStructure.mainTitle}
${template.responseStructure.sections?.map(section => 
  `├── ${section.icon} ${section.title}: ${section.content}\n    Requirements: ${section.requirements.join(', ')}`
).join('\n')}`;
  } else if (template.responseStructure.format === 'comprehensive_parable_study') {
    prompt += `
Use this comprehensive parable study format:
${template.responseStructure.mainTitle}
${template.responseStructure.sections?.map(section => 
  `├── ${section.icon} ${section.title}: ${section.content}\n    Requirements: ${section.requirements.join(', ')}`
).join('\n')}`;
  } else if (template.responseStructure.format === 'full_sermon_manuscript') {
    prompt += `
Use this comprehensive sermon format:
${template.responseStructure.mainTitle}
${template.responseStructure.sections?.map(section => 
  `├── ${section.icon} ${section.title}: ${section.content}\n    Requirements: ${section.requirements.join(', ')}`
).join('\n')}

TARGET LENGTH: ${template.targetLength || '2500-3500 words'}
SERMON STRUCTURE: Follow all sections systematically for maximum depth and impact`;
  } else if (template.responseStructure.format === 'simple_qa') {
    prompt += `
Follow this Q&A format:
${template.responseStructure.sections?.map(section => 
  `${section.title}: ${section.content}\nRequirements: ${section.requirements.join(', ')}`
).join('\n\n')}`;
  }

  prompt += `

TONE: ${template.tone}

RESTRICTIONS:
${template.restrictions.map(restriction => `- ${restriction}`).join('\n')}

${template.maxWords ? `WORD LIMIT: Maximum ${template.maxWords} words` : ''}
${template.targetLength ? `TARGET LENGTH: ${template.targetLength}` : ''}

Always maintain biblical accuracy and reverence for Scripture. Use simple, accessible language while being thorough and helpful.`;

  return prompt;
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