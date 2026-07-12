import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const traitChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-sm font-semibold",
  {
    variants: {
      tone: {
        /** human traits */
        coral: "border-coral-500/30 bg-coral-50 text-coral-800",
        /** dog traits */
        honey: "border-honey-600/35 bg-honey-50 text-honey-800",
        /** logistics / neutral facts */
        teal: "border-teal-600/30 bg-teal-50 text-teal-800",
      },
    },
    defaultVariants: {
      tone: "coral",
    },
  },
);

/**
 * Small labeled pill for profile traits. All three tones are
 * contrast-checked ≥ 4.5:1 (see docs/DESIGN.md).
 */
export function TraitChip({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof traitChipVariants>) {
  return (
    <span className={cn(traitChipVariants({ tone }), className)} {...props} />
  );
}
