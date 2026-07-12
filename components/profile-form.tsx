"use client";

// ============================================================================
// SLICE A (US-1) — Human + dog profile form. Owner: Kelvin (PMP-10).
// Phase 1 (docs/superpowers/specs/2026-07-12-us1-profile-form-design.md):
// asks the 8 matchmaking inputs + city & breed; carries forward age and
// lookingFor from the existing profile (promoted to real fields in Phase 2).
// Saves via lib/current-user.ts — the Slice A → B seam.
// ============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CURRENT_USER } from "@/data/profiles";
import { getCurrentUser, saveCurrentUser } from "@/lib/current-user";
import type { Profile } from "@/data/types";

const energyLevel = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

const ProfileFormSchema = z.object({
  humanName: z.string().min(1, "Please tell us your name."),
  city: z.string().min(1, "Which city are you in?"),
  humanEnergy: energyLevel,
  interests: z.array(z.string()).min(1, "Add at least one interest."),
  dogName: z.string().min(1, "What's your dog's name?"),
  breed: z.string().min(1, "What breed (or best guess)?"),
  size: z.enum(["small", "medium", "large"]),
  dogEnergy: energyLevel,
  temperament: z.array(z.string()).min(1, "Add at least one trait."),
  favoriteActivity: z.string().min(1, "What does your dog love doing?"),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    humanName: profile.human.name,
    city: profile.human.city,
    humanEnergy: profile.human.energy,
    interests: profile.human.interests,
    dogName: profile.dog.name,
    breed: profile.dog.breed,
    size: profile.dog.size,
    dogEnergy: profile.dog.energy,
    temperament: profile.dog.temperament,
    favoriteActivity: profile.dog.favoriteActivity,
  };
}

const HUMAN_ENERGY_LABELS = [
  "Homebody",
  "Mostly cozy",
  "Balanced",
  "Often out",
  "Always out",
] as const;

const DOG_ENERGY_LABELS = [
  "Couch potato",
  "Mellow",
  "Playful",
  "High energy",
  "Never stops",
] as const;

const INTEREST_SUGGESTIONS = [
  "hiking",
  "coffee",
  "live music",
  "cooking",
  "board games",
  "running",
];

const TEMPERAMENT_SUGGESTIONS = [
  "friendly",
  "playful",
  "shy",
  "smart",
  "goofy",
  "gentle",
];

/** Label + control + inline error, consistently spaced. */
function Field({
  label,
  htmlFor,
  error,
  children,
}: React.PropsWithChildren<{
  label: string;
  htmlFor: string;
  error?: string;
}>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-coral-800" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProfileForm() {
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    // Seed defaults for SSR; the stored profile loads after hydration below.
    defaultValues: toFormValues(CURRENT_USER),
  });

  // localStorage is browser-only: resetting after mount avoids a hydration
  // mismatch between the server-rendered seed and a stored profile.
  useEffect(() => {
    form.reset(toFormValues(getCurrentUser()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: ProfileFormValues) {
    // Carry forward what Phase 1 doesn't ask (age, lookingFor) so the saved
    // object stays a complete, schema-valid Profile (frozen contract).
    const base = getCurrentUser();
    saveCurrentUser({
      ...base,
      human: {
        ...base.human,
        name: values.humanName,
        city: values.city,
        energy: values.humanEnergy,
        interests: values.interests,
      },
      dog: {
        name: values.dogName,
        breed: values.breed,
        size: values.size,
        energy: values.dogEnergy,
        temperament: values.temperament,
        favoriteActivity: values.favoriteActivity,
      },
    });
    setSaved(true);
  }

  const { errors } = form.formState;

  if (saved) {
    return (
      <Card>
        <CardContent className="space-y-4 text-center">
          <p className="font-display text-2xl">Profile saved! 🐾</p>
          <p className="text-muted-foreground">
            You and {form.getValues("dogName")} are ready to meet your matches.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/app">See your matches</Link>
            </Button>
            <Button variant="outline" onClick={() => setSaved(false)}>
              Keep editing
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <fieldset className="space-y-4">
        <legend className="font-display text-xl">About you</legend>

        <Field
          label="Your name"
          htmlFor="humanName"
          error={errors.humanName?.message}
        >
          <Input id="humanName" {...form.register("humanName")} />
        </Field>

        <Field label="City" htmlFor="city" error={errors.city?.message}>
          <Input id="city" {...form.register("city")} />
        </Field>

        <Controller
          control={form.control}
          name="humanEnergy"
          render={({ field }) => (
            <Field
              label={`Your lifestyle energy — ${HUMAN_ENERGY_LABELS[field.value - 1]}`}
              htmlFor="humanEnergy"
              error={errors.humanEnergy?.message}
            >
              <Slider
                id="humanEnergy"
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                aria-label="Your lifestyle energy, 1 homebody to 5 always out"
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="interests"
          render={({ field }) => (
            <Field
              label="Your interests"
              htmlFor="interests"
              error={errors.interests?.message}
            >
              <TagInput
                id="interests"
                tone="coral"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. hiking — press Enter to add"
                suggestions={INTEREST_SUGGESTIONS}
              />
            </Field>
          )}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl">About your dog</legend>

        <Field
          label="Dog's name"
          htmlFor="dogName"
          error={errors.dogName?.message}
        >
          <Input id="dogName" {...form.register("dogName")} />
        </Field>

        <Field label="Breed" htmlFor="breed" error={errors.breed?.message}>
          <Input id="breed" {...form.register("breed")} />
        </Field>

        <Controller
          control={form.control}
          name="size"
          render={({ field }) => (
            <Field label="Size" htmlFor="size" error={errors.size?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="size" className="w-full">
                  <SelectValue placeholder="How big is your dog?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="dogEnergy"
          render={({ field }) => (
            <Field
              label={`Dog energy — ${DOG_ENERGY_LABELS[field.value - 1]}`}
              htmlFor="dogEnergy"
              error={errors.dogEnergy?.message}
            >
              <Slider
                id="dogEnergy"
                min={1}
                max={5}
                step={1}
                value={[field.value]}
                onValueChange={([v]) => field.onChange(v)}
                aria-label="Dog energy, 1 couch potato to 5 never stops"
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="temperament"
          render={({ field }) => (
            <Field
              label="Temperament"
              htmlFor="temperament"
              error={errors.temperament?.message}
            >
              <TagInput
                id="temperament"
                tone="honey"
                value={field.value}
                onChange={field.onChange}
                placeholder="e.g. friendly — press Enter to add"
                suggestions={TEMPERAMENT_SUGGESTIONS}
              />
            </Field>
          )}
        />

        <Field
          label="Favorite activity"
          htmlFor="favoriteActivity"
          error={errors.favoriteActivity?.message}
        >
          <Input
            id="favoriteActivity"
            placeholder="e.g. fetch at the park"
            {...form.register("favoriteActivity")}
          />
        </Field>
      </fieldset>

      <Button type="submit" size="lg" className="w-full">
        Save profile
      </Button>
    </form>
  );
}
