import { PERSONAS, type PersonaId } from "@/lib/ai/prompts/personas";
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
import { VenetianMask } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useChatStream } from "@/hooks/use-chat-stream";

export const PersonaSelect = () => {
  const { isSending: disabled } = useChatStream();

  const setPersona = useSessionStore((store) => store.setPersona);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const currentPersona = PERSONAS[session?.persona as PersonaId];
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
                  "h-9 w-9 bg-card/50 border-border/50 transition-all",
                  "hover:bg-accent/20 group",
                )}
              >
                <VenetianMask className={cn("h-4 w-4 text-muted-foreground")} />
                <span className="sr-only">{currentPersona?.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Persona</TooltipContent>
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
          <p className="text-sm font-medium">Personas</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Select a persona for the current session.
          </p>
        </div>

        <div className="flex flex-col p-2 gap-1">
          {Object.values(PERSONAS).map((persona) => {
            const isSelected = persona.id === session.persona;

            return (
              <div
                key={persona.id}
                onClick={() => {
                  setOpen(false);
                  if (!disabled)
                    setPersona(session.id, persona.id as PersonaId);
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
                    {persona.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80 leading-normal">
                  {persona.description}
                </p>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
