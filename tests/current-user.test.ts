// Slice A seam: lib/current-user.ts persists the current user's Profile to
// localStorage and is the ONE read path for "who is the current user".
// Vitest runs in a node environment — localStorage is stubbed per test.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CURRENT_USER } from "@/data/profiles";
import type { Profile } from "@/data/types";
import {
  CURRENT_USER_STORAGE_KEY,
  getCurrentUser,
  saveCurrentUser,
} from "@/lib/current-user";

/** Minimal in-memory Storage implementation for the node test env. */
function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => void map.delete(k),
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

const editedProfile: Profile = {
  id: "me",
  human: {
    name: "Kelvin",
    age: 29,
    city: "Vancouver",
    energy: 3,
    interests: ["bouldering", "coffee"],
    lookingFor: "Someone to split trail miles and lazy Sunday espressos with.",
  },
  dog: {
    name: "Mochi",
    breed: "Shiba Inu",
    size: "small",
    energy: 4,
    temperament: ["independent", "curious"],
    favoriteActivity: "park zoomies",
  },
};

describe("current-user persistence (Slice A → B seam)", () => {
  beforeEach(() => {
    const store = makeStorage();
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal("window", { localStorage: store });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the seeded CURRENT_USER when nothing is stored", () => {
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("round-trips a saved profile", () => {
    saveCurrentUser(editedProfile);
    expect(getCurrentUser()).toEqual(editedProfile);
  });

  it("round-trips a profile with the optional photoUrl intact", () => {
    const withPhoto: Profile = {
      ...editedProfile,
      photoUrl: "/profiles/me.jpg",
    };
    saveCurrentUser(withPhoto);
    expect(getCurrentUser()).toEqual(withPhoto);
  });

  it("falls back to the seed on corrupt JSON (never crashes)", () => {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, "{not json!!");
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("falls back to the seed on schema-invalid stored data", () => {
    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify({ id: "me", human: { name: "" }, dog: {} }),
    );
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("refuses to store a schema-invalid profile", () => {
    const bad = {
      ...editedProfile,
      human: { ...editedProfile.human, name: "" },
    } as Profile;
    expect(() => saveCurrentUser(bad)).toThrow();
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("degrades gracefully when setItem throws (private mode / quota)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        ...makeStorage(),
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    expect(() => saveCurrentUser(editedProfile)).not.toThrow();
    expect(getCurrentUser()).toEqual(CURRENT_USER);
  });

  it("degrades gracefully when localStorage is unavailable (SSR)", () => {
    vi.unstubAllGlobals();
    expect(getCurrentUser()).toEqual(CURRENT_USER);
    expect(() => saveCurrentUser(editedProfile)).not.toThrow();
  });
});
