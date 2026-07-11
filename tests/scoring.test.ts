import { describe, expect, it } from "vitest";
import { scoreDeterministic } from "@/lib/scoring";
import { MatchResultSchema } from "@/data/schemas";
import type { Profile } from "@/data/types";

const ava: Profile = {
  id: "ava",
  human: {
    name: "Ava",
    age: 29,
    city: "Seattle",
    interests: ["hiking", "coffee", "photography"],
    lookingFor: "A trail buddy who loves dogs.",
    location: { lat: 47.6062, lng: -122.3321 },
    walkTimes: ["morning", "evening"],
  },
  dogs: [
    {
      name: "Biscuit",
      breed: "Border Collie",
      size: "medium",
      energy: 5,
      temperament: ["playful", "friendly"],
      favoriteActivity: "long hikes",
    },
  ],
};

const ben: Profile = {
  id: "ben",
  human: {
    name: "Ben",
    age: 31,
    city: "Seattle",
    interests: ["hiking", "board games"],
    lookingFor: "Explore the trails.",
    location: { lat: 47.6097, lng: -122.3331 },
    walkTimes: ["morning"],
  },
  dogs: [
    {
      name: "Mochi",
      breed: "Shiba Inu",
      size: "medium",
      energy: 4,
      temperament: ["independent", "playful"],
      favoriteActivity: "hikes in the forest",
    },
  ],
};

const cleo: Profile = {
  id: "cleo",
  human: {
    name: "Cleo",
    age: 35,
    city: "Tacoma",
    interests: ["reading", "baking"],
    lookingFor: "Quiet nights in.",
    location: { lat: 47.2529, lng: -122.4443 },
    walkTimes: ["night"],
  },
  dogs: [
    {
      name: "Pudding",
      breed: "Great Dane",
      size: "large",
      energy: 1,
      temperament: ["calm"],
      favoriteActivity: "naps in the sun",
    },
  ],
};

describe("scoreDeterministic", () => {
  it("returns the candidate's id, never the user's", () => {
    expect(scoreDeterministic(ava, ben).candidateId).toBe("ben");
  });

  it("is deterministic — same inputs, same result", () => {
    expect(scoreDeterministic(ava, ben)).toEqual(scoreDeterministic(ava, ben));
  });

  it("keeps all scores within 0–100 integers", () => {
    for (const c of [ben, cleo]) {
      const r = scoreDeterministic(ava, c);
      for (const s of [r.combinedScore, r.humanScore, r.dogScore]) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
        expect(Number.isInteger(s)).toBe(true);
      }
    }
  });

  it("weights combined score 60% human / 40% dog", () => {
    const r = scoreDeterministic(ava, ben);
    expect(r.combinedScore).toBe(
      Math.round(0.6 * r.humanScore + 0.4 * r.dogScore),
    );
  });

  it("ranks a compatible pair above an incompatible one", () => {
    expect(scoreDeterministic(ava, ben).combinedScore).toBeGreaterThan(
      scoreDeterministic(ava, cleo).combinedScore,
    );
  });

  it("produces 2–4 faceted signals that satisfy the contract", () => {
    for (const c of [ben, cleo]) {
      const r = scoreDeterministic(ava, c);
      expect(r.signals.length).toBeGreaterThanOrEqual(2);
      expect(r.signals.length).toBeLessThanOrEqual(4);
      for (const sig of r.signals) {
        expect(["human", "dog"]).toContain(sig.facet);
        expect(["positive", "caution"]).toContain(sig.kind);
        expect(sig.label.length).toBeGreaterThan(0);
      }
      expect(MatchResultSchema.safeParse(r).success).toBe(true);
    }
  });

  it("names both dogs in the explanation", () => {
    const r = scoreDeterministic(ava, ben);
    expect(r.explanation).toContain("Biscuit");
    expect(r.explanation).toContain("Mochi");
  });
});
