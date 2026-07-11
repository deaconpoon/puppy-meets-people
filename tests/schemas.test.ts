// Shared-seam contract tests: data/schemas.ts (Zod) must agree with
// data/types.ts. Both CAN evolve — but together, deliberately, and flagged to
// the team. If these fail unexpectedly, the seam drifted; sync it back up.

import { describe, expect, it } from "vitest";
import {
  DogSchema,
  HumanSchema,
  MatchResultSchema,
  MatchScoreSchema,
  ProfileSchema,
} from "@/data/schemas";
import { fallbackScore } from "@/lib/fallback-score";
import type { Profile } from "@/data/types";

const validProfile: Profile = {
  id: "p1",
  human: {
    name: "Dana",
    age: 27,
    city: "Vancouver",
    energy: 3,
    interests: ["climbing"],
    lookingFor: "Adventure partner.",
  },
  dog: {
    name: "Rex",
    breed: "Lab mix",
    size: "large",
    energy: 4,
    temperament: ["goofy"],
    favoriteActivity: "fetch at the park",
  },
  photoUrl: "/profiles/dana.jpg",
};

describe("profile schemas mirror the frozen types", () => {
  it("accepts a valid Profile (with and without optional photoUrl)", () => {
    expect(ProfileSchema.safeParse(validProfile).success).toBe(true);
    const noPhoto: Profile = { ...validProfile };
    delete noPhoto.photoUrl;
    expect(ProfileSchema.safeParse(noPhoto).success).toBe(true);
  });

  it("rejects energy outside the 1–5 literal union", () => {
    expect(
      HumanSchema.safeParse({ ...validProfile.human, energy: 6 }).success,
    ).toBe(false);
    expect(
      DogSchema.safeParse({ ...validProfile.dog, energy: 0 }).success,
    ).toBe(false);
  });

  it("rejects a dog size outside small/medium/large", () => {
    expect(
      DogSchema.safeParse({ ...validProfile.dog, size: "giant" }).success,
    ).toBe(false);
  });
});

describe("AI output schemas (TRD §5.1)", () => {
  it("MatchScoreSchema bounds scores to 0–100 and reasons to 2–4", () => {
    const good = {
      combinedScore: 82,
      humanScore: 90,
      dogScore: 70,
      reasons: ["Both love hiking", "Matched dog energy"],
      explanation: "You both love the outdoors.",
    };
    expect(MatchScoreSchema.safeParse(good).success).toBe(true);
    expect(
      MatchScoreSchema.safeParse({ ...good, combinedScore: 101 }).success,
    ).toBe(false);
    expect(
      MatchScoreSchema.safeParse({ ...good, reasons: ["only one"] }).success,
    ).toBe(false);
  });

  it("validates the fallback scorer's output — AI and fallback share one contract", () => {
    const other: Profile = {
      ...validProfile,
      id: "p2",
      human: { ...validProfile.human, name: "Eli" },
      dog: { ...validProfile.dog, name: "Waffle" },
    };
    const result = fallbackScore(validProfile, other);
    expect(MatchResultSchema.safeParse(result).success).toBe(true);
  });
});
