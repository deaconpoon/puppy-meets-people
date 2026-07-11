"use server";

// Slice B scoring actions. Deterministic engine only for now; Task 5 layers
// LLM narration on top with a template fallback. Never throws to the UI.

import type { ScoredCandidate, ScoreMatch, ScoreAll } from "@/data/types";
import { scoreDeterministic } from "@/lib/scoring";

export const scoreMatch: ScoreMatch = async (user, candidate) => {
  return scoreDeterministic(user, candidate);
};

export const scoreAll: ScoreAll = async (user, candidates) => {
  const results: ScoredCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    match: scoreDeterministic(user, candidate),
  }));
  return results.sort((a, b) => b.match.combinedScore - a.match.combinedScore);
};
