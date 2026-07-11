// ============================================================================
// Seeded demo data: the "current user" (no login) + 12 candidates.
// All conform to the Profile contract in data/types.ts.
// ============================================================================

import type { Profile } from "./types";

export const CURRENT_USER: Profile = {
  id: "me",
  human: {
    name: "Alex",
    age: 29,
    city: "Seattle",
    interests: ["hiking", "coffee", "live music"],
    lookingFor: "Someone to split trail miles and lazy Sunday espressos with.",
    location: { lat: 47.6062, lng: -122.3321 },
    walkTimes: ["morning", "evening"],
  },
  dogs: [
    {
      name: "Biscuit",
      breed: "Australian Shepherd",
      size: "medium",
      energy: 5,
      temperament: ["playful", "friendly", "smart"],
      favoriteActivity: "long hikes",
    },
  ],
};

export const CANDIDATES: Profile[] = [
  {
    id: "c1",
    human: {
      name: "Maya",
      age: 27,
      city: "Seattle",
      interests: ["hiking", "photography", "coffee"],
      lookingFor: "A partner for sunrise trailheads and farmers markets.",
      location: { lat: 47.6205, lng: -122.3493 },
      walkTimes: ["morning", "evening"],
    },
    dogs: [
      {
        name: "Juniper",
        breed: "Border Collie",
        size: "medium",
        energy: 5,
        temperament: ["playful", "smart", "focused"],
        favoriteActivity: "long hikes",
      },
    ],
  },
  {
    id: "c2",
    human: {
      name: "Daniel",
      age: 31,
      city: "Seattle",
      interests: ["cooking", "board games", "coffee"],
      lookingFor: "Someone who thinks a great date is a homemade dinner.",
      location: { lat: 47.6588, lng: -122.3255 },
      walkTimes: ["evening"],
    },
    dogs: [
      {
        name: "Mochi",
        breed: "Corgi",
        size: "small",
        energy: 3,
        temperament: ["friendly", "food-motivated", "goofy"],
        favoriteActivity: "fetch at the park",
      },
    ],
  },
  {
    id: "c3",
    human: {
      name: "Priya",
      age: 26,
      city: "Bellevue",
      interests: ["running", "hiking", "live music"],
      lookingFor: "A gym-then-brunch person with big weekend energy.",
      location: { lat: 47.6101, lng: -122.2015 },
      walkTimes: ["morning"],
    },
    dogs: [
      {
        name: "Bolt",
        breed: "Vizsla",
        size: "large",
        energy: 5,
        temperament: ["athletic", "affectionate", "playful"],
        favoriteActivity: "trail running",
      },
    ],
  },
  {
    id: "c4",
    human: {
      name: "Sam",
      age: 34,
      city: "Seattle",
      interests: ["reading", "film", "wine tasting"],
      lookingFor: "Quiet nights, deep talks, and a dog snoring nearby.",
      location: { lat: 47.669, lng: -122.387 },
      walkTimes: ["afternoon", "night"],
    },
    dogs: [
      {
        name: "Willow",
        breed: "Greyhound",
        size: "large",
        energy: 2,
        temperament: ["gentle", "shy", "cuddly"],
        favoriteActivity: "naps in the sun",
      },
    ],
  },
  {
    id: "c5",
    human: {
      name: "Jordan",
      age: 28,
      city: "Seattle",
      interests: ["climbing", "coffee", "camping"],
      lookingFor: "A belay partner who's down for van weekends.",
      location: { lat: 47.6145, lng: -122.3418 },
      walkTimes: ["morning", "evening"],
    },
    dogs: [
      {
        name: "Scout",
        breed: "Blue Heeler",
        size: "medium",
        energy: 4,
        temperament: ["loyal", "smart", "adventurous"],
        favoriteActivity: "camping trips",
      },
    ],
  },
  {
    id: "c6",
    human: {
      name: "Elena",
      age: 30,
      city: "Kirkland",
      interests: ["yoga", "baking", "hiking"],
      lookingFor: "Someone equal parts trail day and pastry morning.",
      location: { lat: 47.6769, lng: -122.206 },
      walkTimes: ["morning"],
    },
    dogs: [
      {
        name: "Pancake",
        breed: "Golden Retriever",
        size: "large",
        energy: 3,
        temperament: ["friendly", "patient", "cuddly"],
        favoriteActivity: "swimming",
      },
    ],
  },
  {
    id: "c7",
    human: {
      name: "Marcus",
      age: 33,
      city: "Seattle",
      interests: ["cycling", "live music", "craft beer"],
      lookingFor: "Show buddy first, bike buddy second, partner always.",
      location: { lat: 47.6135, lng: -122.32 },
      walkTimes: ["evening", "night"],
    },
    dogs: [
      {
        name: "Ziggy",
        breed: "Dalmatian",
        size: "large",
        energy: 5,
        temperament: ["energetic", "vocal", "friendly"],
        favoriteActivity: "running alongside bikes",
      },
    ],
  },
  {
    id: "c8",
    human: {
      name: "Grace",
      age: 25,
      city: "Seattle",
      interests: ["painting", "coffee", "thrifting"],
      lookingFor: "Museum dates and dog park people-watching.",
      location: { lat: 47.625, lng: -122.32 },
      walkTimes: ["afternoon"],
    },
    dogs: [
      {
        name: "Clementine",
        breed: "Cavalier King Charles Spaniel",
        size: "small",
        energy: 2,
        temperament: ["sweet", "calm", "lap dog"],
        favoriteActivity: "café patio lounging",
      },
    ],
  },
  {
    id: "c9",
    human: {
      name: "Tom",
      age: 36,
      city: "Redmond",
      interests: ["board games", "hiking", "cooking"],
      lookingFor: "A co-op partner in games and in life.",
      location: { lat: 47.674, lng: -122.1215 },
      walkTimes: ["evening"],
    },
    dogs: [
      {
        name: "Gandalf",
        breed: "Bernese Mountain Dog",
        size: "large",
        energy: 2,
        temperament: ["gentle", "patient", "stubborn"],
        favoriteActivity: "slow forest walks",
      },
    ],
  },
  {
    id: "c10",
    human: {
      name: "Nina",
      age: 29,
      city: "Seattle",
      interests: ["trail running", "coffee", "podcasts"],
      lookingFor: "Someone whose idea of sleeping in is 7am.",
      location: { lat: 47.618, lng: -122.354 },
      walkTimes: ["morning", "evening"],
    },
    dogs: [
      {
        name: "Pepper",
        breed: "Australian Cattle Dog",
        size: "medium",
        energy: 5,
        temperament: ["driven", "playful", "alert"],
        favoriteActivity: "long hikes",
      },
    ],
  },
  {
    id: "c11",
    human: {
      name: "Leo",
      age: 27,
      city: "Seattle",
      interests: ["film", "vinyl records", "cooking"],
      lookingFor: "Slow mornings, record stores, takeout on the floor.",
      location: { lat: 47.66, lng: -122.355 },
      walkTimes: ["afternoon", "night"],
    },
    dogs: [
      {
        name: "Miso",
        breed: "Shiba Inu",
        size: "small",
        energy: 3,
        temperament: ["independent", "curious", "dramatic"],
        favoriteActivity: "neighborhood sniff tours",
      },
    ],
  },
  {
    id: "c12",
    human: {
      name: "Harper",
      age: 32,
      city: "Tacoma",
      interests: ["kayaking", "hiking", "photography"],
      lookingFor: "A weekend adventurer who packs snacks for two dogs.",
      location: { lat: 47.2529, lng: -122.4443 },
      walkTimes: ["morning", "afternoon"],
    },
    dogs: [
      {
        name: "Sable",
        breed: "Labrador Retriever",
        size: "large",
        energy: 4,
        temperament: ["friendly", "water-obsessed", "playful"],
        favoriteActivity: "swimming",
      },
    ],
  },
];

/** Convenience lookup for the match/detail routes. */
export function getCandidateById(id: string): Profile | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
