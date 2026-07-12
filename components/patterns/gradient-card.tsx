import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const gradientCardVariants = cva("rounded-3xl border border-border p-6", {
  variants: {
    gradient: {
      /** coral→honey — celebration moments (matches, scores) */
      sunrise: "gradient-sunrise text-white",
      /** teal→cream — calm informational surfaces */
      sky: "gradient-sky text-ink",
      /** coral-50→cream — soft page-level washes (heroes, panels) */
      blush: "gradient-blush text-ink",
    },
  },
  defaultVariants: {
    gradient: "blush",
  },
});

/**
 * A card washed in one of the three named brand gradients.
 * Contrast note: only `sunrise` supports white text, and only for large/bold
 * type — keep body copy on `sky`/`blush`, which use ink text.
 */
export function GradientCard({
  className,
  gradient,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof gradientCardVariants>) {
  return (
    <div
      className={cn(gradientCardVariants({ gradient }), className)}
      {...props}
    />
  );
}
