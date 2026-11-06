import type { ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { CompactSummary } from "@/components/chat/messages/tool-call";
import { formatToolName } from "@/components/chat/messages/tools/shared";
import { cn } from "@/lib/utils";

const ProgressTrack: React.FC<{ finished: number; total: number }> = ({
  finished,
  total,
}) => {
  const percent = total === 0 ? 0 : (finished / total) * 100;
  const fillStyle = { width: `${percent}%` };

  const trackClassName = cn(
    "relative h-0.5 w-10 shrink-0 overflow-hidden rounded-full bg-foreground/10",
  );

  const fillClassName = cn(
    "absolute inset-y-0 left-0 rounded-full bg-foreground/50",
    "transition-[width] duration-300 ease-out motion-reduce:transition-none",
  );

  return (
    <span aria-hidden className={trackClassName}>
      <span className={fillClassName} style={fillStyle} />
    </span>
  );
};

export const ToolActivity: React.FC<{
  toolCalls: ToolCallBlock[];
  running: number;
}> = ({ toolCalls, running }) => {
  const single = toolCalls.length === 1 ? toolCalls[0] : null;

  if (single) {
    const isDone = single.toolName === DONE_TOOL_NAME;
    const title = isDone ? "Wrapping up" : formatToolName(single.toolName);

    const wrapperClassName = cn(
      "flex min-w-0 flex-1 items-center gap-2",
      "animate-in fade-in duration-200 motion-reduce:animate-none",
    );

    return (
      <span key={single.toolName} className={wrapperClassName}>
        <span className="shrink-0 text-xs font-medium text-foreground/80">
          {title}
        </span>
        {!isDone && <CompactSummary block={single} />}
      </span>
    );
  }

  const total = toolCalls.length;
  const finished = total - running;
  const countLabel =
    running > 0
      ? `Running ${running} of ${total} tools…`
      : `Used ${total} tools`;

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2.5">
      <span className="truncate text-xs text-foreground/80">{countLabel}</span>
      <ProgressTrack finished={finished} total={total} />
    </span>
  );
};
