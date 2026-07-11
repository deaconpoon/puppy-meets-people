// The deterministic scoring engine — owns the score and signals. Pure fn of
// two Profiles: no network, no randomness, identical with or without a key.
// Dimensions: human = interest overlap + proximity + walk-schedule overlap
// (weighted 40/30/30); dog = conservative worst-pair-weighted blend over all
// (userDog × candidateDog) pairs (0.7*worstPair + 0.3*mean), so one clashing
// dog can't be diluted away by other easy pairs.

import type { Dog, MatchResult, Profile } from "@/data/types";
import {
  clamp,
  dogPairScore,
  interestFit,
  proximityFit,
  walkFit,
} from "./dimensions";
import { buildSignals, type DimensionInput } from "./signals";

/** Conservative dog fit: 0.7*worstPair + 0.3*meanPair over all dog pairs. */
export function dogFit(
  userDogs: Dog[],
  candDogs: Dog[],
): { score: number; worstPair: { a: Dog; b: Dog; score: number } } {
  const pairs: { a: Dog; b: Dog; score: number }[] = [];
  for (const a of userDogs)
    for (const b of candDogs) pairs.push({ a, b, score: dogPairScore(a, b) });
  const mean = pairs.reduce((s, p) => s + p.score, 0) / pairs.length;
  const worstPair = pairs.reduce(
    (w, p) => (p.score < w.score ? p : w),
    pairs[0],
  );
  const score = clamp(0.7 * worstPair.score + 0.3 * mean);
  return { score, worstPair };
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

  const dog = dogFit(user.dogs, candidate.dogs);
  const dogScore = dog.score;
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
    // NOTE: this signal keys off the WORST pair's score, not the blended
    // dogScore — the conservative blend can sit above the caution threshold
    // even when a real clash exists, so the friction we want to surface is
    // the worst pair itself.
    {
      facet: "dog",
      score: dog.worstPair.score,
      positive: `${dog.worstPair.a.name} & ${dog.worstPair.b.name} click`,
      caution: `${dog.worstPair.a.name} & ${dog.worstPair.b.name} may not mesh`,
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
