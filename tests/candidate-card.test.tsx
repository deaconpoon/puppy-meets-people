// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CandidateCard } from "@/components/candidate-card";
import { CANDIDATES } from "@/data/profiles";
import { getSeededMatch } from "@/data/seeded-matches";
import type { ScoredCandidate } from "@/data/types";

const candidate: ScoredCandidate = {
  ...CANDIDATES[0],
  match: getSeededMatch("c1")!,
};

describe("CandidateCard", () => {
  it("shows the combined score", () => {
    render(<CandidateCard candidate={candidate} />);
    expect(
      screen.getByText(String(candidate.match.combinedScore)),
    ).toBeTruthy();
  });

  it("renders at most 3 signal chips on the card", () => {
    render(<CandidateCard candidate={candidate} />);
    const chips = screen.getAllByTestId("signal-chip");
    expect(chips.length).toBeLessThanOrEqual(3);
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it("links to the candidate detail route", () => {
    render(<CandidateCard candidate={candidate} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/app/candidate/c1");
  });
});
