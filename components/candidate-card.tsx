// ============================================================================
// SLICE B (US-2 / US-3) — Candidate card for Discover.
// Renders one ScoredCandidate: combined score + human/dog sub-scores (US-2),
// top signal chips + AI "why you matched" explanation (US-3), and a link to
// the full breakdown at /app/candidate/[id]. Liking (US-4) is Slice C's flow.
// ============================================================================

import Link from "next/link";
import { PawPrint, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ScoredCandidate } from "@/data/types";

export function CandidateCard({ candidate }: { candidate: ScoredCandidate }) {
  const { human, dogs, match } = candidate;
  const dog = dogs[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback aria-hidden>{human.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle>
            {human.name}, {human.age} &amp; {dog.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {human.city} · {dog.breed} ({dog.size})
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">
            {match.combinedScore}
          </p>
          <p className="text-xs text-muted-foreground">match</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="size-4" aria-hidden /> Human {match.humanScore}
          </span>
          <span className="flex items-center gap-1">
            <PawPrint className="size-4" aria-hidden /> Dog {match.dogScore}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {match.signals.slice(0, 3).map((signal) => (
            <Badge
              key={signal.label}
              data-testid="signal-chip"
              variant={signal.kind === "caution" ? "outline" : "secondary"}
            >
              <span aria-hidden>{signal.kind === "caution" ? "⚠" : "✔"}</span>
              <span className="sr-only">
                {signal.kind === "caution" ? "Caution: " : "Match: "}
              </span>{" "}
              {signal.label}
            </Badge>
          ))}
        </div>
        <p className="text-sm">{match.explanation}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/app/candidate/${candidate.id}`}>
            View why you match
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
