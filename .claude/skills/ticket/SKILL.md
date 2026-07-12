---
name: ticket
description: Create or update a Linear ticket with this team's conventions (right team, project, labels, status). Use when the user says "make a ticket", "track this", "log this in Linear", or when new work is discovered mid-task that shouldn't expand the current story's scope.
---

# Ticket

Create or update a Linear issue the team way. Full conventions live in `AGENTS.md` § Tickets (Linear) — this skill encodes the mechanics.

## Constants

- **Team id**: `82c07b16-b798-4e86-a451-3cb8b6821b02` — always use the id; the team's display name gets renamed and name lookups fail.
- **Project**: `Puppy Meets People — Hackathon MVP`
- **Labels** (pick one): `slice-A` (Profile) · `slice-B` (Discovery & AI) · `slice-C` (Match & Landing) · `process` · `design`
- **Statuses**: Backlog · Todo · In Progress · In Review · Done

## Creating a ticket

1. Check it doesn't already exist (`list_issues` with a `query` on the title keywords).
2. Create with: team id above, the project, exactly one label, and:
   - **Discovered-mid-task work**: status Todo, unassigned, priority Medium — someone grabs it later.
   - **Work the user is about to start**: status In Progress, assignee `me`.
3. Title: outcome-focused, no implementation detail. Description: 1–3 sentences of *what and why*. For user-story-adjacent work keep it solution-agnostic — outcomes, not screens/fields/formats (see AGENTS.md: the scaffold is not direction).
4. Report back the identifier, URL, and Linear's suggested `gitBranchName` (the user needs it for their branch).

## Updating

- Starting work → status In Progress + assignee.
- PR opened → status In Review, add the PR URL (comment or link attachment).
- Merged → Done.

## If Linear is unreachable

Don't block the work. Output the would-be ticket (title, description, label, status) as a copy-pasteable block, and tell the user to paste it into Linear or have a teammate's agent file it.
