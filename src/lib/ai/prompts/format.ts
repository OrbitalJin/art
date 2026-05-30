import type { Page } from "@/lib/store/journal/types";

export const format = {
  notesAsContext: (notes: Page[]) => {
    const context = notes
      .slice(0, 50)
      .map((note) => `Title: ${note.title}\nBody: ${note.content}`)
      .join("\n---\n");
    return `\n<relevant_notes>\n${context}\n</relevant_notes>\n`;
  },
};
