import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionIndex } from "@/lib/store/session/index-store";
import {
  useApprovalStore,
  type PendingApproval,
} from "@/lib/store/use-approval-store";
import {
  useQuestionStore,
  type PendingQuestion,
} from "@/lib/store/use-question-store";
import { usePlanStore, type Plan } from "@/lib/store/use-plan-store";
import { cn } from "@/lib/utils";
import { AccessControl } from "./access-control";
import { EnabledTools } from "./enabled-tools";
import { ToolActivity } from "./tool-activity";
import { useAgentTools } from "./use-agent-tools";
import { ToolApprovalCard } from "./tool-approval-card";
import { AskUserCard } from "./ask-user-card";

type Pending = { id: string; requestedAt: number } & (
  | { kind: "approval"; approval: PendingApproval }
  | { kind: "question"; question: PendingQuestion }
);

/** Pending approvals and questions for a session, oldest first. */
const usePendingPrompts = (sessionId: string | undefined): Pending[] => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  return useMemo(() => {
    if (!sessionId) return [];

    const items: Pending[] = [
      ...Object.entries(approvals)
        .filter(([, a]) => a.status === "pending" && a.sessionId === sessionId)
        .map(([id, approval]) => ({
          id,
          requestedAt: approval.requestedAt,
          kind: "approval" as const,
          approval,
        })),
      ...Object.entries(questions)
        .filter(([, q]) => q.status === "pending" && q.sessionId === sessionId)
        .map(([id, question]) => ({
          id,
          requestedAt: question.requestedAt,
          kind: "question" as const,
          question,
        })),
    ];

    return items.sort((a, b) => a.requestedAt - b.requestedAt);
  }, [approvals, questions, sessionId]);
};

const PagerButton: React.FC<{
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, disabled, onClick, children }) => {
  const buttonClassName = cn(
    "size-5 rounded-full text-muted-foreground hover:text-foreground",
  );

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
    >
      {children}
    </Button>
  );
};

const Pager: React.FC<{
  noun: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ noun, index, total, onPrev, onNext }) => {
  const pagerClassName = cn(
    "flex items-center gap-0.5 rounded-full bg-muted/40 p-0.5",
  );

  const countClassName = cn(
    "min-w-8 text-center text-[11px] font-medium tabular-nums",
    "text-muted-foreground/70",
  );

  return (
    <div className={pagerClassName}>
      <PagerButton
        label={`Previous ${noun}`}
        disabled={index === 0}
        onClick={onPrev}
      >
        <ChevronLeft size={12} aria-hidden />
      </PagerButton>
      <span aria-live="polite" className={countClassName}>
        {index + 1} / {total}
      </span>
      <PagerButton
        label={`Next ${noun}`}
        disabled={index === total - 1}
        onClick={onNext}
      >
        <ChevronRight size={12} aria-hidden />
      </PagerButton>
    </div>
  );
};

const PendingQueue: React.FC<{ items: Pending[] }> = ({ items }) => {
  const [index, setIndex] = useState(0);

  const active = Math.min(index, items.length - 1);
  const item = items[active];
  const trailing =
    items.length > 1 ? (
      <Pager
        noun={item.kind}
        index={active}
        total={items.length}
        onPrev={() => setIndex(active - 1)}
        onNext={() => setIndex(active + 1)}
      />
    ) : undefined;

  if (item.kind === "approval") {
    return (
      <ToolApprovalCard
        key={item.id}
        variant="embedded"
        toolCallId={item.id}
        toolName={item.approval.toolName}
        input={item.approval.input}
        status={item.approval.status}
        trailing={trailing}
      />
    );
  }

  return (
    <AskUserCard
      key={item.id}
      variant="embedded"
      toolCallId={item.id}
      questions={item.question.questions}
      status={item.question.status}
      trailing={trailing}
    />
  );
};

const StreamStatus: React.FC<{ streaming: boolean }> = ({ streaming }) => {
  const haloClassName = cn(
    "absolute inline-flex size-full rounded-full bg-amber-500/60",
    "animate-ping motion-reduce:animate-none",
  );

  const dotClassName = cn(
    "relative inline-flex size-2 rounded-full",
    streaming ? "bg-amber-500" : "bg-emerald-500/70",
  );

  const labelClassName = cn(
    "shrink-0 text-xs font-medium",
    streaming ? "shimmer text-amber-500/40" : "text-foreground/70",
  );

  return (
    <>
      <span aria-hidden className="relative flex size-2 shrink-0">
        {streaming && <span className={haloClassName} />}
        <span className={dotClassName} />
      </span>
      <span className={labelClassName}>{streaming ? "Working" : "Agent"}</span>
    </>
  );
};

