import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import { ToolUse } from "./tool-use";
import { Approval } from "./approval";
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
      active ? "shimmer text-amber-500" : "text-foreground/80",
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
    className="pointer-events-none absolute inset-x-0 -bottom-px h-px animate-pulse bg-linear-to-r from-transparent via-amber-500/40 to-transparent motion-reduce:animate-none"
  />
);

export const AgentBar = () => {
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isSending, toolCalls } = useChatStream();

  if (!session) return null;

  const isAgent = session.type === "agent";
  const active = isSending && toolCalls.length > 0;
  if (!isAgent && !active) return null;

  const barClasses = cn(
    "relative flex h-10 items-center gap-2.5 border-b border-border/40 px-3",
    "bg-linear-to-r to-transparent transition-colors duration-300",
    isSending ? "from-amber-500/3" : "from-emerald-500/2",
  );

  return (
    <div className={barClasses}>
      <StateDot active={isSending} />
      <StatusLabel active={isSending} />
      <Divider />

      <ToolUse active={active} />

      <Approval />

      {isSending && <ProgressLine />}
    </div>
  );
};
