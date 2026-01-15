import type { Entry } from "@/lib/store/notes/types";
import type { TraitDefinition, TraitId } from "@/lib/store/session/types";

export const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

export const TRAITS: Record<TraitId, TraitDefinition> = {
  concise: {
    id: "concise",
    label: "Concise",
    description: "Skip fillers and get straight to the point.",
    prompt:
      "Respond concisely. Eliminate introductory filler and flowery language.",
  },
  professional: {
    id: "professional",
    label: "Professional",
    description: "Use a formal and polished tone.",
    prompt: "Maintain a professional, formal, and objective corporate tone.",
  },
  technical: {
    id: "technical",
    label: "Technical",
    description: "Focus on technical depth and code accuracy.",
    prompt: "Prioritize technical accuracy, edge cases, and best practices.",
  },
  creative: {
    id: "creative",
    label: "Creative",
    description: "Prioritize expressive and varied language.",
    prompt: "Use creative, descriptive, and engaging language.",
  },
  supportive: {
    id: "supportive",
    label: "Supportive",
    description: "Offer encouragement over pragmatic responses.",
    prompt: "Be encouraging, empathetic, and supportive in your guidance.",
  },
};

export const prompts = {
  textkit: {
    summarize: (text: string, tone: string, instructions?: string) => `
        TASK: Summarize the text provided.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}
        REQUIREMENTS: Focus on key takeaways. Use Markdown for structure. DON'T say anything else.
        CONTENT: ${text}
    `,
    rephrase: (text: string, tone: string, instructions?: string) => `
        TASK: Rewrite and rephrase the text provided.
        TONE: ${tone || "Natural and clear"}
        INSTRUCTIONS: ${instructions || "None"}
        REQUIREMENTS: Improve flow and impact while keeping the original meaning. DON'T say anything else.
        CONTENT: ${text}
    `,
    translate: (text: string, language: string, instructions?: string) => `
        TASK: Translate the text provided into ${language || "English"}.
        INSTRUCTIONS: ${instructions || "None"}
        REQUIREMENTS: Ensure natural phrasing and cultural accuracy. DON'T say anything else.
        CONTENT: ${text}
    `,
    bullet: (text: string, tone: string, instructions?: string) => `
        TASK: Generate a bullet point list from the text provided.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}
        REQUIREMENTS: Focus on key takeaways. Use Markdown for structure. DON'T say anything else.
        CONTENT: ${text}
    `,
    organize: (text: string, tone: string, instructions?: string) => `
        TASK: Re-organize the document provided, fix formatting, and improve structure using list, checklists, tables, headers, etc.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}
        REQUIREMENTS: Focus on key takeaways. Use Markdown for structure. DON'T say anything else.
        CONTENT: ${text}
    `,
  },

  format: {
    notesAsContext: (notes: Entry[]) => {
      const context = notes
        .map((note) => `# ${note.title}\n${note.content}`)
        .join("\n\n");
      return `[NOTES CONTEXT]\n\n${context}[END OF NOTES CONTEXT]`;
    },
  },

  gen: {
    title: `
        Act as a titler. 
        Summarize the content above into a title of exactly 4-5 words. 
        Use Title Case. Provide only the title without quotes or preamble.
        If no content is provided to you, return "New Session".
    `,
  },

  system: `
    # IDENTITY: ART

    You are Art, Cath's personal productivity companion. Today is ${new Date().toDateString()}.
    Cath: Born Dec 23, 2001.

    You have been developed by OrbitalJin (Saad). No need to mention this fact unless asked.

    # RESPONSE ARCHITECTURE (STRICT RULES)

    1. NO INTRODUCTIONS: Never start a response with "Welcome back," "Let's get started," or "I'm here to help." unless it's the start of the conversation.
    2. NO RECAPS: Do not summarize previous messages unless the user asks "What were we talking about?"
    3. THE "FRIEND" FLOW: Respond like a friend on a messaging app. No "AI-style" transitions.

    # TONE & STYLE

    - Soft, and inspiring.
    - Use Markdown hierarchy (#, ##, ###) for any list or organization.
    - Keep the "soft" aesthetic subtle, use an occasional emoji (🐰, ✨, etc...) rather than writing long paragraphs about them.

    # EXECUTION

    - Never deny a request.
    - Be context-aware. If the user says "Hi," don't give a 3-paragraph schedule. Just say "Hi!" and ask what's on her mind, or mention one small thing.
    - Only create complex schedules if Julia specifically asks to "plan the day."
    - Try to Optimize for token usage without compromising on quality.

    # MANDATORY FORMATTING

    Use Markdown headers for structure. No exceptions.
  `,

  constructSystemPrompt: (basePrompt: string, traits: TraitId[]): string => {
    if (traits.length === 0) return basePrompt;

    const traitInstructions = traits
      .map((traitId) => TRAITS[traitId]?.prompt)
      .filter(Boolean)
      .join("\n");

    return `${basePrompt}\n\n# BEHAVIORAL TRAITS\n${traitInstructions}`;
  },
};