const stepMark = (status: Plan["steps"][number]["status"]): string => {
  if (status === "completed") return "✓";
  if (status === "in_progress") return "●";
  return "○";
};

const PlanProgress: React.FC<{ completed: number; total: number }> = ({
  completed,
  total,
}) => {
  const percent = total === 0 ? 0 : (completed / total) * 100;
  const fillStyle = { width: `${percent}%` };

  const trackClassName = cn(
    "relative h-0.5 w-10 shrink-0 overflow-hidden rounded-full bg-foreground/10",
  );

  const fillClassName = cn(
    "absolute inset-y-0 left-0 rounded-full",
    "transition-[width] duration-300 ease-out motion-reduce:transition-none",
    completed === total ? "bg-emerald-500" : "bg-foreground/50",
  );

  return (
    <span aria-hidden className={trackClassName}>
      <span className={fillClassName} style={fillStyle} />
    </span>
  );
};

const PlanStrip: React.FC<{ plan: Plan }> = ({ plan }) => {
  const total = plan.steps.length;
  const completed = plan.steps.filter(
    (step) => step.status === "completed",
  ).length;
  const current = plan.steps.find((step) => step.status === "in_progress");
  const next = plan.steps.find((step) => step.status !== "completed");
  const label = current?.content ?? next?.content ?? "Plan complete";

  const title = plan.steps
    .map((step) => `${stepMark(step.status)} ${step.content}`)
    .join("\n");

  const stripClassName = cn(
    "flex h-8 items-center gap-2.5 px-3",
    "animate-in fade-in duration-200 motion-reduce:animate-none",
  );

  const dotClassName = cn(
    "size-1.5 rounded-full",
    completed === total
      ? "bg-emerald-500"
      : current
        ? "animate-pulse bg-amber-500 motion-reduce:animate-none"
        : "bg-muted-foreground/25",
  );

  return (
    <div title={title} className={stripClassName}>
      <span
        aria-hidden
        className="flex size-2 shrink-0 items-center justify-center"
      >
        <span className={dotClassName} />
      </span>
      <span className="min-w-0 truncate text-[11px] text-foreground/70">
        {label}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-2">
        <PlanProgress completed={completed} total={total} />
        <span className="text-[11px] tabular-nums text-muted-foreground/60">
          {completed}/{total}
        </span>
      </span>
    </div>
  );
};

export const AgentBar = () => {
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls, streamingSessionId } = useChatStream();

  const sessionId = session?.id;
  const prompts = usePendingPrompts(sessionId);
  const plan = usePlanStore((state) =>
    sessionId ? state.bySession[sessionId] : undefined,
  );
  const tools = useAgentTools(session, toolCalls);

  if (!session || session.type !== "agent") return null;

  const streaming = streamingSessionId === session.id && isSending;
  const hasPending = prompts.length > 0;
  const runningTools = streaming && toolCalls.length > 0;
  const showPlan = streaming && !hasPending && !!plan && plan.steps.length > 0;

  const rowClassName = cn(
    "relative flex select-none items-center gap-2.5 bg-linear-to-r to-transparent",
    "transition-colors duration-300",
    streaming && "from-amber-500/5",
    hasPending ? "items-stretch px-0" : "h-10 px-3",
  );

  const pendingClassName = cn(
    "w-full animate-in fade-in slide-in-from-top-1 duration-200",
    "motion-reduce:animate-none",
  );

  const glowClassName = cn(
    "pointer-events-none absolute inset-x-0 -bottom-px h-px animate-pulse",
    "bg-linear-to-r from-transparent via-amber-500/20 to-transparent",
    "motion-reduce:animate-none",
  );

  return (
    <div className="relative flex flex-col border-b border-border/40">
      <div className={rowClassName}>
        {hasPending ? (
          <div className={pendingClassName}>
            <PendingQueue key={session.id} items={prompts} />
          </div>
        ) : (
          <>
            <StreamStatus streaming={streaming} />
            <span aria-hidden className="h-3.5 w-px shrink-0 bg-border/50" />
            {runningTools ? (
              <ToolActivity toolCalls={toolCalls} running={tools.running} />
            ) : (
              <EnabledTools session={session} />
            )}
            <AccessControl disabled={streaming} />
          </>
        )}
      </div>

      {showPlan ? <PlanStrip plan={plan} /> : null}

      {streaming && <span aria-hidden className={glowClassName} />}
    </div>
  );
};
