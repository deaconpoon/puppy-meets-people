# US-2 Discovery — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the US-2 "find genuinely compatible matches" experience — a deterministic scoring engine that ranks candidates by combined human+dog fit and produces a signed (✔ positive / ⚠ caution) breakdown, surfaced through a ranked Discover list and a candidate detail view.

**Architecture:** A pure, deterministic scoring engine (`lib/scoring/`) owns the score and the signals; the LLM only narrates a warm explanation from those computed facts (with a templated fallback), so ranking and breakdown are identical with or without an API key. Dog fit is a many-to-many pairwise comparison aggregated conservatively (worst pair carries weight). The shared `data/types.ts` contract is migrated up front (`dog`→`dogs[]`, `reasons`→`signals`, `human.energy` removed, `location`/`walkTimes` added), and all consumers are updated in the same task so the repo stays green.

**Tech Stack:** Next.js (App Router, server components/actions), TypeScript strict, Zod, Vercel AI SDK (`generateObject`), Vitest, shadcn/ui, Bun, Tailwind.

## Global Constraints

- **Never push to `main`.** Work on branch `bynelsonchow/pmp-11-us-2-find-genuinely-compatible-matches` (already created); open a PR. Source: `AGENTS.md` §1.
- **`bun run verify` (lint + typecheck + test + build) must be green before a PR.** Run it at the end of each task. Source: `AGENTS.md` §1.
- **The demo must never break with no `OPENAI_API_KEY`.** A no-secrets, no-network path must always render; CI builds without keys. Source: `AGENTS.md` §4.
- **`data/types.ts` and `data/schemas.ts` are a shared team seam.** Update types + schemas + the sync test together; flag Kelvin (Slice A) and Deacon (Slice C) in the PR description. Source: `AGENTS.md` §2.
- **No secrets in the repo.** Keys live in `.env.local` (gitignored). Source: `AGENTS.md` §5.
- **UI copy uses the name "Puppy Meets People".** Source: `AGENTS.md` Conventions.
- **shadcn/ui components in `components/ui/` are generated — don't hand-edit.** Add new ones with `bunx shadcn@latest add <name>`. Source: `AGENTS.md` Conventions.
- **Accessibility baseline:** semantic HTML, labels on form fields, keyboard navigable, contrast ≥ 4.5:1. Source: `AGENTS.md` Conventions.
- **TypeScript strict; Zod for anything crossing a boundary.** Source: `AGENTS.md` Conventions.
- **Commands:** `bun run test path` runs one test file; `bun run test` runs all; `bun run verify` is the full gate. Node ≥ 20.12 via `nvm use`.

---

## File Structure

**Created:**
- `lib/scoring/dimensions.ts` — pure per-dimension scoring functions (interests, proximity, walk overlap, dog size/energy/temperament/activity) + shared helpers (`clamp`, `overlap`, `haversineKm`).
- `lib/scoring/signals.ts` — turns labeled dimension results into a capped, faceted `Signal[]` (✔/⚠).
- `lib/scoring/index.ts` — `scoreDeterministic(user, candidate)` orchestrator + `templateExplanation`; the public scoring entry point.
- `lib/ai.ts` — **rewritten** to narration-only: `narrateExplanation(user, candidate, signals)` returns just prose.
- `tests/scoring.test.ts` — unit tests for the engine (replaces `tests/fallback-score.test.ts`).
- `tests/scoring-behavior.test.ts` — behavioral/demo-integrity tests (ordering, obvious clash/fit, no-key path).
- `app/app/candidate/[id]/page.tsx` — candidate detail route (full breakdown).

**Modified:**
- `data/types.ts` — new contract shapes.
- `data/schemas.ts` — Zod mirror; `MatchScoreSchema` shrinks to `{ explanation }`.
- `data/profiles.ts` — all profiles migrated to `dogs[]` + `location` + `walkTimes`, `energy` removed.
- `data/seeded-matches.ts` — `reasons` → `signals`.
- `app/actions.ts` — deterministic score → narrate → template fallback.
- `app/app/page.tsx` — Discover; call `scoreDeterministic`, render `.dogs[0]`.
- `components/candidate-card.tsx` — render top signals as ✔/⚠ chips; `.dogs[0]`; link to detail route.
- `components/match-breakdown.tsx` — render `signals` grouped by facet; `.dogs[0]`.
- `components/profile-form.tsx` — `.dogs[0]`.
- `app/app/match/[id]/page.tsx` — use `scoreDeterministic`; `.dogs[0]`.
- `tests/schemas.test.ts` — updated for new shapes.

**Deleted:**
- `lib/fallback-score.ts` — logic moves into `lib/scoring/`.

---

## Task 1: Migrate the contract and establish the deterministic baseline scorer

The foundational, atomic task. Change the shared types, mirror the schemas, build a minimal-but-real deterministic scorer (interests for human fit; mean over dog pairs for dog fit), and migrate every consumer so `bun run verify` is green. Proximity, walk overlap, conservative dog aggregation, and LLM narration are added in later tasks.

**Files:**
- Modify: `data/types.ts`
- Modify: `data/schemas.ts`
- Create: `lib/scoring/dimensions.ts`
- Create: `lib/scoring/signals.ts`
- Create: `lib/scoring/index.ts`
- Create: `tests/scoring.test.ts`
- Modify: `tests/schemas.test.ts`
- Modify: `data/profiles.ts`
- Modify: `data/seeded-matches.ts`
- Modify: `app/actions.ts`
- Modify: `app/app/page.tsx`
- Modify: `app/app/match/[id]/page.tsx`
- Modify: `components/candidate-card.tsx`
- Modify: `components/match-breakdown.tsx`
- Modify: `components/profile-form.tsx`
- Delete: `lib/fallback-score.ts`
- Delete (temporarily): `lib/ai.ts` (recreated as narration-only in Task 5)

**Interfaces:**
- Produces `data/types.ts`:
  ```ts
  type Dog = { name: string; breed: string; size: "small"|"medium"|"large"; energy: 1|2|3|4|5; temperament: string[]; favoriteActivity: string };
  type WalkTime = "morning" | "afternoon" | "evening" | "night";
  type Human = { name: string; age: number; city: string; interests: string[]; lookingFor: string; location: { lat: number; lng: number }; walkTimes: WalkTime[] };
  type Profile = { id: string; human: Human; dogs: Dog[]; photoUrl?: string };
  type Facet = "human" | "dog";
  type Signal = { facet: Facet; kind: "positive"|"caution"; label: string };
  type MatchResult = { candidateId: string; combinedScore: number; humanScore: number; dogScore: number; signals: Signal[]; explanation: string };
  type ScoredCandidate = Profile & { match: MatchResult };
  type ScoreMatch = (user: Profile, candidate: Profile) => Promise<MatchResult>;
  type ScoreAll = (user: Profile, candidates: Profile[]) => Promise<ScoredCandidate[]>;
  ```
- Produces `lib/scoring/index.ts`: `export function scoreDeterministic(user: Profile, candidate: Profile): MatchResult`
- Produces `lib/scoring/dimensions.ts`: `clamp`, `overlap`, `energyFit`, `sizeFit`, `temperamentFit`, `activityFit`, `interestFit` (see step 3).
- Produces `lib/scoring/signals.ts`: `type DimensionInput`, `buildSignals(dims: DimensionInput[]): Signal[]`.

- [ ] **Step 1: Rewrite `data/types.ts` with the new contract**

Replace the whole file with:

```ts
// ============================================================================
// Puppy Meets People — SHARED TYPE CONTRACTS
// The seam between all three slices. Profile flows A → B; a liked candidate
// flows B → C. Changing a field is a TEAM decision (AGENTS.md §2): update
// data/schemas.ts and tests/schemas.test.ts together and flag the team.
// ============================================================================

/** A dog owner's dog. */
export type Dog = {
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
  /** Activity level, 1 (couch potato) – 5 (never stops). */
  energy: 1 | 2 | 3 | 4 | 5;
  temperament: string[];
  favoriteActivity: string;
};

/** When the owner typically walks their dog(s). */
export type WalkTime = "morning" | "afternoon" | "evening" | "night";

/** The human dog owner. */
export type Human = {
  name: string;
  age: number;
  city: string;
  interests: string[];
  lookingFor: string;
  /** Coarse location for proximity scoring. */
  location: { lat: number; lng: number };
  /** Owner's walking routine — drives the "both walk after work" signal. */
  walkTimes: WalkTime[];
};

/** A complete profile: one human + their dog(s). The unit of matching. */
export type Profile = {
  id: string;
  human: Human;
  dogs: Dog[];
  photoUrl?: string;
};

/** Which half of the match a signal is about. */
export type Facet = "human" | "dog";

/** One reason a match fits (✔) or warrants caution (⚠). */
export type Signal = {
  facet: Facet;
  kind: "positive" | "caution";
  /** Short chip text, e.g. "Both love hiking" / "Dogs' energy is mismatched". */
  label: string;
};

/** Result of scoring the current user against one candidate. */
export type MatchResult = {
  candidateId: string;
  /** 0–100, computed = 0.6*human + 0.4*dog. */
  combinedScore: number;
  humanScore: number;
  dogScore: number;
  /** 2–4 signed, faceted signals. */
  signals: Signal[];
  /** 1–3 warm sentences — LLM-narrated, templated fallback. */
  explanation: string;
};

/** A candidate profile with its computed match result — the Discover row. */
export type ScoredCandidate = Profile & { match: MatchResult };

/** Score the current user against a single candidate. */
export type ScoreMatch = (
  user: Profile,
  candidate: Profile,
) => Promise<MatchResult>;

/** Score & rank the current user against all candidates (high → low). */
export type ScoreAll = (
  user: Profile,
  candidates: Profile[],
) => Promise<ScoredCandidate[]>;
```

