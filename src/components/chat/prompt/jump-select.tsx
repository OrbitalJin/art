import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Scroll, Check } from "lucide-react";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { Message } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";

const previewOf = (msg: Message): string => {
  if (typeof msg.content === "string") return msg.content;
  return msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
};

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s;

export const JumpSelect = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();
  const [open, setOpen] = useState(false);

  const turns = useMemo(() => {
    const session = sessions.find((s) => s.id === activeId);
    if (!session) return [];
    return session.messages.filter((m) => m.role === "user");
  }, [sessions, activeId]);

  if (turns.length <= 1) return null;

  return (
    <Popover key={activeId} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 transition-colors",
                  open && "border-primary/50 bg-primary/5",
                )}
              >
                <Scroll
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                />
                <span className="sr-only">Jump to turn</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Jump to turn</TooltipContent>
          </Tooltip>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={8}
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Jump to turn</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Return to an earlier message in this conversation.
          </p>
        </div>

        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search turns…" className="h-9" />
          <CommandList className="max-h-80">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              No turns found.
            </CommandEmpty>
            <CommandGroup>
              {turns.map((m, i) => {
                const isActive = currentAnchorId === m.id;
                const preview = truncate(previewOf(m), 40);
                return (
                  <CommandItem
                    key={m.id}
                    value={preview || "(empty)"}
                    onSelect={() => {
                      setOpen(false);
                      scrollToMessage(m.id, { behavior: "smooth" });
                    }}
                    className={cn(
                      "flex flex-col items-stretch gap-0.5",
                      isActive && "text-primary font-medium",
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="truncate">{preview || "(empty)"}</span>
                      {isActive && (
                        <Check className="size-4 shrink-0 text-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/80 leading-normal">
                      Turn {i + 1}
                    </p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};