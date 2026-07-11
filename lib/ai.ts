// ============================================================================
// SLICE B (US-2 / US-3) — Live AI scoring (TRD §5.1 / §5.2).
// Server-side only: called from app/actions.ts, never from the client.
// generateObject() validates the model output against MatchScoreSchema
// (data/schemas.ts), which mirrors the frozen MatchResult contract.
// ============================================================================

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { MatchScoreSchema } from "@/data/schemas";
import type { MatchResult, Profile } from "@/data/types";

/**
 * Prompt per TRD §5.2: score human fit and dog fit separately, combine
 * 60% human / 40% dog, cite concrete shared traits, stay warm and specific.
 */
export function buildPrompt(user: Profile, candidate: Profile): string {
  return [
    "You are a compatibility matcher for a dating app for dog owners.",
    "Score human-to-human fit (0-100) and dog-to-dog fit (0-100) separately,",
    "then a combinedScore weighted 60% human / 40% dog.",
    "Consider: lifestyle energy match, shared interests, what each is looking",
    "for, dog size compatibility, dog energy levels, temperament fit, and",
    "overlapping favorite activities.",
    'Return 2-4 short reason chips (a few words each, e.g. "Both high-energy',
    'dogs") and a warm, specific 1-3 sentence explanation that names the',
    "people and dogs and cites concrete shared traits. No generic filler.",
    "",
    "CURRENT USER:",
    JSON.stringify({ human: user.human, dog: user.dog }),
    "",
    "CANDIDATE:",
    JSON.stringify({ human: candidate.human, dog: candidate.dog }),
  ].join("\n");
}

/**
 * Score one candidate with gpt-4o-mini via structured output.
 * Throws on API/network/validation failure — the caller (app/actions.ts)
 * catches and falls back to lib/fallback-score.ts, so the UI never breaks.
 */
export async function scoreMatchAI(
  user: Profile,
  candidate: Profile,
): Promise<MatchResult> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: MatchScoreSchema,
    prompt: buildPrompt(user, candidate),
  });
  return { candidateId: candidate.id, ...object };
}
