# PawPair — Technical Requirements (TRD)

> Companion to `01_BRD-PRD_PawPair.md`. Implements the Must-have features only.
> Target: two deliverables (landing page + web app) built in a weekend by 3 people.

---

## 1. Tech stack

### 1.1 Your chosen core
| Layer | Choice |
|---|---|
| Runtime / package manager | **Bun** |
| Framework | **Next.js 15 (App Router)** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS** |
| Components | **shadcn/ui** |

### 1.2 Filled-in rest of the stack
| Concern | Choice | Why |
|---|---|---|
| AI SDK | **Vercel AI SDK (`ai` package)** | First-class Next.js support, `generateObject` gives typed structured output, easy provider swap. |
| LLM provider | **OpenAI `gpt-4o-mini`** (default) | Cheap, fast, great at structured JSON. Drop-in alt: Anthropic `claude-haiku` via `@ai-sdk/anthropic`. |
| Schema / validation | **Zod** | Validates form input *and* defines the AI output schema (`generateObject` consumes Zod directly). |
| Forms | **react-hook-form + `@hookform/resolvers/zod`** | Minimal boilerplate, plays well with shadcn form primitives. |
| Icons | **lucide-react** | Ships with shadcn. |
| Data (demo) | **In-memory seed data** in `/data` (TypeScript) + React state | No DB needed for the demo; zero infra risk. |
| State | **React Server Components + minimal client state** (Zustand only if needed) | Keep it simple; the "current user" lives in a client context/store. |
| Persistence (stretch only) | **Supabase (Postgres + auth)** | Only if you have spare time Sunday; NOT on the critical path. |
| Deployment | **Vercel** | One-command deploy, native Next.js, env vars in dashboard. |
| Linting/format | **Biome** (or ESLint + Prettier) | Biome is fast and single-config; optional. |

### 1.3 Environment variables
```
OPENAI_API_KEY=sk-...        # required for live AI calls
# ANTHROPIC_API_KEY=...      # if using the Anthropic provider instead
```
Never commit keys. Put them in `.env.local` and in the Vercel project settings.

---

## 2. Architecture

### 2.1 High-level
Single Next.js app, App Router. Landing page and web app are routes in the same project (fastest for a hackathon — one deploy, shared components).

```
Browser
  └─ Landing page  (/)           → static marketing, CTA → /app
  └─ Web app       (/app/*)       → profile form, discover, match
                                       │
                                       ▼
                        Server Action / Route Handler  (/api/match or app/actions.ts)
                                       │  builds prompt from (user + candidate)
                                       ▼
                        Vercel AI SDK  →  LLM (gpt-4o-mini)
                                       │  returns typed { combinedScore, humanScore, dogScore, reasons[], explanation }
                                       ▼
                                 rendered match card
```

### 2.2 Rendering strategy
- Landing page: static (RSC, no client JS beyond nav).
- Discover: server component fetches/scored candidates; profile form is a client component.
- AI call runs **server-side only** (protects the API key) via a Server Action.

### 2.3 Demo-safety design (critical)
Pre-generate the AI explanation for each seeded candidate **at build/seed time** and store it on the seed object. At demo time, Discover renders instantly from seed data — no live network dependency. Only call the LLM live when the user *edits their own profile* (re-scores against candidates). Provide a deterministic rule-based fallback score if the live call errors, so the UI never breaks on stage.

---

## 3. Data models

```ts
// data/types.ts
export type Dog = {
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
  energy: 1 | 2 | 3 | 4 | 5;
  temperament: string[];        // e.g. ["friendly", "shy", "playful"]
  favoriteActivity: string;     // e.g. "long hikes"
};

export type Human = {
  name: string;
  age: number;
  city: string;
  energy: 1 | 2 | 3 | 4 | 5;    // lifestyle energy
  interests: string[];          // e.g. ["hiking", "coffee", "board games"]
  lookingFor: string;           // short free text
};

export type Profile = {
  id: string;
  human: Human;
  dog: Dog;
  photoUrl?: string;            // static placeholder image for demo
};

// AI output (also the Zod schema — see §5)
export type MatchResult = {
  candidateId: string;
  combinedScore: number;        // 0–100
  humanScore: number;           // 0–100
  dogScore: number;             // 0–100
  reasons: string[];            // 2–4 short chips
  explanation: string;          // 1–3 sentences
};

export type ScoredCandidate = Profile & { match: MatchResult };
```

