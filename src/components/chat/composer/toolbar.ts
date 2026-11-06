import { cn } from "@/lib/utils";

/**
 * Shared styling for the composer's secondary controls. Borderless and muted by
 * default so the row stays quiet, brightening only on hover or focus.
 */
export const composerControlClasses = cn(
  "size-8 text-muted-foreground/70 shadow-none transition-colors",
  "hover:bg-accent/50 hover:text-foreground",
);
