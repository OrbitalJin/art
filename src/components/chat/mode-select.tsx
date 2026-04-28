import { MODES, type ModeId } from "@/lib/llm/prompts/modes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { Eclipse } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const ModeSelect = () => {
  const { isCurrentSessionStreaming: disabled } = useStreamingState();
  const setMode = useSessionStore((store) => store.setMode);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const currentMode = MODES[session?.mode as ModeId];
  const [open, setOpen] = useState<boolean>(false);

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild disabled={disabled}>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 px-3 gap-2 backdrop-blur-xl bg-card/50 border-border/50 transition-all",
                  "hover:bg-accent/20 group",
                )}
              >
                <Eclipse
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-90",
                    open && "-rotate-90",
                  )}
                />
                <span className="sr-only">{currentMode?.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{currentMode?.label}</TooltipContent>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        side="bottom"
        sideOffset={8}
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Modes</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Select a mode for the current session.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {Object.values(MODES).map((mode) => {
            const isSelected = mode.id === session.mode;

            return (
              <div
                key={mode.id}
                onClick={() => {
                  setOpen(false);
                  if (!disabled) setMode(session.id, mode.id as ModeId);
                }}
                className={cn(
                  "flex flex-col p-2.5 gap-0.5 cursor-pointer rounded-md transition-all duration-200 group",
                  isSelected
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/20",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {mode.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  {mode.description}
                </p>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