---

## 4. API / contract

One server action (preferred) or route handler.

**`scoreMatch(user: Profile, candidate: Profile): Promise<MatchResult>`**
- Input: current user profile + one candidate profile.
- Output: `MatchResult` (typed, validated by Zod).
- Behavior: builds a prompt, calls `generateObject`, validates, returns. On error → returns rule-based fallback (see §5.3).

**`scoreAll(user: Profile, candidates: Profile[]): Promise<ScoredCandidate[]>`**
- Maps `scoreMatch` over candidates, sorts by `combinedScore` desc.
- For the demo, candidates come pre-scored from seed; this runs live only after a profile edit.

---

## 5. AI implementation spec

### 5.1 Structured output with the AI SDK
```ts
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const MatchSchema = z.object({
  combinedScore: z.number().min(0).max(100),
  humanScore: z.number().min(0).max(100),
  dogScore: z.number().min(0).max(100),
  reasons: z.array(z.string()).min(2).max(4),
  explanation: z.string(),
});

export async function scoreMatch(user: Profile, candidate: Profile) {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: MatchSchema,
    prompt: buildPrompt(user, candidate),
  });
  return { candidateId: candidate.id, ...object };
}
```

### 5.2 Prompt shape (`buildPrompt`)
System intent: *"You are a compatibility matcher for a dating app for dog owners. Score human-to-human fit and dog-to-dog fit separately, then a combined score weighted 60% human / 40% dog. Be specific and warm. Cite concrete shared traits."* Then inject both profiles as compact JSON. Ask for reasons as short chips and a 1–3 sentence explanation naming specific shared traits (energy match, activity overlap, dog size/temperament fit).

### 5.3 Deterministic fallback (demo insurance)
A pure function that computes a score from overlap: energy delta, interest/activity overlap, dog size & energy compatibility. Returns a `MatchResult` with a templated explanation. Used when the API key is missing or the call throws — guarantees the UI always renders.

### 5.4 Cost/latency
`gpt-4o-mini` is cheap and ~1–2s. Pre-scoring seed candidates once means the live demo makes at most one call (on profile save). Keep a seeded JSON of results committed so even a totally offline demo works.

---

## 6. Folder structure
```
pawpair/
├─ app/
│  ├─ (marketing)/
│  │  └─ page.tsx              # landing page  /
│  ├─ app/
│  │  ├─ page.tsx              # discover      /app
│  │  ├─ profile/page.tsx      # profile form  /app/profile
│  │  └─ match/[id]/page.tsx   # match result  /app/match/:id
│  ├─ actions.ts               # scoreMatch / scoreAll server actions
│  └─ layout.tsx
├─ components/
│  ├─ ui/                      # shadcn components
│  ├─ profile-form.tsx
│  ├─ candidate-card.tsx
│  └─ match-breakdown.tsx
├─ data/
│  ├─ types.ts
│  ├─ profiles.ts              # ~12 seeded candidates
│  └─ seeded-matches.ts        # pre-generated MatchResults (demo safety)
├─ lib/
│  ├─ ai.ts                    # generateObject wrapper + prompt
│  └─ fallback-score.ts        # deterministic fallback
├─ .env.local
└─ package.json
```

---

## 7. Setup commands
```bash
bun create next-app pawpair --typescript --tailwind --app
cd pawpair
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add button card form input select badge avatar
bun add ai @ai-sdk/openai zod react-hook-form @hookform/resolvers
# (alt provider) bun add @ai-sdk/anthropic
bun dev
```

---

## 8. Division of labor — 3 vertical slices

Everyone owns a full **vertical slice** — a real user-facing feature from UI down to data/AI — rather than a horizontal layer. The slices are the three sequential steps of the core flow, mapped to the four user stories in the BRD (§2.4). Because each slice's output is the next slice's input, the handoffs between people are literally the steps of the user journey, and each seam is a frozen type.

