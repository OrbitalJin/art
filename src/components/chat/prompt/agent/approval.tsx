import { Eye, LockOpen, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/use-session-store";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { AccessMode } from "@/lib/ai/tools/registry";

type Tone = "safe" | "warn" | "risky";

interface ModeDef {
  id: AccessMode;
  label: string;
  description: string;
  tone: Tone;
  icon: React.ReactNode;
}

const MODES: ModeDef[] = [
  {
    id: "readonly",
    label: "Read only",
    description:
      "The agent can read, search, and ask questions, but cannot create, edit, or delete anything.",
    tone: "safe",
    icon: <Eye size={11} aria-hidden className="shrink-0" />,
  },
  {
    id: "confirm",
    label: "Ask to write",
    description:
      "Reads run freely; every create, edit, or delete pauses for your approval first.",
    tone: "warn",
    icon: <ShieldAlert size={11} aria-hidden className="shrink-0" />,
  },
  {
    id: "autonomous",
    label: "Autonomous",
    description:
      "The agent runs tools immediately, including writes, without waiting for you.",
    tone: "risky",
    icon: <LockOpen size={11} aria-hidden className="shrink-0" />,
  },
];

const TONE_SELECTED: Record<Tone, string> = {
  safe: "bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/25",
  warn: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/25",
  risky: "bg-red-500/15 text-red-500 ring-1 ring-red-500/25",
};

const TONE_RING: Record<Tone, string> = {
  safe: "ring-emerald-500/30",
  warn: "ring-amber-500/30",
  risky: "ring-red-500/30",
};

const ModeOption: React.FC<{
  mode: ModeDef;
  selected: boolean;
  onSelect: () => void;
}> = ({ mode, selected, onSelect }) => {
  const optionClasses = cn(
    "flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5",
    "text-xs whitespace-nowrap outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    selected
      ? TONE_SELECTED[mode.tone]
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
      {mode.icon}
    </button>
  );
};

const ModeDescription: React.FC<{ mode: ModeDef; selected: boolean }> = ({
  mode,
  selected,
}) => {
  const rowClasses = cn(
    "flex flex-col gap-0.5 rounded-md p-2",
    selected ? "bg-muted/50 border border-primary/20" : "opacity-60",
  );

  return (
    <div className={rowClasses}>
      <div className={cn("flex items-center justify-between")}>
        <span className="text-xs font-medium">{mode.label}</span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        {mode.description}
      </p>
    </div>
  );
};

const ApprovalDetails: React.FC<{ mode: AccessMode }> = ({ mode }) => {
  const current = MODES.find((m) => m.id === mode) ?? MODES[1];

  return (
    <>
      <div className="flex items-center justify-between border-b bg-muted/30 p-3">
        <p className="text-sm font-medium">Tool access policy</p>
        <span className="rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {current.label}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {MODES.map((m) => (
          <ModeDescription key={m.id} mode={m} selected={m.id === mode} />
        ))}
      </div>
    </>
  );
};

export const Approval: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const activeId = useSessionStore((store) => store.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === activeId),
  );
  const setAccessMode = useSessionStore((store) => store.setAccessMode);

  if (!activeId || !session) return null;

  const mode = session.accessMode ?? "confirm";
  const current = MODES.find((m) => m.id === mode) ?? MODES[1];

  const groupClasses = cn(
    "flex shrink-0 items-center rounded-full bg-foreground/5 p-0.5",
    "ring-1 transition-colors duration-150",
    TONE_RING[current.tone],
  );

  return (
    <HoverCard openDelay={2000} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          role="radiogroup"
          aria-label="Tool access"
          className={cn(
            groupClasses,
            disabled && "pointer-events-none opacity-80",
          )}
        >
          {MODES.map((m) => (
            <ModeOption
              key={m.id}
              mode={m}
              selected={m.id === mode}
              onSelect={() => setAccessMode(activeId, m.id)}
            />
          ))}
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        side="top"
        className="w-80 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
      >
        <ApprovalDetails mode={mode} />
      </HoverCardContent>
    </HoverCard>
  );
};
