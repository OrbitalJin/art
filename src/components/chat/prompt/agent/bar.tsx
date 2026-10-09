import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useApprovalStore, type PendingApproval } from "@/lib/store/use-approval-store";
import {
  useQuestionStore,
  type PendingQuestion,
} from "@/lib/store/use-question-store";
import { useTodoStore, type TodoPlan } from "@/lib/store/use-todo-store";
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

const PagerControls: React.FC<{
  noun: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ noun, index, total, onPrev, onNext }) => (
  <>
    <Button
      size="icon"
      variant="ghost"
      aria-label={`Previous ${noun}`}
      disabled={index === 0}
      onClick={onPrev}
      className="size-5 text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft size={12} aria-hidden />
    </Button>
    <span
      aria-live="polite"
      className="min-w-8 text-center text-[11px] font-medium text-muted-foreground/60 tabular-nums"
    >
      {index + 1} / {total}
    </span>
    <Button
      size="icon"
      variant="ghost"
      aria-label={`Next ${noun}`}
      disabled={index === total - 1}
      onClick={onNext}
      className="size-5 text-muted-foreground hover:text-foreground"
    >
      <ChevronRight size={12} aria-hidden />
    </Button>
  </>
);

const ApprovalQueue: React.FC<{
  entries: [string, PendingApproval][];
}> = ({ entries }) => {
  const [index, setIndex] = useState(0);

  const total = entries.length;
  const activeIndex = Math.min(index, total - 1);
  const [toolCallId, approval] = entries[activeIndex];

  return (
    <ToolApprovalCard
      key={toolCallId}
      variant="embedded"
      toolCallId={toolCallId}
      toolName={approval.toolName}
      input={approval.input}
      status={approval.status}
      trailing={
        total > 1 ? (
          <PagerControls
            noun="approval"
            index={activeIndex}
            total={total}
            onPrev={() => setIndex(activeIndex - 1)}
            onNext={() => setIndex(activeIndex + 1)}
          />
        ) : undefined
      }
    />
  );
};

const QuestionQueue: React.FC<{
  entries: [string, PendingQuestion][];
}> = ({ entries }) => {
  const [index, setIndex] = useState(0);

  const total = entries.length;
  const activeIndex = Math.min(index, total - 1);
  const [toolCallId, question] = entries[activeIndex];

  return (
    <AskUserCard
      key={toolCallId}
      variant="embedded"
      toolCallId={toolCallId}
      questions={question.questions}
      status={question.status}
      trailing={
        total > 1 ? (
          <PagerControls
            noun="question"
            index={activeIndex}
            total={total}
            onPrev={() => setIndex(activeIndex - 1)}
            onNext={() => setIndex(activeIndex + 1)}
          />
        ) : undefined
      }
    />
  );
};

const PendingPrompt: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  const pendingApprovals = useMemo(
    () =>
      Object.entries(approvals)
        .filter(
          ([, approval]) =>
            approval.status === "pending" && approval.sessionId === sessionId,
        )
        .sort(([, a], [, b]) => a.requestedAt - b.requestedAt),
    [approvals, sessionId],
  );

  const pendingQuestions = useMemo(
    () =>
      Object.entries(questions)
        .filter(
          ([, question]) =>
            question.status === "pending" && question.sessionId === sessionId,
        )
        .sort(([, a], [, b]) => a.requestedAt - b.requestedAt),
    [questions, sessionId],
  );

  if (pendingApprovals.length > 0) {
    return <ApprovalQueue entries={pendingApprovals} />;
  }

  if (pendingQuestions.length > 0) {
    return <QuestionQueue entries={pendingQuestions} />;
  }

  return null;
};

const PlanStrip: React.FC<{ plan: TodoPlan }> = ({ plan }) => {
  const completed = plan.todos.filter((todo) => todo.status === "completed")
    .length;
  const current = plan.todos.find((todo) => todo.status === "in_progress");
  const next = plan.todos.find((todo) => todo.status !== "completed");
  const label = current?.content ?? next?.content ?? "Plan complete";
  const title = plan.todos
    .map((todo) => {
      const mark =
        todo.status === "completed"
          ? "✓"
          : todo.status === "in_progress"
            ? "●"
            : "○";
      return `${mark} ${todo.content}`;
    })
    .join("\n");

  return (
    <div
      title={title}
      className="flex h-8 items-center gap-2 px-3 animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <ListTodo
        size={12}
        aria-hidden
        className="shrink-0 text-amber-500/80"
      />
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
        {completed}/{plan.todos.length}
      </span>
      <span className="min-w-0 truncate text-[11px] text-foreground/70">
        {label}
      </span>
    </div>
  );
};

export const AgentBar = () => {
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls, streamingSessionId } = useChatStream();
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  const sessionId = session?.id;
  const plan = useTodoStore((state) =>
    sessionId ? state.bySession[sessionId] : undefined,
  );
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
    "relative flex items-center gap-2.5",
    "bg-linear-to-r to-transparent transition-colors duration-300",
    streaming ? "from-amber-500/3" : "from-emerald-500/2",
    hasPending ? "items-stretch px-0" : "h-10 px-3",
  );

  const showPlan = streaming && !hasPending && !!plan && plan.todos.length > 0;

  return (
    <div className="relative flex flex-col border-b border-border/40">
      <div className={barClasses}>
        {hasPending ? (
          <div className="w-full animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
            <PendingPrompt key={session.id} sessionId={session.id} />
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
      </div>

      {showPlan ? <PlanStrip plan={plan} /> : null}

      {streaming && <ProgressLine />}
    </div>
  );
};
