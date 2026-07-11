// Pure, deterministic per-dimension scoring functions. No network, no
// randomness. Each returns a 0–100 number (higher = more compatible).

import type { Dog } from "@/data/types";

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Case-insensitive overlap between two tag lists → { score, shared }. */
export function overlap(
  a: string[],
  b: string[],
): { score: number; shared: string[] } {
  const setB = new Set(b.map((x) => x.trim().toLowerCase()));
  const shared = a.filter((x) => setB.has(x.trim().toLowerCase()));
  const denom = Math.max(1, Math.min(a.length, b.length));
  return { score: clamp((shared.length / denom) * 100), shared };
}

/** Human interest overlap. */
export function interestFit(
  a: string[],
  b: string[],
): { score: number; shared: string[] } {
  return overlap(a, b);
}

/** 1–5 energy delta → 100..20. Closer scores higher. */
export function energyFit(a: number, b: number): number {
  return clamp(100 - Math.abs(a - b) * 20);
}

const SIZE_ORDER = { small: 0, medium: 1, large: 2 } as const;

/** Same size 100, one step 70, small↔large 40. */
export function sizeFit(
  a: keyof typeof SIZE_ORDER,
  b: keyof typeof SIZE_ORDER,
): number {
  return clamp(100 - Math.abs(SIZE_ORDER[a] - SIZE_ORDER[b]) * 30);
}

/** Dog temperament overlap → { score, shared }. */
export function temperamentFit(
  a: string[],
  b: string[],
): { score: number; shared: string[] } {
  return overlap(a, b);
}

/** Loose word overlap between favorite activities → 100 if any shared word, else 40. */
export function activityFit(a: string, b: string): number {
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
  const setB = new Set(words(b));
  return words(a).some((w) => setB.has(w)) ? 100 : 40;
}

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Proximity fit: 100 when co-located, decaying ~3 pts/km. Also returns a
 *  rough "minutes apart" for the signal label (city driving ≈ 0.5 km/min). */
export function proximityFit(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): { score: number; km: number; minutes: number } {
  const km = haversineKm(a, b);
  return {
    score: clamp(100 - km * 3),
    km,
    minutes: Math.max(1, Math.round(km * 2)),
  };
}

/** Score one dog pair on the four dog dimensions (weighted). */
export function dogPairScore(a: Dog, b: Dog): number {
  return clamp(
    0.35 * energyFit(a.energy, b.energy) +
      0.3 * sizeFit(a.size, b.size) +
      0.2 * temperamentFit(a.temperament, b.temperament).score +
      0.15 * activityFit(a.favoriteActivity, b.favoriteActivity),
  );
}