- [ ] **Step 2: Rewrite `data/schemas.ts` to mirror the new types**

Replace the whole file with:

```ts
// ============================================================================
// Zod schemas mirroring data/types.ts 1:1. Keep in sync (AGENTS.md §2).
// The LLM now returns ONLY the explanation; scores + signals are computed,
// so MatchScoreSchema shrinks to { explanation }.
// ============================================================================

import { z } from "zod";
import type { Dog, Human, MatchResult, Profile, Signal } from "./types";

const energyLevel = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const DogSchema: z.ZodType<Dog> = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  size: z.enum(["small", "medium", "large"]),
  energy: energyLevel,
  temperament: z.array(z.string()),
  favoriteActivity: z.string().min(1),
});

export const HumanSchema: z.ZodType<Human> = z.object({
  name: z.string().min(1),
  age: z.number().int().min(18).max(120),
  city: z.string().min(1),
  interests: z.array(z.string()),
  lookingFor: z.string().min(1),
  location: z.object({ lat: z.number(), lng: z.number() }),
  walkTimes: z.array(z.enum(["morning", "afternoon", "evening", "night"])),
});

export const ProfileSchema: z.ZodType<Profile> = z.object({
  id: z.string().min(1),
  human: HumanSchema,
  dogs: z.array(DogSchema).min(1),
  photoUrl: z.string().optional(),
});

export const SignalSchema: z.ZodType<Signal> = z.object({
  facet: z.enum(["human", "dog"]),
  kind: z.enum(["positive", "caution"]),
  label: z.string().min(1),
});

/** AI output schema: the model returns ONLY the explanation prose. */
export const MatchScoreSchema = z.object({
  explanation: z.string().min(1),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

/** Full MatchResult schema — mirrors the frozen MatchResult type exactly. */
export const MatchResultSchema: z.ZodType<MatchResult> = z.object({
  candidateId: z.string().min(1),
  combinedScore: z.number().min(0).max(100),
  humanScore: z.number().min(0).max(100),
  dogScore: z.number().min(0).max(100),
  signals: z.array(SignalSchema).min(2).max(4),
  explanation: z.string().min(1),
});
```

- [ ] **Step 3: Create `lib/scoring/dimensions.ts`**

```ts
// Pure, deterministic per-dimension scoring functions. No network, no
// randomness. Each returns a 0–100 number (higher = more compatible).

import type { Dog } from "@/data/types";

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Case-insensitive overlap between two tag lists → { score, shared }. */
export function overlap(
  a: string[],
  b: string[],
): { score: number; shared: string[] } {
  const setB = new Set(b.map((x) => x.trim().toLowerCase()));
  const shared = a.filter((x) => setB.has(x.trim().toLowerCase()));
  const denom = Math.max(1, Math.min(a.length, b.length));
  return { score: clamp((shared.length / denom) * 100), shared };
}

/** Human interest overlap. */
export function interestFit(a: string[], b: string[]): { score: number; shared: string[] } {
  return overlap(a, b);
}

/** 1–5 energy delta → 100..20. Closer scores higher. */
export function energyFit(a: number, b: number): number {
  return clamp(100 - Math.abs(a - b) * 20);
}

const SIZE_ORDER = { small: 0, medium: 1, large: 2 } as const;

/** Same size 100, one step 70, small↔large 40. */
export function sizeFit(
  a: keyof typeof SIZE_ORDER,
  b: keyof typeof SIZE_ORDER,
): number {
  return clamp(100 - Math.abs(SIZE_ORDER[a] - SIZE_ORDER[b]) * 30);
}

/** Dog temperament overlap → { score, shared }. */
export function temperamentFit(a: string[], b: string[]): { score: number; shared: string[] } {
  return overlap(a, b);
}

/** Loose word overlap between favorite activities → 100 if any shared word, else 40. */
export function activityFit(a: string, b: string): number {
  const words = (s: string) =>
    s.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const setB = new Set(words(b));
  return words(a).some((w) => setB.has(w)) ? 100 : 40;
}

/** Score one dog pair on the four dog dimensions (weighted). */
export function dogPairScore(a: Dog, b: Dog): number {
  return clamp(
    0.35 * energyFit(a.energy, b.energy) +
      0.3 * sizeFit(a.size, b.size) +
      0.2 * temperamentFit(a.temperament, b.temperament).score +
      0.15 * activityFit(a.favoriteActivity, b.favoriteActivity),
  );
}
```

- [ ] **Step 4: Create `lib/scoring/signals.ts`**

```ts
// Turns labeled dimension results into a capped, faceted Signal[].
// A dimension at/above HIGH becomes a ✔ positive; at/below LOW a ⚠ caution.
// We keep the most extreme signals (farthest from the neutral midpoint),
// capped at 4, and guarantee at least 2 by padding with the strongest
// remaining dimensions as positives.

import type { Facet, Signal } from "@/data/types";

const HIGH = 72;
const LOW = 45;
const MID = 60;
const MAX_SIGNALS = 4;
const MIN_SIGNALS = 2;

export type DimensionInput = {
  facet: Facet;
  score: number;
  /** Chip text to show when this dimension is a strength. */
  positive: string;
  /** Chip text to show when this dimension is a concern. */
  caution: string;
};

export function buildSignals(dims: DimensionInput[]): Signal[] {
  const extremity = (d: DimensionInput) => Math.abs(d.score - MID);
  const ranked = [...dims].sort((a, b) => extremity(b) - extremity(a));

  const chosen: Signal[] = [];
  for (const d of ranked) {
    if (chosen.length >= MAX_SIGNALS) break;
    if (d.score >= HIGH) {
      chosen.push({ facet: d.facet, kind: "positive", label: d.positive });
    } else if (d.score <= LOW) {
      chosen.push({ facet: d.facet, kind: "caution", label: d.caution });
    }
  }

  // Guarantee at least MIN_SIGNALS: pad with the strongest remaining dims.
  if (chosen.length < MIN_SIGNALS) {
    const used = new Set(chosen.map((s) => s.label));
    const byStrength = [...dims].sort((a, b) => b.score - a.score);
    for (const d of byStrength) {
      if (chosen.length >= MIN_SIGNALS) break;
      if (!used.has(d.positive)) {
        chosen.push({ facet: d.facet, kind: "positive", label: d.positive });
        used.add(d.positive);
      }
    }
  }

  return chosen.slice(0, MAX_SIGNALS);
}
```

- [ ] **Step 5: Create `lib/scoring/index.ts` (baseline: interests + mean dog pairs)**

