import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSessionStore } from "@/lib/store/use-session-store";
import { modelById } from "@/lib/ai/models";
import type { Session } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";

const WARN_AT = 70;
const CRITICAL_AT = 90;

type Level = "ok" | "warn" | "critical";

const formatExact = (value: number): string => value.toLocaleString();

const formatCompact = (value: number): string =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const getUsage = (messages: Session["messages"]) => {
  let input = 0;
  let output = 0;

  for (const message of messages) {
    input += message.tokenUsage?.input ?? 0;
    output += message.tokenUsage?.output ?? 0;
  }

  // Context is the size of the last completed assistant turn. Turns with no
  // usage (aborted or errored) are skipped so they don't read as 0%.
  let context = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") continue;

    const used =
      (message.tokenUsage?.input ?? 0) + (message.tokenUsage?.output ?? 0);
    if (used > 0) {
      context = used;
      break;
    }
  }

  return { input, output, total: input + output, context };
};

const EMPTY_USAGE = { input: 0, output: 0, total: 0, context: 0 };

const getLevel = (pct: number): Level => {
  if (pct >= CRITICAL_AT) return "critical";
  if (pct >= WARN_AT) return "warn";
  return "ok";
};

const UsageRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-6 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground/90 tabular-nums">{value}</span>
  </div>
);

export const SidebarFooter = () => {
  const activeSession = useSessionStore((state) =>
    state.sessions.find((session) => session.id === state.activeId),
  );

  const usage = useMemo(
    () => (activeSession ? getUsage(activeSession.messages) : EMPTY_USAGE),
    [activeSession],
  );

  const model = activeSession ? modelById(activeSession.modelId) : null;
  const limit = model?.context ?? 0;
  const pct = limit > 0 ? Math.min((usage.context / limit) * 100, 100) : 0;
  const level = getLevel(pct);

  const sessionId = activeSession?.id;
  const overWarn = pct >= WARN_AT;
  const warnedSessionIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionId) return;

    if (!overWarn) {
      warnedSessionIds.current.delete(sessionId);
      return;
    }

    if (warnedSessionIds.current.has(sessionId)) return;

    warnedSessionIds.current.add(sessionId);
    toast.warning("Approaching context limit");
  }, [sessionId, overWarn]);

  if (!activeSession || limit <= 0) return null;

  const percentClasses = cn(
    "text-xs font-medium tabular-nums",
    level === "ok" && "text-muted-foreground",
    level === "warn" && "text-amber-600 dark:text-amber-500",
    level === "critical" && "text-destructive",
  );

  const progressClasses = cn(
    "h-1 bg-muted/70",
    level === "warn" && "[&>div]:bg-amber-500",
    level === "critical" && "[&>div]:bg-destructive",
  );

  const hintClasses = cn(
    "text-[11px] leading-snug",
    level === "warn" && "text-amber-600/80 dark:text-amber-500/80",
    level === "critical" && "text-destructive/80",
  );

  return (
    <footer className="border-t border-border/50 px-4 py-3">
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            tabIndex={0}
            className="flex cursor-default flex-col gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Context</span>
              <span className={percentClasses}>{Math.round(pct)}%</span>
            </div>

            <Progress value={pct} className={progressClasses} />

            <p className="text-[11px] text-muted-foreground/60 tabular-nums">
              {formatCompact(usage.context)} of {formatCompact(limit)} tokens
            </p>

            {level !== "ok" && (
              <p className={hintClasses}>
                Long sessions get slower and less accurate. Consider starting a
                new one.
              </p>
            )}
          </div>
        </HoverCardTrigger>

        <HoverCardContent
          side="top"
          align="start"
          className="w-64 border-muted-foreground/20 p-3 shadow-xl"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-foreground/90">
                Context window
              </p>
              <span className={percentClasses}>{Math.round(pct)}%</span>
            </div>

            <p className="text-xs leading-snug text-muted-foreground">
              This conversation is{" "}
              <span className="font-medium text-foreground/90">
                {formatExact(usage.context)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground/90">
                {formatExact(limit)}
              </span>{" "}
              tokens.
            </p>

            <div className="flex flex-col gap-1.5 border-t border-border/50 pt-3">
              <UsageRow label="Sent" value={formatExact(usage.input)} />
              <UsageRow label="Received" value={formatExact(usage.output)} />
              <UsageRow
                label="Total processed"
                value={formatExact(usage.total)}
              />
            </div>

            <p className="text-[11px] leading-snug text-muted-foreground/60">
              Each request resends the history, so the total grows faster than
              the conversation does.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </footer>
  );
};
