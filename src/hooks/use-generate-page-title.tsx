import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { useJournalStore } from "@/lib/store/use-journal-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGeneratePageTitle = () => {
  const { llm } = useLLM();
  const [generating, setGenerating] = useState(false);
  const notes = useJournalStore((state) => state.pages);

  const generateTitle = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !llm || generating) return;

    setGenerating(true);
    try {
      const title =
        (await llm.genWithContext(gen.title, [
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