### 8.0 Shared foundation — build together, hour one (co-owned)
Before anyone takes a slice, the three build the connective tissue on one screen. This is what keeps vertical slices cohesive:
- **Type contracts** (`data/types.ts`) — `Profile`, `MatchResult`. Frozen (see §3).
- **Design system** — Tailwind theme + base shadcn components. *Owned by Person 3 (designer)* as the visual cohesion anchor; everyone pulls from the same tokens/components, nobody restyles.
- **App shell** — `layout.tsx`, routing, nav.
- **Seed data + Vercel deploy** — a few sample profiles and a green pipeline.

### 8.1 Slice A — Profile · owns **US-1**
> *US-1: create a profile for me and my dog, so matches consider both of us.*
- End to end: profile form UI (react-hook-form + Zod + shadcn) → validation → save `Profile` to shared state → profile preview card.
- **Stack touched:** UI, form logic, data model, state.
- **Owns AC:** all human + dog fields produce a saved `Profile` used for matching.
- **Seam:** *outputs* a `Profile` → consumed by Slice B.

### 8.2 Slice B — Discovery & AI · owns **US-2 + US-3** (heaviest → strongest builder)
> *US-2: see candidates ranked by combined compatibility. US-3: see why we matched (the AI moment).*
- End to end: Discover page → candidate card UI → `lib/ai.ts` (`generateObject` + prompt) + `lib/fallback-score.ts` → ranking → reason chips + AI explanation. Owns demo-safety seeding (`data/seeded-matches.ts`) and API key handling.
- **Stack touched:** UI, AI/backend, data.
- **Owns AC:** candidates sorted high→low by combined score with human/dog sub-scores (US-2); each shows a 1–3 sentence AI explanation citing specific human + dog reasons (US-3).
- **Seam:** *inputs* a `Profile` from Slice A, *outputs* a liked candidate → Slice C.

### 8.3 Slice C — Match & Landing · owns **US-4** + landing page (you, the designer)
> *US-4: like a candidate and see a match confirmation, so the demo has a satisfying payoff.*
- End to end: "it's a match" confirmation with full breakdown (combined + human/dog + explanation) → celebratory match moment → marketing landing page (`/`). Also owns the shared design system and cross-cutting visual consistency across all three slices.
- **Stack touched:** UI, design-heavy, light logic.
- **Owns AC:** liking a candidate opens a match screen showing the full breakdown + explanation (US-4).
- **Seam:** *inputs* a liked candidate from Slice B.

**Balance note:** Slices A and C are lighter than the US-2+US-3 slice, so Persons A and C help integrate the AI piece and build shared components in the back half.

**Shared discipline:** freeze the type contracts in the first hour; work on a branch per slice, merge to `main` every couple hours; a mid-Saturday end-to-end click-through checkpoint; 15-min standups twice a day (done / blocked / need); everyone swarms to integrate + rehearse ~3–4 hrs before the deadline.

---

## 9. Build timeline (weekend)
| When | Milestone |
|---|---|
| **Fri eve** | Repo scaffolded, stack installed, types/contracts frozen, Vercel deploy pipeline live (deploy a hello-world so it's not a Sunday surprise). |
| **Sat AM** | P3 seeds profiles + AI scoring working end-to-end on one candidate. P2 profile form done. P1 landing hero + layout. |
| **Sat PM** | Discover list rendering scored candidates; match screen; landing page content complete. |
| **Sat eve** | Pre-generate seeded matches (demo safety). First full click-through of the core flow. |
| **Sun AM** | Polish states (loading/empty/error), styling pass, test on one outsider, fix demo-breakers only. |
| **Sun midday** | Freeze code. Rehearse the pitch + demo twice. Deploy final. |

---

## 10. Definition of done (demo-ready)
- Landing page live on Vercel with the one-liner + CTA into the app.
- User can create/edit a human+dog profile.
- Discover shows candidates ranked by combined score with human/dog sub-scores.
- Each candidate shows an AI-generated "why you matched" explanation + reason chips.
- Liking a candidate opens a match screen with the full breakdown.
- Works with the live API **and** survives an API failure via the seeded/fallback path.
