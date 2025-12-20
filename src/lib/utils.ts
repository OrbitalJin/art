import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function estimateTokens(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;

  // Penalize whitespace a bit less
  const charCount = cleaned.replace(/\s+/g, " ").length;
  return Math.ceil(charCount / 4);
}
