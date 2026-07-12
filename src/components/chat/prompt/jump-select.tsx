import { useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
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
import { Scroll, User, Wrench, Asterisk } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { Message } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";

const previewOf = (msg: Message): string => {
  if (typeof msg.content === "string") return msg.content;

  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (text) return text;

  const hasToolCall = msg.content.some((b) => b.type === "tool-call");

  if (hasToolCall) return "Tool call";
  return "(empty message)";
};

const truncate = (s: string, n: number) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  const boundary = lastSpace > n * 0.6 ? lastSpace : n;
  return cut.slice(0, boundary).trimEnd() + "…";
};

const RoleIcon = ({ role }: { role: Message["role"] }) => {
  if (role === "user") {
    return <User className="h-3.5 w-3.5 text-primary" />;
  }
  return <Asterisk className="h-3.5 w-3.5 text-muted-foreground" />;
};

const ContentTypeIcon = ({ msg }: { msg: Message }) => {
  if (typeof msg.content === "string") return null;
  const hasText = msg.content.some((b) => b.type === "text" && b.text?.trim());
  if (hasText) return null;

  if (msg.content.some((b) => b.type === "tool-call")) {
    return <Wrench className="h-3 w-3 text-muted-foreground/60" />;
  }
  return null;
};

const MessageResultItem = ({
  message,
  index,
  isActive,
  onSelect,
}: {
  message: Message;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const preview = truncate(previewOf(message), 60);

  return (
    <CommandItem
      value={preview}
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 border-transparent py-2.5 pl-3",
        isActive && "border-primary bg-accent/40",
      )}
    >
      <RoleIcon role={message.role} />
      <ContentTypeIcon msg={message} />
      <span
        className={cn(
          "flex-1 truncate text-sm leading-snug",
          !preview && "italic text-muted-foreground",
        )}
      >
        {preview}
      </span>
      {isActive && (
        <span className="shrink-0 text-[10px] font-medium text-primary">
          current
        </span>
      )}
      <span className="ml-2 shrink-0 text-[10px] tabular-nums text-muted-foreground/50">
        {index + 1}
      </span>
    </CommandItem>
  );
};

export const JumpSelect = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();
  const [open, setOpen] = useState(false);

  const messages = useMemo(() => {
    const session = sessions.find((s) => s.id === activeId);
    return session ? session.messages : [];
  }, [sessions, activeId]);

  useHotkey("Mod+F", (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 transition-colors",
              open && "border-primary/50 bg-primary/5",
            )}
            onClick={() => setOpen(true)}
          >
            <Scroll className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Jump to message</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Jump to message (Ctrl+F)</TooltipContent>
      </Tooltip>

      <CommandDialog
        key={activeId}
        title="Search messages"
        description="Jump to a message in this conversation."
        showCloseButton
        open={open}
        onOpenChange={setOpen}
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search messages…" />
          <CommandList className="max-h-96">
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              {messages.length === 0
                ? "No messages in this conversation yet."
                : "No messages match your search."}
            </CommandEmpty>
            <CommandGroup>
              {messages.map((m, i) => (
                <MessageResultItem
                  key={m.id}
                  message={m}
                  index={i}
                  isActive={currentAnchorId === m.id}
                  onSelect={() => {
                    setOpen(false);
                    scrollToMessage(m.id, { behavior: "smooth" });
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
          {messages.length > 0 && (
            <div className="flex items-center justify-between border-t px-3 py-1.5 text-[10px] text-muted-foreground/70">
              <span>{messages.length} messages</span>
              <span>↵ to jump · esc to close</span>
            </div>
          )}
        </Command>
      </CommandDialog>
    </>
  );
};
