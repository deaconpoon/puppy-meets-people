<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Puppy Meets People — agent context

**The dating app where your dog swipes too.** A weekend-hackathon web app for three collaborators, built largely with coding agents. This file covers _how we work_; the product docs cover _what we're building_; the _how to build it_ is deliberately left open.

## Start here

- `docs/BRD-PRD.md` — the problem, scope boundary (§1.6), and user stories **US-1..US-12** (§2.4). The stories are **solution-agnostic on purpose**: they define user outcomes, not screens, fields, or formats. The slice owner decides the how.
- `docs/TRD.md` — describes the architecture of the _current scaffold_. Treat it as a reference for what exists, not a mandate for what must be.

**The existing code is scaffolding, not direction.** The landing page copy, the type shapes, the scoring approach — all of it was generated to get us moving and is fair game to reshape. Don't infer design, data-model, or backend decisions from it; infer them from the user stories and the team.

## Working agreements

1. **Branch → PR → merge.** Never push to `main` directly. `bun run verify` (lint + typecheck + test + build) must be green before you open a PR — CI runs the same gates.
2. **Shared seams are team decisions.** `data/types.ts` and `data/schemas.ts` are used by every slice, and a test keeps them in sync. You _can_ change them — but update types, schemas, and tests together, and flag the change to the team (PR description + the team channel) so nobody builds against a stale shape.
3. **Stay in the story you're working on.** Don't drive-by refactor another slice's files; if your work seems to need it, surface that instead of doing it.
4. **The demo must never break.** The app currently works with no `OPENAI_API_KEY` (deterministic fallback + seeded data). Whatever you change, keep a no-secrets, no-network path that renders. CI builds without any keys to enforce this.
5. **No secrets in the repo.** Keys go in `.env.local` (gitignored); `.env.example` documents what exists.

## Commands

Requires Node ≥ 20.12 (`nvm use` picks up `.nvmrc` → Node 24) and Bun.

```bash
bun install          # deps
bun run dev          # dev server → http://localhost:3000
bun run verify       # lint + typecheck + test + build (run before every PR)
bun run test:watch   # Vitest in watch mode
bun run format       # Prettier (write)
```

CI (GitHub Actions) runs lint, typecheck, test, and build on every PR — same as `bun run verify`. Deploys are automatic via Vercel Git integration: PRs get preview URLs, `main` goes to production.

## Slices

Work is split into three vertical slices; each user story in `docs/BRD-PRD.md` §2.4 is tagged with its slice (A — Profile, B — Discovery & AI, C — Match & Landing; C is Deacon's, A/B split between Nelson and Kelvin is TBD). The stories, not the current files, define each slice's scope — check the docs rather than assuming a file layout.

## What exists right now (orientation, not prescription)

A working end-to-end scaffold: `/` landing → `/app` discover → `/app/profile` → `/app/match/[id]`, with server actions in `app/actions.ts`, AI scoring in `lib/ai.ts` (Vercel AI SDK `generateObject`), a deterministic fallback in `lib/fallback-score.ts`, and seeded profiles in `data/`. Skim `git log` and the files themselves for the current state — this section will go stale.

## Conventions

- TypeScript strict; Zod for anything crossing a boundary (forms, AI output).
- shadcn/ui components live in `components/ui/` — generated code, don't hand-edit or reformat; add new ones with `bunx shadcn@latest add <name>`.
- Prettier formats everything else (`bun run format`); CI checks it.
- UI copy uses the name "Puppy Meets People" (old docs say "PawPair" — same product, new name).
- Accessibility baseline: semantic HTML, labels on form fields, keyboard navigable, contrast ≥ 4.5:1.

## Project skills (Claude Code)

- `/verify` — run the full quality gate and summarize failures.
