import { Button } from "@/components/ui/button";
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
import { useStreamingState } from "@/hooks/use-streaming-state";
import { TRAITS } from "@/lib/llm/common/prompts";
import { type TraitId } from "@/lib/store/session/types";
import { useSessionStore } from "@/lib/store/use-session-store";
import { cn } from "@/lib/utils";
import { Check, Fingerprint } from "lucide-react";

export const TraitPicker = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const addTrait = useSessionStore((state) => state.addTrait);
  const removeTrait = useSessionStore((state) => state.removeTrait);
  const clearTraits = useSessionStore((state) => state.clearTraits);

  const { isCurrentSessionStreaming: disabled } = useStreamingState();

  const withinTraits = (sessionId: string, traitId: TraitId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    return session.traits.includes(traitId);
  };

  const handleToggleTrait = (traitId: TraitId) => {
    if (activeId) {
      if (withinTraits(activeId, traitId)) {
        removeTrait(activeId, traitId);
      } else {
        addTrait(activeId, traitId);
      }
    }
  };

  const handleClearTraits = () => {
    if (activeId) {
      clearTraits(activeId);
    }
  };

  if (!activeId) return null;

  const selectedTraits = Object.values(TRAITS).filter((t) =>
    withinTraits(activeId, t.id),
  );

  return (
    <DropdownMenu key={activeId}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild disabled={disabled}>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 transition-colors",
                  selectedTraits.length > 0 && "border-primary/50 bg-primary/5",
                )}
              >
                <Fingerprint
                  className={cn(
                    selectedTraits.length > 0
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Traits</TooltipContent>
          </Tooltip>
          {selectedTraits.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground font-bold">
              {selectedTraits.length}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Traits</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Configure how Art should behave.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {Object.values(TRAITS).map((trait) => {
            const isSelected = withinTraits(activeId, trait.id);

            return (
              <div
                key={trait.id}
                onClick={() => handleToggleTrait(trait.id)}
                className={cn(
                  "flex flex-col p-2.5 gap-0.5 cursor-pointer rounded-md transition-all duration-200 group",
                  isSelected
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:bg-accent/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {trait.label}
                  </span>
                  {isSelected && (
                    <div className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground animate-in zoom-in-75 duration-200">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  {trait.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-2 border-t bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-muted-foreground hover:text-destructive"
            onClick={handleClearTraits}
            disabled={selectedTraits.length === 0}
          >
            Clear selection
          </Button>
          <p className="text-[10px] text-muted-foreground px-2">
            {selectedTraits.length} selected
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
