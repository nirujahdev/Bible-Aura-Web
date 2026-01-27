// Prompt templates for all LLM stages
// All prompts enforce strict formatting rules

/**
 * Get mode-specific compose prompt
 */
export function getComposePrompt(
  mode: 'chat' | 'verse' | 'parable' | 'character' | 'topical' | 'qa',
  query: string,
  groundingPlan: { usedVerseRefs: string[]; reasoningSummary: string[] },
  evidence: { sources: Array<{ reference?: string; snippet?: string }> }
): string {
  const evidenceText = evidence.sources
    .slice(0, 8)
    .map((source, idx) => {
      return `[${idx + 1}] ${source.reference || 'Unknown'}: ${(source.snippet || '').substring(0, 150)}...`;
    })
    .join('\n\n');

  const verseRefsList = groundingPlan.usedVerseRefs.length > 0
    ? `\n\nAvailable verse references to use: ${groundingPlan.usedVerseRefs.join(', ')}`
    : '\n\nIMPORTANT: You must include at least one Bible verse reference in your response.';

  const baseRules = `
CRITICAL FORMATTING RULES:
- Use ONLY these symbols: ➤ ⤷ ↗
- NO markdown (#, *, **, etc.)
- NO emojis
- NO decorative symbols
- Blank lines between sections
- Reference verses like "John 3:16" but DO NOT quote verse text
- Must include at least one verse reference
- Do NOT mention internal tools or "I retrieved X from Pinecone"
- Avoid factual claims not supported by provided evidence`;

  switch (mode) {
    case 'verse':
      return `You are explaining a Bible verse. Use this format:

➤ [Verse reference]

⤷ Historical background
[content with context, time period, cultural setting]

⤷ Theology
[doctrinal meaning, theological significance, biblical interpretation]

⤷ Simple explanation
[clear, accessible explanation with practical meaning]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here with blank lines between titles",
  "mode": "verse",
  "lang": "en" | "ta",
  "usedVerseRefs": ["John 3:16", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    case 'chat':
      return `You are providing conversational Bible guidance. Use this format:

➤ [Main answer]
[comprehensive conversational response with detailed biblical guidance]

⤷ [Scripture references]
[verses woven naturally into the conversation with context]

⤷ [Encouraging application]
[practical steps and encouragement rooted in Scripture]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here",
  "mode": "chat",
  "lang": "en" | "ta",
  "usedVerseRefs": ["John 3:16", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    case 'parable':
      return `You are explaining a biblical parable. Use this format:

➤ [Parable reference & text]
[parable name, Scripture reference, and full text]

⤷ Background & audience
[historical setting, cultural context, who Jesus was speaking to]

⤷ Main message
[Jesus' intended meaning, spiritual lesson, theological significance]

⤷ Application for today
[modern relevance, practical steps, how to apply today]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here",
  "mode": "parable",
  "lang": "en" | "ta",
  "usedVerseRefs": ["Luke 10:25-37", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    case 'character':
      return `You are studying a biblical character. Use this format:

➤ [Name & key facts]
[character name, roles, key biographical information]

⤷ Historical role
[their role in biblical history, accomplishments, significance]

⤷ Spiritual significance
[theological importance, lessons from their life, biblical impact]

⤷ Lessons to apply
[practical lessons, what we can learn, how to apply today]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here",
  "mode": "character",
  "lang": "en" | "ta",
  "usedVerseRefs": ["1 Samuel 16:7", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    case 'topical':
      return `You are studying a biblical topic/theme. Use this format:

➤ [Topic name]
[clear topic definition and overview]

⤷ Relevant verses
[multiple Scripture references with explanations and context]

⤷ Theological meaning
[doctrinal significance, biblical theology, systematic understanding]

⤷ Practical application
[how to apply in daily life, specific steps, modern relevance]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here",
  "mode": "topical",
  "lang": "en" | "ta",
  "usedVerseRefs": ["Hebrews 11:1", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    case 'qa':
      return `You are answering a Bible question directly. Use this format:

➤ [Restated question]
[clear restatement of the user's question]

⤷ [Bible-based answer with references]
[comprehensive answer with multiple Scripture citations and explanations]

⤷ [Short application]
[practical steps and guidance for applying the answer]

${baseRules}

Query: "${query}"

Evidence:
${evidenceText}${verseRefsList}

Return JSON only:
{
  "text": "your formatted answer here",
  "mode": "qa",
  "lang": "en" | "ta",
  "usedVerseRefs": ["Matthew 6:14-15", ...],
  "followUpQuestions": [
    {"question": "question text", "relevance": 0.0-1.0}
  ]
}`;

    default:
      return getComposePrompt('chat', query, groundingPlan, evidence);
  }
}

