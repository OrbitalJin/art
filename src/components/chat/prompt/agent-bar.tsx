import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { CompactSummary } from "@/components/chat/messages/tool-call-card";
import { cn } from "@/lib/utils";

const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const Divider = () => (
  <span aria-hidden className="h-3 w-px shrink-0 bg-border/70" />
);

const Readout: React.FC<{
  label: string;
  value: string;
  dim?: boolean;
}> = ({ label, value, dim }) => (
  <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
    <span className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground/45">
      {label}
    </span>
    <span
      className={cn(
        "font-mono text-[11px] tabular-nums",
        dim ? "text-muted-foreground/40" : "text-foreground/75",
      )}
    >
      {value}
    </span>
  </span>
);

const StateDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className="relative flex size-1.5 shrink-0 self-center">
    <span
      className={cn(
        "relative inline-flex size-1.5 rounded-full",
        active ? "bg-amber-500" : "bg-emerald-500",
      )}
    />
    {active ? (
      <span className="absolute inline-flex size-1.5 animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
    ) : null}
  </span>
);

const ContextReadout: React.FC<{
  knowledgeBase?: string;
  journal?: boolean;
  tasks?: boolean;
}> = ({ knowledgeBase, journal, tasks }) => (
  <span className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
    <Readout
      label="Knowledge"
      value={knowledgeBase ? basename(knowledgeBase) : "Off"}
      dim={!knowledgeBase}
    />
    <Divider />
    <Readout label="Journal" value={journal ? "On" : "Off"} dim={!journal} />
    <Divider />
    <Readout label="Tasks" value={tasks ? "On" : "Off"} dim={!tasks} />
  </span>
);

const ActivityLine: React.FC<{
  toolCalls: ToolCallBlock[];
  running: number;
}> = ({ toolCalls, running }) => {
  const single = toolCalls.length === 1 ? toolCalls[0] : null;

  if (single) {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="shrinko-0 text-[10px] font-medium tracking-[0.14em] text-muted-foreground"
          style={{ fontFamily: "monospace" }}
        >
          {single.toolName}
        </span>
        <CompactSummary block={single} />
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <span className="truncate text-[10px] font-medium tracking-[0.14em] text-muted-foreground/85">
        {toolCalls.length} tools {running > 0 ? "running" : "used"}…
      </span>
    </span>
  );
};

export const AgentBar = () => {
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls } = useChatStream();

  if (!session) return null;

  const isAgent = session.type === "agent";
  const active = isSending && toolCalls.length > 0;
  if (!isAgent && !active) return null;

  const running = toolCalls.filter(
    (call) => call.state === "executing" && call.toolName !== DONE_TOOL_NAME,
  ).length;

  return (
    <div className="flex h-8 items-center gap-2 border-b px-2.5">
      <StateDot active={isSending} />
      {active ? (
        <ActivityLine toolCalls={toolCalls} running={running} />
      ) : (
        <ContextReadout
          knowledgeBase={session.knowledgeBase}
          journal={session.capabilities.journal}
          tasks={session.capabilities.tasks}
        />
      )}
    </div>
  );
};
