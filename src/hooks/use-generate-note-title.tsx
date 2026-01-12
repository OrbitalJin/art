import { useLLM } from "@/contexts/llm-context";
import { prompts } from "@/lib/llm/common/prompts";
import { useNoteStore } from "@/lib/store/use-note-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGenerateNoteTitle = () => {
  const { llm } = useLLM();
  const [generating, setGenerating] = useState(false);
  const notes = useNoteStore((state) => state.entries);

  const generateTitle = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !llm || generating) return;

    setGenerating(true);
    try {
      const title =
        (await llm.genWithContext(prompts.gen.title, [
          { id: "1", role: "user", content: note.content, status: "complete" },
        ])) || "Untitled Note";

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
