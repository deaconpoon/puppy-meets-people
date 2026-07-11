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

### 2.4 User stories (Must-haves, with acceptance criteria)

**US-1 — Build a combined profile**
> As a single dog owner, I want to create a profile for me *and* my dog, so that matches consider both of us.
- *Given* I open the profile form, *when* I fill human fields (name, age, city, lifestyle/energy, interests, what I want) and dog fields (dog name, breed, size, energy, temperament, favorite activity), *then* my profile is saved to app state and used for matching.

**US-2 — See ranked matches with combined score**
> As a single dog owner, I want to see candidates ranked by combined human + dog compatibility, so that I find dates whose dogs also fit mine.
- *Given* my profile exists, *when* I open Discover, *then* I see candidates sorted high-to-low by a combined score (0–100), each showing human sub-score and dog sub-score.

**US-3 — Understand *why* we matched (the AI moment)**
> As a single dog owner, I want to see why a match was made, so that I trust it.
- *Given* a candidate in Discover, *when* it renders, *then* I see a 1–3 sentence AI-generated explanation citing specific human and dog reasons (e.g., "You both prioritize outdoor weekends, and both dogs are high-energy medium breeds that would love the same parks").

**US-4 — Confirm a match**
> As a single dog owner, I want to like a candidate and see a match confirmation, so that the demo has a satisfying payoff.
- *Given* a candidate, *when* I click Like, *then* I see a match screen with the combined score, the human/dog breakdown, and the explanation.

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
