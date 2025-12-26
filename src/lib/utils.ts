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

export const prompts = {
  gen: {
    title: `
        Act as a conversation titler. 
        Summarize the provided text into a title of exactly 4 to 5 word. 
        Use Title Case. Provide only the title without quotes or preamble.
        If no content is provided to you, return "New Session".
    `,
  },
};
