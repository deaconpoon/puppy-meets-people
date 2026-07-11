import { describe, expect, it } from "vitest";
import {
  DogSchema,
  HumanSchema,
  MatchResultSchema,
  MatchScoreSchema,
  ProfileSchema,
} from "@/data/schemas";
import { scoreDeterministic } from "@/lib/scoring";
import type { Profile } from "@/data/types";

const validProfile: Profile = {
  id: "p1",
  human: {
    name: "Dana",
    age: 27,
    city: "Seattle",
    interests: ["climbing"],
    lookingFor: "Adventure partner.",
    location: { lat: 47.6062, lng: -122.3321 },
    walkTimes: ["morning"],
  },
  dogs: [
    {
      name: "Rex",
      breed: "Lab mix",
      size: "large",
      energy: 4,
      temperament: ["goofy"],
      favoriteActivity: "fetch at the park",
    },
  ],
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
      DogSchema.safeParse({ ...validProfile.dogs[0], energy: 0 }).success,
    ).toBe(false);
  });

  it("rejects a dog size outside small/medium/large", () => {
    expect(
      DogSchema.safeParse({ ...validProfile.dogs[0], size: "giant" }).success,
    ).toBe(false);
  });

  it("requires at least one dog", () => {
    expect(ProfileSchema.safeParse({ ...validProfile, dogs: [] }).success).toBe(
      false,
    );
  });

  it("rejects a walkTime outside the enum", () => {
    expect(
      HumanSchema.safeParse({ ...validProfile.human, walkTimes: ["dawn"] })
        .success,
    ).toBe(false);
  });
});

describe("AI output + match result schemas", () => {
  it("MatchScoreSchema requires an explanation", () => {
    expect(
      MatchScoreSchema.safeParse({ explanation: "You both love the trail." })
        .success,
    ).toBe(true);
    expect(MatchScoreSchema.safeParse({ explanation: "" }).success).toBe(false);
  });

  it("validates the deterministic scorer's output against the MatchResult contract", () => {
    const other: Profile = {
      ...validProfile,
      id: "p2",
      human: { ...validProfile.human, name: "Eli" },
      dogs: [{ ...validProfile.dogs[0], name: "Waffle" }],
    };
    expect(
      MatchResultSchema.safeParse(scoreDeterministic(validProfile, other))
        .success,
    ).toBe(true);
  });
});
