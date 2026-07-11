// ============================================================================
// SLICE A (US-1) — Profile page (/app/profile). STUB — owner: Person A.
// Human + dog profile form; the saved Profile is the seam consumed by
// Slice B's Discover ranking. See components/profile-form.tsx for the
// Slice A TODO list (full field set, Zod validation, shared state, preview).
// ============================================================================

import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-1 text-muted-foreground">
        Tell us about you and your dog — matches consider both of you.
      </p>
      <div className="mt-6">
        <ProfileForm />
      </div>
    </div>
  );
}
