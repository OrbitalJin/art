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

const ActiveBar: React.FC<{ tone: AccessModeTone }> = ({ tone }) => {
  const wrapperClassName = cn(
    "pointer-events-none absolute inset-y-0 left-0 flex items-center",
    tone.text,
  );

  return (
    <span aria-hidden className={wrapperClassName}>
      <span className="h-4 w-0.5 rounded-r-full bg-current" />
    </span>
  );
};

const AccessOption: React.FC<{
  label: string;
  selected: boolean;
  tone: AccessModeTone;
  onSelect: () => void;
  children: React.ReactNode;
}> = ({ label, selected, tone, onSelect, children }) => {
  const optionClassName = cn(
    "flex h-6 cursor-pointer items-center rounded-full border px-2.5 outline-none",
    "transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? cn("border-foreground/15 shadow-sm", tone.fill, tone.text)
      : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={optionClassName}
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
  const rowClassName = cn(
    "relative flex items-start gap-2.5 rounded-xl border px-3 py-2",
    "transition-opacity duration-150",
    selected
      ? cn("border-foreground/10", tone.fill)
      : "border-transparent opacity-55",
  );

  const iconClassName = cn(
    "mt-0.5 shrink-0",
    selected ? tone.text : "text-muted-foreground",
  );

  return (
    <div className={rowClassName}>
      {selected && <ActiveBar tone={tone} />}
      <span className={iconClassName}>{children}</span>
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
  const currentTone = ACCESS_MODE_TONES[mode];

  const headerClassName = cn(
    "flex items-center justify-between gap-2",
    "border-b border-border/40 py-2.5 pl-4 pr-3",
  );

  const labelClassName = cn(
    "text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  const currentClassName = cn(
    "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ring-foreground/10",
    currentTone.fill,
    currentTone.text,
  );

  return (
    <>
      <div className={headerClassName}>
        <p className={labelClassName}>Access control</p>
        <span className={currentClassName}>{currentLabel}</span>
      </div>

      <div className="flex flex-col gap-0.5 p-1.5">
        <AccessDescription
          label="Read only"
          description="The agent can read, search, and ask questions, but cannot create, edit, or delete anything."
          selected={mode === "readonly"}
          tone={ACCESS_MODE_TONES.readonly}
        >
          <Eye size={13} strokeWidth={1.75} aria-hidden />
        </AccessDescription>

        <AccessDescription
          label="Ask to write"
          description="Reads run freely; every create, edit, or delete pauses for your approval first."
          selected={mode === "confirm"}
          tone={ACCESS_MODE_TONES.confirm}
        >
          <ShieldAlert size={13} strokeWidth={1.75} aria-hidden />
        </AccessDescription>

        <AccessDescription
          label="Autonomous"
          description="The agent runs tools immediately, including writes, without waiting for you."
          selected={mode === "autonomous"}
          tone={ACCESS_MODE_TONES.autonomous}
        >
          <LockOpen size={13} strokeWidth={1.75} aria-hidden />
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

  const groupClassName = cn(
    "flex h-7 shrink-0 items-center gap-0.5 rounded-full p-0.5",
    "bg-background/40 ring-1 transition-colors duration-150",
    tone.ring,
    disabled && "pointer-events-none opacity-60",
  );

  const contentClassName = cn(
    "w-80 overflow-hidden rounded-2xl p-0",
    "border-border/40 bg-popover/80 backdrop-blur-2xl",
    "shadow-xl shadow-black/15 ring-1 ring-inset ring-foreground/5",
  );

  return (
    <HoverCard openDelay={2000} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          role="radiogroup"
          aria-label="Access control"
          className={groupClassName}
        >
          <AccessOption
            label="Read only"
            selected={mode === "readonly"}
            tone={ACCESS_MODE_TONES.readonly}
            onSelect={() => setAccessMode(activeId, "readonly")}
          >
            <Eye size={12} strokeWidth={1.75} aria-hidden />
          </AccessOption>

          <AccessOption
            label="Ask to write"
            selected={mode === "confirm"}
            tone={ACCESS_MODE_TONES.confirm}
            onSelect={() => setAccessMode(activeId, "confirm")}
          >
            <ShieldAlert size={12} strokeWidth={1.75} aria-hidden />
          </AccessOption>

          <AccessOption
            label="Autonomous"
            selected={mode === "autonomous"}
            tone={ACCESS_MODE_TONES.autonomous}
            onSelect={() => setAccessMode(activeId, "autonomous")}
          >
            <LockOpen size={12} strokeWidth={1.75} aria-hidden />
          </AccessOption>
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        side="top"
        sideOffset={8}
        className={contentClassName}
      >
        <AccessDetails mode={mode} />
      </HoverCardContent>
    </HoverCard>
  );
};
