---
name: verify
description: Run the full quality gate (format check, lint, typecheck, test, build) and summarize the results. Use before opening a PR, after finishing a feature, or when the user asks "does everything pass?".
---

# Verify

Run the repo's full quality gate and report results clearly.

## Steps

1. Ensure Node ≥ 20.12 is active (Vitest 4 needs it). If `node -v` shows < 20.12, prefix commands with the nvm Node 24 bin, e.g. `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"` or run `nvm use` (reads `.nvmrc`).
2. Run each gate separately so failures are attributable:
   - `bun run format:check` (fix with `bun run format`)
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test`
   - `bun run build`
3. Report a one-line pass/fail per gate. For failures, quote the specific error and the file:line, then fix and re-run only the failed gate.

## Rules

- If `tests/schemas.test.ts` fails, the shared seam has drifted: `data/types.ts` and `data/schemas.ts` must agree. Either can be the one to change — but changing the seam is a team decision, so if the fix isn't an obvious sync-up, flag it instead of silently picking a side.
- A build that only passes with `OPENAI_API_KEY` set is a bug — the demo must work with no keys at all.
