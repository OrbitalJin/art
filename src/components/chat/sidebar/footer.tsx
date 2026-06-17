import { Progress } from "@/components/ui/progress";
import { useSessionStore } from "@/lib/store/use-session-store";
import { modelById } from "@/lib/ai/models";
import { useMemo } from "react";

export const SidebarFooter = () => {
  const sessions = useSessionStore((state) => state.sessions);
  const activeId = useSessionStore((state) => state.activeId);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const usage = useMemo(() => {
    if (!activeSession) return { input: 0, output: 0, total: 0 };

    return activeSession.messages.reduce(
      (acc, msg) => ({
        input: acc.input + msg.tokenUsage?.input,
        output: acc.output + msg.tokenUsage?.output,
        total: acc.total + msg.tokenUsage?.input + msg.tokenUsage?.output,
      }),
      { input: 0, output: 0, total: 0 },
    );
  }, [activeSession]);

  const model = activeSession ? modelById(activeSession.modelId) : null;
  const limit = model?.limit ?? 1_000_000;
  const pct = Math.min((usage.total / limit) * 100, 100);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="border-t bg-card/50">
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Tokens</span>
          <span className="font-medium tabular-nums text-foreground">
            {fmt(usage.total)} / {fmt(limit)}
          </span>
        </div>

        <Progress value={pct} className="h-2 bg-muted/70" />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>↑ {fmt(usage.output)} out</span>
          <span>↓ {fmt(usage.input)} in</span>
        </div>
      </div>
    </div>
  );
};
