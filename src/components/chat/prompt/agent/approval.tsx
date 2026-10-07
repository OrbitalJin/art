import { Lock, LockOpen, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const ModeOption: React.FC<{
  label: string;
  selected: boolean;
  tone: "safe" | "risky";
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ label, selected, tone, onSelect, children }) => {
  const selectedClasses =
    tone === "safe"
      ? "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/25"
      : "bg-red-500/15 text-red-500 ring-1 ring-red-500/25";

  const optionClasses = cn(
    "flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5",
    "text-xs whitespace-nowrap outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? selectedClasses
      : "text-muted-foreground/60 hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={optionClasses}
    >
      {children}
      {label}
    </button>
  );
};

const ModeDescription: React.FC<{
  title: string;
  description: string;
  selected: boolean;
}> = ({ title, description, selected }) => {
  const rowClasses = cn(
    "flex flex-col gap-0.5 rounded-md p-2",
    selected ? "bg-muted/50 ring-1 ring-border/60" : "opacity-60",
  );

  return (
    <div className={rowClasses}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{title}</span>
        {selected && (
          <span className="text-[10px] font-medium text-muted-foreground">
            Current
          </span>
        )}
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

const ApprovalDetails: React.FC<{ autoRun: boolean }> = ({ autoRun }) => {
  const warningClasses = cn(
    "flex gap-2 rounded-md p-2 text-[11px] leading-snug",
    autoRun
      ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/25"
      : "bg-muted/40 text-muted-foreground",
  );

  return (
    <>
      <div className="flex items-center justify-between border-b bg-muted/30 p-3">
        <p className="text-sm font-medium">Tool approval</p>
        <span className="rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {autoRun ? "Auto-run" : "Ask first"}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <ModeDescription
          title="Ask first"
          description="The agent pauses and waits for your OK before every tool call."
          selected={!autoRun}
        />
        <ModeDescription
          title="Auto-run"
          description="The agent runs tools immediately, without waiting for you."
          selected={autoRun}
        />

        <div className={warningClasses}>
          <TriangleAlert size={13} aria-hidden className="mt-px shrink-0" />
          <p>
            With Auto-run, write and destructive actions (creating, editing and
            deleting) happen without asking you first, and may not be
            reversible.
          </p>
        </div>
      </div>
    </>
  );
};

export const Approval: React.FC = () => {
  const activeId = useSessionStore((store) => store.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );
  const requireApproval = useSessionStore((store) => store.requireApproval);

  if (!activeId || !session) return null;

  const autoRun = !!session.disableApproval;

  const handleAskFirst = () => requireApproval(activeId, true);
  const handleAutoRun = () => requireApproval(activeId, false);

  const groupClasses = cn(
    "flex shrink-0 items-center rounded-full bg-foreground/5 p-0.5",
    "ring-1 transition-colors duration-150",
    autoRun ? "ring-red-500/30" : "ring-border/50",
  );

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          role="radiogroup"
          aria-label="Tool approval"
          className={groupClasses}
        >
          <ModeOption
            label="Ask first"
            tone="safe"
            selected={!autoRun}
            onSelect={handleAskFirst}
          >
            <Lock size={11} aria-hidden className="shrink-0" />
          </ModeOption>

          <ModeOption
            label="Auto-run"
            tone="risky"
            selected={autoRun}
            onSelect={handleAutoRun}
          >
            <LockOpen size={11} aria-hidden className="shrink-0" />
          </ModeOption>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        side="top"
        className="w-80 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
      >
        <ApprovalDetails autoRun={autoRun} />
      </HoverCardContent>
    </HoverCard>
  );
};
