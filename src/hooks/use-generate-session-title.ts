import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGenerateSessionTitle = () => {
  const { llm } = useLLM();
  const [generating, setGenerating] = useState(false);

  const generateTitle = async (sessionId: string) => {
    if (generating) return;

    const sessions = useSessionStore.getState().sessions;
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !llm) return;

    setGenerating(true);
    try {
      const title = await llm.genFromMessages(gen.title, session.messages);

      if (title?.trim()) {
        const trimmed = title.trim();
        useSessionStore.getState().updateTitle(sessionId, trimmed);
        useSessionStore.getState().setTitleGenerated(sessionId, true);
        return trimmed;
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
