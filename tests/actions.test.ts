import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai", () => ({ narrateExplanation: vi.fn() }));

import { narrateExplanation } from "@/lib/ai";
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

// OPENAI_API_KEY present → narration path. These mock @/lib/ai so no real
// API calls happen; they cover the two branches the no-key tests can't:
// narration succeeding (explanation overwritten) and narration throwing
// (catch → deterministic template explanation, the demo-safety fallback).
describe("scoreMatch (key present → narration)", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    vi.restoreAllMocks();
  });

  it("overwrites explanation with the narrated text, leaving scores/signals intact", async () => {
    const deterministic = await (async () => {
      delete process.env.OPENAI_API_KEY; // compute the no-key baseline
      const r = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
      process.env.OPENAI_API_KEY = "test-key";
      return r;
    })();
    vi.mocked(narrateExplanation).mockResolvedValue("A warm narrated line.");
    const r = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
    expect(r.explanation).toBe("A warm narrated line.");
    expect(r.combinedScore).toBe(deterministic.combinedScore);
    expect(r.signals).toEqual(deterministic.signals);
  });

  it("falls back to the deterministic template explanation when narration throws", async () => {
    delete process.env.OPENAI_API_KEY;
    const baseline = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
    process.env.OPENAI_API_KEY = "test-key";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(narrateExplanation).mockRejectedValue(new Error("api down"));
    const r = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
    expect(r.explanation).toBe(baseline.explanation); // template, not thrown
    expect(r.signals).toEqual(baseline.signals);
  });
});
