---
name: pr
description: Open a pull request the team way — quality gate green, branch pushed, PR from the template, Linear ticket moved to In Review with the PR link. Use when the user says "open a PR", "ship this", or has finished a change on a branch.
---

# PR

Take the current branch from "code works" to "PR open, board updated". One command for the whole flow so nothing gets forgotten.

## Steps

1. **Never from `main`.** If on `main` with changes, create a branch first — use the Linear issue's suggested branch name (e.g. `yourname/pmp-13-us-4-act-on-a-match`). Identify the ticket: from the branch name (`pmp-NN`), or ask.
2. **Gate**: run `/verify` (lint + typecheck + test + build). Don't open the PR until it's green. Remember the demo-safety rule: everything must pass with no `.env.local` / no API keys.
3. **Push** the branch and open the PR with `gh pr create`, filling `.github/PULL_REQUEST_TEMPLATE.md` for the body:
   - Title: `PMP-NN: <what changed>`.
   - Body includes `Fixes PMP-NN`, honest checklist state, and — if `data/types.ts` or `data/schemas.ts` changed — a loud callout in "Notes for the team".
4. **Update Linear** (team id `82c07b16-b798-4e86-a451-3cb8b6821b02`): move PMP-NN to **In Review**, attach the PR URL. If Linear is unreachable, say so and continue — the PR is the source of truth.
5. **Report**: PR URL, Vercel preview URL if the bot has posted it, and anything the team should know.

## After merge

If asked to merge (or the PR auto-merges): confirm CI was green, then move the ticket to **Done**. Head branches auto-delete on merge if the repo setting is on; otherwise clean up.
