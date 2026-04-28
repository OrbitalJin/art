import { useCallback, useRef, useState } from "react";
import { useLLM } from "@/contexts/llm-context";
import { gen } from "@/lib/llm/prompts/gen";
import { useSessionStore } from "@/lib/store/use-session-store";
import { toast } from "sonner";

export const useGenerateSessionTitle = () => {
  const { llm } = useLLM();
  const [generating, setGenerating] = useState(false);
  const genRef = useRef(false);

  const generateTitle = useCallback(
    async (sessionId: string) => {
      if (genRef.current || generating || !llm) return;
      genRef.current = true;
      setGenerating(true);

      try {
        const sessions = useSessionStore.getState().sessions;
        const session = sessions.find((s) => s.id === sessionId);
        if (!session?.messages.length) return;

        const title = await llm.genFromMessages(gen.title, session.messages);
        if (title?.trim()) {
          useSessionStore.getState().updateTitle(sessionId, title.trim());
          useSessionStore.getState().setTitleGenerated(sessionId, true);
          return title.trim();
        }
      } catch (err) {
        console.error("Title generation failed", err);
        toast.error("Failed to generate title");
      } finally {
        genRef.current = false;
        setGenerating(false);
      }
    },
    [llm, generating],
  );

  return { generateTitle, generating };
};
