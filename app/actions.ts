"use server";

// Slice B scoring actions. Deterministic engine computes the score and
// signals; when OPENAI_API_KEY is set, the LLM narrates a warmer explanation
// over those already-computed facts, falling back to the templated
// explanation on any error. Never throws to the UI.

import type { ScoredCandidate, ScoreMatch, ScoreAll } from "@/data/types";
import { scoreDeterministic } from "@/lib/scoring";
import { narrateExplanation } from "@/lib/ai";

export const scoreMatch: ScoreMatch = async (user, candidate) => {
  const result = scoreDeterministic(user, candidate);
  if (!process.env.OPENAI_API_KEY) return result;
  try {
    const explanation = await narrateExplanation(
      user,
      candidate,
      result.signals,
    );
    return { ...result, explanation };
  } catch (error) {
    console.error(
      `scoreMatch: narration failed for ${candidate.id}, using template`,
      error,
    );
    return result; // deterministic template explanation
  }
};

export const scoreAll: ScoreAll = async (user, candidates) => {
  const results: ScoredCandidate[] = await Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      match: await scoreMatch(user, candidate),
    })),
  );
  return results.sort((a, b) => b.match.combinedScore - a.match.combinedScore);
};
