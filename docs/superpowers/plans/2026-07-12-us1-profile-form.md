# US-1 (PMP-10) Profile Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A user fills a human+dog profile form, it persists to localStorage, and the rest of the app can read it via `lib/current-user.ts` — unblocking Slice B.

**Architecture:** One new persistence module (`lib/current-user.ts`, the Slice A→B seam, TDD'd), one new reusable `TagInput` client component, a full rewrite of the `ProfileForm` stub (react-hook-form + zodResolver against a form schema; stored profile loaded via `useEffect` + `form.reset` to avoid SSR hydration mismatch), and a light `PageShell` polish of the profile page. Frozen contracts (`data/types.ts`, `data/schemas.ts`) are **not modified**. No Slice B/C or design-owned files are touched.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, react-hook-form + `@hookform/resolvers/zod`, Zod, shadcn/ui (`Input`, `Button`, `Slider`, `Select`, `Card`), design patterns (`PageShell`, `TraitChip`), Vitest (node env — localStorage must be stubbed in tests), Bun.

**Spec:** `docs/superpowers/specs/2026-07-12-us1-profile-form-design.md`

**Repo rules that bind this plan:** work stays on branch `kelvin/pmp-10-us-1-represent-both-me-and-my-dog`; `bun run format` before committing (CI checks Prettier); `bun run verify` green before PR; per `AGENTS.md`, if a Next.js API behaves unexpectedly, read `node_modules/next/dist/docs/` before fighting it (this plan only uses `next/link` — low risk).

---

### Task 1: `lib/current-user.ts` — the persistence seam (TDD)

**Files:**
- Test: `tests/current-user.test.ts` (create)
- Create: `lib/current-user.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/current-user.test.ts`:

```ts
// Slice A seam: lib/current-user.ts persists the current user's Profile to
// localStorage and is the ONE read path for "who is the current user".
// Vitest runs in a node environment — localStorage is stubbed per test.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_USER } from "@/data/profiles";
import type { Profile } from "@/data/types";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
  saveCurrentUser,
} from "@/lib/current-user";

/** Minimal in-memory Storage implementation for the node test env. */
function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

const editedProfile: Profile = {
  id: "me",
  human: {
    name: "Kelvin",
    age: 29,
    city: "Vancouver",
    energy: 3,
    interests: ["bouldering", "coffee"],
    lookingFor: "Someone to split trail miles and lazy Sunday espressos with.",
  },
  dog: {
    name: "Mochi",
    breed: "Shiba Inu",
    size: "small",
    energy: 4,
    temperament: ["independent", "curious"],
    favoriteActivity: "park zoomies",
  },
};

describe("current-user persistence (Slice A → B seam)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the seeded CURRENT_USER when nothing is stored", () => {
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("round-trips a saved profile", () => {
    saveCurrentUser(editedProfile);
    expect(getCurrentUser()).toEqual(editedProfile);
  });

  it("falls back to the seed on corrupt JSON (never crashes)", () => {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, "{not json!!");
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("falls back to the seed on schema-invalid stored data", () => {
    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify({ id: "me", human: { name: "" }, dog: {} }),
    );
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("refuses to store a schema-invalid profile", () => {
    const bad = {
      ...editedProfile,
      human: { ...editedProfile.human, name: "" },
    } as Profile;
    expect(() => saveCurrentUser(bad)).toThrow();
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("degrades gracefully when localStorage is unavailable (SSR)", () => {
    vi.unstubAllGlobals();
    expect(getCurrentUser()).toEqual(CURRENT_USER);
    expect(() => saveCurrentUser(editedProfile)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test -- tests/current-user.test.ts`
Expected: FAIL — `Cannot find module '@/lib/current-user'` (or equivalent resolve error).

- [ ] **Step 3: Write the implementation**

Create `lib/current-user.ts`:

```ts
// ============================================================================
// SLICE A (US-1) — Current-user persistence. The Slice A → B seam.
// The profile form saves here; anything needing "who is the current user"
// (e.g. Discover re-scoring) reads getCurrentUser(). Client-side only:
// on the server (or with storage unavailable) it returns the demo seed,
// so the no-network demo path always renders (AGENTS.md rule 4).
// ============================================================================

import { CURRENT_USER } from "@/data/profiles";
import { ProfileSchema } from "@/data/schemas";
import type { Profile } from "@/data/types";

export const CURRENT_USER_STORAGE_KEY = "pmp.currentUser.v1";

/** localStorage if usable, else null (SSR, privacy modes that throw). */
function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * The current user's Profile: the stored one if present and valid,
 * otherwise the seeded demo user. Never throws.
 */
export function getCurrentUser(): Profile {
  const store = storage();
  if (!store) return CURRENT_USER;
  try {
    const raw = store.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return CURRENT_USER;
    const parsed = ProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : CURRENT_USER;
  } catch {
    return CURRENT_USER;
  }
}

/**
 * Validate and persist the current user's Profile.
 * Throws on a schema-invalid profile (callers validate via the form first);
 * silently no-ops when storage is unavailable.
 */
export function saveCurrentUser(profile: Profile): void {
  const validated = ProfileSchema.parse(profile);
  storage()?.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(validated));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test -- tests/current-user.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Format and commit**

```bash
bun run format
git add lib/current-user.ts tests/current-user.test.ts
git commit -m "feat(profile): current-user persistence seam via localStorage (PMP-10)

getCurrentUser()/saveCurrentUser() in lib/current-user.ts — validated
round-trip, seed fallback on missing/corrupt/invalid data, SSR-safe.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `TagInput` — reusable tag-chip input

**Files:**
- Create: `components/tag-input.tsx`

No unit test (Vitest env is node, no DOM); verified by typecheck now and manual browser test in Task 5.

- [ ] **Step 1: Create the component**

Create `components/tag-input.tsx`:

```tsx
"use client";

// SLICE A (US-1) — Tag input for interests (coral) / temperament (honey).
// Type + Enter/comma/Add to add; click a chip to remove; one-tap suggestions.

import { useState } from "react";
import { X } from "lucide-react";
import { TraitChip } from "@/components/patterns/trait-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  /** coral = human traits, honey = dog traits (docs/DESIGN.md). */
  tone: "coral" | "honey";
  placeholder?: string;
  suggestions?: string[];
};

export function TagInput({
  id,
  value,
  onChange,
  tone,
  placeholder,
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add(tag: string) {
    const trimmed = tag.trim();
    setDraft("");
    if (!trimmed) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
  }

  const remainingSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => add(draft)}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {value.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                className="cursor-pointer"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((v) => v !== tag))}
              >
                <TraitChip tone={tone}>
                  {tag}
                  <X aria-hidden className="size-3.5" />
                </TraitChip>
              </button>
            </li>
          ))}
        </ul>
      )}
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="cursor-pointer rounded-full border border-dashed border-muted-foreground/40 px-3 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
              onClick={() => add(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Format and commit**

```bash
bun run format
git add components/tag-input.tsx
git commit -m "feat(profile): TagInput chip component for interests/temperament (PMP-10)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Rewrite `ProfileForm` — full Phase 1 form

**Files:**
- Rewrite: `components/profile-form.tsx`

- [ ] **Step 1: Replace the stub with the full form**

Replace the entire contents of `components/profile-form.tsx`:

```tsx
"use client";

// ============================================================================
// SLICE A (US-1) — Human + dog profile form. Owner: Kelvin (PMP-10).
// Phase 1 (docs/superpowers/specs/2026-07-12-us1-profile-form-design.md):
// asks the 8 matchmaking inputs + city & breed; carries forward age and
// lookingFor from the existing profile (promoted to real fields in Phase 2).
// Saves via lib/current-user.ts — the Slice A → B seam.
// ============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CURRENT_USER } from "@/data/profiles";
import { getCurrentUser, saveCurrentUser } from "@/lib/current-user";
import type { Profile } from "@/data/types";

const energyLevel = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const ProfileFormSchema = z.object({
  humanName: z.string().min(1, "Please tell us your name."),
  city: z.string().min(1, "Which city are you in?"),
  humanEnergy: energyLevel,
  interests: z.array(z.string()).min(1, "Add at least one interest."),
  dogName: z.string().min(1, "What's your dog's name?"),
  breed: z.string().min(1, "What breed (or best guess)?"),
  size: z.enum(["small", "medium", "large"]),
  dogEnergy: energyLevel,
  temperament: z.array(z.string()).min(1, "Add at least one trait."),
  favoriteActivity: z.string().min(1, "What does your dog love doing?"),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    humanName: profile.human.name,
    city: profile.human.city,
    humanEnergy: profile.human.energy,
    interests: profile.human.interests,
    dogName: profile.dog.name,
    breed: profile.dog.breed,
    size: profile.dog.size,
    dogEnergy: profile.dog.energy,
    temperament: profile.dog.temperament,
    favoriteActivity: profile.dog.favoriteActivity,
  };
}

const HUMAN_ENERGY_LABELS = [
  "Homebody",
  "Mostly cozy",
  "Balanced",
  "Often out",
  "Always out",
] as const;

const DOG_ENERGY_LABELS = [
  "Couch potato",
  "Mellow",
  "Playful",
  "High energy",
  "Never stops",
] as const;

const INTEREST_SUGGESTIONS = [
  "hiking",
  "coffee",
  "live music",
  "cooking",
  "board games",
  "running",
];

const TEMPERAMENT_SUGGESTIONS = [
  "friendly",
  "playful",
  "shy",
  "smart",
  "goofy",
  "gentle",
];

/** Label + control + inline error, consistently spaced. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: React.PropsWithChildren<{
  label: string;
  htmlFor: string;
  error?: string;
}>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-coral-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProfileForm() {
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    // Seed defaults for SSR; the stored profile loads after hydration below.
    defaultValues: toFormValues(CURRENT_USER),
  });

  // localStorage is browser-only: resetting after mount avoids a hydration
  // mismatch between the server-rendered seed and a stored profile.
  useEffect(() => {
    form.reset(toFormValues(getCurrentUser()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: ProfileFormValues) {
    // Carry forward what Phase 1 doesn't ask (age, lookingFor) so the saved
    // object stays a complete, schema-valid Profile (frozen contract).
    const base = getCurrentUser();
    saveCurrentUser({
      ...base,
      human: {
        ...base.human,
        name: values.humanName,
        city: values.city,
        energy: values.humanEnergy,
        interests: values.interests,
      },
      dog: {
        name: values.dogName,
        breed: values.breed,
        size: values.size,
        energy: values.dogEnergy,
        temperament: values.temperament,
        favoriteActivity: values.favoriteActivity,
      },
    });
    setSaved(true);
  }

  const { errors } = form.formState;

  if (saved) {
    return (
      <Card>
        <CardContent className="space-y-4 text-center">
          <p className="font-display text-2xl">Profile saved! 🐾</p>
          <p className="text-muted-foreground">
            You and {form.getValues("dogName")} are ready to meet your matches.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/app">See your matches</Link>
            </Button>
            <Button variant="outline" onClick={() => setSaved(false)}>
              Keep editing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <fieldset className="space-y-4">
        <legend className="font-display text-xl">About you</legend>

        <Field label="Your name" htmlFor="humanName" error={errors.humanName?.message}>
          <Input id="humanName" {...form.register("humanName")} />
        </Field>

        <Field label="City" htmlFor="city" error={errors.city?.message}>
          <Input id="city" {...form.register("city")} />
        </Field>

        <Controller
          control={form.control}
          name="humanEnergy"
          render={({ field }) => (
            <Field
              label={`Your lifestyle energy — ${HUMAN_ENERGY_LABELS[field.value - 1]}`}
              htmlFor="humanEnergy"
              error={errors.humanEnergy?.message}
            >
              <Slider
                id="humanEnergy"
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                aria-label="Your lifestyle energy, 1 homebody to 5 always out"
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="interests"
          render={({ field }) => (
            <Field
              label="Your interests"
              htmlFor="interests"
              error={errors.interests?.message}
            >
              <TagInput
                id="interests"
                tone="coral"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. hiking — press Enter to add"
                suggestions={INTEREST_SUGGESTIONS}
              />
            </Field>
          )}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl">About your dog</legend>

        <Field label="Dog's name" htmlFor="dogName" error={errors.dogName?.message}>
          <Input id="dogName" {...form.register("dogName")} />
        </Field>

        <Field label="Breed" htmlFor="breed" error={errors.breed?.message}>
          <Input id="breed" {...form.register("breed")} />
        </Field>

        <Controller
          control={form.control}
          name="size"
          render={({ field }) => (
            <Field label="Size" htmlFor="size" error={errors.size?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="size" className="w-full">
                  <SelectValue placeholder="How big is your dog?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dogEnergy"
          render={({ field }) => (
            <Field
              label={`Dog energy — ${DOG_ENERGY_LABELS[field.value - 1]}`}
              htmlFor="dogEnergy"
              error={errors.dogEnergy?.message}
            >
              <Slider
                id="dogEnergy"
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                aria-label="Dog energy, 1 couch potato to 5 never stops"
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="temperament"
          render={({ field }) => (
            <Field
              label="Temperament"
              htmlFor="temperament"
              error={errors.temperament?.message}
            >
              <TagInput
                id="temperament"
                tone="honey"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. friendly — press Enter to add"
                suggestions={TEMPERAMENT_SUGGESTIONS}
              />
            </Field>
          )}
        />

        <Field
          label="Favorite activity"
          htmlFor="favoriteActivity"
          error={errors.favoriteActivity?.message}
        >
          <Input
            id="favoriteActivity"
            placeholder="e.g. fetch at the park"
            {...form.register("favoriteActivity")}
          />
        </Field>
      </fieldset>

      <Button type="submit" size="lg" className="w-full">
        Save profile
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Typecheck and run all tests**

Run: `bunx tsc --noEmit && bun run test`
Expected: no type errors; all tests pass (existing suites + current-user).

- [ ] **Step 3: Format and commit**

```bash
bun run format
git add components/profile-form.tsx
git commit -m "feat(profile): full Phase 1 profile form — 10 fields, validation, persistence (PMP-10)

Energy sliders, size select, interest/temperament tag chips, inline zod
errors, saved-state confirmation with CTA to Discover. Age/lookingFor carry
forward from the stored profile until Phase 2 promotes them to fields.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Profile page polish

**Files:**
- Modify: `app/app/profile/page.tsx`

- [ ] **Step 1: Wrap in PageShell, align copy**

Replace the entire contents of `app/app/profile/page.tsx`:

```tsx
// ============================================================================
// SLICE A (US-1) — Profile page (/app/profile). Owner: Kelvin (PMP-10).
// Human + dog profile form; the saved Profile persists via lib/current-user.ts
// (the Slice A → B seam consumed by Discover's re-scoring).
// ============================================================================

import { PageShell } from "@/components/patterns/page-shell";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return (
    <PageShell className="py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us about you and your dog — matches consider both of you.
        </p>
        <div className="mt-6">
          <ProfileForm />
        </div>
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `bunx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Format and commit**

```bash
bun run format
git add app/app/profile/page.tsx
git commit -m "feat(profile): profile page on PageShell (PMP-10)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Full verify + manual end-to-end check

**Files:** none (verification only)

- [ ] **Step 1: Run the team quality gate**

Run: `bun run verify`
Expected: format ✓, lint ✓, typecheck ✓, tests ✓, keyless build ✓. Fix anything red before proceeding (do not skip — CI runs the same gates).

- [ ] **Step 2: Manual browser test**

```bash
bun run dev
```

Then in the browser at `http://localhost:3000/app/profile`:
1. Form renders with the seeded profile (Alex / Biscuit) pre-filled.
2. Clear "Your name" → Save → inline error "Please tell us your name." appears; nothing saved.
3. Fill all fields with new values (use suggestion chips + type a custom tag), Save → "Profile saved! 🐾" confirmation with a working "See your matches" link.
4. **Refresh the page** → the form shows the values you saved (persistence works).
5. Visit `/app` (Discover) → still renders normally (unchanged, seeded — Nelson's re-score wiring is Slice B).
6. Keyboard-only pass: Tab through every field, adjust sliders with arrow keys, add/remove a tag with Enter — all reachable.

Expected: all six pass. If a Next.js behavior surprises here, check `node_modules/next/dist/docs/` per AGENTS.md before patching around it.

- [ ] **Step 3: Commit any fixes from manual testing**

```bash
bun run format
git add -A
git commit -m "fix(profile): manual-test fixes (PMP-10)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Skip if nothing changed.)

---

### Task 6: Ship — push, PR, ticket

**Files:** none (process only)

- [ ] **Step 1: Push the branch and open the PR**

Use the repo's `/pr` skill if available in-session; otherwise:

```bash
git push -u origin kelvin/pmp-10-us-1-represent-both-me-and-my-dog
gh pr create \
  --title "PMP-10: profile represents both me and my dog" \
  --body "$(cat <<'EOF'
## What
US-1 (Slice A): full human+dog profile form with validation, persisted to
localStorage via a new `lib/current-user.ts` seam module.

## Why
Unblocks Slice B: `getCurrentUser()` is now the one read path for the current
user's Profile — Discover's re-scoring (Nelson's TODO #1) can call it from
client code and score the real user instead of the seed.

**@Nelson — seam note:** `getCurrentUser(): Profile` (client-side; returns the
seed on server/no-storage so the keyless demo path is unchanged) and
`saveCurrentUser(profile)` — validated, throws on invalid. Storage key
`pmp.currentUser.v1`. Frozen contracts untouched.

## Scope
Phase 1 of the spec (docs/superpowers/specs/2026-07-12-us1-profile-form-design.md):
asks the 8 scoring inputs + city & breed; age/lookingFor carry forward until
Phase 2 (preview card, remaining fields, polish pass).

## Testing
- Vitest: current-user round-trip, corrupt/invalid fallback, SSR guard
- `bun run verify` green
- Manual: fill → save → refresh persists; validation errors inline; keyboard pass

Fixes PMP-10

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 2: Update the Linear ticket**

No Linear access from this agent → per AGENTS.md, don't block: the PR title
carries the ticket id and the description says `Fixes PMP-10`. Ask a teammate
(or their agent) to move PMP-10 → **In Review** with the PR URL attached, or do
it in the Linear app.

---

## Self-review notes

- **Spec coverage:** 10 asked fields ✓ (Task 3), defaults carried forward ✓ (onSubmit), zod validation with friendly messages ✓, ≥1 tag rule ✓ (form schema, deliberately stricter than the frozen schema), localStorage module + key + corrupt fallback ✓ (Task 1), save → confirmation → CTA ✓, design-system composition ✓ (PageShell/TraitChip/shadcn, no design-owned files touched), tests ✓ (Task 1 + Task 5 verify), out-of-scope respected ✓ (no `data/types.ts`, `data/schemas.ts`, Slice B/C edits).
- **Deviation from spec, deliberate:** spec said "age default 30"; the plan carries forward the stored/seed age (29) instead — strictly better (preserves data on edit) and still schema-valid. Noted in the form comment.
- **Type consistency:** `getCurrentUser`/`saveCurrentUser`/`CURRENT_USER_STORAGE_KEY` names match across Tasks 1 and 3; `TagInput` props (`id/value/onChange/tone/placeholder/suggestions`) match between Tasks 2 and 3; energy handled as literal-union throughout (no casts).
