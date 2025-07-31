# AI Response Templates System

This directory contains the structured response templates for Bible Aura AI's different chat modes. Each mode has specific formatting requirements and response structures to ensure consistent, high-quality outputs.

## 📁 Files Structure

```
ai-response-templates/
├── index.ts                 # Main index with TypeScript interfaces
├── chat-mode.json          # Conversational chat mode (100 words)
├── verse-analysis.json     # 4-section verse breakdown format
├── parable-explainer.json  # 4-component parable structure
├── character-profiles.json # Biblical character study format
├── topical-study.json      # 5-section comprehensive study
├── qa-mode.json            # Quick Q&A with scripture support
└── README.md               # This documentation
```

## 🎯 Available Chat Modes

### 1. 💬 Chat Mode
- **Purpose**: Conversational assistant for Bible-related topics
- **Word Limit**: 100 words maximum
- **Format**: Direct, conversational with scripture support
- **Best For**: Quick questions, spiritual guidance, general Bible chat

### 2. 📖 Verse Analysis
- **Purpose**: Deep, structured examination of specific Bible verses
- **Format**: 5 sections with emojis
  - 📖 SCRIPTURE: Full verse with reference
  - 📝 SIMPLE EXPLANATION: Plain language breakdown
  - 🏛️ HISTORY: Historical and cultural background
  - ✝️ THEOLOGY: Doctrinal significance
  - 🔗 CROSS REFERENCES: Related verses
- **Best For**: Bible study, understanding specific passages

### 3. 🧩 Parable Explainer
- **Purpose**: Break down Jesus' parables into understandable lessons
- **Format**: Tree structure with 4 components
  - 📖 The Story: Brief retelling
  - 👥 Original Audience & Context: Who and why
  - 🎯 Core Spiritual Lesson: Main truth
  - 🌍 Modern-Day Example: Contemporary application
- **Best For**: Understanding parables, teaching materials

### 4. 👤 Character Profiles
- **Purpose**: Comprehensive biblical character studies
- **Format**: Profile structure with 4 sections
  - 🎯 Quick Overview: Essential summary
  - ⏰ Timeline & Key Events: Life chronology
  - 💎 Lessons for Today: Modern applications
  - 📚 Key Scripture References: Important passages
- **Best For**: Character studies, devotional content

### 5. 📚 Topical Study
- **Purpose**: Comprehensive biblical teaching on specific topics
- **Format**: 5-section comprehensive study
  - 🎯 Definition & Overview: Topic introduction
  - 📖 Key Scripture Passages: Primary texts
  - 💭 Biblical Commentary: Deep explanation
  - 🌟 Real-Life Application: Practical application
  - 🔍 Additional Study Resources: Further study
- **Best For**: In-depth Bible study, research, teaching preparation

### 6. ❓ Q&A Mode
- **Purpose**: Quick, direct answers to Bible questions
- **Word Limit**: 150 words maximum
- **Format**: Simple 3-part structure
  - Direct Answer: Clear, concise response
  - Supporting Scripture: Relevant Bible verse
  - Brief Explanation: Connection between answer and verse
- **Best For**: Quick answers, fact-checking, simple questions

## 🛠️ Technical Implementation

### Core Components

1. **ResponseTemplate Interface**: TypeScript interface defining template structure
2. **generateSystemPrompt()**: Function that creates detailed AI system prompts
3. **validateResponse()**: Function to validate responses against templates
4. **AI_RESPONSE_TEMPLATES**: Main object containing all templates

### Usage in Components

```typescript
import { generateSystemPrompt, AI_RESPONSE_TEMPLATES } from './ai-response-templates';

// Get system prompt for a specific mode
const systemPrompt = generateSystemPrompt('verse');

// Access template information
const chatMode = AI_RESPONSE_TEMPLATES.chat;
console.log(chatMode.name, chatMode.purpose);
```

### Integration with AI Chat

The `EnhancedAIChat` component automatically:
- Loads all templates and provides mode selection
- Generates appropriate system prompts based on selected mode
- Adjusts token limits based on template requirements
- Shows mode descriptions in the UI dropdown

## 📝 Template Structure

Each JSON template contains:

- **mode**: Unique identifier
- **name**: Display name for UI
- **purpose**: Brief description of the mode's purpose
- **maxWords**: Optional word limit
- **responseStructure**: Detailed formatting requirements
- **examples**: Good (and bad) response examples
- **tone**: Required tone and style
- **restrictions**: What to avoid or limit
- **visualFormat**: Special formatting requirements

## 📋 Sample Responses

Each template now includes **real sample responses** showing exactly how the AI should format its answers:

- **Chat Mode**: 67-word response about "Why did Jesus weep?"
- **Verse Analysis**: Complete 5-section breakdown of John 3:16  
- **Parable Explainer**: Full analysis of The Lost Sheep parable
- **Character Profile**: Comprehensive study of King David
- **Topical Study**: In-depth exploration of Grace
- **Q&A Mode**: Three sample short answers (anger, death, tithing)

These examples serve as training data for consistent, high-quality AI responses.

## 🎨 Response Quality Features

### Consistent Formatting
- Each mode has specific emoji usage
- Structured sections with clear headers
- Consistent biblical reference formats
- No markdown symbols (plain text only)

### Biblical Accuracy
- Always include relevant scripture
- Maintain reverence for biblical text
- Focus on biblical truth and application
- Include proper verse references

### User Experience
- Clear, accessible language
- Practical applications
- Appropriate length for each mode
- Visual structure for easy reading

## 🔧 Extending the System

To add a new chat mode:

1. Create a new JSON template file
2. Add it to the imports in `index.ts`
3. Include it in `AI_RESPONSE_TEMPLATES`
4. Add the mode to `CHAT_MODES` in `EnhancedAIChat.tsx`
5. Test with various inputs

## 📚 Best Practices

### For Template Creation
- Define clear section requirements
- Provide specific examples
- Set appropriate word limits
- Include visual formatting guidelines

### For System Prompts
- Be specific about structure requirements
- Include both positive and negative instructions
- Specify tone and style requirements
- Add biblical accuracy requirements

### For Response Validation
- Check word limits
- Verify required sections are present
- Ensure biblical references are included
- Validate formatting consistency

This system ensures that Bible Aura AI provides consistent, high-quality responses tailored to different types of biblical study and spiritual guidance needs. 