# Puppy Meets People

**The dating app where your dog swipes too.** Matches single dog owners on human compatibility *and* dog compatibility — and explains why you matched.

## Getting started

```bash
nvm use 24        # Next.js 16 needs Node >= 20
bun install
bun run dev       # http://localhost:3000
```

Optional: paste an OpenAI key into `.env.local` (`OPENAI_API_KEY=`) for live AI scoring. Without a key the app falls back to seeded matches + a deterministic scorer, so the demo always works.

## Docs & contracts

- `docs/BRD-PRD.md` — business + product requirements (user stories US-1..US-4)
- `docs/TRD.md` — architecture, AI spec, and the three vertical slices (A/B/C)
- `data/types.ts` — **frozen type contracts.** Never change a field; fix the code instead.

## Who owns what

| Slice | User story | Files |
|---|---|---|
| A — Profile | US-1 | `components/profile-form.tsx`, `app/app/profile/page.tsx` |
| B — Discovery & AI | US-2, US-3 | `lib/ai.ts`, `lib/fallback-score.ts`, `data/seeded-matches.ts`, `app/app/page.tsx`, `components/candidate-card.tsx`, `app/actions.ts` |
| C — Match & Landing | US-4 | `app/(marketing)/page.tsx`, `app/app/match/[id]/page.tsx`, `components/match-breakdown.tsx` |
