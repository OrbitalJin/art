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
  quiz: {
    generate: (
      topic: string,
      context: string,
      difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
      type:
        | "multiple_choice"
        | "short_answer"
        | "coding"
        | "fill_blank" = "multiple_choice",
    ) => `
        TASK: Generate a ${difficulty} level ${type.replace("_", " ")} quiz question for knowledge checking.
        TOPIC: ${topic}
        RECENT CONTEXT: ${context}
        
        REQUIREMENTS:
        - Focus on basic understanding and key concepts
        - Question should test comprehension, not just recall
        - Keep it simple and direct for quick assessment
        - For multiple choice: provide 4 options, 1 correct, 3 plausible distractors
        - For short answer: ask clear, focused question requiring brief response
        - For coding: provide partial code with clear TODO comments for key logic
        - For fill_blank: replace 2-3 key terms with blanks
        - Do NOT reveal the correct answer yet
        - Ask user to attempt the question first
        
        Format as:
        **Question:** [question text]
        
        ${type === "multiple_choice" ? "Options:\nA) [option1]\nB) [option2]\nC) [option3]\nD) [option4]" : ""}
        
        **Your answer:** [awaiting response]
      `,

    evaluate: (question: string, userAnswer: string, correctAnswer: string) => `
        TASK: Evaluate user's answer and provide guided discovery feedback.
        
        QUESTION: ${question}
        USER ANSWER: ${userAnswer}
        CORRECT ANSWER: ${correctAnswer}
        
        Provide:
        1. **Assessment:** Correct/Incorrect/Partially Correct
        2. **Guided Hint:** If incorrect, give a hint to help user discover the correct answer themselves
        3. **Explanation:** After the hint, explain why the correct answer is right
        4. **Next Step:** Suggest related concept to practice or advance to
      `,

    adaptive: (userProgress: string, difficultyLevel: string) => `
        TASK: Generate an adaptive next question based on user's performance.
        
        USER PROGRESS SUMMARY: ${userProgress}
        CURRENT DIFFICULTY: ${difficultyLevel}
        
        If user is struggling (>2 wrong answers): Generate easier question on same topic
        If user is excelling (>2 consecutive correct): Generate slightly harder question or advance topic
        If performance is mixed: Generate question on related but different aspect
        
        Keep focus on simple knowledge checks unless specifically asked for complexity.
        Follow same format as quiz.generate.
      `,

    progressCheck: (topic: string, interactionHistory: string) => `
        TASK: Assess user's mastery level and provide guidance.
        
        TOPIC: ${topic}
        RECENT INTERACTIONS: ${interactionHistory}
        
        Provide:
        1. **Mastery Level:** Beginner/Intermediate/Advanced/Mastered
        2. **Strengths:** Concepts user understands well
        3. **Gaps:** Areas needing more work
        4. **Recommendation:** Continue current topic, review fundamentals, or advance to next concept
      `,
  },
};
