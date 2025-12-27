import { useMemo } from "react";
import { estimateUsage } from "@/lib/ai/common/utils";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export const useUsage = () => {
  const currentSession = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const usage = useMemo(
    () => (currentSession ? estimateUsage(currentSession) : ""),
    [currentSession],
  );

  return {
    usage,
  };
};
