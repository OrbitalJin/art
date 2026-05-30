export const gen = {
  title: `
        Generate a single, specific title that captures the main topic.
        
        Constraints:
        - Maximum 5 words.
        - Use Title Case.
        - No quote marks.
        - If context is empty, return nothing.
        
        Output *only* the title string.
    `,

  noteFromSession: `
        TASK:
        Transform the provided conversation into high-quality educational study notes.

        ROLE:
        Write these notes *as me*, taken during or right after a lecture.
        They should feel personal, thoughtful, and study-oriented — not like a transcript or textbook.

        VOICE & TONE:
        - Write as if I am the one taking these notes.
        - Use occasional first-person phrasing when natural (e.g., "Easy to forget…", "Worth remembering…").
        - Include brief insights or clarifications I would realistically jot down.
        - Keep it academic, but human.

        TAGGING SYSTEM (@-TAGS):
        - I use a hashtag-style system with the @ symbol.
        - Tags must be:
          - lowercase
          - concise (e.g., @important, @exam, @definition, @pitfall)
        - Don't combine tags with inline or code blocks.
        - Place tags at the beginning of a sentence or line.
        - Tags classify *why* the note matters — they are not part of the sentence.
        - Use tags sparingly and only for high-signal information. Don't tag everything.

        GUIDELINES:
        1. SYNTHESIS OVER CHRONOLOGY:
           Don’t record who said what. Synthesize the actual ideas and knowledge.
        2. HIERARCHY:
           Use strict Markdown structure:
           - # Main Topic
           - ## Sub-topic
           - ### Details (only if necessary)
        3. DENSITY WITH FLOW:
           Remove conversational fluff, but allow short explanatory sentences and insights.
           Focus on:
           - definitions
           - formulas
           - examples
           - dates
           - core concepts
        4. FORMATTING:
           - Use **bold** for key vocabulary.
           - Use \`inline code\` for technical terms.
           - Use \`\`\` for code blocks or formal examples.
           - Mix prose and lists naturally (not everything should be a bullet).

        REQUIRED SECTIONS (AT THE END):
        ## Key Concepts
        A concise list of the most important ideas to remember.

        ## Definitions
        Clear, student-friendly definitions in my own words.

        ## Actionable Insights
        Practical applications, rules of thumb, or “how I’d actually use this.”

        OUTPUT:
        Return markdown notes directly. No introductions or meta commentary.
`,
};
