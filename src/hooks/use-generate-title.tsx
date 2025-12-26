import { useAI } from "@/contexts/ai-context";
import { prompts } from "@/lib/ai/common/prompts";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGenerateTitle = () => {
  const { ai } = useAI();
  const sessions = useSessionStore((state) => state.sessions);
  const updateTitle = useSessionStore((state) => state.updateTitle);
  const [generating, setGenerating] = useState(false);

  const generateTitle = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !ai || generating) return;

    setGenerating(true);
    try {
      const title =
        (await ai.gen(prompts.gen.title, session.messages)) || "New Session";

      if (title && title.trim()) {
        updateTitle(sessionId, title.trim());
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
