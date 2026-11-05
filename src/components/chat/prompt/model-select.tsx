import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStream } from "@/hooks/use-chat-stream";
import { MODELS } from "@/lib/ai/models";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { cn } from "@/lib/utils";
import { Check, ChevronUp, Cpu } from "lucide-react";
import { useState } from "react";
import { selectableRowClasses } from "./agent/configure-menu/helpers";

type Model = (typeof MODELS)[number];

interface ModelRowProps {
  model: Model;
  selected: boolean;
  onSelect: () => void;
}

const ModelRow = ({ model, selected, onSelect }: ModelRowProps) => {
  const rowClassName = cn(selectableRowClasses(selected), "relative");

  const indicatorClassName = cn(
    "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2",
    "rounded-r-full bg-primary",
  );

  const nameClassName = cn(
    "truncate text-[13px] font-medium",
    selected ? "text-foreground" : "text-foreground/80",
  );

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={rowClassName}
    >
      {selected && <span aria-hidden className={indicatorClassName} />}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className={nameClassName}>{model.displayName}</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {model.description}
        </span>
      </span>
      {selected && (
        <Check strokeWidth={2} className="size-3.5 shrink-0 text-primary" />
      )}
    </button>
  );
};

interface ModelTriggerProps {
  label: string;
  open: boolean;
  disabled: boolean;
}

const ModelTrigger = ({ label, open, disabled }: ModelTriggerProps) => {
  const triggerClassName = cn(
    "inline-flex h-8 max-w-44 cursor-pointer items-center gap-1.5 rounded-full px-3",
    "text-xs text-muted-foreground/80 transition-colors outline-none",
    "hover:bg-accent/60 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    open && "bg-accent/60 text-foreground",
  );

  const chevronClassName = cn(
    "size-3.5 shrink-0 opacity-50 transition-transform duration-200",
    open && "rotate-180",
  );

  return (
    <DropdownMenuTrigger disabled={disabled} className={triggerClassName}>
      <Cpu strokeWidth={1.75} className="size-3 shrink-0" />
      <span className="truncate font-medium">{label}</span>
      <ChevronUp strokeWidth={2.25} className={chevronClassName} />
    </DropdownMenuTrigger>
  );
};

export const ModelSelect = () => {
  const activeId = useSessionIndex((state) => state.activeId);
  const setSessionModel = useSessionIndex((store) => store.setModel);
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const model = MODELS.find((m) => m.id === session?.modelId);
  const [open, setOpen] = useState(false);

  const { isSending: disabled } = useChatStream();

  const handleSelect = (modelId: Model["id"]) => {
    if (session) setSessionModel(session.id, modelId);
    setOpen(false);
  };

  const contentClassName = cn(
    "w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-0",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-border/40 bg-popover/80 backdrop-blur-2xl",
    "shadow-xl shadow-black/15 ring-1 ring-inset ring-foreground/5",
  );

  const headerClassName = cn(
    "flex flex-col gap-0.5 border-b border-border/40 px-4 pb-2.5 pt-3",
  );

  const labelClassName = cn(
    "text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  return (
    <DropdownMenu key={activeId} open={open} onOpenChange={setOpen}>
      <ModelTrigger
        label={model?.displayName || "Model"}
        open={open}
        disabled={disabled}
      />

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        className={contentClassName}
      >
        <div className={headerClassName}>
          <p className={labelClassName}>Models</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            Select the best engine for your task.
          </p>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5">
          {MODELS.map((m) => (
            <ModelRow
              key={m.id}
              model={m}
              selected={model?.id === m.id}
              onSelect={() => handleSelect(m.id)}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
