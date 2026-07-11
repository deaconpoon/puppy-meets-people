// ============================================================================
// SLICE B (US-2 / US-3) — Discover page (/app). STUB — owner: Person B.
// Renders candidates ranked high→low by combined score (US-2), each with
// reason chips + the AI explanation (US-3), from the pre-generated seeds
// (TRD §2.3 demo safety — zero network at demo time).
//
// TODO (Slice B):
//   1. When the user saves an edited profile (Slice A seam), re-score live
//      via the scoreAll server action in app/actions.ts instead of seeds.
//   2. Loading skeletons (components/ui/skeleton.tsx) while re-scoring.
//   3. Should-have: filters (dog size, energy) per BRD §2.3.
// ============================================================================

import { CandidateCard } from "@/components/candidate-card";
import { CANDIDATES, CURRENT_USER } from "@/data/profiles";
import { getSeededMatch } from "@/data/seeded-matches";
import { fallbackScore } from "@/lib/fallback-score";
import type { ScoredCandidate } from "@/data/types";

export default function DiscoverPage() {
  // Seeded results, ranked high → low (US-2). fallbackScore covers any
  // candidate missing a seed so the page can never render a hole.
  const scored: ScoredCandidate[] = CANDIDATES.map((candidate) => ({
    ...candidate,
    match: getSeededMatch(candidate.id) ?? fallbackScore(CURRENT_USER, candidate),
  })).sort((a, b) => b.match.combinedScore - a.match.combinedScore);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Discover</h1>
      <p className="mt-1 text-muted-foreground">
        Ranked by combined fit for you, {CURRENT_USER.human.name} — and for{" "}
        {CURRENT_USER.dog.name}.
      </p>
      <div className="mt-6 space-y-4">
        {scored.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
