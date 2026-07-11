# Claude Code — repo setup prompt (Puppy Meets People)

Open a terminal, `cd` into the repo folder, run `claude`, then paste the entire
fenced block below.

---

```
# ROLE
You are scaffolding a weekend-hackathon web app. Work in the current directory.
Read the referenced docs BEFORE writing any code, and treat them as the source
of truth. Ask me nothing you can answer from the docs — just build.

# PRODUCT
Name (display):   Puppy Meets People
Name (package):   puppy-meets-people
One-liner:        The dating app where your dog swipes too.
What it is:       A dating app for single dog owners that matches on BOTH human
                  compatibility AND dog compatibility, and explains WHY you matched.

# READ THESE FIRST (source of truth — do not contradict them)
- docs/BRD-PRD.md   Business + product requirements. Note especially:
                    §1.6 scope boundary, §2.3 MoSCoW feature list (build MUST-haves
                    only), and §2.4 the four user stories US-1..US-4.
- docs/TRD.md       Technical requirements. Note especially:
                    §2 architecture, §3 data models, §4 API contract, §5 AI spec,
                    §6 folder structure, §8 the THREE VERTICAL SLICES (A/B/C).
- data/types.ts     The FROZEN type contracts (Profile, Human, Dog, MatchResult,
                    ScoreMatch, ScoreAll). DO NOT change any field name or type.
                    If code doesn't compile, fix the code — never weaken this file.
(The docs use the old working name "PawPair" in places — it is the SAME product,
now called "Puppy Meets People". Use the new name in all UI copy and metadata.)

# STACK (already decided — do not substitute)
- Bun (runtime + package manager)
- Next.js 15, App Router, TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Vercel AI SDK (`ai`) + OpenAI provider (`@ai-sdk/openai`), model: gpt-4o-mini
- Zod, react-hook-form + @hookform/resolvers, lucide-react

# TASKS (in order)

1. SCAFFOLD (the dir already has docs/ and data/ — never delete or overwrite them).
   create-next-app needs an empty dir, so scaffold into a temp folder and merge up:
     bunx --bun create-next-app@latest .scaffold --typescript --tailwind --app \
       --no-src-dir --import-alias "@/*" --use-bun --yes
     rsync -a .scaffold/ ./ && rm -rf .scaffold
   Then confirm docs/ and data/types.ts still exist. Set the package.json "name"
   field to "puppy-meets-people".

2. COMPONENTS: init shadcn/ui and add:
     button card form input select textarea badge avatar dialog skeleton slider

3. DEPENDENCIES:
     bun add ai @ai-sdk/openai zod react-hook-form @hookform/resolvers lucide-react

4. SHARED FOUNDATION (TRD §8.0 — this is the connective tissue for all slices):
   - data/schemas.ts: Zod schemas that mirror data/types.ts EXACTLY (Profile, Human,
     Dog, MatchResult) so generateObject() can validate model output against them.
   - Set up a simple Tailwind theme (warm, friendly palette) + shared layout/nav.
   - app/layout.tsx metadata: title "Puppy Meets People".

5. BUILD THE FOLDER STRUCTURE from TRD §6 as WORKING code where specified, and as
   clearly-labeled stubs elsewhere. Label every stub with a comment marking which
   vertical slice (A / B / C) and which user story it belongs to, so each teammate
   can find their work:

     app/(marketing)/page.tsx        # SLICE C — landing page. Hero + one-liner +
                                     #   problem + 3-step how-it-works + differentiator
                                     #   ("your dog swipes too") + CTA → /app
     app/app/page.tsx                # SLICE B (US-2/US-3) — Discover: ranked candidates
     app/app/profile/page.tsx        # SLICE A (US-1) — human + dog profile form
     app/app/match/[id]/page.tsx     # SLICE C (US-4) — match confirmation + breakdown
     app/actions.ts                  # server actions: scoreMatch / scoreAll (typed
                                     #   per data/types.ts ScoreMatch / ScoreAll)
     lib/ai.ts                       # SLICE B — IMPLEMENT: generateObject wrapper +
                                     #   buildPrompt(user, candidate) per TRD §5.1/§5.2
     lib/fallback-score.ts           # SLICE B — IMPLEMENT: deterministic fallback
                                     #   scorer per TRD §5.3 (energy delta, interest &
                                     #   activity overlap, dog size/energy fit)
     data/profiles.ts                # ~12 believable seeded dog-owner profiles
     data/seeded-matches.ts          # pre-generated MatchResults for demo safety
     components/profile-form.tsx     # SLICE A
     components/candidate-card.tsx   # SLICE B — score + reason chips + explanation
     components/match-breakdown.tsx  # SLICE C — full human/dog breakdown

   Fully IMPLEMENT: lib/ai.ts, lib/fallback-score.ts, data/schemas.ts, data/profiles.ts,
   app/actions.ts. The three server actions must call the AI with a graceful fallback
   to lib/fallback-score.ts when OPENAI_API_KEY is missing or the call throws, so the
   UI never breaks (TRD §2.3). Leave the three page components as minimal working stubs
   with the slice/US labels above.

6. ENV: create .env.local containing `OPENAI_API_KEY=` and add .env.local to .gitignore.

7. VERIFY: run `bun run build`. Fix all type errors — but NEVER by editing
   data/types.ts. The contract is frozen.

8. COMMIT: `git init` and make ONE commit:
     "chore: scaffold Puppy Meets People + frozen contracts + slice stubs"
   Do NOT create a GitHub remote — I'll do that myself.

# OUTPUT WHEN DONE
Print a short handoff: for each teammate (Slice A / Slice B / Slice C), the files
they own and the exact next step, referencing the user stories in docs/BRD-PRD.md §2.4.
```
