import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const bannerClasses = cn(
  "group mb-2 flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-lg",
  "border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-left text-xs",
  "outline-none transition-colors duration-150 hover:bg-amber-500/10",
  "focus-visible:ring-2 focus-visible:ring-ring/50",
);

const AttentionDot: React.FC = () => (
  <span aria-hidden className="relative flex size-1.5 shrink-0">
    <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
  </span>
);

const BannerContent: React.FC<{
  label: string;
  detail?: string;
  action: string;
}> = ({ label, detail, action }) => (
  <>
    <AttentionDot />
    <span className="shrink-0 font-medium text-foreground/80">{label}</span>
    {detail && (
      <span className="min-w-0 truncate text-muted-foreground/70">
        {detail}
      </span>
    )}
    <span
      className={cn(
        "ml-auto shrink-0 text-[11px] font-medium text-amber-600 dark:text-amber-400",
        "transition-opacity duration-150 group-hover:opacity-80",
      )}
    >
      {action}
    </span>
  </>
);

const AttentionRowButton: React.FC<{
  row: AttentionRow;
  onSelect: (row: AttentionRow) => void;
}> = ({ row, onSelect }) => {
  const rowClasses = cn(
    "flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2",
    "text-left outline-none transition-colors duration-150 hover:bg-accent/30",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  return (
    <button type="button" onClick={() => onSelect(row)} className={rowClasses}>
      <AttentionDot />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] text-foreground/90">
          {row.title || "Untitled session"}
        </span>
        <span className="truncate text-[11px] text-muted-foreground/70">
          {row.summary}
        </span>
      </span>
    </button>
  );
};

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
            .filter(
              (entry) =>
                entry.status === "pending" && entry.sessionId === sessionId,
            )
            .map((entry) => ({
              requestedAt: entry.requestedAt,
              summary: `Approve ${formatToolName(entry.toolName)}`,
            })),
          ...Object.values(questions)
            .filter(
              (entry) =>
                entry.status === "pending" && entry.sessionId === sessionId,
            )
            .map((entry) => ({
              requestedAt: entry.requestedAt,
              summary: entry.questions[0]?.header ?? "Question",
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
      <button type="button" onClick={() => jump(row)} className={bannerClasses}>
        <BannerContent
          label="Needs your attention"
          detail={row.title || row.summary}
          action="Jump"
        />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={bannerClasses}>
          <BannerContent
            label={`${rows.length} sessions need your attention`}
            action="Review"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        className="w-80 overflow-hidden border-muted-foreground/20 p-1 shadow-xl"
      >
        <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium text-muted-foreground/60">
          Waiting on you
        </p>

        <div className="flex flex-col gap-0.5">
          {rows.map((row) => (
            <AttentionRowButton key={row.sessionId} row={row} onSelect={jump} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
