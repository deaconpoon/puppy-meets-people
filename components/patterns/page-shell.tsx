import { cn } from "@/lib/utils";

/**
 * Standard page container — max width, horizontal padding, centered.
 * Use as the outermost wrapper of any page so slices line up with the nav.
 */
export function PageShell({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4", className)}>
      {children}
    </div>
  );
}
