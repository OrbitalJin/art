import { useMemo } from "react";
import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { ToolUse } from "./tool-use";
import { Approval } from "./approval";
import { ToolApprovalCard } from "./tool-approval-card";
import { AskUserCard } from "./ask-user-card";
import { cn } from "@/lib/utils";

const StateDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className="relative flex size-2 shrink-0 self-center">
    <span
      className={cn(
        "relative inline-flex size-2 rounded-full",
        active
          ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
          : "bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.45)]",
      )}
    />
    {active ? (
      <span className="absolute inline-flex size-2 animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
    ) : null}
  </span>
);

const StatusLabel: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={cn(
      "shrink-0 text-xs font-medium",
      active ? "shimmer text-amber-500/40" : "text-foreground/80",
    )}
  >
    {active ? "Working" : "Agent"}
  </span>
);

const Divider: React.FC = () => (
  <span aria-hidden className="h-3.5 w-px shrink-0 bg-border/60" />
);

const ProgressLine: React.FC = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-x-0 -bottom-px h-px animate-pulse bg-linear-to-r from-transparent via-amber-500/20 to-transparent motion-reduce:animate-none"
  />
);

const PendingPrompt: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  const activeApproval = useMemo(() => {
    const entries = Object.entries(approvals).filter(
      ([, approval]) =>
        approval.status === "pending" && approval.sessionId === sessionId,
    );
    if (entries.length === 0) return null;
    const [toolCallId, approval] = entries.reduce((newest, entry) =>
      entry[1].requestedAt > newest[1].requestedAt ? entry : newest,
    );
    return { toolCallId, approval };
  }, [approvals, sessionId]);

  const activeQuestion = useMemo(() => {
    const entries = Object.entries(questions).filter(
      ([, question]) =>
        question.status === "pending" && question.sessionId === sessionId,
    );
    if (entries.length === 0) return null;
    const [toolCallId, question] = entries[entries.length - 1];
    return { toolCallId, question };
  }, [questions, sessionId]);

  if (activeApproval) {
    return (
      <ToolApprovalCard
        variant="embedded"
        toolCallId={activeApproval.toolCallId}
        toolName={activeApproval.approval.toolName}
        input={activeApproval.approval.input}
        status={activeApproval.approval.status}
      />
    );
  }

  if (activeQuestion) {
    return (
      <AskUserCard
        variant="embedded"
        toolCallId={activeQuestion.toolCallId}
        questions={activeQuestion.question.questions}
        status={activeQuestion.question.status}
      />
    );
  }

  return null;
};

export const AgentBar = () => {
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls, streamingSessionId } = useChatStream();
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  const sessionId = session?.id;
  const ownsStream = !!session && streamingSessionId === session.id;
  const hasPending = useMemo(
    () =>
      !!sessionId &&
      (Object.values(approvals).some(
        (a) => a.status === "pending" && a.sessionId === sessionId,
      ) ||
        Object.values(questions).some(
          (q) => q.status === "pending" && q.sessionId === sessionId,
        )),
    [sessionId, approvals, questions],
  );

  if (!session || session.type !== "agent") return null;

  const streaming = ownsStream && isSending;
  const active = streaming && toolCalls.length > 0;

  const barClasses = cn(
    "relative flex items-center gap-2.5 border-b border-border/40",
    "bg-linear-to-r to-transparent transition-colors duration-300",
    streaming ? "from-amber-500/3" : "from-emerald-500/2",
    hasPending ? "items-stretch px-0" : "h-10 px-3",
  );

  return (
    <div className={barClasses}>
      {hasPending ? (
        <div className="w-full animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
          <PendingPrompt sessionId={session.id} />
        </div>
      ) : (
        <>
          <StateDot active={streaming} />
          <StatusLabel active={streaming} />
          <Divider />
          <ToolUse active={active} />
          <Approval disabled={streaming} />
        </>
      )}

      {streaming && <ProgressLine />}
    </div>
  );
};
