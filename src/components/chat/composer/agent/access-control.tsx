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
  const optionClassName = cn(
    "flex h-6 cursor-pointer items-center rounded-full px-2.5 outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? cn("bg-background shadow-sm", tone.text)
      : "text-muted-foreground/60 hover:text-foreground",
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
    "flex items-start gap-2.5 rounded-lg px-3 py-2",
    "transition-colors duration-150",
    selected ? "bg-accent/40" : "opacity-55",
  );

  const iconClassName = cn(
    "mt-0.5 shrink-0",
    selected ? tone.text : "text-muted-foreground",
  );

  return (
    <div className={rowClassName}>
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
  const headerClassName = cn(
    "border-b border-border/40 px-4 py-2.5",
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
  );

  return (
    <>
      <p className={headerClassName}>Access control</p>

      <div className="flex flex-col gap-0.5 p-1">
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

  const groupClassName = cn(
    "flex h-7 shrink-0 items-center gap-0.5 rounded-full bg-muted/40 p-0.5",
    "transition-opacity duration-150",
    disabled && "pointer-events-none opacity-60",
  );

  const contentClassName = cn(
    "w-80 overflow-hidden rounded-xl p-0",
    "border-border/40 bg-popover/80 shadow-lg shadow-black/10 backdrop-blur-2xl",
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
