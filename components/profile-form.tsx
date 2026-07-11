"use client";

// ============================================================================
// SLICE A (US-1) — Human + dog profile form. STUB — owner: Person A.
//
// TODO (Slice A):
//   1. Add the remaining fields per BRD §2.4 US-1 acceptance criteria:
//      human: name, age, city, energy (1–5 slider), interests, lookingFor
//      dog:   name, breed, size (select), energy (1–5 slider),
//             temperament (tags), favoriteActivity
//   2. Validate with data/schemas.ts (HumanSchema / DogSchema) via zodResolver.
//   3. On save, persist the Profile to shared app state (React context or
//      localStorage) so Discover (Slice B) re-scores against it via the
//      scoreAll server action in app/actions.ts.
//   4. Show a profile preview card after save (TRD §8.1).
//
// The frozen seam: this form OUTPUTS a `Profile` (data/types.ts) → Slice B.
// ============================================================================

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENT_USER } from "@/data/profiles";
import type { Profile } from "@/data/types";

type ProfileFormValues = {
  humanName: string;
  city: string;
  dogName: string;
  dogBreed: string;
};

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      humanName: CURRENT_USER.human.name,
      city: CURRENT_USER.human.city,
      dogName: CURRENT_USER.dogs[0].name,
      dogBreed: CURRENT_USER.dogs[0].breed,
    },
  });

  function onSubmit(values: ProfileFormValues) {
    // TODO (Slice A): build a full `Profile` and save it to shared state.
    const draft: Profile = {
      ...CURRENT_USER,
      human: {
        ...CURRENT_USER.human,
        name: values.humanName,
        city: values.city,
      },
      dogs: [
        {
          ...CURRENT_USER.dogs[0],
          name: values.dogName,
          breed: values.dogBreed,
        },
      ],
    };
    console.log("Profile draft (not yet persisted):", draft);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="font-semibold">About you</legend>
        <label className="block text-sm" htmlFor="humanName">
          Your name
        </label>
        <Input
          id="humanName"
          {...form.register("humanName", { required: true })}
        />
        <label className="block text-sm" htmlFor="city">
          City
        </label>
        <Input id="city" {...form.register("city", { required: true })} />
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="font-semibold">About your dog</legend>
        <label className="block text-sm" htmlFor="dogName">
          Dog&apos;s name
        </label>
        <Input id="dogName" {...form.register("dogName", { required: true })} />
        <label className="block text-sm" htmlFor="dogBreed">
          Breed
        </label>
        <Input
          id="dogBreed"
          {...form.register("dogBreed", { required: true })}
        />
      </fieldset>
      <Button type="submit">Save profile</Button>
    </form>
  );
}
