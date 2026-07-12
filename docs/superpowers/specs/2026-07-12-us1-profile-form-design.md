# US-1 (PMP-10) — Profile form: design spec

> Slice A. Owner: Kelvin. Status: approved 2026-07-12.
> Strategy: ship a matchmaking-ready Phase 1 ASAP to unblock Slice B (Nelson),
> with Phase 2 and a future pipeline documented up front.

## Goal

A user can create a profile representing **both themselves and their dog**, and
that profile is **persisted where the rest of the app reads it** — so Discover
(Slice B) scores against the real user, not the seeded default.

## What the matching actually consumes (evidence)

`lib/fallback-score.ts` + the AI prompt score on: human `energy`, `interests`,
`name`; dog `energy`, `size`, `temperament`, `favoriteActivity`, `name`.
Not consumed by scoring: human `age`, `city`, `lookingFor`; dog `breed`.

## Phase 1 — matchmaking-ready form (this build)

**Fields asked (10):**

| Human | Input |
| --- | --- |
| Name | text |
| City | text *(included by decision — same-city matters for real matching)* |
| Energy 1–5 | slider |
| Interests | tag chips (type + add; suggestions offered) |

| Dog | Input |
| --- | --- |
| Name | text |
| Breed | text *(included by decision — owners expect to state it; shown on cards)* |
| Size | select: small / medium / large |
| Energy 1–5 | slider |
| Temperament | tag chips |
| Favorite activity | text |

**Defaulted, not asked (2):** human `age` (default 30), human `lookingFor`
(default sensible copy). The saved object is still a complete, schema-valid
`Profile` — the frozen contract in `data/types.ts` is untouched.

**Validation:** zodResolver against `HumanSchema`/`DogSchema`
(`data/schemas.ts`), friendly inline messages. Interests/temperament require
≥1 tag (scoring degrades to zero-overlap otherwise, but empty lists are
schema-legal — we require 1+ for data quality).

**Persistence (the seam):** browser `localStorage`, wrapped in a small module
`lib/current-user.ts`:

- `getCurrentUser(): Profile` — stored profile, else `CURRENT_USER` seed.
- `saveCurrentUser(p: Profile): void` — validate + write.
- Storage key: `pmp.currentUser.v1`. Corrupt/invalid stored JSON → fall back
  to seed (never crash).
- This module is the **one read path** Slice B uses to get the current user.
  Coordination note for Nelson goes in the PR description.

**On save:** persist → confirmation state → CTA to `/app` (Discover).

**Look & feel:** compose Deacon's system — `PageShell`, shadcn `Card`,
`Slider`, `Select`, `Input`, `TraitChip` (coral = human, honey = dog). No new
colors/gradients; no edits to design-owned files.

## Phase 2 — full profile (next, if time)

- Promote `age` and `lookingFor` to real inputs.
- Post-save **preview card** of human + dog (reuses card patterns).
- Edit-in-place re-open of the saved profile (form already defaults from
  `getCurrentUser()`, so this is mostly free).
- Visual polish pass with Deacon.

## Future pipeline (documented, not scheduled)

Photo upload · AI-drafted dog bio from tags · richer trait vocabulary /
multi-dog households · account persistence beyond one browser (post-hackathon).

## Testing

- Unit: `lib/current-user.ts` round-trip, corrupt-JSON fallback, seed default
  (Vitest, mirrors existing `tests/` style).
- `bun run verify` green (lint, typecheck, tests, keyless build) before PR.
- Manual: fill form → save → refresh → values persist; Discover still renders.

## Out of scope

Anything in Slice B/C files; changes to `data/types.ts` / `data/schemas.ts`;
auth; server-side storage.
