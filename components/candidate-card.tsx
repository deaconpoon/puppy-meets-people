// ============================================================================
// SLICE B (US-2 / US-3) — Candidate card for Discover.
// Renders one ScoredCandidate: combined score + human/dog sub-scores (US-2),
// reason chips + AI "why you matched" explanation (US-3), and a Like button
// that hands the candidate to Slice C via /app/match/[id] (US-4 seam).
// ============================================================================

import Link from "next/link";
import { Heart, PawPrint, User } from "lucide-react";
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
  const { human, dog, match } = candidate;

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
          <p className="text-3xl font-bold text-primary">{match.combinedScore}</p>
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
          {match.reasons.map((reason) => (
            <Badge key={reason} variant="secondary">
              {reason}
            </Badge>
          ))}
        </div>
        <p className="text-sm">{match.explanation}</p>
      </CardContent>
      <CardFooter>
        {/* US-4 seam: liking opens the Slice C match confirmation */}
        <Button asChild className="w-full">
          <Link href={`/app/match/${candidate.id}`}>
            <Heart className="size-4" aria-hidden /> Like {human.name} &amp; {dog.name}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
