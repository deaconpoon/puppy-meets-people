"use server";

// ============================================================================
// SHARED FOUNDATION (TRD §4) — the API contract between all three slices.
// Slice B implements the scoring; Slices A and C call these actions.
// Signatures are frozen as ScoreMatch / ScoreAll in data/types.ts.
//
// Demo-safety chain (TRD §2.3): live gpt-4o-mini call → on missing key or
// any error, deterministic fallback (lib/fallback-score.ts). Never throws to
// the UI.
// ============================================================================

import type { Profile, ScoredCandidate, ScoreMatch, ScoreAll } from "@/data/types";
import { scoreMatchAI } from "@/lib/ai";
import { fallbackScore } from "@/lib/fallback-score";

/** Score the current user against a single candidate (TRD §4). */
export const scoreMatch: ScoreMatch = async (user, candidate) => {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackScore(user, candidate);
  }
  try {
    return await scoreMatchAI(user, candidate);
  } catch (error) {
    console.error(`scoreMatch: AI call failed for ${candidate.id}, using fallback`, error);
    return fallbackScore(user, candidate);
  }
};

/** Score & rank the current user against all candidates, high → low (TRD §4). */
export const scoreAll: ScoreAll = async (user, candidates) => {
  const results = await Promise.all(
    candidates.map(async (candidate): Promise<ScoredCandidate> => {
      const match = await scoreMatch(user, candidate);
      return { ...candidate, match };
    }),
  );
  return results.sort((a, b) => b.match.combinedScore - a.match.combinedScore);
};
