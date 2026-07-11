// ============================================================================
// SHARED FOUNDATION (TRD §8.0) — Zod schemas mirroring data/types.ts 1:1.
// data/types.ts is the FROZEN contract; these schemas must never drift from it.
// The `satisfies`/type annotations below make the compiler enforce the mirror:
// if a schema stops matching its type, `bun run build` fails here — fix the
// schema, never types.ts.
// ============================================================================

import { z } from "zod";
import type { Dog, Human, MatchResult, Profile } from "./types";

const energyLevel = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const DogSchema: z.ZodType<Dog> = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  size: z.enum(["small", "medium", "large"]),
  energy: energyLevel,
  temperament: z.array(z.string()),
  favoriteActivity: z.string().min(1),
});

export const HumanSchema: z.ZodType<Human> = z.object({
  name: z.string().min(1),
  age: z.number().int().min(18).max(120),
  city: z.string().min(1),
  energy: energyLevel,
  interests: z.array(z.string()),
  lookingFor: z.string().min(1),
});

export const ProfileSchema: z.ZodType<Profile> = z.object({
  id: z.string().min(1),
  human: HumanSchema,
  dog: DogSchema,
  photoUrl: z.string().optional(),
});

/**
 * AI output schema (TRD §5.1). The model returns the scores/reasons/explanation;
 * `candidateId` is stamped on afterwards by scoreMatch, so it is NOT part of
 * what generateObject validates.
 */
export const MatchScoreSchema = z.object({
  combinedScore: z.number().min(0).max(100),
  humanScore: z.number().min(0).max(100),
  dogScore: z.number().min(0).max(100),
  reasons: z.array(z.string()).min(2).max(4),
  explanation: z.string(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

/** Full MatchResult schema — mirrors the frozen MatchResult type exactly. */
export const MatchResultSchema: z.ZodType<MatchResult> = MatchScoreSchema.extend(
  {
    candidateId: z.string().min(1),
  },
);
