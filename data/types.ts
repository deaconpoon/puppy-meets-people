// ============================================================================
// Puppy Meets People — SHARED TYPE CONTRACTS
// The seam between all three slices. Profile flows A → B; a liked candidate
// flows B → C. Changing a field is a TEAM decision (AGENTS.md §2): update
// data/schemas.ts and tests/schemas.test.ts together and flag the team.
// ============================================================================

/** A dog owner's dog. */
export type Dog = {
  name: string;
  breed: string;
  size: "small" | "medium" | "large";
  /** Activity level, 1 (couch potato) – 5 (never stops). */
  energy: 1 | 2 | 3 | 4 | 5;
  temperament: string[];
  favoriteActivity: string;
};

/** When the owner typically walks their dog(s). */
export type WalkTime = "morning" | "afternoon" | "evening" | "night";

/** The human dog owner. */
export type Human = {
  name: string;
  age: number;
  city: string;
  interests: string[];
  lookingFor: string;
  /** Coarse location for proximity scoring. */
  location: { lat: number; lng: number };
  /** Owner's walking routine — drives the "both walk after work" signal. */
  walkTimes: WalkTime[];
};

/** A complete profile: one human + their dog(s). The unit of matching. */
export type Profile = {
  id: string;
  human: Human;
  dogs: Dog[];
  photoUrl?: string;
};

/** Which half of the match a signal is about. */
export type Facet = "human" | "dog";

/** One reason a match fits (✔) or warrants caution (⚠). */
export type Signal = {
  facet: Facet;
  kind: "positive" | "caution";
  /** Short chip text, e.g. "Both love hiking" / "Dogs' energy is mismatched". */
  label: string;
};

/** Result of scoring the current user against one candidate. */
export type MatchResult = {
  candidateId: string;
  /** 0–100, computed = 0.6*human + 0.4*dog. */
  combinedScore: number;
  humanScore: number;
  dogScore: number;
  /** 2–4 signed, faceted signals. */
  signals: Signal[];
  /** 1–3 warm sentences — LLM-narrated, templated fallback. */
  explanation: string;
};

/** A candidate profile with its computed match result — the Discover row. */
export type ScoredCandidate = Profile & { match: MatchResult };

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
