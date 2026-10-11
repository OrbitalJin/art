import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  useApprovalStore,
  type PendingApproval,
} from "@/lib/store/use-approval-store";
import {
  useQuestionStore,
  type PendingQuestion,
} from "@/lib/store/use-question-store";
import { useTodoStore, type TodoPlan } from "@/lib/store/use-todo-store";
import { ToolUse } from "./tool-use";
import { ApprovalSwitch } from "./approval-switch";
import { ToolApprovalCard } from "./tool-approval-card";
import { AskUserCard } from "./ask-user-card";
import { cn } from "@/lib/utils";

interface PendingPrompts {
  approvals: [string, PendingApproval][];
  questions: [string, PendingQuestion][];
}

const NO_PROMPTS: PendingPrompts = { approvals: [], questions: [] };

const usePendingPrompts = (sessionId: string | undefined): PendingPrompts => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  return useMemo(() => {
    if (!sessionId) return NO_PROMPTS;

    const pendingApprovals = Object.entries(approvals)
      .filter(
        ([, approval]) =>
          approval.status === "pending" && approval.sessionId === sessionId,
      )
      .sort(([, a], [, b]) => a.requestedAt - b.requestedAt);

    const pendingQuestions = Object.entries(questions)
      .filter(
        ([, question]) =>
          question.status === "pending" && question.sessionId === sessionId,
      )
      .sort(([, a], [, b]) => a.requestedAt - b.requestedAt);

    return { approvals: pendingApprovals, questions: pendingQuestions };
  }, [approvals, questions, sessionId]);
};

const StateDot: React.FC<{ active: boolean }> = ({ active }) => {
  const dotClasses = cn(
    "size-2 shrink-0 self-center rounded-full",
    active
      ? "animate-pulse bg-amber-500 motion-reduce:animate-none"
      : "bg-emerald-500/70",
  );

  return <span aria-hidden className={dotClasses} />;
};

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

const PendingPrompt: React.FC<{ prompts: PendingPrompts }> = ({ prompts }) => {
  if (prompts.approvals.length > 0) {
    return <ApprovalQueue entries={prompts.approvals} />;
  }

  if (prompts.questions.length > 0) {
    return <QuestionQueue entries={prompts.questions} />;
  }

  return null;
};

const PlanMarker: React.FC<{ active: boolean; done: boolean }> = ({
  active,
  done,
}) => {
  const dotClasses = cn(
    "size-1.5 rounded-full",
    done && "bg-emerald-500",
    !done && active && "animate-pulse bg-amber-500 motion-reduce:animate-none",
    !done && !active && "bg-muted-foreground/25",
  );

  return (
    <span
      aria-hidden
      className="flex size-2 shrink-0 items-center justify-center"
    >
      <span className={dotClasses} />
    </span>
  );
};

const PlanStrip: React.FC<{ plan: TodoPlan }> = ({ plan }) => {
  const total = plan.todos.length;
  const completed = plan.todos.filter(
    (todo) => todo.status === "completed",
  ).length;
  const current = plan.todos.find((todo) => todo.status === "in_progress");
  const next = plan.todos.find((todo) => todo.status !== "completed");
  const allDone = completed === total;
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
      className="flex h-8 items-center gap-2.5 px-3 animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      <PlanMarker active={current !== undefined} done={allDone} />
      <span className="min-w-0 truncate text-[11px] text-foreground/70">
        {label}
      </span>
      <span className="ml-auto shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
        {completed}/{total}
      </span>
    </div>
  );
};

export const AgentBar = () => {
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls, streamingSessionId } = useChatStream();

  const sessionId = session?.id;
  const prompts = usePendingPrompts(sessionId);
  const plan = useTodoStore((state) =>
    sessionId ? state.bySession[sessionId] : undefined,
  );

  if (!session || session.type !== "agent") return null;

  const ownsStream = streamingSessionId === session.id;
  const streaming = ownsStream && isSending;
  const active = streaming && toolCalls.length > 0;
  const hasPending =
    prompts.approvals.length > 0 || prompts.questions.length > 0;
  const showPlan = streaming && !hasPending && !!plan && plan.todos.length > 0;

  const barClasses = cn(
    "relative flex items-center gap-2.5",
    "bg-linear-to-r to-transparent transition-colors duration-300",
    streaming ? "from-amber-500/3" : "from-emerald-500/2",
    hasPending ? "items-stretch px-0" : "h-10 px-3",
  );

  return (
    <div className="relative flex flex-col border-b border-border/40">
      <div className={barClasses}>
        {hasPending ? (
          <div className="w-full animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
            <PendingPrompt key={session.id} prompts={prompts} />
          </div>
        ) : (
          <>
            <StateDot active={streaming} />
            <StatusLabel active={streaming} />
            <Divider />
            <ToolUse active={active} />
            <ApprovalSwitch disabled={streaming} />
          </>
        )}
      </div>

      {showPlan ? <PlanStrip plan={plan} /> : null}

      {streaming && <ProgressLine />}
    </div>
  );
};
