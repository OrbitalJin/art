I would like to introduce an other dimension to my llm config. I want "tutor mode" to be a layer above simple traits. I want a "mode" as well. Tutor mode Conversation mode and research mode. They would have different uses case. Conversation would be a simple llm chat, tutor would lean towards teaching and cognitivie reinforcement, and research mode would be tailored for deep research and data gathering, syntehsis and hypothesis in a more scineitic/academic way. what do you think of this, and how do you think I should implement it?

This is an excellent architectural decision. Distinguishing between **Mode** (Functional Role/Directive) and **Trait** (Tone/Style) is the best way to scale an LLM application.

Here is why this separation works:

1.  **Hierarchy of Instruction:**
    - **System:** Who am I? (Identity)
    - **Mode:** What is my job right now? (The functional loop)
    - **Trait:** How should I sound while doing it? (The voice/vibe)
2.  **Conflict Resolution:** Currently, "Tutor" is a trait. If you combine "Tutor" (which asks questions) with "Concise" (which is brief), the LLM might get confused about whether to explain things or just ask a short question. Separating them allows you to have a "Concise Tutor" vs. a "Supportive Tutor."

Here is how I would implement this in your codebase.

### 1. Define the Types

You'll need to update your types file (likely `@/lib/store/session/types`) to include Modes.

```typescript
// @/lib/store/session/types

export type ModeId = "conversation" | "tutor" | "research";

export interface ModeDefinition {
  id: ModeId;
  label: string;
  description: string;
  prompt: string;
}

// Keep existing Trait types...
```

### 2. Define the Modes Constant

In your configuration file, create a new `MODES` object. Note that I have moved the logic from your old Tutor trait into the Tutor mode, and added a robust Research mode.

```typescript
export const MODES: Record<ModeId, ModeDefinition> = {
  conversation: {
    id: "conversation",
    label: "Conversation",
    description: "Standard fluid interaction.",
    prompt:
      "Role: Intelligent conversational partner. Engage naturally, answer questions directly, and maintain the established persona. No special structural constraints.",
  },
  tutor: {
    id: "tutor",
    label: "Tutor",
    description: "Socratic teaching and reinforcement.",
    prompt: `
      # MODE: SOCRATIC TUTOR
      
      GOAL: Build the user's mental model. Do not provide direct answers unless explicitly stuck.
      
      PROTOCOL:
      1. Socratic Method: Answer questions with guiding questions.
      2. Verification: Ask the user to explain concepts back to you.
      3. Scaffolding: Break complex topics into atomic steps.
      4. Quiz Injection: If the user masters a concept, ask: "Ready for a quick test?"
      
      Constraint: Never lecture for more than 3 sentences without checking understanding.
    `,
  },
  research: {
    id: "research",
    label: "Researcher",
    description: "Deep synthesis, data gathering, and academic rigor.",
    prompt: `
      # MODE: DEEP RESEARCHER
      
      GOAL: Provide comprehensive, evidence-based, and synthesized information.
      
      PROTOCOL:
      1. Structure: Use academic structuring (Abstract -> Background -> Analysis -> Conclusion).
      2. Synthesis: Do not just list facts. Connect disparate dots and identify patterns.
      3. Counter-arguments: Always briefly mention opposing views or edge cases.
      4. Citations: If referencing external concepts, books, or papers, cite them clearly.
      5. Depth: Prioritize accuracy and nuance over brevity.
      
      Constraint: Avoid "chatty" fillers. Be objective and analytical.
    `,
  },
};
```

### 3. Clean up the Traits

Remove `tutor` from `TRAITS` since it is now a mode.

```typescript
export const TRAITS: Record<TraitId, TraitDefinition> = {
  concise: {
    /* ...keep existing... */
  },
  professional: {
    /* ...keep existing... */
  },
  technical: {
    /* ...keep existing... */
  },
  creative: {
    /* ...keep existing... */
  },
  supportive: {
    /* ...keep existing... */
  },
  // REMOVED: tutor (It is now a mode)
};
```

### 4. Update the Prompt Constructor

Finally, update `constructSystemPrompt` in your `prompts` object to layer these correctly. The order matters: **Identity -> Mode -> Context -> Traits**.

```typescript
  constructSystemPrompt: (
    basePrompt: string,
    modeId: ModeId,
    traits: TraitId[]
  ): string => {

    // 1. Get the Mode Prompt (Default to conversation if missing)
    const modeInstruction = MODES[modeId]?.prompt || MODES.conversation.prompt;

    // 2. Get Trait Prompts
    const traitInstructions = traits
      .map((traitId) => TRAITS[traitId]?.prompt)
      .filter(Boolean)
      .join("\n\n");

    // 3. Assemble
    return `
${basePrompt}

# FUNCTIONAL MODE
${modeInstruction}

${traits.length > 0 ? `# TONE & STYLE ADJUSTMENTS\n${traitInstructions}` : ""}
    `.trim();
  },
```

### Why this specific implementation?

**1. The "Research" Prompt Design**
I designed the Research prompt to be structurally different from the others. By enforcing `Abstract -> Background -> Analysis`, you force the LLM to "think" in a structured way, which drastically reduces hallucinations and improves the quality of long-form answers.

**2. Combinatorial Power**
Now you can mix and match for powerful results:

- **Research Mode + Creative Trait:** Good for brainstorming novel hypotheses or writing essays.
- **Research Mode + Technical Trait:** Good for writing documentation or architectural reviews.
- **Tutor Mode + Supportive Trait:** Good for a user who is struggling and needs encouragement while learning.
- **Tutor Mode + Concise Trait:** Good for rapid-fire drilling/testing.

**3. UI Implementation Hint**
In your UI, you should treat **Mode** as a tab selector (or a dropdown at the top), and **Traits** as toggle chips/tags. Users usually pick _one_ mode, but might want multiple traits (e.g., "Professional" + "Technical").
