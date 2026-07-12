import { describe, expect, it } from "vitest";
import { scoreMatch, scoreAll } from "@/app/actions";
import { CURRENT_USER, CANDIDATES } from "@/data/profiles";

// No OPENAI_API_KEY in the test env → deterministic + templated path.
describe("scoreMatch (no key → deterministic + template)", () => {
  it("returns a valid, non-empty explanation without a key", async () => {
    const r = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
    expect(r.candidateId).toBe(CANDIDATES[0].id);
    expect(r.explanation.length).toBeGreaterThan(0);
    expect(r.signals.length).toBeGreaterThanOrEqual(2);
  });

  it("scoreAll ranks results high → low by combined score", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].match.combinedScore).toBeGreaterThanOrEqual(
        ranked[i].match.combinedScore,
      );
    }
  });
});
