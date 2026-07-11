# Puppy Meets People

**The dating app where your dog swipes too.** Matches single dog owners on human compatibility _and_ dog compatibility — and explains why you matched.

## Getting started

```bash
nvm use           # reads .nvmrc → Node 24 (Next.js 16 needs >= 20, Vitest >= 20.12)
bun install
bun run dev       # http://localhost:3000
```

Optional: `cp .env.example .env.local` and paste an OpenAI key for live AI scoring. Without a key the app falls back to seeded matches + a deterministic scorer, so the demo always works.

## Working on the repo

```bash
bun run verify        # lint + typecheck + test + build — run before every PR
bun run test:watch    # Vitest in watch mode
bun run format        # Prettier
```

- **Branch → PR → merge.** Don't push to `main` directly. CI (GitHub Actions) runs the same gates as `bun run verify` on every PR, and Vercel posts a preview URL.
- **Agent-friendly:** `AGENTS.md` is the shared context for coding agents (Claude Code, Cursor, etc.) — working agreements and orientation live there. Claude Code users also get a `/verify` project skill.
- `data/types.ts` and `data/schemas.ts` are the **shared seam** between slices — a test fails if they drift apart. Changing them is fine, but do it deliberately: update both + tests together and tell the team.

## Deploys (Vercel Git integration — one-time setup)

Whoever owns the Vercel project (suggest: Nelson, since he owns the GitHub repo):

1. [vercel.com/new](https://vercel.com/new) → Import `nchchow/puppy-meets-people` (framework auto-detects Next.js; Bun is auto-detected from `bun.lock`).
2. Skip environment variables — `OPENAI_API_KEY` is optional; add it later in Project → Settings → Environment Variables if we want live AI scoring in production.
3. Done. From then on: every PR gets a preview URL as a PR comment; merging to `main` deploys production.

## Docs

- `docs/BRD-PRD.md` — the problem, scope boundary, and solution-agnostic user stories **US-1..US-12** (each tagged with its slice A/B/C). This is the source of truth for _what_ to build; the _how_ is each slice owner's call.
- `docs/TRD.md` — reference notes on the current scaffold's architecture, not a mandate.
- The code on `main` is a working end-to-end scaffold. Treat it as a starting point — don't infer design or backend direction from it.
