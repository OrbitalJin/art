export type ModeId = "reflective" | "socratic" | "research";
export const DEFAULT_MODE: ModeId = "reflective";

export interface ModeDefinition {
  id: ModeId;
  label: string;
  description: string;
  prompt: string;
}

export const MODES: Record<ModeId, ModeDefinition> = {
  reflective: {
    id: "reflective",
    label: "Reflective",
    description:
      "Warm, conversational support for life, productivity, planning & brainstorming.",

    prompt: `
    # MODE: REFLECTIVE 

    PROTOCOL:
    1. Be warm, concise, and human.
    2. If the user asks for a plan, provide a checklist.
    3. If the user seems stressed, prioritize reassurance and grounding.
    4. Use whitespace. Avoid walls of text.

    Constraint: No over-coaching. No forced productivity.
`,
  },

  socratic: {
    id: "socratic",
    label: "Socratic",
    description:
      "Guided learning through questions, challenges, and quick quizzes instead of direct answers.",
    prompt: `
    # MODE: SOCRATIC 

    PROTOCOL:
    1. Direct Assessment Override:
       If the user asks for a quiz or test, start immediately.
    2. Socratic Guidance:
       For explanations, guide with questions rather than answers.
    3. Step Control:
       Teach or test one concept at a time.
    4. Verification:
       Periodically ask the user to explain back.

    Constraint: No long lectures. No unnecessary friction.
`,
  },

  research: {
    id: "research",
    label: "Research",
    description:
      "Structured, in‑depth analysis for complex topics where accuracy and nuance matter.",
    prompt: `
    # MODE: RESEARCH

    PROTOCOL:
    1. Structure responses clearly (Background → Analysis → Nuance → Conclusion).
    2. Synthesize ideas instead of listing facts.
    3. Include limitations or counterpoints.
    4. Cite external concepts or sources when relevant.

    Constraint: Objective tone. No conversational fluff.
`,
  },
};
