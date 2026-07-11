// ============================================================================
// Puppy Meets People — FROZEN TYPE CONTRACTS
// ----------------------------------------------------------------------------
// This file is the shared contract between all three vertical slices.
// Profile flows Slice A → Slice B. A liked candidate flows Slice B → Slice C.
// Do NOT change a field name or type without telling the whole team — every
// slice is built against these shapes. Treat this as a design system for data.
// ============================================================================

/** A dog owner's dog. */
export type Dog = {
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
  /** Activity level, 1 (couch potato) – 5 (never stops). */
  energy: 1 | 2 | 3 | 4 | 5;
  /** Free-form personality tags, e.g. ["friendly", "shy", "playful"]. */
  temperament: string[];
  /** e.g. "long hikes", "naps in the sun", "fetch at the park". */
  favoriteActivity: string;
};

/** The human dog owner. */
export type Human = {
  name: string;
  age: number;
  city: string;
  /** Lifestyle energy, 1 (homebody) – 5 (always out). */
  energy: 1 | 2 | 3 | 4 | 5;
  /** e.g. ["hiking", "coffee", "board games"]. */
  interests: string[];
  /** Short free text: what they're looking for. */
  lookingFor: string;
};

/** A complete profile: one human + their dog. The unit of matching. */
export type Profile = {
  id: string;
  human: Human;
  dog: Dog;
  /** Static placeholder image path for the demo, e.g. "/profiles/ava.jpg". */
  photoUrl?: string;
};

// ----------------------------------------------------------------------------
// AI OUTPUT CONTRACT
// The scoring function returns exactly this shape. Slice B produces it,
// Slice C's match screen and Slice B's cards both render it.
// A matching Zod schema (data/schemas.ts) should mirror this 1:1 so the AI
// SDK's generateObject() can validate model output against it.
// ----------------------------------------------------------------------------

/** Result of scoring the current user against one candidate. */
export type MatchResult = {
  candidateId: string;
  /** 0–100, weighted 60% human / 40% dog (see TRD §5.2). */
  combinedScore: number;
  /** 0–100, human-to-human fit. */
  humanScore: number;
  /** 0–100, dog-to-dog fit. */
  dogScore: number;
  /** 2–4 short chips, e.g. ["Both high-energy dogs", "Both love hiking"]. */
  reasons: string[];
  /** 1–3 warm, specific sentences naming concrete shared traits. */
  explanation: string;
};

/** A candidate profile with its computed match result — the Discover row. */
export type ScoredCandidate = Profile & { match: MatchResult };

// ----------------------------------------------------------------------------
// FUNCTION CONTRACT (the seam between Slice A → B → C)
// Slice B implements these. Slices A and C call them. Signatures are frozen.
// ----------------------------------------------------------------------------

/** Score the current user against a single candidate. */
export type ScoreMatch = (
  user: Profile,
  candidate: Profile,
) => Promise<MatchResult>;

/** Score & rank the current user against all candidates (high → low). */
export type ScoreAll = (
  user: Profile,
  candidates: Profile[],
) => Promise<ScoredCandidate[]>;
