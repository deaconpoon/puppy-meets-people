// ============================================================================
// SLICE B (US-2 / US-3) — Pre-generated MatchResults (TRD §2.3 demo safety).
// These are committed results for CURRENT_USER vs. every candidate so the
// demo renders instantly with zero network dependency. Live AI scoring only
// runs after the user edits their profile (app/actions.ts); if that call
// fails too, lib/fallback-score.ts kicks in. combinedScore = 60% human +
// 40% dog per the frozen contract in data/types.ts.
// ============================================================================

import type { MatchResult } from "./types";

export const SEEDED_MATCHES: MatchResult[] = [
  {
    candidateId: "c1",
    combinedScore: 93,
    humanScore: 92,
    dogScore: 95,
    reasons: [
      "Both live for the trail",
      "Coffee people",
      "High-energy herding dogs",
      "Same dog park stamina",
    ],
    explanation:
      "You and Maya both plan weekends around trailheads and coffee stops, so your calendars already look alike. Biscuit and Juniper are both brilliant, high-drive herders who'd happily log the same ten miles — this is the rare match where all four of you want the exact same Saturday.",
  },
  {
    candidateId: "c2",
    combinedScore: 66,
    humanScore: 72,
    dogScore: 58,
    reasons: [
      "Shared coffee ritual",
      "Homebody-adjacent balance",
      "Gentle size gap",
    ],
    explanation:
      "You and Daniel would bond fast over coffee, and his homemade-dinner energy is a cozy counterweight to your trail days. Mochi's mellow fetch sessions run slower than Biscuit's pace, but a goofy Corgi is a hard playmate to refuse.",
  },
  {
    candidateId: "c3",
    combinedScore: 83,
    humanScore: 84,
    dogScore: 82,
    reasons: [
      "Live music + hiking overlap",
      "Big weekend energy",
      "Athletic dogs",
    ],
    explanation:
      "Priya's sunrise-runs-and-shows lifestyle lines up almost beat-for-beat with your hiking and live music habits. Bolt is an athlete like Biscuit, and a Vizsla who trail-runs would keep an Aussie honest on any climb.",
  },
  {
    candidateId: "c4",
    combinedScore: 44,
    humanScore: 46,
    dogScore: 40,
    reasons: ["Opposite paces", "Calm counterbalance"],
    explanation:
      "Sam's quiet-nights world moves at a much slower speed than your trail-and-show weekends. Willow is a sweet, sleepy Greyhound, but she'd rather sunbathe than keep up with Biscuit — this one's a stretch.",
  },
  {
    candidateId: "c5",
    combinedScore: 79,
    humanScore: 80,
    dogScore: 78,
    reasons: [
      "Coffee + outdoors overlap",
      "Matched lifestyle energy",
      "Adventure-ready dogs",
    ],
    explanation:
      "You and Jordan share the coffee-fueled outdoor gene, and van-camping weekends slot neatly next to your hiking habit. Scout the Heeler and Biscuit are both smart, driven herding types who'd thrive on the same campsite chaos.",
  },
  {
    candidateId: "c6",
    combinedScore: 67,
    humanScore: 70,
    dogScore: 62,
    reasons: [
      "Hiking in common",
      "Trail day, pastry morning",
      "Easygoing Golden",
    ],
    explanation:
      "Elena hikes too, and her yoga-and-baking rhythm would mellow your week in a good way. Pancake is friendlier than he is fast — he'd let Biscuit set the pace and love every minute.",
  },
  {
    candidateId: "c7",
    combinedScore: 72,
    humanScore: 74,
    dogScore: 70,
    reasons: [
      "Live music buddies",
      "Big engine lifestyles",
      "High-energy large dogs",
    ],
    explanation:
      "You and Marcus would burn through a concert calendar together, and his cycling keeps pace with your energy. Ziggy the Dalmatian matches Biscuit's motor, though his run-with-bikes obsession is a different sport than your long hikes.",
  },
  {
    candidateId: "c8",
    combinedScore: 51,
    humanScore: 60,
    dogScore: 38,
    reasons: ["Coffee shop overlap", "Very different dog speeds"],
    explanation:
      "Grace's café-and-galleries pace shares a coffee habit with you but not much trail time. Clementine is a lap dog through and through — Biscuit would lap her three times before she finished a patio nap.",
  },
  {
    candidateId: "c9",
    combinedScore: 58,
    humanScore: 66,
    dogScore: 46,
    reasons: ["Hiking + board games", "Slow-and-steady Bernese"],
    explanation:
      "Tom hikes and hosts board game nights, which covers a surprising amount of your list. Gandalf the Bernese prefers slow forest ambles to Biscuit's all-day pace, so the dogs would need to meet in the middle.",
  },
  {
    candidateId: "c10",
    combinedScore: 88,
    humanScore: 86,
    dogScore: 90,
    reasons: [
      "Early-riser trail people",
      "Coffee before miles",
      "Both dogs love long hikes",
      "Medium herders, same speed",
    ],
    explanation:
      "You and Nina are the same species of early riser — trails first, coffee always, podcasts on the drive. Pepper and Biscuit are both medium-sized herding dynamos whose shared favorite activity is literally long hikes; the four of you could leave for a summit tomorrow.",
  },
  {
    candidateId: "c11",
    combinedScore: 46,
    humanScore: 44,
    dogScore: 50,
    reasons: ["Opposite weekend speeds", "Independent Shiba energy"],
    explanation:
      "Leo's slow-mornings-and-vinyl life is the inverse of your out-the-door energy. Miso is charmingly dramatic but famously does his own thing — Biscuit's invitation to play would probably get a polite Shiba decline.",
  },
  {
    candidateId: "c12",
    combinedScore: 76,
    humanScore: 78,
    dogScore: 74,
    reasons: [
      "Hiking + photography",
      "Weekend adventurers",
      "Water-loving Lab",
    ],
    explanation:
      "Harper packs the same weekend bag you do — trails, a kayak, and a camera. Sable's happy-go-lucky Lab energy runs just a notch below Biscuit's, and a swimming stop mid-hike sounds like both dogs' perfect day.",
  },
];

/** Lookup for Discover and the match screen. */
export function getSeededMatch(candidateId: string): MatchResult | undefined {
  return SEEDED_MATCHES.find((m) => m.candidateId === candidateId);
}
