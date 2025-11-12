import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";
import { z } from "zod";
import { Agent, AgentInputItem, Runner, withTrace } from "@openai/agents";

// Shared client for guardrails and file search
const client = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY 
});

if (!import.meta.env.VITE_OPENAI_API_KEY && !process.env.VITE_OPENAI_API_KEY) {
  console.warn('OpenAI API key not found in environment variables');
}

// Guardrails definitions
const guardrailsConfig = {
  guardrails: [
    {
      name: "Contains PII",
      config: {
        block: true,
        entities: [
          "CREDIT_CARD",
          "US_BANK_NUMBER",
          "US_PASSPORT",
          "US_SSN"
        ]
      }
    },
    {
      name: "Moderation",
      config: {
        categories: [
          "sexual/minors",
          "hate/threatening",
          "harassment/threatening",
          "self-harm/instructions",
          "violence/graphic",
          "illicit/violent"
        ]
      }
    },
    {
      name: "Hallucination Detection",
      config: {
        model: "gpt-4o-mini",
        knowledge_source: "vs_6914c8f2ecf48191b8c80e0911d335cf",
        confidence_threshold: 0.7
      }
    },
    {
      name: "Jailbreak",
      config: {
        model: "gpt-4o-mini",
        confidence_threshold: 0.7
      }
    }
  ]
};

const context = { guardrailLlm: client };

// Guardrails utils
function guardrailsHasTripwire(results: any) {
    return (results ?? []).some((r: any) => r?.tripwireTriggered === true);
}

function getGuardrailSafeText(results: any, fallbackText: string) {
    // Prefer checked_text as the generic safe/processed text
    for (const r of results ?? []) {
        if (r?.info && ("checked_text" in r.info)) {
            return r.info.checked_text ?? fallbackText;
        }
    }
    // Fall back to PII-specific anonymized_text if present
    const pii = (results ?? []).find((r: any) => r?.info && "anonymized_text" in r.info);
    return pii?.info?.anonymized_text ?? fallbackText;
}

function buildGuardrailFailOutput(results: any) {
    const get = (name: string) => (results ?? []).find((r: any) => {
          const info = r?.info ?? {};
          const n = (info?.guardrail_name ?? info?.guardrailName);
          return n === name;
        }),
          pii = get("Contains PII"),
          mod = get("Moderation"),
          jb = get("Jailbreak"),
          hal = get("Hallucination Detection"),
          piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
              .filter(([, v]: [string, any]) => Array.isArray(v))
              .map(([k, v]: [string, any]) => k + ":" + v.length),
          thr = jb?.info?.threshold,
          conf = jb?.info?.confidence;

    return {
        pii: {
            failed: (piiCounts.length > 0) || pii?.tripwireTriggered === true,
            ...(piiCounts.length ? { detected_counts: piiCounts } : {}),
            ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
        },
        moderation: {
            failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
            ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
            ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
        },
        jailbreak: {
            // Rely on runtime-provided tripwire; don't recompute thresholds
            failed: jb?.tripwireTriggered === true,
            ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
        },
        hallucination: {
            // Rely on runtime-provided tripwire; don't recompute
            failed: hal?.tripwireTriggered === true,
            ...(hal?.info?.reasoning ? { reasoning: hal.info.reasoning } : {}),
            ...(hal?.info?.hallucination_type ? { hallucination_type: hal.info.hallucination_type } : {}),
            ...(hal?.info?.hallucinated_statements ? { hallucinated_statements: hal.info.hallucinated_statements } : {}),
            ...(hal?.info?.verified_statements ? { verified_statements: hal.info.verified_statements } : {}),
            ...(hal?.executionFailed && hal?.info?.error ? { error: hal.info.error } : {}),
        },
    };
}

const LanguageClassifierSchema = z.object({ lang: z.enum(["en", "ta"]) });
const ModeClassifierSchema = z.object({ mode: z.enum(["chat", "verse", "parable", "character", "topical", "qa"]) });

