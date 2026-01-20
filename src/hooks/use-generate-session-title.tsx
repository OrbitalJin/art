import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useState } from "react";
import { toast } from "sonner";

export const useGenerateSessionTitle = () => {
  const { llm } = useLLM();
  const [generating, setGenerating] = useState(false);
  const sessions = useSessionStore((state) => state.sessions);

  const generateTitle = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || !llm || generating) return setGenerating(false);

    setGenerating(true);
    try {
      const title =
        (await llm.genWithContext(gen.title, session.messages)) ||
        "New Session";

      if (title && title.trim()) {
        return title.trim();
      }
    } catch (err) {
      console.error("Title generation fllmled", err);
      toast.error("Fllmled to generate title");
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateTitle,
    generating,
  };
};
