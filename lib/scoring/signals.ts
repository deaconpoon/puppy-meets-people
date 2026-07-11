// Turns labeled dimension results into a capped, faceted Signal[].
// A dimension at/above HIGH becomes a ✔ positive; at/below LOW a ⚠ caution.
// We keep the most extreme signals (farthest from the neutral midpoint),
// capped at 4, and guarantee at least 2 by padding with the strongest
// remaining dimensions as positives.

import type { Facet, Signal } from "@/data/types";

const HIGH = 72;
const LOW = 45;
const MID = 60;
const MAX_SIGNALS = 4;
const MIN_SIGNALS = 2;

export type DimensionInput = {
  facet: Facet;
  score: number;
  /** Chip text to show when this dimension is a strength. */
  positive: string;
  /** Chip text to show when this dimension is a concern. */
  caution: string;
};

export function buildSignals(dims: DimensionInput[]): Signal[] {
  const extremity = (d: DimensionInput) => Math.abs(d.score - MID);
  const ranked = [...dims].sort((a, b) => extremity(b) - extremity(a));

  const chosen: Signal[] = [];
  for (const d of ranked) {
    if (chosen.length >= MAX_SIGNALS) break;
    if (d.score >= HIGH) {
      chosen.push({ facet: d.facet, kind: "positive", label: d.positive });
    } else if (d.score <= LOW) {
      chosen.push({ facet: d.facet, kind: "caution", label: d.caution });
    }
  }

  // Guarantee at least MIN_SIGNALS: pad with the strongest remaining dims.
  if (chosen.length < MIN_SIGNALS) {
    const used = new Set(chosen.map((s) => s.label));
    const byStrength = [...dims].sort((a, b) => b.score - a.score);
    for (const d of byStrength) {
      if (chosen.length >= MIN_SIGNALS) break;
      if (!used.has(d.positive)) {
        chosen.push({ facet: d.facet, kind: "positive", label: d.positive });
        used.add(d.positive);
      }
    }
  }

  return chosen.slice(0, MAX_SIGNALS);
}
