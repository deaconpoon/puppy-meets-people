// The deterministic scoring engine — owns the score and signals. Pure fn of
// two Profiles: no network, no randomness, identical with or without a key.
// Baseline dimensions: human = interest overlap + walk-schedule overlap +
// proximity; dog = mean over all dog pairs. Conservative dog aggregation is
// added in a later task.

import type { MatchResult, Profile } from "@/data/types";
import {
  clamp,
  dogPairScore,
  interestFit,
  proximityFit,
  walkFit,
} from "./dimensions";
import { buildSignals, type DimensionInput } from "./signals";

/** Mean of every (userDog × candidateDog) pair score. */
export function dogFit(
  userDogs: Profile["dogs"],
  candDogs: Profile["dogs"],
): number {
  const scores: number[] = [];
  for (const a of userDogs)
    for (const b of candDogs) scores.push(dogPairScore(a, b));
  return clamp(scores.reduce((s, n) => s + n, 0) / scores.length);
}

/** A short, templated explanation built from the computed signals. */
export function templateExplanation(
  user: Profile,
  candidate: Profile,
  signals: import("@/data/types").Signal[],
): string {
  const positives = signals
    .filter((s) => s.kind === "positive")
    .map((s) => s.label.toLowerCase());
  const cautions = signals
    .filter((s) => s.kind === "caution")
    .map((s) => s.label.toLowerCase());
  const lead =
    positives.length > 0
      ? `You and ${candidate.human.name} click on ${positives.slice(0, 2).join(" and ")}`
      : `You and ${candidate.human.name} have a few things in common`;
  const dogLine = `${user.dogs[0].name} and ${candidate.dogs[0].name}`;
  const tail =
    cautions.length > 0
      ? ` — worth noting: ${cautions[0]}.`
      : ` would get along easily.`;
  return `${lead}. ${dogLine}${tail}`;
}

export function scoreDeterministic(
  user: Profile,
  candidate: Profile,
): MatchResult {
  const interests = interestFit(
    user.human.interests,
    candidate.human.interests,
  );
  const prox = proximityFit(user.human.location, candidate.human.location);
  const walk = walkFit(user.human.walkTimes, candidate.human.walkTimes);
  const humanScore = clamp(
    0.4 * interests.score + 0.3 * walk.score + 0.3 * prox.score,
  );

  const dogScore = dogFit(user.dogs, candidate.dogs);
  const combinedScore = clamp(0.6 * humanScore + 0.4 * dogScore);

  const dims: DimensionInput[] = [
    {
      facet: "human",
      score: interests.score,
      positive:
        interests.shared.length > 0
          ? `Both love ${interests.shared[0]}`
          : "Shared interests",
      caution: "Different interests",
    },
    {
      facet: "human",
      score: prox.score,
      positive: `Live about ${prox.minutes} min apart`,
      caution: "You live far apart",
    },
    {
      facet: "human",
      score: walk.score,
      positive:
        walk.shared.length > 0
          ? `Both walk in the ${walk.shared[0]}`
          : "Similar walk routine",
      caution: "Different walk schedules",
    },
    {
      facet: "dog",
      score: dogScore,
      positive: "Dogs are a good match",
      caution: "Dogs may not mesh",
    },
  ];
  const signals = buildSignals(dims);

  return {
    candidateId: candidate.id,
    combinedScore,
    humanScore,
    dogScore,
    signals,
    explanation: templateExplanation(user, candidate, signals),
  };
}
