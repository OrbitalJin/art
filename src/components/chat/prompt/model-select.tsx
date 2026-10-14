import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatStream } from "@/hooks/use-chat-stream";
import { MODELS } from "@/lib/ai/models";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { selectableRowClasses } from "./agent/configure-menu/helpers";

export const ModelSelect = () => {
  const activeId = useSessionIndex((state) => state.activeId);
  const setSessionModel = useSessionIndex((store) => store.setModel);
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const model = MODELS.find((m) => m.id === session?.modelId);
  const [open, setOpen] = useState(false);

  const { isSending: disabled } = useChatStream();

  const handleSelect = (key: string) => {
    if (session) {
      const m = MODELS.find((m) => m.id === key);
      if (m) setSessionModel(session.id, m.id);
    }
    setOpen(false);
  };

  const contentClasses = cn(
    "w-80 max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-lg",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-border/60",
  );

  return (
    <DropdownMenu key={activeId} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        disabled={disabled}
        className="
        w-[120px] text-xs border cursor-pointer h-9
        shadow-none focus:ring-0 transition-colors
        hover:bg-accent/30 hover:text-primary
        inline-flex items-center justify-between rounded-md px-3 py-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="truncate font-medium">
          {model?.displayName || "Model"}
        </span>
        <ChevronUp
          className={cn(
            "h-3.5 w-3.5 opacity-50 shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        avoidCollisions={false}
        className={contentClasses}
      >
        <div className="flex flex-col border-b border-border/50 py-2 pr-3.5 pl-3.5">
          <p className="text-[13px] font-medium text-foreground">Models</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            Select the best engine for your task.
          </p>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5">
          {MODELS.map((m) => {
            const isSelected = model?.id === m.id;

            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelect(m.id)}
                className={selectableRowClasses(isSelected)}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                  <span
                    className={cn(
                      "truncate text-[13px] font-medium",
                      isSelected ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    {m.displayName}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {m.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
