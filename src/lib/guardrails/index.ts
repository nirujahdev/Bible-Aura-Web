// Bible Aura Guardrails Handler
// Single global guardrails pass (PII + Moderation only)

import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";

// Guardrails configuration (only fast checks)
export const guardrailsConfig = {
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
    }
  ]
};

// Guardrails utilities
export function guardrailsHasTripwire(results: any[]): boolean {
  return (results ?? []).some((r) => r?.tripwireTriggered === true);
}

export function getGuardrailSafeText(results: any[], fallbackText: string): string {
  for (const r of results ?? []) {
    if (r?.info && ("checked_text" in r.info)) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  const pii = (results ?? []).find((r) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}

export function buildGuardrailFailOutput(results: any[]) {
  const get = (name: string) => (results ?? []).find((r) => {
    const info = r?.info ?? {};
    const n = (info?.guardrail_name ?? info?.guardrailName);
    return n === name;
  });

  const pii = get("Contains PII");
  const mod = get("Moderation");

  return {
    pii: {
      failed: (pii?.tripwireTriggered === true) || false,
      ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
    },
    moderation: {
      failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
      ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
      ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
    }
  };
}

/**
 * Run global guardrails on text
 * Returns safe text or throws error if blocked
 */
export async function runGlobalGuardrails(
  text: string,
  client: OpenAI,
  timeoutMs: number = 1000
): Promise<string> {
  const context = { guardrailLlm: client };

  try {
    // Set timeout for guardrails (1 second max)
    const guardrailsPromise = runGuardrails(text, guardrailsConfig, context, true);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Guardrails timeout')), timeoutMs)
    );

    const guardrailsResult = await Promise.race([guardrailsPromise, timeoutPromise]) as any;
    const hasTripwire = guardrailsHasTripwire(guardrailsResult);
    const safeText = getGuardrailSafeText(guardrailsResult, text);

    if (hasTripwire) {
      // Content blocked
      console.warn('[Guardrails] Content blocked:', buildGuardrailFailOutput(guardrailsResult ?? []));
      throw new Error(`Content blocked by guardrails: ${JSON.stringify(buildGuardrailFailOutput(guardrailsResult ?? []))}`);
    }

    return safeText;
  } catch (error: any) {
    // If timeout or error, check if it's a content block
    if (error.message && error.message.includes('Content blocked')) {
      throw error; // Re-throw content blocks
    }

    // If timeout or other error, skip guardrails and use original text
    if (error.message && error.message.includes('timeout')) {
      console.warn('[Guardrails] Timeout, using original text');
    } else {
      console.error('[Guardrails] Error:', error.message);
    }

    // Return original text if guardrails fail (non-blocking errors)
    return text;
  }
}

