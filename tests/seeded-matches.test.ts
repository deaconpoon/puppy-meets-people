import { describe, expect, it } from "vitest";
import { SEEDED_MATCHES } from "@/data/seeded-matches";
import { MatchResultSchema } from "@/data/schemas";
import { CANDIDATES } from "@/data/profiles";

describe("SEEDED_MATCHES", () => {
  it("every entry satisfies the MatchResult contract", () => {
    for (const m of SEEDED_MATCHES) {
      expect(MatchResultSchema.safeParse(m).success).toBe(true);
    }
  });

  it("every entry's combinedScore reconciles with the 60/40 weighting", () => {
    for (const m of SEEDED_MATCHES) {
      expect(m.combinedScore).toBe(
        Math.round(0.6 * m.humanScore + 0.4 * m.dogScore),
      );
    }
  });

  it("has exactly one seeded match per candidate, no missing or orphaned ids", () => {
    const seededIds = new Set(SEEDED_MATCHES.map((m) => m.candidateId));
    const candidateIds = new Set(CANDIDATES.map((c) => c.id));

    expect(seededIds).toEqual(candidateIds);
    expect(SEEDED_MATCHES.length).toBe(CANDIDATES.length);
  });
});
