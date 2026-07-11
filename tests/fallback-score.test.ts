// Tests for the deterministic fallback scorer (currently backing US-2/US-3).
// Whatever the scoring approach becomes, the demo-safety property under test
// here should survive: a valid MatchResult, deterministic, no network.

import { describe, expect, it } from "vitest";
import { fallbackScore } from "@/lib/fallback-score";
import type { Profile } from "@/data/types";

const ava: Profile = {
  id: "ava",
  human: {
    name: "Ava",
    age: 29,
    city: "Vancouver",
    energy: 4,
    interests: ["hiking", "coffee", "photography"],
    lookingFor: "A trail buddy who loves dogs as much as I do.",
  },
  dog: {
    name: "Biscuit",
    breed: "Border Collie",
    size: "medium",
    energy: 5,
    temperament: ["playful", "friendly"],
    favoriteActivity: "long hikes",
  },
};

const ben: Profile = {
  id: "ben",
  human: {
    name: "Ben",
    age: 31,
    city: "Vancouver",
    energy: 4,
    interests: ["hiking", "board games"],
    lookingFor: "Someone to explore the North Shore with.",
  },
  dog: {
    name: "Mochi",
    breed: "Shiba Inu",
    size: "medium",
    energy: 4,
    temperament: ["independent", "playful"],
    favoriteActivity: "hikes in the forest",
  },
};

const cleo: Profile = {
  id: "cleo",
  human: {
    name: "Cleo",
    age: 35,
    city: "Burnaby",
    energy: 1,
    interests: ["reading", "baking"],
    lookingFor: "Quiet nights in.",
  },
  dog: {
    name: "Pudding",
    breed: "Great Dane",
    size: "large",
    energy: 1,
    temperament: ["calm"],
    favoriteActivity: "naps in the sun",
  },
};

describe("fallbackScore", () => {
  it("returns the candidate's id, never the user's", () => {
    expect(fallbackScore(ava, ben).candidateId).toBe("ben");
  });

  it("is deterministic — same inputs, same result", () => {
    expect(fallbackScore(ava, ben)).toEqual(fallbackScore(ava, ben));
  });

  it("keeps all scores within 0–100", () => {
    for (const candidate of [ben, cleo]) {
      const r = fallbackScore(ava, candidate);
      for (const score of [r.combinedScore, r.humanScore, r.dogScore]) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      }
    }
  });

  it("weights combined score 60% human / 40% dog", () => {
    const r = fallbackScore(ava, ben);
    expect(r.combinedScore).toBe(
      Math.round(0.6 * r.humanScore + 0.4 * r.dogScore),
    );
  });

  it("ranks a compatible pair above an incompatible one", () => {
    const compatible = fallbackScore(ava, ben);
    const incompatible = fallbackScore(ava, cleo);
    expect(compatible.combinedScore).toBeGreaterThan(
      incompatible.combinedScore,
    );
  });

  it("produces 2–4 reason chips (contract: MatchResult.reasons)", () => {
    for (const candidate of [ben, cleo]) {
      const { reasons } = fallbackScore(ava, candidate);
      expect(reasons.length).toBeGreaterThanOrEqual(2);
      expect(reasons.length).toBeLessThanOrEqual(4);
    }
  });

  it("names concrete shared traits in the explanation", () => {
    const r = fallbackScore(ava, ben);
    expect(r.explanation).toContain("Ben");
    expect(r.explanation).toContain("Biscuit");
    expect(r.explanation).toContain("Mochi");
    expect(r.explanation.toLowerCase()).toContain("hiking");
  });
});