```ts
// The deterministic scoring engine — owns the score and signals. Pure fn of
// two Profiles: no network, no randomness, identical with or without a key.
// Baseline dimensions: human = interest overlap; dog = mean over all dog
// pairs. Proximity, walk overlap, and conservative dog aggregation are added
// in later tasks.

import type { MatchResult, Profile } from "@/data/types";
import {
  clamp,
  dogPairScore,
  interestFit,
} from "./dimensions";
import { buildSignals, type DimensionInput } from "./signals";

/** Mean of every (userDog × candidateDog) pair score. */
export function dogFit(userDogs: Profile["dogs"], candDogs: Profile["dogs"]): number {
  const scores: number[] = [];
  for (const a of userDogs) for (const b of candDogs) scores.push(dogPairScore(a, b));
  return clamp(scores.reduce((s, n) => s + n, 0) / scores.length);
}

/** A short, templated explanation built from the computed signals. */
export function templateExplanation(
  user: Profile,
  candidate: Profile,
  signals: import("@/data/types").Signal[],
): string {
  const positives = signals.filter((s) => s.kind === "positive").map((s) => s.label.toLowerCase());
  const cautions = signals.filter((s) => s.kind === "caution").map((s) => s.label.toLowerCase());
  const lead =
    positives.length > 0
      ? `You and ${candidate.human.name} click on ${positives.slice(0, 2).join(" and ")}`
      : `You and ${candidate.human.name} have a few things in common`;
  const dogLine = `${user.dogs[0].name} and ${candidate.dogs[0].name}`;
  const tail =
    cautions.length > 0
      ? ` — worth noting: ${cautions[0]}.`
      : ` would get along easily.`;
  return `${lead}. ${dogLine}${tail}`;
}

export function scoreDeterministic(user: Profile, candidate: Profile): MatchResult {
  const interests = interestFit(user.human.interests, candidate.human.interests);
  const humanScore = clamp(interests.score);

  const dogScore = dogFit(user.dogs, candidate.dogs);
  const combinedScore = clamp(0.6 * humanScore + 0.4 * dogScore);

  const dims: DimensionInput[] = [
    {
      facet: "human",
      score: interests.score,
      positive:
        interests.shared.length > 0
          ? `Both love ${interests.shared[0]}`
          : "Shared interests",
      caution: "Different interests",
    },
    {
      facet: "dog",
      score: dogScore,
      positive: "Dogs are a good match",
      caution: "Dogs may not mesh",
    },
  ];
  const signals = buildSignals(dims);

  return {
    candidateId: candidate.id,
    combinedScore,
    humanScore,
    dogScore,
    signals,
    explanation: templateExplanation(user, candidate, signals),
  };
}
```

- [ ] **Step 6: Write `tests/scoring.test.ts` (failing — module consumers not yet migrated)**

Replace `tests/fallback-score.test.ts` by creating `tests/scoring.test.ts` and deleting the old file:

```ts
import { describe, expect, it } from "vitest";
import { scoreDeterministic } from "@/lib/scoring";
import { MatchResultSchema } from "@/data/schemas";
import type { Profile } from "@/data/types";

const ava: Profile = {
  id: "ava",
  human: {
    name: "Ava", age: 29, city: "Seattle",
    interests: ["hiking", "coffee", "photography"],
    lookingFor: "A trail buddy who loves dogs.",
    location: { lat: 47.6062, lng: -122.3321 },
    walkTimes: ["morning", "evening"],
  },
  dogs: [{ name: "Biscuit", breed: "Border Collie", size: "medium", energy: 5, temperament: ["playful", "friendly"], favoriteActivity: "long hikes" }],
};

const ben: Profile = {
  id: "ben",
  human: {
    name: "Ben", age: 31, city: "Seattle",
    interests: ["hiking", "board games"],
    lookingFor: "Explore the trails.",
    location: { lat: 47.6097, lng: -122.3331 },
    walkTimes: ["morning"],
  },
  dogs: [{ name: "Mochi", breed: "Shiba Inu", size: "medium", energy: 4, temperament: ["independent", "playful"], favoriteActivity: "hikes in the forest" }],
};

const cleo: Profile = {
  id: "cleo",
  human: {
    name: "Cleo", age: 35, city: "Tacoma",
    interests: ["reading", "baking"],
    lookingFor: "Quiet nights in.",
    location: { lat: 47.2529, lng: -122.4443 },
    walkTimes: ["night"],
  },
  dogs: [{ name: "Pudding", breed: "Great Dane", size: "large", energy: 1, temperament: ["calm"], favoriteActivity: "naps in the sun" }],
};

describe("scoreDeterministic", () => {
  it("returns the candidate's id, never the user's", () => {
    expect(scoreDeterministic(ava, ben).candidateId).toBe("ben");
  });

  it("is deterministic — same inputs, same result", () => {
    expect(scoreDeterministic(ava, ben)).toEqual(scoreDeterministic(ava, ben));
  });

  it("keeps all scores within 0–100 integers", () => {
    for (const c of [ben, cleo]) {
      const r = scoreDeterministic(ava, c);
      for (const s of [r.combinedScore, r.humanScore, r.dogScore]) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
        expect(Number.isInteger(s)).toBe(true);
      }
    }
  });

  it("weights combined score 60% human / 40% dog", () => {
    const r = scoreDeterministic(ava, ben);
    expect(r.combinedScore).toBe(Math.round(0.6 * r.humanScore + 0.4 * r.dogScore));
  });

  it("ranks a compatible pair above an incompatible one", () => {
    expect(scoreDeterministic(ava, ben).combinedScore).toBeGreaterThan(
      scoreDeterministic(ava, cleo).combinedScore,
    );
  });

  it("produces 2–4 faceted signals that satisfy the contract", () => {
    for (const c of [ben, cleo]) {
      const r = scoreDeterministic(ava, c);
      expect(r.signals.length).toBeGreaterThanOrEqual(2);
      expect(r.signals.length).toBeLessThanOrEqual(4);
      for (const sig of r.signals) {
        expect(["human", "dog"]).toContain(sig.facet);
        expect(["positive", "caution"]).toContain(sig.kind);
        expect(sig.label.length).toBeGreaterThan(0);
      }
      expect(MatchResultSchema.safeParse(r).success).toBe(true);
    }
  });

  it("names both dogs in the explanation", () => {
    const r = scoreDeterministic(ava, ben);
    expect(r.explanation).toContain("Biscuit");
    expect(r.explanation).toContain("Mochi");
  });
});
```

Then delete the old scorer test:

```bash
git rm tests/fallback-score.test.ts
```

- [ ] **Step 7: Run the new test — verify it fails (imports resolve, but app still references old shapes)**

