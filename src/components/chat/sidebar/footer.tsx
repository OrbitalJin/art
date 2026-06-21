import { Progress } from "@/components/ui/progress";
import { useSessionStore } from "@/lib/store/use-session-store";
import { modelById } from "@/lib/ai/models";
import { useEffect, useMemo, useRef } from "react";
import { ArrowDown, ArrowUp, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export const SidebarFooter = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const activeId = useSessionStore((state) => state.activeId);
  const createSession = useSessionStore((state) => state.create);
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const usage = useMemo(() => {
    if (!activeSession) return { input: 0, output: 0, total: 0 };
    return activeSession.messages.reduce(
      (acc, msg) => ({
        input: acc.input + (msg.tokenUsage?.input ?? 0),
        output: acc.output + (msg.tokenUsage?.output ?? 0),
        total:
          acc.total +
          (msg.tokenUsage?.input ?? 0) +
          (msg.tokenUsage?.output ?? 0),
      }),
      { input: 0, output: 0, total: 0 },
    );
  }, [activeSession]);

  const model = activeSession ? modelById(activeSession.modelId) : null;
  const limit = model?.limit ?? 1_000_000;
  const pct = Math.min((usage.total / limit) * 100, 100);
  const fmt = (n: number) => n.toLocaleString();

  const isNearLimit = pct >= 70 && pct < 90;
  const isAtLimit = pct >= 90;

  const warnedSessionIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeSession) return;

    if (pct >= 70) {
      if (!warnedSessionIds.current.has(activeSession.id)) {
        warnedSessionIds.current.add(activeSession.id);
        toast.warning("Approaching context limit", {
          action: {
            label: "New session",
            onClick: () => createSession(),
          },
        });
      }
    } else {
      warnedSessionIds.current.delete(activeSession.id);
    }
  }, [activeSession?.id, pct >= 70]);

  return (
    <div className="border-t bg-muted/30">
      <div className="space-y-2.5 px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <HoverCard openDelay={300} closeDelay={150}>
            <HoverCardTrigger asChild>
              <span
                className={cn(
                  "flex cursor-default items-center gap-1 text-xs font-medium text-muted-foreground",
                  isAtLimit && "text-destructive",
                  isNearLimit && "text-amber-600 dark:text-amber-500",
                )}
              >
                {(isNearLimit || isAtLimit) && (
                  <TriangleAlert className="h-3 w-3" />
                )}
                Context usage
              </span>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              side="top"
              className="w-64 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
            >
              <div className="flex items-center justify-between border-b bg-muted/30 p-2 px-3">
                <p className="text-sm font-medium">Context Usage</p>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-xs text-muted-foreground">
                  This session has used{" "}
                  <span className="font-medium text-foreground">
                    {fmt(usage.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {fmt(limit)}
                  </span>{" "}
                  tokens.
                </p>
                {(isNearLimit || isAtLimit) && (
                  <p className="text-xs text-muted-foreground">
                    Long sessions can affect accuracy, slow down responses, and
                    cost more per message. Consider starting a new session to
                    keep things running smoothly.
                  </p>
                )}
                {(isNearLimit || isAtLimit) && (
                  <button
                    onClick={() => createSession()}
                    className="w-full rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Start new session
                  </button>
                )}
              </div>
            </HoverCardContent>
          </HoverCard>
          <span className="font-mono text-xs tabular-nums text-foreground">
            <span className="font-semibold">{fmt(usage.total)}</span>
            <span className="text-muted-foreground"> / {fmt(limit)}</span>
          </span>
        </div>

        <Progress
          value={pct}
          className={cn(
            "h-1.5 bg-muted/70",
            isAtLimit && "[&>div]:bg-destructive",
            isNearLimit && "[&>div]:bg-amber-500",
          )}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            {fmt(usage.input)} in
          </span>
          <span className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3" />
            {fmt(usage.output)} out
          </span>
        </div>
      </div>
    </div>
  );
};
