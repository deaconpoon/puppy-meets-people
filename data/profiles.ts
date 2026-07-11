// ============================================================================
// SHARED FOUNDATION (TRD §8.0) — Seeded demo data.
// The demo "current user" (no login, BRD §2.2 step 1) + 12 candidates.
// All profiles conform to the frozen Profile contract in data/types.ts.
// ============================================================================

import type { Profile } from "./types";

/** The seeded logged-in user for the demo (BRD §2.2: "lands as a seeded current user"). */
export const CURRENT_USER: Profile = {
  id: "me",
  human: {
    name: "Alex",
    age: 29,
    city: "Seattle",
    energy: 4,
    interests: ["hiking", "coffee", "live music"],
    lookingFor: "Someone to split trail miles and lazy Sunday espressos with.",
  },
  dog: {
    name: "Biscuit",
    breed: "Australian Shepherd",
    size: "medium",
    energy: 5,
    temperament: ["playful", "friendly", "smart"],
    favoriteActivity: "long hikes",
  },
};

/** ~12 believable candidates to match against (BRD §2.3 Must-have). */
export const CANDIDATES: Profile[] = [
  {
    id: "c1",
    human: {
      name: "Maya",
      age: 27,
      city: "Seattle",
      energy: 4,
      interests: ["hiking", "photography", "coffee"],
      lookingFor: "A partner for sunrise trailheads and farmers markets.",
    },
    dog: {
      name: "Juniper",
      breed: "Border Collie",
      size: "medium",
      energy: 5,
      temperament: ["playful", "smart", "focused"],
      favoriteActivity: "long hikes",
    },
  },
  {
    id: "c2",
    human: {
      name: "Daniel",
      age: 31,
      city: "Seattle",
      energy: 3,
      interests: ["cooking", "board games", "coffee"],
      lookingFor: "Someone who thinks a great date is a homemade dinner.",
    },
    dog: {
      name: "Mochi",
      breed: "Corgi",
      size: "small",
      energy: 3,
      temperament: ["friendly", "food-motivated", "goofy"],
      favoriteActivity: "fetch at the park",
    },
  },
  {
    id: "c3",
    human: {
      name: "Priya",
      age: 26,
      city: "Bellevue",
      energy: 5,
      interests: ["running", "hiking", "live music"],
      lookingFor: "A gym-then-brunch person with big weekend energy.",
    },
    dog: {
      name: "Bolt",
      breed: "Vizsla",
      size: "large",
      energy: 5,
      temperament: ["athletic", "affectionate", "playful"],
      favoriteActivity: "trail running",
    },
  },
  {
    id: "c4",
    human: {
      name: "Sam",
      age: 34,
      city: "Seattle",
      energy: 2,
      interests: ["reading", "film", "wine tasting"],
      lookingFor: "Quiet nights, deep talks, and a dog snoring nearby.",
    },
    dog: {
      name: "Willow",
      breed: "Greyhound",
      size: "large",
      energy: 2,
      temperament: ["gentle", "shy", "cuddly"],
      favoriteActivity: "naps in the sun",
    },
  },
  {
    id: "c5",
    human: {
      name: "Jordan",
      age: 28,
      city: "Seattle",
      energy: 4,
      interests: ["climbing", "coffee", "camping"],
      lookingFor: "A belay partner who's down for van weekends.",
    },
    dog: {
      name: "Scout",
      breed: "Blue Heeler",
      size: "medium",
      energy: 4,
      temperament: ["loyal", "smart", "adventurous"],
      favoriteActivity: "camping trips",
    },
  },
  {
    id: "c6",
    human: {
      name: "Elena",
      age: 30,
      city: "Kirkland",
      energy: 3,
      interests: ["yoga", "baking", "hiking"],
      lookingFor: "Someone equal parts trail day and pastry morning.",
    },
    dog: {
      name: "Pancake",
      breed: "Golden Retriever",
      size: "large",
      energy: 3,
      temperament: ["friendly", "patient", "cuddly"],
      favoriteActivity: "swimming",
    },
  },
  {
    id: "c7",
    human: {
      name: "Marcus",
      age: 33,
      city: "Seattle",
      energy: 5,
      interests: ["cycling", "live music", "craft beer"],
      lookingFor: "Show buddy first, bike buddy second, partner always.",
    },
    dog: {
      name: "Ziggy",
      breed: "Dalmatian",
      size: "large",
      energy: 5,
      temperament: ["energetic", "vocal", "friendly"],
      favoriteActivity: "running alongside bikes",
    },
  },
  {
    id: "c8",
    human: {
      name: "Grace",
      age: 25,
      city: "Seattle",
      energy: 3,
      interests: ["painting", "coffee", "thrifting"],
      lookingFor: "Museum dates and dog park people-watching.",
    },
    dog: {
      name: "Clementine",
      breed: "Cavalier King Charles Spaniel",
      size: "small",
      energy: 2,
      temperament: ["sweet", "calm", "lap dog"],
      favoriteActivity: "café patio lounging",
    },
  },
  {
    id: "c9",
    human: {
      name: "Tom",
      age: 36,
      city: "Redmond",
      energy: 3,
      interests: ["board games", "hiking", "cooking"],
      lookingFor: "A co-op partner in games and in life.",
    },
    dog: {
      name: "Gandalf",
      breed: "Bernese Mountain Dog",
      size: "large",
      energy: 2,
      temperament: ["gentle", "patient", "stubborn"],
      favoriteActivity: "slow forest walks",
    },
  },
  {
    id: "c10",
    human: {
      name: "Nina",
      age: 29,
      city: "Seattle",
      energy: 4,
      interests: ["trail running", "coffee", "podcasts"],
      lookingFor: "Someone whose idea of sleeping in is 7am.",
    },
    dog: {
      name: "Pepper",
      breed: "Australian Cattle Dog",
      size: "medium",
      energy: 5,
      temperament: ["driven", "playful", "alert"],
      favoriteActivity: "long hikes",
    },
  },
  {
    id: "c11",
    human: {
      name: "Leo",
      age: 27,
      city: "Seattle",
      energy: 2,
      interests: ["film", "vinyl records", "cooking"],
      lookingFor: "Slow mornings, record stores, takeout on the floor.",
    },
    dog: {
      name: "Miso",
      breed: "Shiba Inu",
      size: "small",
      energy: 3,
      temperament: ["independent", "curious", "dramatic"],
      favoriteActivity: "neighborhood sniff tours",
    },
  },
  {
    id: "c12",
    human: {
      name: "Harper",
      age: 32,
      city: "Tacoma",
      energy: 4,
      interests: ["kayaking", "hiking", "photography"],
      lookingFor: "A weekend adventurer who packs snacks for two dogs.",
    },
    dog: {
      name: "Sable",
      breed: "Labrador Retriever",
      size: "large",
      energy: 4,
      temperament: ["friendly", "water-obsessed", "playful"],
      favoriteActivity: "swimming",
    },
  },
];

/** Convenience lookup for /app/match/[id] (Slice C). */
export function getCandidateById(id: string): Profile | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
