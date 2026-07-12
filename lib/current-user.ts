// ============================================================================
// SLICE A (US-1) — Current-user persistence. The Slice A → B seam.
// The profile form saves here; anything needing "who is the current user"
// (e.g. Discover re-scoring) reads getCurrentUser(). Client-side only:
// on the server (or with storage unavailable) it returns the demo seed,
// so the no-network demo path always renders (AGENTS.md rule 4).
// ============================================================================

import { CURRENT_USER } from "@/data/profiles";
import { ProfileSchema } from "@/data/schemas";
import type { Profile } from "@/data/types";

export const CURRENT_USER_STORAGE_KEY = "pmp.currentUser.v1";

/** localStorage if usable, else null (SSR, privacy modes that throw). */
function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * The current user's Profile: the stored one if present and valid,
 * otherwise the seeded demo user. Never throws.
 */
export function getCurrentUser(): Profile {
  const store = storage();
  if (!store) return structuredClone(CURRENT_USER);
  try {
    const raw = store.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return structuredClone(CURRENT_USER);
    const parsed = ProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : structuredClone(CURRENT_USER);
  } catch {
    return structuredClone(CURRENT_USER);
  }
}

/**
 * Validate and persist the current user's Profile.
 * Throws on a schema-invalid profile (callers validate via the form first);
 * silently no-ops when storage is unavailable.
 */
export function saveCurrentUser(profile: Profile): void {
  const validated = ProfileSchema.parse(profile);
  try {
    storage()?.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(validated));
  } catch {
    // Storage full or blocked (private mode) — the form still works this session.
  }
}
