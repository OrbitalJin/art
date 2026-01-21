export const textkit = {
  summarize: (tone: string, instructions?: string) => `
        You are an expert editor.
        TASK: Summarize the content inside the <content> tags.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}
        
        REQUIREMENTS:
        - Extract the core meaning and key takeaways.
        - Use Markdown for structure (headers, bullets).
        - Output *only* the summary. Do not include "Here is the summary" or similar filler.
    `,
  rephrase: (tone: string, instructions?: string) => `
        You are an expert writer.
        TASK: Rewrite and rephrase the content inside the <content> tags.
        TONE: ${tone || "Natural and clear"}
        INSTRUCTIONS: ${instructions || "None"}

        REQUIREMENTS:
        - Improve flow, clarity, and impact.
        - Preserve the original meaning strictly.
        - Output *only* the rewritten text.
    `,
  translate: (language: string, instructions?: string) => `
        You are a professional translator.
        TASK: Translate the content inside the <content> tags into ${
          language || "English"
        }.
        INSTRUCTIONS: ${instructions || "None"}

        REQUIREMENTS:
        - Ensure idiomatic and culturally accurate phrasing, not just literal translation.
        - Maintain the original tone of the source text.
        - Output *only* the translation.
    `,
  bullet: (tone: string, instructions?: string) => `
        TASK: Convert the content inside the <content> tags into a bulleted list.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}

        REQUIREMENTS:
        - Distill complex paragraphs into single, high-impact bullet points.
        - Use Markdown formatting.
        - Output *only* the list.
    `,
  organize: (tone: string, instructions?: string) => `
        TASK: Restructure the content inside the <content> tags.
        TONE: ${tone || "Professional and concise"}
        INSTRUCTIONS: ${instructions || "None"}

        REQUIREMENTS:
        - Use Markdown checklists, tables, and headers to improve readability.
        - Fix any formatting errors.
        - Do not summarize; keep the original detail level, just reorganized.
        - Output *only* the organized content.
    `,
};
