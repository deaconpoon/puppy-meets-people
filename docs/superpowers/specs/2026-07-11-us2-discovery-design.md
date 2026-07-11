# US-2 — Find Genuinely Compatible Matches (Slice B) — Design

- **Issue:** [PMP-11](https://linear.app/dknazeroth/issue/PMP-11/us-2-find-genuinely-compatible-matches)
- **Story:** As a single dog owner, I want to discover people whose compatibility reflects both human and dog fit, so that I don't pursue matches that would fall apart because our dogs don't work.
- **Acceptance criteria (from `docs/BRD-PRD.md` §2.4):**
  1. I'm shown potential matches ordered so the most compatible are easiest to find.
  2. Compatibility visibly reflects both human fit **and** dog fit, not human fit alone.
- **Status:** Design approved, ready to plan.

## Goal

Establish the discovery **UX workflow** and — the primary deliverable — the **backend scoring logic** behind it. The UI need not be final (a design system lands separately); it must be functional and demonstrate the workflow. The scoring engine is the real product of this slice: deterministic, unit-tested, and demo-proof.

The insight driving the design (from stakeholder input): a genuinely smart match view shows not just *why you fit* but *what to watch* — positive signals **and** caution signals, spanning both human and dog. Example:

```
87% Match
✔ Both love weekend hikes
✔ Dogs are similar energy
✔ Live 12 minutes apart
⚠ Your dog is shy; theirs is very playful
```

That signed breakdown — not a flat list of positives — is what makes it "smarter than 'you both like dogs.'"

## Scope

**In scope (this slice):**
- Rank candidates by combined human + dog fit.
- A **signed breakdown**: positive (✔) and caution (⚠) signals, each labeled human or dog.
- New matching dimensions: **proximity** and **owner walk routine**.
- Discover list → candidate detail UX workflow.
- The deterministic scoring engine + narrowed LLM narration.

**Explicitly deferred (other stories/slices):** icebreakers (US-10), first-date/venue planning (US-11), safety & verification (US-8), badges / photo albums / dog "approval" animations, relationship modes (US-8-ish), hard dealbreakers & constraints (US-6), acting on a match — like/pass/queue (US-4 / Slice C).

## Key decisions

1. **Tight scope** — the compatibility engine + signed "why," nothing downstream of a match.
2. **Extend the profile contract for real** (not demo-only scaffolding) to carry the new dimensions.
3. **Cautions are the low-scoring dimensions** — score and breakdown come from one computation, so the "why" always reconciles with the number.
4. **The deterministic engine owns the score and signals; the LLM only narrates.** Ranking and breakdown are identical with or without an API key.
5. **Discover = ranked list (score + top signals) → tap → detail (full breakdown).**
6. **Multiple dogs per profile** (`dogs: Dog[]`) — collapsing to single later is trivial; expanding later is a migration.

## Data contract (`data/types.ts` + `data/schemas.ts`)

This is the shared team seam. Changes here are coordinated per `AGENTS.md` §2: update types, schemas, and the sync test together, and flag Kelvin (Slice A form) and Deacon (Slice C match screen).

```ts
type Human = {
  name: string;
  age: number;
  city: string;
  interests: string[];
  lookingFor: string;
  // NEW
  location: { lat: number; lng: number };                          // enables proximity
  walkTimes: Array<"morning" | "afternoon" | "evening" | "night">; // owner's routine
  // REMOVED: energy (vague scalar, overlapped with interests + routine)
};

// Dog is unchanged: { name, breed, size, energy, temperament[], favoriteActivity }

type Profile = {
  id: string;
  human: Human;
  dogs: Dog[];        // was: dog: Dog  (multiple dogs supported)
  photoUrl?: string;
};

type Facet = "human" | "dog";

type Signal = {
  facet: Facet;                    // which half of the match this is about
  kind: "positive" | "caution";    // ✔ or ⚠
  label: string;                   // "Both love weekend hikes" / "Dogs' energy is mismatched"
};

type MatchResult = {
  candidateId: string;
  combinedScore: number;   // 0–100, computed = 0.6*human + 0.4*dog
  humanScore: number;      // 0–100, computed
  dogScore: number;        // 0–100, computed
  signals: Signal[];       // signed + faceted, derived from the same computation
  explanation: string;     // LLM narration; templated fallback
};
```

- `ScoredCandidate = Profile & { match: MatchResult }`, `ScoreMatch`, and `ScoreAll` signatures are unchanged.
- **`reasons: string[]` is replaced outright by `signals: Signal[]`** — a breaking change Slice C renders against.
- **`schemas.ts`** now validates only the LLM's `{ explanation: string }`; scores and signals no longer come from the model, so the schema's role shrinks accordingly. The `types.ts` ↔ `schemas.ts` sync test is updated for the new shapes.

## Scoring engine (`lib/scoring/`)

The core deliverable. A pure, deterministic, unit-tested module. The current `lib/fallback-score.ts` is refactored into this; it is no longer a "fallback" but *the* scorer.

**Per-dimension functions**, each returning a `0–100` score plus enough to emit a signal:

- **Human dimensions:**
  - `interestOverlap` — case-insensitive overlap of `interests`.
  - `walkOverlap` — shared `walkTimes` slots (owner routine alignment).
  - `proximity` — haversine on `location` → distance → `100` when near, decaying with km.
- **Dog dimensions** (per dog-pair): `sizeFit`, `energyFit`, `temperamentOverlap`, `activityFit` (reuse existing logic).

**Aggregation:**
- `humanScore` = weighted mean of the human dimensions.
- **Dog fit is many-to-many** (both sides may have multiple dogs): score every `(myDog × theirDog)` pair, then aggregate **conservatively** —
  `dogScore = 0.7 * worstPairScore + 0.3 * meanPairScore`.
  One clashing pair pulls the score down hard (surfacing the ⚠) without a single mismatch among several good pairs completely tanking a strong match. Dogs are hard to predict from a profile alone, so the worst pair is allowed to carry weight. For the common one-dog-each case, `worst == mean`, so this is a no-op.
- `combinedScore = 0.6 * humanScore + 0.4 * dogScore`.

**Signals derive from the same numbers** (thresholds, not a separate pass):
- Any dimension ≥ *high* threshold → a **✔ positive** signal (e.g. `"Both love weekend hikes"`, `"Live 12 minutes apart"`).
- Any dimension ≤ *low* threshold → a **⚠ caution** (e.g. `"Dogs' energy is mismatched"`).
- For dogs, the caution names the **worst-scoring pair** specifically (e.g. `"Your shy dog + their very playful dog"`).
- Middle band → no chip. Cap at ~2–4 signals total, prioritizing the most extreme contributions so cards stay scannable, and mixing facets so both human and dog fit are visible.

Everything here is a pure function of two `Profile`s — no network, no randomness, fully testable, identical with or without an API key.

## Data flow & the LLM's narrowed role

- **`lib/scoring/`** produces the full `MatchResult` *except* `explanation`.
- **`lib/ai.ts` (narration only):** takes the computed `{ signals, humanScore, dogScore }` + the two profiles and returns **only** the `explanation` prose. Its Zod schema shrinks to `{ explanation: string }`. The model can neither contradict the number nor invent signals — it turns facts into a warm 1–3 sentence line.
- **`app/actions.ts`:** `scoreAll(user, candidates)` scores every candidate deterministically, sorts high→low, then narrates. `scoreMatch` similarly. Fallback chain: missing key or LLM error → **templated explanation** built from the same signals (existing template logic, retained). Ranking and breakdown are byte-identical with or without an API key; only the prose voice changes.
- **Discover page** calls `scoreAll(CURRENT_USER, CANDIDATES)`. Pre-generated seeded explanations remain as demo insurance for zero-network pitch time.

## UX workflow

- **`/app` (Discover):** ranked list of `CandidateCard`s. Each card shows photo, name, **combined score**, and the **top 2–3 signals** as ✔/⚠ chips, mixing human and dog facets so both are visible at a glance (AC #2). Tapping a card opens the detail view.
- **`/app/candidate/[id]` (detail):** the full breakdown — combined score, **human sub-score and dog sub-score shown distinctly**, the complete ✔/⚠ signal list grouped by facet, and the AI `explanation`. Kept deliberately close to what Slice C's match screen will render, so it is a clean handoff rather than throwaway work.
- **States:** loading skeletons while (re)scoring; a polished empty state; the page never errors because scoring cannot throw.
- **No like/pass/queue state** — acting on a match is US-4 / Slice C. US-2 is browse + understand.
- UI is functional, not final; the design system lands separately.

## Testing

- **Unit (the core):** each dimension function (proximity decay, walk overlap, size/energy/temperament, activity); the pairwise dog aggregation including worst-pair conservatism; signal thresholds (positive/caution boundaries); combined-score weighting. Deterministic → exhaustive and fast.
- **Contract:** the `types.ts` ↔ `schemas.ts` sync test, updated for `dogs[]`, `location`, `walkTimes`, and `signals`.
- **Behavioral:** `scoreAll` returns high→low order; a seeded "obvious clash" profile surfaces a ⚠ and ranks low; an "obvious fit" ranks high — a demo-integrity guard.
- **No-key path:** scoring + templated explanation renders with `OPENAI_API_KEY` unset (CI enforces).

## Team-seam impact (coordinate before merge)

- `reasons → signals`: Slice C's match screen must render the new signed shape.
- `Human` gains `location` + `walkTimes`, loses `energy`; `Profile.dog → dogs[]`: Slice A's profile form and all seeded profiles change.
- Per `AGENTS.md` §2, update `types.ts` + `schemas.ts` + sync test together and flag the team in the PR description and channel.
