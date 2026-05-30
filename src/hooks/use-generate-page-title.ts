import { useJournalStore } from "@/lib/store/use-journal-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGeneratePageTitle = () => {
  const [generating, setGenerating] = useState(false);
  const notes = useJournalStore((state) => state.pages);

  const generateTitle = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || generating) return;

    setGenerating(true);
    try {
      const title = "Untitled Page";

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
