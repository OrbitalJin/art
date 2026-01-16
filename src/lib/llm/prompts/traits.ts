export type TraitId =
  | "concise"
  | "professional"
  | "technical"
  | "creative"
  | "supportive";

export interface TraitDefinition {
  id: TraitId;
  label: string;
  description: string;
  prompt: string;
}
export const TRAITS: Record<TraitId, TraitDefinition> = {
  concise: {
    id: "concise",
    label: "Concise",
    description: "Skip fillers and get straight to the point.",
    prompt:
      "Optimize for brevity. Remove introductory filler, transitional phrases, and flowery language. Deliver information in the fewest words possible without losing meaning.",
  },
  professional: {
    id: "professional",
    label: "Professional",
    description: "Use a formal and polished tone.",
    prompt:
      "Adopt a consultative, objective, and polished corporate tone. Avoid slang, emojis, or overly casual phrasing.",
  },
  technical: {
    id: "technical",
    label: "Technical",
    description: "Focus on technical depth and code accuracy.",
    prompt:
      "Prioritize technical accuracy. When providing code, adhere to strict best practices, handle edge cases, and use TypeScript/modern standards by default. Explain 'why', not just 'how'.",
  },
  creative: {
    id: "creative",
    label: "Creative",
    description: "Prioritize expressive and varied language.",
    prompt:
      "Use evocative, varied, and descriptive vocabulary. Avoid clichés and standard AI sentence structures. Be inventive with analogies.",
  },
  supportive: {
    id: "supportive",
    label: "Supportive",
    description: "Offer encouragement over pragmatic responses.",
    prompt:
      "Prioritize emotional intelligence. Be validating, encouraging, and empathetic. Focus on the user's wellbeing and progress.",
  },
};