Run: `bun run test tests/scoring.test.ts`
Expected: FAIL — `lib/scoring` may not typecheck yet against consumers, or assertions fail. (If it already passes, that's fine; the migration in the next steps is still required for `verify` to pass.)

- [ ] **Step 8: Migrate `data/profiles.ts` to the new contract**

Replace the whole file. Each profile gets `dogs: [ ... ]`, a `location`, and `walkTimes`; `human.energy` is removed. Coordinates are approximate city centers.

```ts
// ============================================================================
// Seeded demo data: the "current user" (no login) + 12 candidates.
// All conform to the Profile contract in data/types.ts.
// ============================================================================

import type { Profile } from "./types";

export const CURRENT_USER: Profile = {
  id: "me",
  human: {
    name: "Alex", age: 29, city: "Seattle",
    interests: ["hiking", "coffee", "live music"],
    lookingFor: "Someone to split trail miles and lazy Sunday espressos with.",
    location: { lat: 47.6062, lng: -122.3321 },
    walkTimes: ["morning", "evening"],
  },
  dogs: [{ name: "Biscuit", breed: "Australian Shepherd", size: "medium", energy: 5, temperament: ["playful", "friendly", "smart"], favoriteActivity: "long hikes" }],
};

export const CANDIDATES: Profile[] = [
  { id: "c1", human: { name: "Maya", age: 27, city: "Seattle", interests: ["hiking", "photography", "coffee"], lookingFor: "A partner for sunrise trailheads and farmers markets.", location: { lat: 47.6205, lng: -122.3493 }, walkTimes: ["morning", "evening"] }, dogs: [{ name: "Juniper", breed: "Border Collie", size: "medium", energy: 5, temperament: ["playful", "smart", "focused"], favoriteActivity: "long hikes" }] },
  { id: "c2", human: { name: "Daniel", age: 31, city: "Seattle", interests: ["cooking", "board games", "coffee"], lookingFor: "Someone who thinks a great date is a homemade dinner.", location: { lat: 47.6588, lng: -122.3255 }, walkTimes: ["evening"] }, dogs: [{ name: "Mochi", breed: "Corgi", size: "small", energy: 3, temperament: ["friendly", "food-motivated", "goofy"], favoriteActivity: "fetch at the park" }] },
  { id: "c3", human: { name: "Priya", age: 26, city: "Bellevue", interests: ["running", "hiking", "live music"], lookingFor: "A gym-then-brunch person with big weekend energy.", location: { lat: 47.6101, lng: -122.2015 }, walkTimes: ["morning"] }, dogs: [{ name: "Bolt", breed: "Vizsla", size: "large", energy: 5, temperament: ["athletic", "affectionate", "playful"], favoriteActivity: "trail running" }] },
  { id: "c4", human: { name: "Sam", age: 34, city: "Seattle", interests: ["reading", "film", "wine tasting"], lookingFor: "Quiet nights, deep talks, and a dog snoring nearby.", location: { lat: 47.6690, lng: -122.3870 }, walkTimes: ["afternoon", "night"] }, dogs: [{ name: "Willow", breed: "Greyhound", size: "large", energy: 2, temperament: ["gentle", "shy", "cuddly"], favoriteActivity: "naps in the sun" }] },
  { id: "c5", human: { name: "Jordan", age: 28, city: "Seattle", interests: ["climbing", "coffee", "camping"], lookingFor: "A belay partner who's down for van weekends.", location: { lat: 47.6145, lng: -122.3418 }, walkTimes: ["morning", "evening"] }, dogs: [{ name: "Scout", breed: "Blue Heeler", size: "medium", energy: 4, temperament: ["loyal", "smart", "adventurous"], favoriteActivity: "camping trips" }] },
  { id: "c6", human: { name: "Elena", age: 30, city: "Kirkland", interests: ["yoga", "baking", "hiking"], lookingFor: "Someone equal parts trail day and pastry morning.", location: { lat: 47.6769, lng: -122.2060 }, walkTimes: ["morning"] }, dogs: [{ name: "Pancake", breed: "Golden Retriever", size: "large", energy: 3, temperament: ["friendly", "patient", "cuddly"], favoriteActivity: "swimming" }] },
  { id: "c7", human: { name: "Marcus", age: 33, city: "Seattle", interests: ["cycling", "live music", "craft beer"], lookingFor: "Show buddy first, bike buddy second, partner always.", location: { lat: 47.6135, lng: -122.3200 }, walkTimes: ["evening", "night"] }, dogs: [{ name: "Ziggy", breed: "Dalmatian", size: "large", energy: 5, temperament: ["energetic", "vocal", "friendly"], favoriteActivity: "running alongside bikes" }] },
  { id: "c8", human: { name: "Grace", age: 25, city: "Seattle", interests: ["painting", "coffee", "thrifting"], lookingFor: "Museum dates and dog park people-watching.", location: { lat: 47.6250, lng: -122.3200 }, walkTimes: ["afternoon"] }, dogs: [{ name: "Clementine", breed: "Cavalier King Charles Spaniel", size: "small", energy: 2, temperament: ["sweet", "calm", "lap dog"], favoriteActivity: "café patio lounging" }] },
  { id: "c9", human: { name: "Tom", age: 36, city: "Redmond", interests: ["board games", "hiking", "cooking"], lookingFor: "A co-op partner in games and in life.", location: { lat: 47.6740, lng: -122.1215 }, walkTimes: ["evening"] }, dogs: [{ name: "Gandalf", breed: "Bernese Mountain Dog", size: "large", energy: 2, temperament: ["gentle", "patient", "stubborn"], favoriteActivity: "slow forest walks" }] },
  { id: "c10", human: { name: "Nina", age: 29, city: "Seattle", interests: ["trail running", "coffee", "podcasts"], lookingFor: "Someone whose idea of sleeping in is 7am.", location: { lat: 47.6180, lng: -122.3540 }, walkTimes: ["morning", "evening"] }, dogs: [{ name: "Pepper", breed: "Australian Cattle Dog", size: "medium", energy: 5, temperament: ["driven", "playful", "alert"], favoriteActivity: "long hikes" }] },
  { id: "c11", human: { name: "Leo", age: 27, city: "Seattle", interests: ["film", "vinyl records", "cooking"], lookingFor: "Slow mornings, record stores, takeout on the floor.", location: { lat: 47.6600, lng: -122.3550 }, walkTimes: ["afternoon", "night"] }, dogs: [{ name: "Miso", breed: "Shiba Inu", size: "small", energy: 3, temperament: ["independent", "curious", "dramatic"], favoriteActivity: "neighborhood sniff tours" }] },
  { id: "c12", human: { name: "Harper", age: 32, city: "Tacoma", interests: ["kayaking", "hiking", "photography"], lookingFor: "A weekend adventurer who packs snacks for two dogs.", location: { lat: 47.2529, lng: -122.4443 }, walkTimes: ["morning", "afternoon"] }, dogs: [{ name: "Sable", breed: "Labrador Retriever", size: "large", energy: 4, temperament: ["friendly", "water-obsessed", "playful"], favoriteActivity: "swimming" }] },
];

/** Convenience lookup for the match/detail routes. */
export function getCandidateById(id: string): Profile | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
```

- [ ] **Step 9: Migrate `data/seeded-matches.ts` (`reasons` → `signals`)**

Replace the whole file. Convert each match's reason strings into signed, faceted signals (mostly positive; low-dog-score entries get a ⚠). Keep `combinedScore`/`humanScore`/`dogScore`/`explanation` as-is.

```ts
// ============================================================================
// Pre-generated MatchResults for CURRENT_USER vs. every candidate — demo
// insurance so Discover renders instantly with zero network. combinedScore =
// 60% human + 40% dog. Signals are signed + faceted per the contract.
// ============================================================================

import type { MatchResult } from "./types";

export const SEEDED_MATCHES: MatchResult[] = [
  { candidateId: "c1", combinedScore: 93, humanScore: 92, dogScore: 95, signals: [ { facet: "human", kind: "positive", label: "Both live for the trail" }, { facet: "human", kind: "positive", label: "Coffee people" }, { facet: "dog", kind: "positive", label: "High-energy herding dogs" }, { facet: "dog", kind: "positive", label: "Same trail stamina" } ], explanation: "You and Maya both plan weekends around trailheads and coffee stops, so your calendars already look alike. Biscuit and Juniper are both brilliant, high-drive herders who'd happily log the same ten miles." },
  { candidateId: "c2", combinedScore: 66, humanScore: 72, dogScore: 58, signals: [ { facet: "human", kind: "positive", label: "Shared coffee ritual" }, { facet: "human", kind: "positive", label: "Complementary paces" }, { facet: "dog", kind: "caution", label: "Mochi is slower than Biscuit" } ], explanation: "You and Daniel would bond fast over coffee, and his homemade-dinner energy is a cozy counterweight to your trail days. Mochi's mellow fetch runs slower than Biscuit's pace, but a goofy Corgi is hard to refuse." },
  { candidateId: "c3", combinedScore: 83, humanScore: 84, dogScore: 82, signals: [ { facet: "human", kind: "positive", label: "Live music + hiking overlap" }, { facet: "human", kind: "positive", label: "Big weekend energy" }, { facet: "dog", kind: "positive", label: "Athletic dogs" } ], explanation: "Priya's sunrise-runs-and-shows lifestyle lines up with your hiking and live music. Bolt is an athlete like Biscuit, and a Vizsla who trail-runs would keep an Aussie honest on any climb." },
  { candidateId: "c4", combinedScore: 44, humanScore: 46, dogScore: 40, signals: [ { facet: "human", kind: "caution", label: "Opposite paces" }, { facet: "dog", kind: "caution", label: "Willow can't keep up with Biscuit" } ], explanation: "Sam's quiet-nights world moves at a slower speed than your trail-and-show weekends. Willow is a sweet, sleepy Greyhound, but she'd rather sunbathe than keep up with Biscuit." },
  { candidateId: "c5", combinedScore: 79, humanScore: 80, dogScore: 78, signals: [ { facet: "human", kind: "positive", label: "Coffee + outdoors overlap" }, { facet: "human", kind: "positive", label: "Matched lifestyle energy" }, { facet: "dog", kind: "positive", label: "Adventure-ready dogs" } ], explanation: "You and Jordan share the coffee-fueled outdoor gene, and van-camping weekends slot next to your hiking habit. Scout and Biscuit are both smart, driven herders who'd thrive on the same campsite chaos." },
  { candidateId: "c6", combinedScore: 67, humanScore: 70, dogScore: 62, signals: [ { facet: "human", kind: "positive", label: "Hiking in common" }, { facet: "human", kind: "positive", label: "Trail day, pastry morning" }, { facet: "dog", kind: "positive", label: "Easygoing Golden" } ], explanation: "Elena hikes too, and her yoga-and-baking rhythm would mellow your week in a good way. Pancake is friendlier than he is fast — he'd let Biscuit set the pace and love every minute." },
  { candidateId: "c7", combinedScore: 72, humanScore: 74, dogScore: 70, signals: [ { facet: "human", kind: "positive", label: "Live music buddies" }, { facet: "human", kind: "positive", label: "Big-engine lifestyles" }, { facet: "dog", kind: "positive", label: "High-energy large dogs" } ], explanation: "You and Marcus would burn through a concert calendar together, and his cycling keeps pace with your energy. Ziggy matches Biscuit's motor, though his run-with-bikes obsession is a different sport than long hikes." },
  { candidateId: "c8", combinedScore: 51, humanScore: 60, dogScore: 38, signals: [ { facet: "human", kind: "positive", label: "Coffee shop overlap" }, { facet: "dog", kind: "caution", label: "Very different dog speeds" } ], explanation: "Grace's café-and-galleries pace shares a coffee habit with you but not much trail time. Clementine is a lap dog through and through — Biscuit would lap her three times before she finished a patio nap." },
  { candidateId: "c9", combinedScore: 58, humanScore: 66, dogScore: 46, signals: [ { facet: "human", kind: "positive", label: "Hiking + board games" }, { facet: "dog", kind: "caution", label: "Gandalf prefers slow strolls" } ], explanation: "Tom hikes and hosts board game nights, which covers a lot of your list. Gandalf prefers slow forest ambles to Biscuit's all-day pace, so the dogs would need to meet in the middle." },
  { candidateId: "c10", combinedScore: 88, humanScore: 86, dogScore: 90, signals: [ { facet: "human", kind: "positive", label: "Early-riser trail people" }, { facet: "human", kind: "positive", label: "Coffee before miles" }, { facet: "dog", kind: "positive", label: "Both dogs love long hikes" }, { facet: "dog", kind: "positive", label: "Medium herders, same speed" } ], explanation: "You and Nina are the same species of early riser — trails first, coffee always. Pepper and Biscuit are both medium herding dynamos whose shared favorite activity is literally long hikes." },
  { candidateId: "c11", combinedScore: 46, humanScore: 44, dogScore: 50, signals: [ { facet: "human", kind: "caution", label: "Opposite weekend speeds" }, { facet: "dog", kind: "caution", label: "Miso does his own thing" } ], explanation: "Leo's slow-mornings-and-vinyl life is the inverse of your out-the-door energy. Miso is charming but famously independent — Biscuit's invite to play would get a polite Shiba decline." },
  { candidateId: "c12", combinedScore: 76, humanScore: 78, dogScore: 74, signals: [ { facet: "human", kind: "positive", label: "Hiking + photography" }, { facet: "human", kind: "positive", label: "Weekend adventurers" }, { facet: "dog", kind: "positive", label: "Water-loving Lab" } ], explanation: "Harper packs the same weekend bag you do — trails, a kayak, and a camera. Sable's Lab energy runs a notch below Biscuit's, and a swimming stop mid-hike sounds like both dogs' perfect day." },
];

/** Lookup for Discover and the match/detail screens. */
export function getSeededMatch(candidateId: string): MatchResult | undefined {
  return SEEDED_MATCHES.find((m) => m.candidateId === candidateId);
}
```

- [ ] **Step 10: Delete the old scorer and AI module, simplify `app/actions.ts`**

```bash
git rm lib/fallback-score.ts lib/ai.ts
```

Replace `app/actions.ts` with a deterministic-only version (LLM narration is re-added in Task 5):

```ts
"use server";

// Slice B scoring actions. Deterministic engine only for now; Task 5 layers
// LLM narration on top with a template fallback. Never throws to the UI.

import type { ScoredCandidate, ScoreMatch, ScoreAll } from "@/data/types";
import { scoreDeterministic } from "@/lib/scoring";

export const scoreMatch: ScoreMatch = async (user, candidate) => {
  return scoreDeterministic(user, candidate);
};

export const scoreAll: ScoreAll = async (user, candidates) => {
  const results: ScoredCandidate[] = candidates.map((candidate) => ({
    ...candidate,
    match: scoreDeterministic(user, candidate),
  }));
  return results.sort((a, b) => b.match.combinedScore - a.match.combinedScore);
};
```

- [ ] **Step 11: Migrate the Discover page `app/app/page.tsx`**

Replace `fallbackScore` import + usage and `.dog` reference:

```ts
import { CandidateCard } from "@/components/candidate-card";
import { CANDIDATES, CURRENT_USER } from "@/data/profiles";
import { getSeededMatch } from "@/data/seeded-matches";
import { scoreDeterministic } from "@/lib/scoring";
import type { ScoredCandidate } from "@/data/types";

export default function DiscoverPage() {
  const scored: ScoredCandidate[] = CANDIDATES.map((candidate) => ({
    ...candidate,
    match: getSeededMatch(candidate.id) ?? scoreDeterministic(CURRENT_USER, candidate),
  })).sort((a, b) => b.match.combinedScore - a.match.combinedScore);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Discover</h1>
      <p className="mt-1 text-muted-foreground">
        Ranked by combined fit for you, {CURRENT_USER.human.name} — and for{" "}
        {CURRENT_USER.dogs[0].name}.
      </p>
      <div className="mt-6 space-y-4">
        {scored.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Migrate `app/app/match/[id]/page.tsx`**

Change the import and the two `.dog` references:

```ts
// line 19: replace the fallback-score import
import { scoreDeterministic } from "@/lib/scoring";
// line 30: replace the match computation
  const match = getSeededMatch(id) ?? scoreDeterministic(CURRENT_USER, candidate);
// lines 36-37: CURRENT_USER.dog.name → CURRENT_USER.dogs[0].name; candidate.dog.name → candidate.dogs[0].name
        {CURRENT_USER.human.name} &amp; {CURRENT_USER.dogs[0].name}, meet{" "}
        {candidate.human.name} &amp; {candidate.dogs[0].name}.
```

- [ ] **Step 13: Migrate `components/candidate-card.tsx` (signals + `.dogs[0]`)**

Replace the destructure and the reason-chip block. Change line 23 and lines 33-37 and 55-61:

```tsx
// line 23
  const { human, dogs, match } = candidate;
  const dog = dogs[0];
// (lines 33-37 stay the same since they now reference the local `dog`)
// Replace the reasons block (lines 55-61) with signal chips:
        <div className="flex flex-wrap gap-1.5">
          {match.signals.map((signal) => (
            <Badge
              key={signal.label}
              variant={signal.kind === "caution" ? "outline" : "secondary"}
            >
              {signal.kind === "caution" ? "⚠" : "✔"} {signal.label}
            </Badge>
          ))}
        </div>
```

- [ ] **Step 14: Migrate `components/match-breakdown.tsx` (signals + `.dogs[0]`)**

Replace `candidate.dog.name` (lines 58, 69) with `candidate.dogs[0].name`, and the reasons block (lines 74-80) with:

```tsx
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
```

- [ ] **Step 15: Migrate `components/profile-form.tsx` (`.dogs[0]`)**

Replace lines 38-39 and 53:

```tsx
// lines 38-39
      dogName: CURRENT_USER.dogs[0].name,
      dogBreed: CURRENT_USER.dogs[0].breed,
// line 53 (inside the draft — build a new dogs array)
      dogs: [
        {
          ...CURRENT_USER.dogs[0],
          name: values.dogName,
          breed: values.dogBreed,
        },
      ],
```

Note: the surrounding `onSubmit` builds `draft.dog` today — change that key to `dogs` per the snippet so the `Profile` typechecks.

- [ ] **Step 16: Rewrite `tests/schemas.test.ts` for the new shapes**

```ts
import { describe, expect, it } from "vitest";
import {
  DogSchema,
  HumanSchema,
  MatchResultSchema,
  MatchScoreSchema,
  ProfileSchema,
} from "@/data/schemas";
import { scoreDeterministic } from "@/lib/scoring";
import type { Profile } from "@/data/types";

const validProfile: Profile = {
  id: "p1",
  human: {
    name: "Dana", age: 27, city: "Seattle",
    interests: ["climbing"], lookingFor: "Adventure partner.",
    location: { lat: 47.6062, lng: -122.3321 }, walkTimes: ["morning"],
  },
  dogs: [{ name: "Rex", breed: "Lab mix", size: "large", energy: 4, temperament: ["goofy"], favoriteActivity: "fetch at the park" }],
  photoUrl: "/profiles/dana.jpg",
};

describe("profile schemas mirror the frozen types", () => {
  it("accepts a valid Profile (with and without optional photoUrl)", () => {
    expect(ProfileSchema.safeParse(validProfile).success).toBe(true);
    const noPhoto: Profile = { ...validProfile };
    delete noPhoto.photoUrl;
    expect(ProfileSchema.safeParse(noPhoto).success).toBe(true);
  });

  it("rejects energy outside the 1–5 literal union", () => {
    expect(DogSchema.safeParse({ ...validProfile.dogs[0], energy: 0 }).success).toBe(false);
  });

  it("rejects a dog size outside small/medium/large", () => {
    expect(DogSchema.safeParse({ ...validProfile.dogs[0], size: "giant" }).success).toBe(false);
  });

  it("requires at least one dog", () => {
    expect(ProfileSchema.safeParse({ ...validProfile, dogs: [] }).success).toBe(false);
  });

  it("rejects a walkTime outside the enum", () => {
    expect(HumanSchema.safeParse({ ...validProfile.human, walkTimes: ["dawn"] }).success).toBe(false);
  });
});

describe("AI output + match result schemas", () => {
  it("MatchScoreSchema requires an explanation", () => {
    expect(MatchScoreSchema.safeParse({ explanation: "You both love the trail." }).success).toBe(true);
    expect(MatchScoreSchema.safeParse({ explanation: "" }).success).toBe(false);
  });

  it("validates the deterministic scorer's output against the MatchResult contract", () => {
    const other: Profile = { ...validProfile, id: "p2", human: { ...validProfile.human, name: "Eli" }, dogs: [{ ...validProfile.dogs[0], name: "Waffle" }] };
    expect(MatchResultSchema.safeParse(scoreDeterministic(validProfile, other)).success).toBe(true);
  });
});
```

- [ ] **Step 17: Run the full gate**

Run: `bun run verify`
Expected: PASS — lint, typecheck, all tests, and build succeed with no `OPENAI_API_KEY` set.

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "feat(slice-b): migrate contract + deterministic scoring baseline (PMP-11)

dogs[], location, walkTimes; reasons -> signed signals. New lib/scoring
engine owns the score; removed AI-authored scoring (re-added as narration
in a later commit)."
```

---

## Task 2: Proximity dimension

Add haversine-based proximity to the human score and a "live N min apart" positive signal.

**Files:**
- Modify: `lib/scoring/dimensions.ts`
- Modify: `lib/scoring/index.ts`
- Modify: `tests/scoring.test.ts`

**Interfaces:**
- Consumes: `Human["location"]` = `{ lat: number; lng: number }`.
- Produces `lib/scoring/dimensions.ts`: `haversineKm(a, b): number`, `proximityFit(a, b): { score: number; km: number; minutes: number }`.

- [ ] **Step 1: Write failing tests in `tests/scoring.test.ts`**

Add inside the `describe("scoreDeterministic", ...)` block:

```ts
  it("scores same-neighborhood higher on human fit than a distant city", () => {
    const near = scoreDeterministic(ava, ben);   // both Seattle, ~0.4km
    const far = scoreDeterministic(ava, cleo);    // Tacoma, ~45km
    expect(near.humanScore).toBeGreaterThan(far.humanScore);
  });

  it("emits a proximity ✔ signal for very close matches", () => {
    const r = scoreDeterministic(ava, ben);
    expect(r.signals.some((s) => s.facet === "human" && /apart/i.test(s.label))).toBe(true);
  });
```

Also add a direct dimension test in a new block:

```ts
import { haversineKm, proximityFit } from "@/lib/scoring/dimensions";

describe("proximityFit", () => {
  it("is ~0 km for identical coordinates and scores 100", () => {
    const p = proximityFit({ lat: 47.6, lng: -122.3 }, { lat: 47.6, lng: -122.3 });
    expect(p.km).toBeCloseTo(0, 1);
    expect(p.score).toBe(100);
  });

  it("decays with distance", () => {
    const near = proximityFit({ lat: 47.60, lng: -122.33 }, { lat: 47.61, lng: -122.33 });
    const far = proximityFit({ lat: 47.60, lng: -122.33 }, { lat: 47.25, lng: -122.44 });
    expect(near.score).toBeGreaterThan(far.score);
  });

  it("computes a plausible haversine distance (Seattle→Tacoma ≈ 40–50 km)", () => {
    const km = haversineKm({ lat: 47.6062, lng: -122.3321 }, { lat: 47.2529, lng: -122.4443 });
    expect(km).toBeGreaterThan(38);
    expect(km).toBeLessThan(52);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `bun run test tests/scoring.test.ts`
Expected: FAIL — `haversineKm`/`proximityFit` not exported; proximity assertions fail.

- [ ] **Step 3: Add `haversineKm` and `proximityFit` to `lib/scoring/dimensions.ts`**

```ts
/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Proximity fit: 100 when co-located, decaying ~3 pts/km. Also returns a
 *  rough "minutes apart" for the signal label (city driving ≈ 0.5 km/min). */
export function proximityFit(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): { score: number; km: number; minutes: number } {
  const km = haversineKm(a, b);
  return { score: clamp(100 - km * 3), km, minutes: Math.max(1, Math.round(km * 2)) };
}
```

- [ ] **Step 4: Wire proximity into `scoreDeterministic` in `lib/scoring/index.ts`**

Update the import and `humanScore`/`dims` computation:

```ts
import { clamp, dogPairScore, interestFit, proximityFit } from "./dimensions";
// ...
  const interests = interestFit(user.human.interests, candidate.human.interests);
  const prox = proximityFit(user.human.location, candidate.human.location);
  const humanScore = clamp(0.6 * interests.score + 0.4 * prox.score);
```

And add a proximity dimension to the `dims` array (before `buildSignals`):

```ts
    {
      facet: "human",
      score: prox.score,
      positive: `Live about ${prox.minutes} min apart`,
      caution: "You live far apart",
    },
```

- [ ] **Step 5: Run tests — verify pass**

Run: `bun run test tests/scoring.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/scoring/dimensions.ts lib/scoring/index.ts tests/scoring.test.ts
git commit -m "feat(slice-b): add proximity dimension to scoring"
```

---

## Task 3: Walk-schedule overlap dimension

Add owner walk-routine overlap to the human score and a "both walk after work" style signal.

**Files:**
- Modify: `lib/scoring/dimensions.ts`
- Modify: `lib/scoring/index.ts`
- Modify: `tests/scoring.test.ts`

**Interfaces:**
- Consumes: `Human["walkTimes"]` = `WalkTime[]`.
- Produces `lib/scoring/dimensions.ts`: `walkFit(a: WalkTime[], b: WalkTime[]): { score: number; shared: WalkTime[] }`.

- [ ] **Step 1: Write failing tests**

Add a block to `tests/scoring.test.ts`:

```ts
import { walkFit } from "@/lib/scoring/dimensions";

describe("walkFit", () => {
  it("scores full overlap high and no overlap low", () => {
    expect(walkFit(["morning", "evening"], ["morning", "evening"]).score).toBeGreaterThan(
      walkFit(["morning"], ["night"]).score,
    );
  });

  it("returns the shared slots", () => {
    expect(walkFit(["morning", "evening"], ["evening", "night"]).shared).toEqual(["evening"]);
  });
});
```

And add to the `scoreDeterministic` block:

```ts
  it("surfaces a shared-walk-time ✔ signal when routines align", () => {
    // ava walks morning+evening; ben walks morning
    const r = scoreDeterministic(ava, ben);
    expect(r.signals.some((s) => s.facet === "human" && /walk/i.test(s.label))).toBe(true);
  });
```

- [ ] **Step 2: Run tests — verify fail**

Run: `bun run test tests/scoring.test.ts`
Expected: FAIL — `walkFit` not exported; walk-signal assertion fails.

- [ ] **Step 3: Add `walkFit` to `lib/scoring/dimensions.ts`**

```ts
import type { Dog, WalkTime } from "@/data/types";
// (extend the existing type import)

/** Owner walk-routine overlap → { score, shared }. */
export function walkFit(
  a: WalkTime[],
  b: WalkTime[],
): { score: number; shared: WalkTime[] } {
  const setB = new Set(b);
  const shared = a.filter((t) => setB.has(t));
  const denom = Math.max(1, Math.min(a.length, b.length));
  return { score: clamp((shared.length / denom) * 100), shared };
}
```

- [ ] **Step 4: Wire walk overlap into `scoreDeterministic`**

Update `lib/scoring/index.ts`:

```ts
import { clamp, dogPairScore, interestFit, proximityFit, walkFit } from "./dimensions";
// ...
  const walk = walkFit(user.human.walkTimes, candidate.human.walkTimes);
  const humanScore = clamp(0.4 * interests.score + 0.3 * walk.score + 0.3 * prox.score);
```

Add to the `dims` array:

```ts
    {
      facet: "human",
      score: walk.score,
      positive:
        walk.shared.length > 0
          ? `Both walk in the ${walk.shared[0]}`
          : "Similar walk routine",
      caution: "Different walk schedules",
    },
```

- [ ] **Step 5: Run tests — verify pass**

Run: `bun run test tests/scoring.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/scoring/dimensions.ts lib/scoring/index.ts tests/scoring.test.ts
git commit -m "feat(slice-b): add walk-schedule overlap dimension"
```

---

## Task 4: Conservative multi-dog aggregation + worst-pair caution

Replace the mean dog aggregation with a worst-pair-weighted blend, and surface the worst-scoring dog pair as a ⚠ caution that names the dogs.

**Files:**
- Modify: `lib/scoring/index.ts`
- Modify: `tests/scoring.test.ts`

**Interfaces:**
- Produces `lib/scoring/index.ts`: `dogFit(userDogs, candDogs): { score: number; worstPair: { a: Dog; b: Dog; score: number } }` (return shape widened from Task 1's `number`).

- [ ] **Step 1: Write failing tests**

Add to `tests/scoring.test.ts`:

```ts
import { dogFit } from "@/lib/scoring";

const twoDogs: Profile = {
  ...ava,
  id: "multi",
  dogs: [
    ava.dogs[0], // high-energy Border Collie
    { name: "Sleepy", breed: "Basset Hound", size: "large", energy: 1, temperament: ["lazy", "shy"], favoriteActivity: "naps in the sun" },
  ],
};

describe("dogFit (conservative aggregation)", () => {
  it("adding a clashing dog lowers (never raises) the dog score", () => {
    const single = dogFit(ava.dogs, ben.dogs).score;
    const withClash = dogFit(twoDogs.dogs, ben.dogs).score;
    expect(withClash).toBeLessThanOrEqual(single);
  });

  it("returns the worst pair for caution labeling", () => {
    const { worstPair } = dogFit(twoDogs.dogs, ben.dogs);
    expect(worstPair.a.name).toBe("Sleepy"); // the mismatched dog is the worst pair
  });

  it("identifies the single pair as the worst pair for one dog each", () => {
    const { score, worstPair } = dogFit(ava.dogs, ben.dogs);
    expect(worstPair.a.name).toBe("Biscuit");
    expect(score).toBeGreaterThan(0);
  });
});
```

And add to the `scoreDeterministic` block:

```ts
  it("surfaces a ⚠ caution naming the worst dog pair when dogs clash", () => {
    const r = scoreDeterministic(twoDogs, ben);
    expect(r.signals.some((s) => s.facet === "dog" && s.kind === "caution" && /Sleepy/.test(s.label))).toBe(true);
  });
```

- [ ] **Step 2: Run tests — verify fail**

Run: `bun run test tests/scoring.test.ts`
Expected: FAIL — `dogFit` returns a `number`, has no `worstPair`; caution assertion fails.

- [ ] **Step 3: Rewrite `dogFit` in `lib/scoring/index.ts` (conservative)**

```ts
import type { Dog, MatchResult, Profile, Signal } from "@/data/types";

/** Conservative dog fit: 0.7*worstPair + 0.3*meanPair over all dog pairs. */
export function dogFit(
  userDogs: Dog[],
  candDogs: Dog[],
): { score: number; worstPair: { a: Dog; b: Dog; score: number } } {
  const pairs: { a: Dog; b: Dog; score: number }[] = [];
  for (const a of userDogs) for (const b of candDogs) pairs.push({ a, b, score: dogPairScore(a, b) });
  const mean = pairs.reduce((s, p) => s + p.score, 0) / pairs.length;
  const worstPair = pairs.reduce((w, p) => (p.score < w.score ? p : w), pairs[0]);
  const score = clamp(0.7 * worstPair.score + 0.3 * mean);
  return { score, worstPair };
}
```

- [ ] **Step 4: Use the new `dogFit` shape in `scoreDeterministic`**

```ts
  const dog = dogFit(user.dogs, candidate.dogs);
  const dogScore = dog.score;
  const combinedScore = clamp(0.6 * humanScore + 0.4 * dogScore);
  // ...
  // replace the single dog dimension entry with a worst-pair-aware one.
  // NOTE: the signal keys off the WORST pair's score, not the blended
  // dogScore — the conservative blend can sit above the caution threshold
  // even when a real clash exists, so the friction we want to surface is the
  // worst pair itself.
    {
      facet: "dog",
      score: dog.worstPair.score,
      positive: `${dog.worstPair.a.name} & ${dog.worstPair.b.name} click`,
      caution: `${dog.worstPair.a.name} & ${dog.worstPair.b.name} may not mesh`,
    },
```

- [ ] **Step 5: Run the full gate**

Run: `bun run verify`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/scoring/index.ts tests/scoring.test.ts
git commit -m "feat(slice-b): conservative worst-pair dog aggregation + caution"
```

---

## Task 5: LLM narration (explanation only) with template fallback

Re-introduce `lib/ai.ts` as narration-only, and wire `app/actions.ts` to narrate over the deterministic result, falling back to the template when there's no key or the call fails.

**Files:**
- Create: `lib/ai.ts`
- Modify: `app/actions.ts`
- Create: `tests/actions.test.ts`
- Modify: `lib/scoring/index.ts` (export `templateExplanation` — already exported in Task 1)

**Interfaces:**
- Produces `lib/ai.ts`: `narrateExplanation(user: Profile, candidate: Profile, signals: Signal[]): Promise<string>` (throws on API/validation failure).
- `app/actions.ts` `scoreMatch`/`scoreAll` unchanged in signature; now return an LLM-narrated `explanation` when a key is present, else the templated one.

- [ ] **Step 1: Write failing test `tests/actions.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { scoreMatch, scoreAll } from "@/app/actions";
import { CURRENT_USER, CANDIDATES } from "@/data/profiles";

// No OPENAI_API_KEY in the test env → deterministic + templated path.
describe("scoreMatch (no key → deterministic + template)", () => {
  it("returns a valid, non-empty explanation without a key", async () => {
    const r = await scoreMatch(CURRENT_USER, CANDIDATES[0]);
    expect(r.candidateId).toBe(CANDIDATES[0].id);
    expect(r.explanation.length).toBeGreaterThan(0);
    expect(r.signals.length).toBeGreaterThanOrEqual(2);
  });

  it("scoreAll ranks results high → low by combined score", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].match.combinedScore).toBeGreaterThanOrEqual(ranked[i].match.combinedScore);
    }
  });
});
```

- [ ] **Step 2: Run — verify fail**

Run: `bun run test tests/actions.test.ts`
Expected: FAIL — `scoreAll`/`scoreMatch` importable but the narration wiring in Step 4 not yet present (test may pass on the deterministic path already; if so, it still guards the no-key behavior — proceed).

- [ ] **Step 3: Create `lib/ai.ts` (narration-only)**

```ts
// Slice B — LLM narration. The deterministic engine owns the score and the
// signals; the model only turns those computed facts into a warm sentence.
// generateObject validates the output against MatchScoreSchema ({ explanation }).
// Throws on API/validation failure — app/actions.ts catches and falls back to
// the templated explanation, so the UI never breaks.

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { MatchScoreSchema } from "@/data/schemas";
import type { Profile, Signal } from "@/data/types";

export function buildNarrationPrompt(
  user: Profile,
  candidate: Profile,
  signals: Signal[],
): string {
  return [
    "You are writing a warm, specific 'why you matched' blurb for a dating",
    "app for dog owners. The compatibility has ALREADY been computed — do NOT",
    "invent scores or new reasons. Turn ONLY the signals below into 1–3 warm,",
    "specific sentences that name the people and dogs. Positive signals are",
    "strengths; caution signals are honest things to watch. No generic filler.",
    "",
    `USER: ${user.human.name}, dogs: ${user.dogs.map((d) => d.name).join(", ")}`,
    `CANDIDATE: ${candidate.human.name}, dogs: ${candidate.dogs.map((d) => d.name).join(", ")}`,
    "SIGNALS:",
    ...signals.map((s) => `- [${s.kind}/${s.facet}] ${s.label}`),
  ].join("\n");
}

export async function narrateExplanation(
  user: Profile,
  candidate: Profile,
  signals: Signal[],
): Promise<string> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: MatchScoreSchema,
    prompt: buildNarrationPrompt(user, candidate, signals),
  });
  return object.explanation;
}
```

- [ ] **Step 4: Wire narration into `app/actions.ts`**

```ts
"use server";

import type { ScoredCandidate, ScoreMatch, ScoreAll } from "@/data/types";
import { scoreDeterministic } from "@/lib/scoring";
import { narrateExplanation } from "@/lib/ai";

export const scoreMatch: ScoreMatch = async (user, candidate) => {
  const result = scoreDeterministic(user, candidate);
  if (!process.env.OPENAI_API_KEY) return result;
  try {
    const explanation = await narrateExplanation(user, candidate, result.signals);
    return { ...result, explanation };
  } catch (error) {
    console.error(`scoreMatch: narration failed for ${candidate.id}, using template`, error);
    return result; // deterministic template explanation
  }
};

export const scoreAll: ScoreAll = async (user, candidates) => {
  const results: ScoredCandidate[] = await Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      match: await scoreMatch(user, candidate),
    })),
  );
  return results.sort((a, b) => b.match.combinedScore - a.match.combinedScore);
};
```

- [ ] **Step 5: Run tests + gate**

Run: `bun run test tests/actions.test.ts`
Expected: PASS.
Run: `bun run verify`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/ai.ts app/actions.ts tests/actions.test.ts
git commit -m "feat(slice-b): LLM narration of explanation with template fallback"
```

---

## Task 6: Discover card — scannable signal chips

Cap the Discover card to the top 2–3 signals for a light feed (the detail view shows all). Distinguish ✔ vs ⚠ visually and accessibly.

**Files:**
- Modify: `components/candidate-card.tsx`
- Create: `tests/candidate-card.test.tsx`

**Interfaces:**
- Consumes: `ScoredCandidate` (from `data/types.ts`).

- [ ] **Step 1: Confirm the test setup supports component rendering**

Run: `bun run test --run tests/schemas.test.ts`
Expected: PASS (sanity that Vitest runs). If `@testing-library/react` is not installed, install it:

```bash
bun add -d @testing-library/react @testing-library/dom happy-dom
```

And ensure `vitest.config.ts` sets `test.environment: "happy-dom"` (add it if missing).

- [ ] **Step 2: Write failing test `tests/candidate-card.test.tsx`**

```tsx
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
    expect(screen.getByText(String(candidate.match.combinedScore))).toBeTruthy();
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
```

- [ ] **Step 3: Run — verify fail**

Run: `bun run test tests/candidate-card.test.tsx`
Expected: FAIL — no `signal-chip` testid; link points to `/app/match/c1` (from Task 1).

- [ ] **Step 4: Update `components/candidate-card.tsx`**

Cap to 3 signals, add the testid, and point the link at the detail route. Replace the signals block and the footer link:

```tsx
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
```

Footer link (replace `/app/match/${candidate.id}` with the detail route, keep the CTA):

```tsx
        <Button asChild className="w-full">
          <Link href={`/app/candidate/${candidate.id}`}>
            View why you match
          </Link>
        </Button>
```

> The `Heart`/`Like` CTA (US-4) belongs to Slice C's flow; the Discover card's job in US-2 is to open the breakdown. Remove the now-unused `Heart` import if lint flags it.

- [ ] **Step 5: Run tests — verify pass**

Run: `bun run test tests/candidate-card.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/candidate-card.tsx tests/candidate-card.test.tsx vitest.config.ts package.json
git commit -m "feat(slice-b): scannable signal chips on Discover card"
```

---

## Task 7: Candidate detail route

Add `/app/candidate/[id]` showing the full breakdown (combined score, human + dog sub-scores, all signals grouped by facet, explanation) via the existing `MatchBreakdown`.

**Files:**
- Create: `app/app/candidate/[id]/page.tsx`
- Modify: `components/match-breakdown.tsx` (group signals by facet)

**Interfaces:**
- Consumes: `getCandidateById`, `getSeededMatch`, `scoreDeterministic`, `MatchBreakdown`.

- [ ] **Step 1: Group signals by facet in `components/match-breakdown.tsx`**

Replace the single signals block with two labeled groups:

```tsx
        {(["human", "dog"] as const).map((facet) => {
          const group = match.signals.filter((s) => s.facet === facet);
          if (group.length === 0) return null;
          return (
            <div key={facet}>
              <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">
                {facet === "human" ? "You two" : "Your dogs"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.map((signal) => (
                  <Badge
                    key={signal.label}
                    variant={signal.kind === "caution" ? "outline" : "secondary"}
                  >
                    <span aria-hidden>{signal.kind === "caution" ? "⚠" : "✔"}</span>{" "}
                    {signal.label}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
```

- [ ] **Step 2: Create `app/app/candidate/[id]/page.tsx`**

```tsx
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

  const match = getSeededMatch(id) ?? scoreDeterministic(CURRENT_USER, candidate);

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
```

- [ ] **Step 3: Verify the route renders**

Run: `bun run dev`, open `http://localhost:3000/app`, click "View why you match" on a card. Confirm the detail page shows the score, both sub-score bars, signals grouped into "You two" / "Your dogs", and the explanation. Stop the dev server.

- [ ] **Step 4: Run the full gate**

Run: `bun run verify`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/app/candidate components/match-breakdown.tsx
git commit -m "feat(slice-b): candidate detail route with faceted breakdown"
```

---

## Task 8: Demo-integrity behavioral tests

Lock in the properties the demo depends on: ordering, an obvious clash surfaces a ⚠ and ranks low, an obvious fit ranks high, and the no-key path produces valid results for every seeded candidate.

**Files:**
- Create: `tests/scoring-behavior.test.ts`

**Interfaces:**
- Consumes: `scoreAll` (from `app/actions.ts`), `CURRENT_USER`, `CANDIDATES`, `MatchResultSchema`.

- [ ] **Step 1: Write the behavioral tests**

```ts
import { describe, expect, it } from "vitest";
import { scoreAll } from "@/app/actions";
import { CURRENT_USER, CANDIDATES } from "@/data/profiles";
import { MatchResultSchema } from "@/data/schemas";

describe("US-2 demo integrity", () => {
  it("every seeded candidate scores to a valid MatchResult with no key", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    expect(ranked.length).toBe(CANDIDATES.length);
    for (const c of ranked) {
      expect(MatchResultSchema.safeParse(c.match).success).toBe(true);
    }
  });

  it("orders results high → low by combined score", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const scores = ranked.map((c) => c.match.combinedScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("an obvious fit (Nina/Pepper, c10) outranks an obvious clash (Leo/Miso, c11)", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const rank = (id: string) => ranked.findIndex((c) => c.id === id);
    expect(rank("c10")).toBeLessThan(rank("c11"));
  });

  it("surfaces at least one caution somewhere in the field", async () => {
    const ranked = await scoreAll(CURRENT_USER, CANDIDATES);
    const anyCaution = ranked.some((c) => c.match.signals.some((s) => s.kind === "caution"));
    expect(anyCaution).toBe(true);
  });
});
```

- [ ] **Step 2: Run — verify pass**

Run: `bun run test tests/scoring-behavior.test.ts`
Expected: PASS. (If the "obvious fit outranks clash" assertion fails, the seeded scores in `data/seeded-matches.ts` drive Discover ordering — c10=88 already outranks c11=46, so this should hold. If live scoring changes ordering, adjust the seeded data, not the test.)

- [ ] **Step 3: Run the full gate**

Run: `bun run verify`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/scoring-behavior.test.ts
git commit -m "test(slice-b): demo-integrity behavioral tests for US-2"
```

---

## Task 9: Open the PR

**Files:** none.

- [ ] **Step 1: Final gate**

Run: `bun run verify`
Expected: PASS.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin bynelsonchow/pmp-11-us-2-find-genuinely-compatible-matches
gh pr create --title "US-2: Find genuinely compatible matches (PMP-11)" --body "$(cat <<'BODY'
Implements US-2 / Slice B: deterministic signed-scoring engine + ranked Discover list + candidate detail.

## Team-seam changes (please review — @kelvin Slice A, @deacon Slice C)
- `data/types.ts`: `Profile.dog` → `dogs: Dog[]`; `Human` gains `location` + `walkTimes`, loses `energy`; `MatchResult.reasons` → `signals: Signal[]` (signed + faceted).
- `data/schemas.ts` updated to mirror; `MatchScoreSchema` shrinks to `{ explanation }` (LLM narrates only).
- Slice A: profile form must capture the new fields and support multiple dogs.
- Slice C: match screen now renders `signals` (not `reasons`) via the updated `MatchBreakdown`.

## What's here
- `lib/scoring/`: deterministic engine (interests, proximity, walk overlap; conservative worst-pair dog aggregation) owning the score + signals.
- `lib/ai.ts`: narration-only; no-key path uses a templated explanation.
- Discover list (scannable chips) → `/app/candidate/[id]` detail (full faceted breakdown).
- Unit + behavioral tests; `bun run verify` green with no `OPENAI_API_KEY`.

Design + spec: `docs/superpowers/specs/2026-07-11-us2-discovery-design.md`.
BODY
)"
```

Expected: PR created with a preview URL comment from Vercel.

---

## Notes for the implementer

- **Deferred (not this slice):** icebreakers, date planning, safety/verification, badges, relationship modes, hard dealbreakers, and acting on a match (like/pass — US-4/Slice C). Don't build them here.
- **Tunable, not sacred:** the signal thresholds (`HIGH=72`, `LOW=45`), proximity decay (`3 pts/km`), dog aggregation blend (`0.7*worst + 0.3*mean`), and human weighting (`0.4 interest / 0.3 walk / 0.3 proximity`). The *shapes* are the decisions; adjust constants to make the demo read well.
- **If a seeded match and live scoring disagree on ordering,** the seeded data is what the demo shows — tune `data/seeded-matches.ts`, never weaken a test.
```
