import { useLLM } from "@/contexts/llm-context";
import { useSessions } from "@/contexts/sessions-context";
import { prompts } from "@/lib/utils";
import { useState } from "react";

export const useGenerateTitle = () => {
  const { llm } = useLLM();
  const { getSession } = useSessions();
  const [generating, setGenerating] = useState(false);

  const generateTitle = async (sessionId: string) => {
    const session = getSession(sessionId);
    if (!llm) return;
    if (!session) return;
    setGenerating(true);
    try {
      const title = await llm.gen(prompts.gen.title, session);
      return title;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateTitle,
    generating,
  };
};
