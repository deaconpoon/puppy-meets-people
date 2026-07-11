// ============================================================================
// SLICE C (US-4) — Match confirmation (/app/match/[id]). STUB — owner: Person C.
// The demo payoff: "It's a match!" + full breakdown (combined score,
// human/dog sub-scores, reason chips, AI explanation).
//
// TODO (Slice C):
//   1. Celebratory moment — confetti / paw animation on mount.
//   2. When Slice A ships editable profiles, score live via the scoreMatch
//      server action (app/actions.ts) instead of only seeded results.
//   3. Faked next step per BRD §2.2 (e.g. static "plan a dog-park date").
// ============================================================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatchBreakdown } from "@/components/match-breakdown";
import { CURRENT_USER, getCandidateById } from "@/data/profiles";
import { getSeededMatch } from "@/data/seeded-matches";
import { scoreDeterministic } from "@/lib/scoring";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidateById(id);
  if (!candidate) notFound();

  const match =
    getSeededMatch(id) ?? scoreDeterministic(CURRENT_USER, candidate);

  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <h1 className="text-4xl font-bold text-primary">It&apos;s a match! 🐾</h1>
      <p className="mt-2 text-muted-foreground">
        {CURRENT_USER.human.name} &amp; {CURRENT_USER.dogs[0].name}, meet{" "}
        {candidate.human.name} &amp; {candidate.dogs[0].name}.
      </p>
      <div className="mt-6 text-left">
        <MatchBreakdown candidate={candidate} match={match} />
      </div>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/app">Back to Discover</Link>
      </Button>
    </div>
  );
}
