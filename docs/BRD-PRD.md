# PawPair — Business & Product Requirements (BRD / PRD)

> Working project name: **PawPair** — *the dating app where your dog swipes too.*
> Format: hackathon MVP. Two deliverables: a **marketing landing page** and a **working web app**.
> Status: v1 — ready to build.

---

## 1. Business Requirements (BRD)

### 1.1 Problem
Single dog owners want a romantic partner, but they also need that partner (and their dog) to be compatible with *their* dog. Existing dating apps optimize only for human-to-human fit and ignore the reality that a dog owner's life revolves around their pet. A mismatched dog dynamic (energy, size, temperament) quietly kills otherwise-good relationships.

### 1.2 Target user
Single dog owners, 22–40, who treat their dog as family and want dating that respects that. Primary persona: *"Wants a partner whose lifestyle — and dog — fits mine."*

### 1.3 Value proposition
**The only dating app that matches on human compatibility *and* dog compatibility, and tells you *why* you matched.** Your dog isn't an afterthought on your profile — it's half the match.

### 1.4 Why now / why it wins (pitch angle)
The dog angle is the differentiator. Anyone can build "another dating app"; the defensible, demo-able edge is the **combined human+dog compatibility score with an AI-generated explanation**. That's the moment that lands with judges.

### 1.5 Success metrics
For the hackathon, success = a judge watches the core flow and immediately understands the value.

- **Primary (demo) metric:** A judge sees a match get created and reads a clear, believable "why you matched" explanation covering both human and dog fit.
- **Secondary:** Profile creation (human + dog) completes in under 90 seconds.
- **Narrative metric for the pitch:** "X% of dog owners say a partner's dog compatibility matters" (cite or self-report; used as slide, not built).

### 1.6 Scope boundary (the most important section)
**In scope (demo moment):**
> A single dog owner creates a profile for themselves AND their dog, then browses matches ranked by a combined human + dog compatibility score, each with an AI-generated explanation of *why* they matched.

**Explicitly OUT of scope this weekend:** real authentication, real-time chat, messaging, payments/subscriptions, push notifications, geolocation, photo moderation, a real user database at scale, mobile native app. Fake or stub all of these.

---

## 2. Product Requirements (PRD)

### 2.1 The two deliverables

**A. Landing page (`/`)** — marketing site to sell the concept.
Hero with the one-liner, the problem, how it works (3 steps), the "your dog swipes too" differentiator, and a single CTA ("Try the demo") that links into the web app. Purpose: makes the pitch land before the demo even starts.

**B. Web app (`/app`)** — the working product.
The core flow below. This is what you demo live.

### 2.2 Core user flow (the one flow that must work)
1. User lands in the app as a seeded "current user" (no login).
2. **Create / edit profile** — human traits + dog traits (a short form).
3. **Discover** — see a ranked list/stack of candidate matches, each showing a **combined compatibility score** and the AI **"why you matched"** blurb.
4. **Match** — user likes a candidate; a match confirmation shows the full compatibility breakdown (human fit + dog fit + the explanation).

Everything past step 4 (chat, scheduling a dog-park date) is faked with a static screen or omitted.

### 2.3 Feature list — prioritized (MoSCoW)

**Must have (build these):**
- Profile creation form: human fields + dog fields.
- A seeded set of ~10–12 candidate profiles (human + dog) to match against.
- AI-powered compatibility scoring that returns a combined score + human/dog sub-scores + a natural-language "why you matched."
- Discover view showing ranked candidates with score and explanation.
- Match confirmation view with the full breakdown.

**Should have (if time):**
- Filter candidates (e.g., dog size, energy level).
- A "compatibility reasons" chip list (e.g., "Both high-energy dogs," "Both love hiking").
- Empty/loading/error states that look polished for the demo.

**Could have (nice-to-have, likely skipped):**
- AI-generated dog bio from a few tags.
- Swipe/stack UI with animation instead of a list.
- Fake chat screen after a match.

**Won't have (this weekend):** auth, real chat, payments, notifications, real DB, native app.

### 2.4 User stories

**How to read these.** Each story defines a *user need and outcome*, not an implementation. Acceptance criteria describe what the user should be able to experience or trust — deliberately **solution-agnostic**. The vertical-slice owner decides the *how* (screens, fields, scoring format, interactions). If an AC starts to name a screen, a button, or a number format, it has drifted into solution territory and should be re-generalized.

Priority uses MoSCoW (see §2.3). **Must-haves (US-1–US-4)** are the weekend build and map to the three vertical slices. The rest scope the fuller product and inform stretch work / the pitch's "what's next."

