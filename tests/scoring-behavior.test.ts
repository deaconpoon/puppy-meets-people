import { describe, expect, it } from "vitest";
import { scoreAll } from "@/app/actions";
import { CURRENT_USER, CANDIDATES } from "@/data/profiles";
import { MatchResultSchema } from "@/data/schemas";

describe("US-2 demo integrity", () => {
  it("every seeded candidate scores to a valid MatchResult with no key", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    expect(ranked.length).toBe(CANDIDATES.length);
    for (const c of ranked) {
      expect(MatchResultSchema.safeParse(c.match).success).toBe(true);
    }
  });

  it("orders results high → low by combined score", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const scores = ranked.map((c) => c.match.combinedScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("an obvious fit (Nina/Pepper, c10) outranks an obvious clash (Leo/Miso, c11)", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const rank = (id: string) => ranked.findIndex((c) => c.id === id);
    expect(rank("c10")).toBeLessThan(rank("c11"));
  });

  it("surfaces at least one caution somewhere in the field", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const anyCaution = ranked.some((c) =>
      c.match.signals.some((s) => s.kind === "caution"),
    );
    expect(anyCaution).toBe(true);
  });
});
