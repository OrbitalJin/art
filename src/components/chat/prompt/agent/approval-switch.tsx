import { Eye, LockOpen, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { AccessMode } from "@/lib/ai/tools/registry";

const SAFE_TONE = "text-emerald-500";
const WARN_TONE = "text-amber-500";
const RISKY_TONE = "text-red-500";

const ModeOption: React.FC<{
  label: string;
  selected: boolean;
  toneClasses: string;
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ label, selected, toneClasses, onSelect, children }) => {
  const optionClasses = cn(
    "flex cursor-pointer items-center rounded-md border px-2 py-1 outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? cn("border-foreground/15 bg-muted/50", toneClasses)
      : "border-transparent text-muted-foreground hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={optionClasses}
    >
      {children}
    </button>
  );
};

const ModeDescription: React.FC<{
  label: string;
  description: string;
  selected: boolean;
  toneClasses: string;
  children: React.ReactNode;
}> = ({ label, description, selected, toneClasses, children }) => {
  const rowClasses = cn(
    "flex items-start gap-2.5 rounded-lg border px-2.5 py-2",
    selected
      ? "border-foreground/15 bg-muted/50"
      : "border-transparent opacity-60",
  );

  const iconClasses = cn(
    "mt-0.5 shrink-0",
    selected ? toneClasses : "text-muted-foreground",
  );

  return (
    <div className={rowClasses}>
      <span className={iconClasses}>{children}</span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[13px] font-medium text-foreground">{label}</span>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
};

const ApprovalDetails: React.FC<{ mode: AccessMode }> = ({ mode }) => {
  const currentLabel =
    mode === "readonly"
      ? "Read only"
      : mode === "autonomous"
        ? "Autonomous"
        : "Ask to write";

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 pr-2.5 pl-3.5">
        <p className="text-[13px] font-medium text-foreground">Tool access</p>
        <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60">
          {currentLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 p-1.5">
        <ModeDescription
          label="Read only"
          description="The agent can read, search, and ask questions, but cannot create, edit, or delete anything."
          selected={mode === "readonly"}
          toneClasses={SAFE_TONE}
        >
          <Eye size={13} aria-hidden />
        </ModeDescription>

        <ModeDescription
          label="Ask to write"
          description="Reads run freely; every create, edit, or delete pauses for your approval first."
          selected={mode === "confirm"}
          toneClasses={WARN_TONE}
        >
          <ShieldAlert size={13} aria-hidden />
        </ModeDescription>

        <ModeDescription
          label="Autonomous"
          description="The agent runs tools immediately, including writes, without waiting for you."
          selected={mode === "autonomous"}
          toneClasses={RISKY_TONE}
        >
          <LockOpen size={13} aria-hidden />
        </ModeDescription>
      </div>
    </>
  );
};

export const ApprovalSwitch: React.FC<{ disabled: boolean }> = ({
  disabled,
}) => {
  const activeId = useSessionStore((store) => store.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );
  const setAccessMode = useSessionStore((store) => store.setAccessMode);

  if (!activeId || !session) return null;

  const mode = session.accessMode ?? "confirm";

  const groupClasses = cn(
    "flex shrink-0 items-center gap-0.5 rounded-lg p-0.5 h-7",
    "ring-1 ring-border/60 transition-colors duration-150",
    disabled && "pointer-events-none opacity-60",
  );

  const contentClasses = cn(
    "w-80 overflow-hidden rounded-xl border-border/60 p-0 shadow-lg",
  );

  return (
    <HoverCard openDelay={2000} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          role="radiogroup"
          aria-label="Tool access"
          className={groupClasses}
        >
          <ModeOption
            label="Read only"
            selected={mode === "readonly"}
            toneClasses={SAFE_TONE}
            onSelect={() => setAccessMode(activeId, "readonly")}
          >
            <Eye size={12} aria-hidden />
          </ModeOption>

          <ModeOption
            label="Ask to write"
            selected={mode === "confirm"}
            toneClasses={WARN_TONE}
            onSelect={() => setAccessMode(activeId, "confirm")}
          >
            <ShieldAlert size={12} aria-hidden />
          </ModeOption>

          <ModeOption
            label="Autonomous"
            selected={mode === "autonomous"}
            toneClasses={RISKY_TONE}
            onSelect={() => setAccessMode(activeId, "autonomous")}
          >
            <LockOpen size={12} aria-hidden />
          </ModeOption>
        </div>
      </HoverCardTrigger>

      <HoverCardContent align="end" side="top" className={contentClasses}>
        <ApprovalDetails mode={mode} />
      </HoverCardContent>
    </HoverCard>
  );
};
