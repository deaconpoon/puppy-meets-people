// ============================================================================
// SLICE C — Marketing landing page (/). STUB — owner: Person C.
// BRD §2.1A: hero + one-liner, the problem, how it works (3 steps), the
// "your dog swipes too" differentiator, single CTA into /app.
// TODO (Slice C): design pass — imagery, warmer hero, social proof, polish.
// ============================================================================

import Link from "next/link";
import { Heart, PawPrint, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    icon: UserRound,
    title: "1 · Build a profile for both of you",
    body: "Your lifestyle, interests, and energy — plus your dog's size, temperament, and favorite activity.",
  },
  {
    icon: Sparkles,
    title: "2 · Get matched on two hearts",
    body: "AI scores human fit and dog fit separately, then combines them — and explains exactly why you match.",
  },
  {
    icon: Heart,
    title: "3 · Meet at the dog park",
    body: "Like a match, see the full compatibility breakdown, and plan a first date all four of you will love.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero + one-liner */}
      <section className="py-20 text-center">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground">
          <PawPrint className="size-4" aria-hidden /> Puppy Meets People
        </p>
        <h1 className="mx-auto max-w-2xl text-5xl font-bold tracking-tight">
          The dating app where your dog swipes too.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          We match on human compatibility <em>and</em> dog compatibility — and
          tell you exactly why you matched.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/app">Try the demo</Link>
        </Button>
      </section>

      {/* The problem */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-semibold">
          A mismatched dog quietly kills a good relationship.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Dating apps optimize for human-to-human fit and ignore the family
          member who’s already on your couch. If their reactive husky and your
          anxious senior beagle can’t share a park, neither can you.
        </p>
      </section>

      {/* How it works — 3 steps */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardHeader>
                <step.icon className="mb-2 size-6 text-primary" aria-hidden />
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {step.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Differentiator + CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-semibold">
          Your dog isn’t a profile photo. It’s half the match.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Every match comes with a combined human + dog compatibility score and
          a plain-language explanation of why all four of you fit.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/app">Find your pack</Link>
        </Button>
      </section>
    </div>
  );
}
