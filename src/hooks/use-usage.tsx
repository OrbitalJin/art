import { useMemo } from "react";
import { estimateUsage } from "@/lib/llm/common/utils";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useConversationContext } from "./use-conversation-context";

export const useUsage = () => {
  const currentSession = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const context = useConversationContext(currentSession);

  const usage = useMemo(
    () => (currentSession ? estimateUsage(currentSession, context) : ""),
    [currentSession, context],
  );

  return {
    usage,
  };
};
