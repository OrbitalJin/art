import { Eye, LockOpen, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionIndex } from "@/lib/store/session/index-store";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ACCESS_MODE_TONES,
  accessModeLabel,
  type AccessMode,
  type AccessModeTone,
} from "@/lib/store/session/types";

const AccessOption: React.FC<{
  label: string;
  selected: boolean;
  tone: AccessModeTone;
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ label, selected, tone, onSelect, children }) => {
  const optionClasses = cn(
    "flex cursor-pointer items-center rounded-md border px-2 py-1 outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? cn("border-foreground/15", tone.fill, tone.text)
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

const AccessDescription: React.FC<{
  label: string;
  description: string;
  selected: boolean;
  tone: AccessModeTone;
  children: React.ReactNode;
}> = ({ label, description, selected, tone, children }) => {
  const rowClasses = cn(
    "flex items-start gap-2.5 rounded-lg border px-2.5 py-2",
    selected ? cn("border-foreground/15", tone.fill) : "border-transparent opacity-60",
  );

  const iconClasses = cn(
    "mt-0.5 shrink-0",
    selected ? tone.text : "text-muted-foreground",
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

const AccessDetails: React.FC<{ mode: AccessMode }> = ({ mode }) => {
  const currentLabel = accessModeLabel(mode);

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 pr-2.5 pl-3.5">
        <p className="text-[13px] font-medium text-foreground">Access control</p>
        <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60">
          {currentLabel}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 p-1.5">
        <AccessDescription
          label="Read only"
          description="The agent can read, search, and ask questions, but cannot create, edit, or delete anything."
          selected={mode === "readonly"}
          tone={ACCESS_MODE_TONES.readonly}
        >
          <Eye size={13} aria-hidden />
        </AccessDescription>

        <AccessDescription
          label="Ask to write"
          description="Reads run freely; every create, edit, or delete pauses for your approval first."
          selected={mode === "confirm"}
          tone={ACCESS_MODE_TONES.confirm}
        >
          <ShieldAlert size={13} aria-hidden />
        </AccessDescription>

        <AccessDescription
          label="Autonomous"
          description="The agent runs tools immediately, including writes, without waiting for you."
          selected={mode === "autonomous"}
          tone={ACCESS_MODE_TONES.autonomous}
        >
          <LockOpen size={13} aria-hidden />
        </AccessDescription>
      </div>
    </>
  );
};

export const AccessControl: React.FC<{ disabled: boolean }> = ({
  disabled,
}) => {
  const activeId = useSessionIndex((store) => store.activeId);
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === activeId),
  );
  const setAccessMode = useSessionIndex((store) => store.setAccessMode);

  if (!activeId || !session) return null;

  const mode = session.accessMode ?? "confirm";
  const tone = ACCESS_MODE_TONES[mode];

  const groupClasses = cn(
    "flex shrink-0 items-center gap-0.5 rounded-lg p-0.5 h-7",
    "ring-1 transition-colors duration-150",
    tone.ring,
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
          aria-label="Access control"
          className={groupClasses}
        >
          <AccessOption
            label="Read only"
            selected={mode === "readonly"}
            tone={ACCESS_MODE_TONES.readonly}
            onSelect={() => setAccessMode(activeId, "readonly")}
          >
            <Eye size={12} aria-hidden />
          </AccessOption>

          <AccessOption
            label="Ask to write"
            selected={mode === "confirm"}
            tone={ACCESS_MODE_TONES.confirm}
            onSelect={() => setAccessMode(activeId, "confirm")}
          >
            <ShieldAlert size={12} aria-hidden />
          </AccessOption>

          <AccessOption
            label="Autonomous"
            selected={mode === "autonomous"}
            tone={ACCESS_MODE_TONES.autonomous}
            onSelect={() => setAccessMode(activeId, "autonomous")}
          >
            <LockOpen size={12} aria-hidden />
          </AccessOption>
        </div>
      </HoverCardTrigger>

      <HoverCardContent align="end" side="top" className={contentClasses}>
        <AccessDetails mode={mode} />
      </HoverCardContent>
    </HoverCard>
  );
};
