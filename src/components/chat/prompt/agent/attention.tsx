import { useMemo } from "react";
import { BellRing, ArrowRight } from "lucide-react";
import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { cn } from "@/lib/utils";

export const AgentAttention: React.FC = () => {
  const { streamingSessionId } = useChatStream();
  const activeId = useSessionStore((state) => state.activeId);
  const setActive = useSessionStore((state) => state.setActive);
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);
  const title = useSessionStore((state) =>
    state.sessions.find((s) => s.id === streamingSessionId)?.title,
  );

  const needsAttention = useMemo(
    () =>
      !!streamingSessionId &&
      streamingSessionId !== activeId &&
      (Object.values(approvals).some((a) => a.status === "pending") ||
        Object.values(questions).some((q) => q.status === "pending")),
    [streamingSessionId, activeId, approvals, questions],
  );

  if (!needsAttention || !streamingSessionId) return null;

  return (
    <button
      type="button"
      onClick={() => setActive(streamingSessionId)}
      className={cn(
        "mb-2 flex w-full items-center gap-2 rounded-lg border border-amber-500/30",
        "bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-600",
        "transition-colors hover:bg-amber-500/15 dark:text-amber-400",
      )}
    >
      <BellRing className="size-3.5 shrink-0 animate-pulse motion-reduce:animate-none" />
      <span className="truncate font-medium">
        Agent needs your attention{title ? ` in “${title}”` : ""}
      </span>
      <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium">
        Jump
        <ArrowRight className="size-3" />
      </span>
    </button>
  );
};
