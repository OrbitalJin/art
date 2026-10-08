import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";
import { useAttentionOwners } from "@/hooks/use-session-attention";
import { formatToolName } from "@/components/chat/messages/tool-call-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SessionType } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";

interface AttentionRow {
  sessionId: string;
  title: string;
  type: SessionType;
  summary: string;
}

const triggerClasses = cn(
  "mb-2 flex w-full items-center gap-2 rounded-lg border border-amber-500/30",
  "bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-600",
  "transition-colors hover:bg-amber-500/15 dark:text-amber-400",
);

export const AgentAttention: React.FC = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);
  const owners = useAttentionOwners(activeId);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const rows = useMemo<AttentionRow[]>(
    () =>
      owners.map((sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        const candidates = [
          ...Object.values(approvals)
            .filter((e) => e.status === "pending" && e.sessionId === sessionId)
            .map((e) => ({
              requestedAt: e.requestedAt,
              summary: `Approve ${formatToolName(e.toolName)}`,
            })),
          ...Object.values(questions)
            .filter((e) => e.status === "pending" && e.sessionId === sessionId)
            .map((e) => ({
              requestedAt: e.requestedAt,
              summary: e.questions[0]?.header ?? "Question",
            })),
        ].sort((a, b) => b.requestedAt - a.requestedAt);

        return {
          sessionId,
          title: session?.title ?? "",
          type: session?.type ?? "chat",
          summary: candidates[0]?.summary ?? "Needs input",
        };
      }),
    [owners, sessions, approvals, questions],
  );

  if (rows.length === 0) return null;

  const jump = (row: AttentionRow) => {
    setOpen(false);
    navigate(`/session/${row.type}/${row.sessionId}`);
  };

  if (rows.length === 1) {
    const row = rows[0];
    return (
      <button
        type="button"
        onClick={() => jump(row)}
        className={triggerClasses}
      >
        <span className="truncate font-medium">
          Agent needs your attention{row.title ? ` in “${row.title}”` : ""}
        </span>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium">
          Jump
          <ArrowRight className="size-3" />
        </span>
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClasses}>
          <span className="truncate font-medium">
            {rows.length} sessions need your attention
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-medium">
            Review
            <ArrowRight className="size-3" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        className="w-80 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
      >
        <div className="border-b bg-muted/30 px-3 py-2">
          <p className="text-sm font-medium">Needs your attention</p>
        </div>

        <div className="flex flex-col gap-0.5 p-1">
          {rows.map((row) => (
            <button
              key={row.sessionId}
              type="button"
              onClick={() => jump(row)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left",
                "outline-none transition-colors hover:bg-accent/20",
                "focus-visible:ring-2 focus-visible:ring-ring/50",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground/90">
                  {row.title || "Untitled session"}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {row.summary}
                </span>
              </span>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/60" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