const languageClassifier = new Agent({
  name: "Language Classifier",
  instructions: `You are the Bible Aura language detector.
Identify whether the user's message is written in English or Tamil.
Respond ONLY with structured JSON.`,
  model: "gpt-4o-mini",
  outputType: LanguageClassifierSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const chat = new Agent({
  name: "Chat",
  instructions: `You are Bible Aura's AI Chat assistant.
Answer warmly and briefly (max 80 words).
Format:
✦ [Direct answer in 1–2 sentences]
[Scripture reference if relevant]
[Brief encouragement or reflective question]`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const qA = new Agent({
  name: "Q&A",
  instructions: `You are Bible Aura's Quick Q&A AI.
Give ultra-fast answers under 100 words.
Format:
✦ [Question Topic]
↗ Answer
↗ Scripture
↗ Why
Keep it practical, clear, and biblical.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const verseAnalysis = new Agent({
  name: "Verse Analysis",
  instructions: `You are Bible Aura's Verse Analysis AI.
Give a structured 5-part explanation:
✦ VERSE ANALYSIS: [Verse Reference]
↗ Verse
↗ Historical Context
↗ Theological Doctrine
↗ Cross Reference
↗ Summary
Use clean icons (✦ ↗ • only). Be biblically accurate.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const topical = new Agent({
  name: "Topical",
  instructions: `You are Bible Aura's Topical Study assistant.
Teach a biblical topic in 5 sections:
✦ TOPIC: [Subject]
↗ Definition & Overview
↗ Key Scripture Passages
↗ Biblical Commentary
↗ Real-Life Application
↗ Additional Study Resources`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const parable = new Agent({
  name: "Parable",
  instructions: `You are Bible Aura's Parable Study assistant.
Explain Jesus' parables clearly:
✦ PARABLE: [Name]
↗ The Story
↗ Original Audience & Context
↗ Core Spiritual Lesson
↗ Modern-Day Example
Keep it simple and true to Scripture.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const character = new Agent({
  name: "Character",
  instructions: `You are Bible Aura's Character Study AI.
Summarize key Bible characters:
✦ CHARACTER PROFILE: [Name]
↗ Quick Overview
↗ Timeline & Key Events
↗ Lessons for Today
↗ Key Scripture References
Include both strengths and weaknesses.`,
  model: "gpt-4o-mini",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

const modeClassifier = new Agent({
  name: "Mode Classifier",
  instructions: `You are the Bible Aura mode classification agent.
The user's query and retrieved Bible text are provided below.

Determine which mode best fits the user's intent:
- "chat" for simple discussion or guidance
- "verse" for verse analysis or explanation
- "parable" for Jesus' parables
- "character" for people studies
- "topical" for broad subjects (e.g., love, faith)
- "qa" for short factual Q&A

Return JSON only.`,
  model: "gpt-4o-mini",
  outputType: ModeClassifierSchema,
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput): Promise<any> => {
  return await withTrace("Bible Aura AI", async () => {
    const state: any = {};

    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: workflow.input_as_text
          }
        ]
      }
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_6914dcd45c3c81909293fb24b99295d70aa098ac551088a0"
      }
    });

    const languageClassifierResultTemp = await runner.run(
      languageClassifier,
      [
        ...conversationHistory,
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `User query: ${workflow.input_as_text}`
            }
          ]
        }
      ]
    );

    conversationHistory.push(...languageClassifierResultTemp.newItems.map((item) => item.rawItem));

    if (!languageClassifierResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
    }

    const languageClassifierResult = {
      output_text: JSON.stringify(languageClassifierResultTemp.finalOutput),
      output_parsed: languageClassifierResultTemp.finalOutput
    };

    // Helper function to process mode and return result
    const processMode = async (mode: string, fileSearchResults: any[]) => {
      const modeClassifierResultTemp = await runner.run(
        modeClassifier,
        [
          ...conversationHistory,
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `User query: ${workflow.input_as_text}\nContext: ${JSON.stringify(fileSearchResults)}`
              }
            ]
          }
        ]
      );

      conversationHistory.push(...modeClassifierResultTemp.newItems.map((item) => item.rawItem));

      if (!modeClassifierResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
      }

      const modeClassifierResult = {
        output_text: JSON.stringify(modeClassifierResultTemp.finalOutput),
        output_parsed: modeClassifierResultTemp.finalOutput
      };

      let agentResult: any;
      let agentName = '';

      switch (modeClassifierResult.output_parsed.mode) {
        case "chat":
          agentName = 'chat';
          const chatResultTemp = await runner.run(chat, [...conversationHistory]);
          conversationHistory.push(...chatResultTemp.newItems.map((item) => item.rawItem));
          if (!chatResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: chatResultTemp.finalOutput ?? "" };
          break;

        case "verse":
          agentName = 'verseAnalysis';
          const verseAnalysisResultTemp = await runner.run(verseAnalysis, [...conversationHistory]);
          conversationHistory.push(...verseAnalysisResultTemp.newItems.map((item) => item.rawItem));
          if (!verseAnalysisResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: verseAnalysisResultTemp.finalOutput ?? "" };
          break;

        case "parable":
          agentName = 'parable';
          const parableResultTemp = await runner.run(parable, [...conversationHistory]);
          conversationHistory.push(...parableResultTemp.newItems.map((item) => item.rawItem));
          if (!parableResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: parableResultTemp.finalOutput ?? "" };
          break;

        case "character":
          agentName = 'character';
          const characterResultTemp = await runner.run(character, [...conversationHistory]);
          conversationHistory.push(...characterResultTemp.newItems.map((item) => item.rawItem));
          if (!characterResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: characterResultTemp.finalOutput ?? "" };
          break;

        case "topical":
          agentName = 'topical';
          const topicalResultTemp = await runner.run(topical, [...conversationHistory]);
          conversationHistory.push(...topicalResultTemp.newItems.map((item) => item.rawItem));
          if (!topicalResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: topicalResultTemp.finalOutput ?? "" };
          break;

        case "qa":
          agentName = 'qA';
          const qAResultTemp = await runner.run(qA, [...conversationHistory]);
          conversationHistory.push(...qAResultTemp.newItems.map((item) => item.rawItem));
          if (!qAResultTemp.finalOutput) throw new Error("Agent result is undefined");
          agentResult = { output_text: qAResultTemp.finalOutput ?? "" };
          break;

        default:
          throw new Error(`Unknown mode: ${modeClassifierResult.output_parsed.mode}`);
      }

      // Run guardrails
      const guardrailsInputtext = workflow.input_as_text;
      const guardrailsResult = await runGuardrails(guardrailsInputtext, guardrailsConfig, context, true);
      const guardrailsHastripwire = guardrailsHasTripwire(guardrailsResult);
      const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult, guardrailsInputtext);
      const guardrailsOutput = (guardrailsHastripwire ? buildGuardrailFailOutput(guardrailsResult ?? []) : { safe_text: (guardrailsAnonymizedtext ?? guardrailsInputtext) });

      if (guardrailsHastripwire) {
        return guardrailsOutput;
      } else {
        return agentResult.output_text || guardrailsOutput.safe_text || "I apologize, but I could not generate a response. Please try again.";
      }
    };

    // Process based on language (file search may not be available in browser, so we skip it)
    const filesearchResult: any[] = [];
    
    if (languageClassifierResult.output_parsed.lang == "en") {
      return await processMode("en", filesearchResult);
    } else if (languageClassifierResult.output_parsed.lang == "ta") {
      return await processMode("ta", filesearchResult);
    } else {
      throw new Error(`Unknown language: ${languageClassifierResult.output_parsed.lang}`);
    }
  });
};

