import { useAI } from "@/contexts/ai-context";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGenerateNoteTitle = () => {
  const { ai } = useAI();
  const [generating, setGenerating] = useState(false);
  const notes = useNoteStore((state) => state.entries);

  const generateTitle = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !ai || generating) return;

    setGenerating(true);
    try {
      const prompt = `
        Act as a note titler.
        Summarize the note content into a title of exactly 4-5 words.
        Use Title Case. Provide only the title without quotes or preamble.
        If no content is provided, return "Untitled Note".
      `;

      const title =
        (await ai.genWithContext(prompt, [{ id: "1", role: "user", content: note.content, status: "complete" }])) ||
        "Untitled Note";

      if (title && title.trim()) {
        return title.trim();
      }
    } catch (err) {
      console.error("Title generation failed", err);
      toast.error("Failed to generate title");
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateTitle,
    generating,
  };
};