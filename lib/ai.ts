// Slice B — LLM narration. The deterministic engine owns the score and the
// signals; the model only turns those computed facts into a warm sentence.
// generateObject validates the output against MatchScoreSchema ({ explanation }).
// Throws on API/validation failure — app/actions.ts catches and falls back to
// the templated explanation, so the UI never breaks.

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { MatchScoreSchema } from "@/data/schemas";
import type { Profile, Signal } from "@/data/types";

export function buildNarrationPrompt(
  user: Profile,
  candidate: Profile,
  signals: Signal[],
): string {
  return [
    "You are writing a warm, specific 'why you matched' blurb for a dating",
    "app for dog owners. The compatibility has ALREADY been computed — do NOT",
    "invent scores or new reasons. Turn ONLY the signals below into 1–3 warm,",
    "specific sentences that name the people and dogs. Positive signals are",
    "strengths; caution signals are honest things to watch. No generic filler.",
    "",
    `USER: ${user.human.name}, dogs: ${user.dogs.map((d) => d.name).join(", ")}`,
    `CANDIDATE: ${candidate.human.name}, dogs: ${candidate.dogs.map((d) => d.name).join(", ")}`,
    "SIGNALS:",
    ...signals.map((s) => `- [${s.kind}/${s.facet}] ${s.label}`),
  ].join("\n");
}

export async function narrateExplanation(
  user: Profile,
  candidate: Profile,
  signals: Signal[],
): Promise<string> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: MatchScoreSchema,
    prompt: buildNarrationPrompt(user, candidate, signals),
  });
  return object.explanation;
}
