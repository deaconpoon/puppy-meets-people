// ============================================================================
// DESIGN TRACK — /design showroom (TES-27). Owner: Deacon.
// Living reference for the shared design system. Not linked from the nav;
// visit /design directly. Source of truth for tokens: app/globals.css +
// docs/DESIGN.md.
// ============================================================================

import type { Metadata } from "next";
import { Heart, PawPrint, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GradientCard } from "@/components/patterns/gradient-card";
import { PageShell } from "@/components/patterns/page-shell";
import { TraitChip } from "@/components/patterns/trait-chip";

export const metadata: Metadata = {
  title: "Design system — Puppy Meets People",
};

const RAMPS = [
  {
    name: "Coral — primary / CTA",
    base: "#FF6B5E",
    steps: ["bg-coral-50", "bg-coral-300", "bg-coral-500", "bg-coral-700"],
  },
  {
    name: "Honey — dog / celebration",
    base: "#FFB648",
    steps: ["bg-honey-50", "bg-honey-300", "bg-honey-500", "bg-honey-700"],
  },
  {
    name: "Teal — sparse accent",
    base: "#2EC4B6",
    steps: ["bg-teal-50", "bg-teal-300", "bg-teal-500", "bg-teal-700"],
  },
  {
    name: "Warm neutrals",
    base: "#FFF9F2",
    steps: ["bg-cream", "bg-muted", "bg-border", "bg-ink"],
  },
];

function Section({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="py-8">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignShowroomPage() {
  return (
    <PageShell className="py-12">
      <h1 className="text-4xl font-bold">Design system</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        The shared lego box for all three slices — tokens, gradients, type, and
        pattern components. Rules and rationale live in{" "}
        <code className="font-mono text-sm">docs/DESIGN.md</code>.
      </p>

      <Section title="Palette">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RAMPS.map((ramp) => (
            <div
              key={ramp.name}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="flex h-16">
                {ramp.steps.map((step) => (
                  <span key={step} className={`flex-1 ${step}`} />
                ))}
              </div>
              <div className="px-4 py-3 text-sm">
                <p className="font-semibold">{ramp.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {ramp.base}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Gradients">
        <div className="grid gap-4 sm:grid-cols-3">
          <GradientCard gradient="sunrise" className="h-28">
            <p className="font-mono text-sm font-semibold">gradient-sunrise</p>
          </GradientCard>
          <GradientCard gradient="sky" className="h-28">
            <p className="font-mono text-sm font-semibold">gradient-sky</p>
          </GradientCard>
          <GradientCard gradient="blush" className="h-28">
            <p className="font-mono text-sm font-semibold">gradient-blush</p>
          </GradientCard>
        </div>
      </Section>

      <Section title="Type">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Display — Baloo 2
          </p>
          <p className="font-display text-4xl font-bold">
            Two hearts, one match.
          </p>
          <p className="mt-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Body — Figtree
          </p>
          <p className="max-w-prose">
            Warm, rounded, and legible at small sizes. Figtree keeps forms and
            compatibility explanations quiet so the display face and the three
            brand hues can do the personality work.
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" className="rounded-full">
            Primary CTA
          </Button>
          <Button variant="secondary" className="rounded-full">
            Secondary
          </Button>
          <Button variant="outline" className="rounded-full">
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Section>

      <Section title="TraitChip">
        <div className="flex flex-wrap gap-2.5">
          <TraitChip tone="coral">Early riser</TraitChip>
          <TraitChip tone="coral">Trail runner</TraitChip>
          <TraitChip tone="honey">High energy</TraitChip>
          <TraitChip tone="honey">Loves fetch</TraitChip>
          <TraitChip tone="teal">Off-leash trained</TraitChip>
          <TraitChip tone="teal">Good with cats</TraitChip>
        </div>
      </Section>

      <Section title="Icon chips + cards">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["coral", PawPrint, "bg-coral-50 text-coral-600"],
              ["honey", Sparkles, "bg-honey-50 text-honey-600"],
              ["teal", Heart, "bg-teal-50 text-teal-600"],
            ] as const
          ).map(([tone, Icon, chip]) => (
            <Card key={tone}>
              <CardHeader>
                <span
                  aria-hidden
                  className={`grid size-11 place-items-center rounded-xl ${chip}`}
                >
                  <Icon className="size-5" />
                </span>
                <CardTitle className="capitalize">{tone} card</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                White card on cream, one soft icon chip per card — the standard
                content surface.
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
