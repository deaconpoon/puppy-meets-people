# Design system — Puppy Meets People

The shared visual foundation for all three slices (TES-27). It's a **lego box,
not a layout guide**: it gives you tokens, gradients, type, and a few pattern
components — how you compose your slice's screens is yours.

**Live reference:** run the app and open [`/design`](http://localhost:3000/design).
**Approved preview:** the direction was signed off against a rendered mock on
2026-07-11 (coral/honey/teal on cream, Waterllama-warmth but minimal).

## Ownership

The design track (Deacon) owns `app/globals.css`, `app/layout.tsx`,
`components/patterns/**`, `app/design/**`, and this file. Anyone can *use*
everything here; changes to those files route through design review (mention
in PR + team channel).

## Palette

Three brand hues + warm neutrals. Light mode only — by decision, not omission.

| Token | Base | Role |
| --- | --- | --- |
| `coral-*` | `#FF6B5E` | Primary. CTAs, links, human-side accents. |
| `honey-*` | `#FFB648` | Secondary. Dog-side accents, celebration, badges. |
| `teal-*` | `#2EC4B6` | Sparse accent. Logistics, informational touches — use sparingly. |
| `cream` | `#FFF9F2` | Page background (`bg-background`). |
| `ink` | `#3D3733` | Text (`text-foreground`). |

Each hue has a ramp (`coral-50` … `coral-800`) defined in `app/globals.css`.
Tailwind utilities work directly: `bg-coral-50`, `text-honey-800`, etc.

Prefer the **semantic shadcn tokens** (`bg-primary`, `bg-accent`,
`text-muted-foreground`, `border`) for structure, and reach for raw hue
utilities only when the hue itself is the point (icon chips, TraitChips,
score dots).

## Gradients

Exactly three, as utility classes. Don't invent new ones.

| Class | Recipe | Use for |
| --- | --- | --- |
| `gradient-sunrise` | coral→honey | Brand mark, celebration moments. White text at large/bold sizes only. |
| `gradient-sky` | teal→cream | Calm informational surfaces. Ink text. |
| `gradient-blush` | coral-50→cream | Page-level washes (heroes, panels). Ink text. |

## Type

- **Display — Baloo 2** (`font-display`): `h1`–`h4` get it automatically via
  the base layer. Also for scores and the brand wordmark.
- **Body — Figtree** (`font-sans`): everything else, applied globally.

Both load via `next/font/google` in `app/layout.tsx` (self-hosted, no runtime
requests — the no-network demo path still works).

## Contrast (WCAG AA, ≥ 4.5:1 for text)

Checked pairs — safe to use:

- White on `primary` (#C9402F): **4.93** — this is why solid buttons use
  coral-700, not raw coral-500 (white on #FF6B5E is 3.0, fails).
- `ink` on `cream`: 11.2 · `muted-foreground` on cream: 4.57
- `*-800` text on `*-50` tint: coral 6.02 · honey 5.74 · teal 6.48
- `ink` on `honey-500`: 6.71 ✓ — but `ink` on `coral-500` is **4.19, fails**;
  don't put body text directly on raw coral.

## Pattern components (`components/patterns/`)

- **`PageShell`** — standard page container (max-width + padding). Wrap your
  page in it so slices align with the nav.
- **`GradientCard`** — a card washed in one named gradient
  (`gradient="sunrise" | "sky" | "blush"`).
- **`TraitChip`** — profile trait pill (`tone="coral" | "honey" | "teal"`;
  suggested mapping: coral = human, honey = dog, teal = logistics).

shadcn components live in `components/ui/` as usual — add new ones with
`bunx shadcn@latest add <name>`; they pick up the theme automatically.

## Shape & feel

- Radius is generous (`--radius: 1rem`); prefer `rounded-3xl` cards and
  `rounded-full` buttons/pills.
- Content sits on white cards over the cream page; one soft icon chip
  (`bg-<hue>-50 text-<hue>-600`) per card.
- Motion is subtle: hover shadow/translate on cards, nothing autoplaying.

## Illustrated assets (TES-28 — upcoming)

Playful illustrations (dogs wearing accessories, diverse people) generated in
Higgsfield from a locked master style prompt, delivered to `public/assets/`
with prompts recorded in `docs/asset-prompts.md`. Blocked on this foundation —
the style prompt locks to the approved palette above.
