// ============================================================================
// SLICE C (US-4) — Full match breakdown for the confirmation screen.
// Renders combined score, human/dog sub-scores with bars, reason chips, and
// the AI explanation. Consumes the frozen MatchResult produced by Slice B.
// ============================================================================

import { PawPrint, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchResult, Profile } from "@/data/types";

function ScoreBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="font-semibold">{score}</span>
      </div>
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} score`}
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function MatchBreakdown({
  candidate,
  match,
}: {
  candidate: Profile;
  match: MatchResult;
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <p className="text-6xl font-bold text-primary">{match.combinedScore}</p>
        <CardTitle>
          compatibility with {candidate.human.name} &amp;{" "}
          {candidate.dogs[0].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <ScoreBar
            label={`You + ${candidate.human.name}`}
            score={match.humanScore}
            icon={<User className="size-4" aria-hidden />}
          />
          <ScoreBar
            label={`Your dog + ${candidate.dogs[0].name}`}
            score={match.dogScore}
            icon={<PawPrint className="size-4" aria-hidden />}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {match.signals.map((signal) => (
            <Badge
              key={signal.label}
              variant={signal.kind === "caution" ? "outline" : "secondary"}
            >
              {signal.kind === "caution" ? "⚠" : "✔"} {signal.label}
            </Badge>
          ))}
        </div>
        <p className="text-center text-sm leading-relaxed">
          {match.explanation}
        </p>
      </CardContent>
    </Card>
  );
}
