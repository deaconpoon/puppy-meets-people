// SLICE B (US-2) — Candidate detail: the full compatibility breakdown.
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MatchBreakdown } from "@/components/match-breakdown";
import { CURRENT_USER, getCandidateById } from "@/data/profiles";
import { getSeededMatch } from "@/data/seeded-matches";
import { scoreDeterministic } from "@/lib/scoring";

export default async function CandidatePage({
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
    <div className="mx-auto max-w-xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/app">← Back to Discover</Link>
      </Button>
      <h1 className="text-2xl font-bold">
        {candidate.human.name} &amp; {candidate.dogs[0].name}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Why you and {CURRENT_USER.human.name} might fit — for both of you.
      </p>
      <div className="mt-6">
        <MatchBreakdown candidate={candidate} match={match} />
      </div>
    </div>
  );
}