#### Must-have (this weekend)

**US-1 — Represent both me and my dog** · *Slice A*

> As a single dog owner, I want my profile to represent both me and my dog, so that potential matches understand who they'd really be dating — both of us.

- Both my own identity and my dog's identity are captured as part of who I am.
- My dog is treated as a first-class part of my profile, not an optional add-on.
- What I capture is available to the matching experience.

**US-2 — Find genuinely compatible matches** · *Slice B*

> As a single dog owner, I want to discover people whose compatibility reflects both human and dog fit, so that I don't pursue matches that would fall apart because our dogs don't work.

- I'm shown potential matches ordered so the most compatible are easiest to find.
- Compatibility visibly reflects both human fit and dog fit, not human fit alone.

**US-3 — Understand why a match fits (the AI moment)** · *Slice B*

> As a single dog owner, I want to understand why someone is a good match, so that I can trust the recommendation and decide with confidence.

- For a given match, I'm given a clear, believable reason it was suggested.
- The reason references what specifically makes us — and our dogs — compatible, so it feels personal rather than generic.

**US-4 — Act on a match and feel progress** · *Slice C*

> As a single dog owner, I want to express interest in a match and get a satisfying confirmation, so that I feel real momentum toward meeting.

- I can signal interest in a match I like.
- When there's mutual/positive interest, I get a confirmation that reinforces why we fit and feels like a rewarding moment.

#### Should-have (fuller product / stretch)

**US-5 — Keep my profile current**

> As a single dog owner, I want to update my and my dog's details over time, so that my matches stay accurate as life changes.

- I can revise what I've shared, and future matching reflects the changes.

**US-6 — Express what I'm looking for**

> As a single dog owner, I want to communicate my preferences and dealbreakers (about people *and* dogs), so that matches respect my constraints.

- I can express what matters to me; matches that violate a stated dealbreaker aren't pushed on me.

**US-7 — Skip matches that aren't right**

> As a single dog owner, I want to pass on matches that don't fit, so that I only invest time in ones that do.

- I can decline a suggestion, and it stops taking up my attention.

**US-8 — Trust it's safe to meet**

> As a single dog owner, I want to feel safe about meeting a stranger and their dog, so that I'm comfortable taking a match into the real world.

- Before meeting, I have enough signal and support to feel the step is safe and in my control.

#### Could-have (nice-to-have / future)

**US-9 — Know my dog will get along too**

> As a single dog owner, I want confidence that our dogs are socially compatible, so that a first meeting doesn't go badly because of the dogs.

- I understand how well our dogs are likely to get along, not just the people.

**US-10 — Connect once there's mutual interest**

> As a single dog owner, I want to start a conversation after we both show interest, so that we can actually arrange to meet.

- Once interest is mutual, I have a way to communicate and take the next step.

**US-11 — Plan a dog-friendly first meeting**

> As a single dog owner, I want help finding a place our dogs can join, so that the first date works for humans and dogs alike.

- I'm supported in choosing a setting that suits both people and both dogs.

**US-12 — Instantly get what's different here** · *Slice C (landing)*

> As a prospective user, I want to quickly grasp what makes this app different from other dating apps, so that I decide it's worth trying.

- Within moments I understand the core promise — that my dog's compatibility counts too — and how to start.

### 2.5 AI feature specification
- **What the AI does:** given the current user's profile and a candidate profile, produce a structured result: `combinedScore (0–100)`, `humanScore`, `dogScore`, `reasons[]` (short chips), and `explanation` (1–3 sentences, warm, specific).
- **Why LLM and not just rules:** the *explanation* is what wins the demo — a hardcoded score is boring, but "here's why you two (and your dogs) fit" feels magical. A rules-based score can back it up, but the language must be model-generated.
- **Guardrails for a live demo:** cache/seed results so the demo never depends on a flaky network call at pitch time; have a deterministic fallback score if the API fails. (Technical detail in the TRD.)

### 2.6 Assumptions & risks
- **Assumption:** judges reward a clear, working core flow over breadth. → Build one flow deeply.
- **Risk:** live LLM call fails on stage. → Pre-generate explanations for seeded candidates; only call live for the user's own edits.
- **Risk:** scope creep into chat/auth. → Product owner (you) guards the scope boundary in §1.6.

---

## 3. Handoff to the TRD
The technical stack, architecture, data models, API contract, folder structure, per-person task split, and build timeline are specified in **`02_TRD_PawPair.md`**. Feature names and scope in this document are the source of truth; the TRD implements exactly the Must-haves in §2.3.
