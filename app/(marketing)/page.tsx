// ============================================================================
// SLICE C — Marketing landing page (/). Owner: Deacon.
// BRD §2.1A: hero + one-liner, the problem, how it works (3 steps), the
// "your dog swipes too" differentiator, single CTA into /app.
// Styled per the approved design system (docs/DESIGN.md, TES-27 preview).
// ============================================================================

import Link from "next/link";
import { Heart, PawPrint, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell } from "@/components/patterns/page-shell";

const STEPS = [
  {
    icon: UserRound,
    chip: "bg-coral-50 text-coral-600",
    step: "Step 1",
    title: "Build a profile for both of you",
    body: "Your lifestyle, interests, and energy — plus your dog's size, temperament, and favorite activity.",
  },
  {
    icon: Sparkles,
    chip: "bg-honey-50 text-honey-600",
    step: "Step 2",
    title: "Get matched on two hearts",
    body: "AI scores human fit and dog fit separately, then combines them — and explains exactly why you match.",
  },
  {
    icon: Heart,
    chip: "bg-teal-50 text-teal-600",
    step: "Step 3",
    title: "Meet at the dog park",
    body: "Like a match, see the full compatibility breakdown, and plan a first date all four of you will love.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero + one-liner */}
      <section className="gradient-blush relative overflow-hidden px-4 pt-20 pb-24 text-center">
        <div
          aria-hidden
          className="absolute -top-40 -right-30 size-105 rounded-full bg-honey-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-45 -left-35 size-95 rounded-full bg-teal-500/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-honey-600/35 bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
            <PawPrint className="size-4" aria-hidden /> Puppy Meets People
          </p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-balance sm:text-6xl">
            The dating app where{" "}
            <span className="text-coral-600">your dog swipes too</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            We match on human compatibility <em>and</em> dog compatibility —
            and tell you exactly why you matched.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full">
            <Link href="/app">Try the demo</Link>
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No sign-up. Seeded demo profiles included.
          </p>
        </div>
      </section>

      <PageShell>
        {/* The problem */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-semibold text-balance">
            A mismatched dog quietly kills a good relationship.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Dating apps optimize for human-to-human fit and ignore the family
            member who’s already on your couch. If their reactive husky and
            your anxious senior beagle can’t share a park, neither can you.
          </p>
        </section>

        {/* How it works — 3 steps */}
        <section className="py-12">
          <h2 className="mb-10 text-center text-3xl font-semibold">
            How it works
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step) => (
              <Card
                key={step.title}
                className="rounded-3xl transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <span
                    aria-hidden
                    className={`mb-2 grid size-11 place-items-center rounded-xl ${step.chip}`}
                  >
                    <step.icon className="size-5" />
                  </span>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {step.step}
                  </p>
                  <CardTitle className="font-display text-lg">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {step.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Differentiator + CTA */}
        <section className="py-16">
          <div className="rounded-4xl border bg-[linear-gradient(115deg,var(--color-coral-50),var(--color-honey-50)_55%,var(--color-teal-50))] px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold text-balance">
              Your dog isn’t a profile photo. It’s half the match.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Every match comes with a combined human + dog compatibility score
              and a plain-language explanation of why all four of you fit.
            </p>
            <p
              className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 rounded-full border bg-card px-5 py-2.5 text-sm font-semibold"
              aria-label="Example compatibility score"
            >
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-coral-500" />
                You two · 84
              </span>
              <span aria-hidden className="text-border">
                |
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-2.5 rounded-full bg-honey-500" />
                Your dogs · 91
              </span>
              <span aria-hidden className="text-border">
                |
              </span>
              <span className="font-display text-base font-bold text-coral-600">
                88 together
              </span>
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/app">Find your pack</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="pb-14 text-center text-sm text-muted-foreground">
          Made over a weekend by three humans and two very opinionated dogs.
        </footer>
      </PageShell>
    </div>
  );
}
