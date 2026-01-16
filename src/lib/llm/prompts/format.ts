import type { Entry } from "@/lib/store/notes/types";

export const format = {
  notesAsContext: (notes: Entry[]) => {
    const context = notes
      .slice(0, 50)
      .map((note) => `Title: ${note.title}\nBody: ${note.content}`)
      .join("\n---\n");
    return `\n<relevant_notes>\n${context}\n</relevant_notes>\n`;
  },
};
