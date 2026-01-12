import { useCallback } from "react";
import { useLLM } from "@/contexts/llm-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { prompts } from "@/lib/llm/common/prompts";
import { useLLMStream } from "@/hooks/use-llm-stream";
import { createModelMessage } from "@/lib/llm/common/message-factories";
import type { Model } from "@/lib/llm/common/types";
import { useConversationContext } from "@/hooks/use-conversation-context";
import { toast } from "sonner";
import type { Session } from "@/lib/store/session/types";

interface UseLLMSessionProps {
  activeId: string | null;
  activeSession: Session | undefined;
  onToken: (token: string) => void;
  onComplete: (result: { content: string; status: string; errorType?: string }) => void;
}

export const useLLMSession = ({
  activeId,
  activeSession,
  onToken,
  onComplete,
}: UseLLMSessionProps) => {
  const { llm } = useLLM();
  const { addMessage } = useSessionStore();
  const context = useConversationContext(activeSession);

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
          activeSession?.preferredModel,
          errorType,
        ),
      );
      onComplete({ content, status });
    },
  });

  const send = useCallback(
    async (text: string) => {
      if (!activeId || !llm) return;
      await stream({
        text,
        messages: activeSession?.messages || [],
        systemPrompt: prompts.system,
        context,
        model: activeSession?.preferredModel as Model,
      });
    },
    [activeId, llm, activeSession, stream, context],
  );

  return { send, abort };
};