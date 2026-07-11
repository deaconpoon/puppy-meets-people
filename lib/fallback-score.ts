// ============================================================================
// SLICE B (US-2 / US-3) — Deterministic fallback scorer (TRD §5.3).
// Demo insurance: used when OPENAI_API_KEY is missing or the live AI call
// throws, so the UI always renders. Pure function — no network, no randomness.
// Scores from: human energy delta, interest overlap, dog size fit, dog energy
// fit, and shared activity vibes. Weighted 60% human / 40% dog (types.ts).
// ============================================================================

import type { MatchResult, Profile } from "@/data/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** 0–4 energy delta → 100..20. Closer lifestyles score higher. */
function energyFit(a: number, b: number): number {
  return 100 - Math.abs(a - b) * 20;
}

/** Case-insensitive overlap between two tag lists → 0–100. */
function overlapScore(
  a: string[],
  b: string[],
): { score: number; shared: string[] } {
  const setB = new Set(b.map((x) => x.trim().toLowerCase()));
  const shared = a.filter((x) => setB.has(x.trim().toLowerCase()));
  const denom = Math.max(1, Math.min(a.length, b.length));
  return { score: clamp((shared.length / denom) * 100), shared };
}

const SIZE_ORDER = { small: 0, medium: 1, large: 2 } as const;

/** Same size 100, one step apart 70, small↔large 40. */
function sizeFit(
  a: keyof typeof SIZE_ORDER,
  b: keyof typeof SIZE_ORDER,
): number {
  return 100 - Math.abs(SIZE_ORDER[a] - SIZE_ORDER[b]) * 30;
}

/** Loose word overlap between favorite activities, e.g. "long hikes" ~ "hikes". */
function activityFit(a: string, b: string): boolean {
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
  const setB = new Set(words(b));
  return words(a).some((w) => setB.has(w));
}

/**
 * Deterministic MatchResult for user vs. candidate. Same shape the AI returns,
 * with a templated (but specific) explanation.
 */
export function fallbackScore(user: Profile, candidate: Profile): MatchResult {
  const humanEnergy = energyFit(user.human.energy, candidate.human.energy);
  const interests = overlapScore(
    user.human.interests,
    candidate.human.interests,
  );
  const humanScore = clamp(0.5 * humanEnergy + 0.5 * interests.score);

  const dogEnergy = energyFit(user.dog.energy, candidate.dog.energy);
  const dogSize = sizeFit(user.dog.size, candidate.dog.size);
  const temperament = overlapScore(
    user.dog.temperament,
    candidate.dog.temperament,
  );
  const sharedActivity = activityFit(
    user.dog.favoriteActivity,
    candidate.dog.favoriteActivity,
  );
  const dogScore = clamp(
    0.35 * dogEnergy +
      0.3 * dogSize +
      0.2 * temperament.score +
      0.15 * (sharedActivity ? 100 : 40),
  );

  const combinedScore = clamp(0.6 * humanScore + 0.4 * dogScore);

  // Build 2–4 reason chips from the strongest concrete signals.
  const reasons: string[] = [];
  if (interests.shared.length > 0) {
    reasons.push(`You both love ${interests.shared[0]}`);
  }
  if (Math.abs(user.human.energy - candidate.human.energy) <= 1) {
    reasons.push("Matched lifestyle energy");
  }
  if (user.dog.size === candidate.dog.size) {
    reasons.push(`Both ${user.dog.size} dogs`);
  }
  if (Math.abs(user.dog.energy - candidate.dog.energy) <= 1) {
    reasons.push("Dog energy levels align");
  }
  if (sharedActivity) {
    reasons.push("Dogs share a favorite activity");
  }
  while (reasons.length < 2) {
    reasons.push(
      reasons.length === 0
        ? "Complementary lifestyles"
        : "Dogs could balance each other",
    );
  }

  const explanation =
    `You and ${candidate.human.name} ${
      interests.shared.length > 0
        ? `share a love of ${interests.shared.slice(0, 2).join(" and ")}`
        : "have complementary interests"
    }, and your lifestyle energies are ${
      Math.abs(user.human.energy - candidate.human.energy) <= 1
        ? "closely"
        : "loosely"
    } matched. ` +
    `${user.dog.name} and ${candidate.dog.name} are ${
      user.dog.size === candidate.dog.size
        ? `both ${user.dog.size} dogs`
        : "different sizes but"
    } with ${
      Math.abs(user.dog.energy - candidate.dog.energy) <= 1
        ? "similar"
        : "contrasting"
    } energy — ${
      sharedActivity
        ? `and they both live for ${candidate.dog.favoriteActivity}.`
        : `${candidate.dog.name} loves ${candidate.dog.favoriteActivity}.`
    }`;

  return {
    candidateId: candidate.id,
    combinedScore,
    humanScore,
    dogScore,
    reasons: reasons.slice(0, 4),
    explanation,
  };
}
