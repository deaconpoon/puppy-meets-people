// ============================================================================
// Zod schemas mirroring data/types.ts 1:1. Keep in sync (AGENTS.md §2).
// The LLM now returns ONLY the explanation; scores + signals are computed,
// so MatchScoreSchema shrinks to { explanation }.
// ============================================================================

import { z } from "zod";
import type { Dog, Human, MatchResult, Profile, Signal } from "./types";

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
  interests: z.array(z.string()),
  lookingFor: z.string().min(1),
  location: z.object({ lat: z.number(), lng: z.number() }),
  walkTimes: z.array(z.enum(["morning", "afternoon", "evening", "night"])),
});

export const ProfileSchema: z.ZodType<Profile> = z.object({
  id: z.string().min(1),
  human: HumanSchema,
  dogs: z.array(DogSchema).min(1),
  photoUrl: z.string().optional(),
});

export const SignalSchema: z.ZodType<Signal> = z.object({
  facet: z.enum(["human", "dog"]),
  kind: z.enum(["positive", "caution"]),
  label: z.string().min(1),
});

/** AI output schema: the model returns ONLY the explanation prose. */
export const MatchScoreSchema = z.object({
  explanation: z.string().min(1),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

/** Full MatchResult schema — mirrors the frozen MatchResult type exactly. */
export const MatchResultSchema: z.ZodType<MatchResult> = z.object({
  candidateId: z.string().min(1),
  combinedScore: z.number().min(0).max(100),
  humanScore: z.number().min(0).max(100),
  dogScore: z.number().min(0).max(100),
  signals: z.array(SignalSchema).min(2).max(4),
  explanation: z.string().min(1),
});
