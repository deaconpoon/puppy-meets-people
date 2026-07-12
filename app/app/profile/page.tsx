// ============================================================================
// SLICE A (US-1) — Profile page (/app/profile). Owner: Kelvin (PMP-10).
// Human + dog profile form; the saved Profile persists via lib/current-user.ts
// (the Slice A → B seam consumed by Discover's re-scoring).
// ============================================================================

import { PageShell } from "@/components/patterns/page-shell";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return (
    <PageShell className="py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-1 text-muted-foreground">
          Tell us about you and your dog — matches consider both of you.
        </p>
        <div className="mt-6">
          <ProfileForm />
        </div>
      </div>
    </PageShell>
  );
}
