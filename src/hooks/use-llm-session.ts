import { useCallback } from "react";
import { useLLM } from "@/contexts/llm-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useLLMStream } from "@/hooks/use-llm-stream";
import { createModelMessage } from "@/lib/llm/common/message-factories";
import { MODELS } from "@/lib/llm/common/types";
import { useSessionRefs } from "@/hooks/use-session-refs";
import { toast } from "sonner";
import type { Session } from "@/lib/store/session/types";
import { systemPrompt } from "@/lib/llm/prompts/system";
import { DEFAULT_MODE } from "@/lib/llm/prompts/modes";

interface UseLLMSessionProps {
  activeId: string | null;
  activeSession: Session | undefined;
  onToken: (token: string) => void;
  onComplete: (result: {
    content: string;
    status: string;
    errorType?: string;
  }) => void;
}

export const useLLMSession = ({
  activeId,
  activeSession,
  onToken,
  onComplete,
}: UseLLMSessionProps) => {
  const { llm } = useLLM();
  const { addMessage } = useSessionStore();
  const context = useSessionRefs(activeSession);

  const { stream, abort } = useLLMStream({
    llm,
    onToken,
    onComplete: ({ content, status, errorType }) => {
      if (!activeId) return;
      if (status === "error") toast.error("Network error occurred");
      addMessage(
        activeId,
        createModelMessage(
          content,
          status,
          activeSession?.searchGrounding,
          activeSession?.modelId,
          errorType,
        ),
      );
      onComplete({ content, status });
    },
  });

  const send = useCallback(
    async (text: string) => {
      if (!activeId || !llm) return;
      const modelType = MODELS.find(
        (m) => m.id === activeSession?.modelId,
      )?.type;

      await stream(text, activeSession?.messages || [], {
        systemPrompt: systemPrompt(
          activeSession?.mode || DEFAULT_MODE,
          activeSession?.traits || [],
        ),
        context,
        model: modelType,
        useGoogleSearch: activeSession?.searchGrounding,
      });
    },
    [activeId, llm, activeSession, stream, context],
  );

  return { send, abort };
};
