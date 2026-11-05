import { useState } from "react";
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
import {
  Scroll,
  SearchX,
  User,
  Wrench,
  Asterisk,
  Paperclip,
} from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@/components/ui/message-scroller";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useSession } from "@/lib/store/session/data-store";
import type { Message } from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { promptControlClasses } from "./toolbar";

const PREVIEW_LENGTH = 60;
const SNIPPET_LEAD = 20;

const previewOf = (msg: Message): string => {
  const text = messageText(msg).replace(/\s+/g, " ").trim();
  if (text) return text;
  if (msg.toolCalls?.length) return "Tool call";
  return "(empty message)";
};

const truncate = (s: string, n: number) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  const boundary = lastSpace > n * 0.6 ? lastSpace : n;
  return cut.slice(0, boundary).trimEnd() + "…";
};

const snippetFor = (text: string, query: string, length: number): string => {
  const needle = query.trim().toLowerCase();
  const matchIndex = needle ? text.toLowerCase().indexOf(needle) : -1;
  const matchIsVisible = matchIndex < length - needle.length;

  if (matchIndex === -1 || matchIsVisible) return truncate(text, length);

  const start = Math.max(0, matchIndex - SNIPPET_LEAD);
  const tail = text.slice(start).trimStart();
  return "…" + truncate(tail, length);
};

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const needle = query.trim();
  const matchIndex = needle
    ? text.toLowerCase().indexOf(needle.toLowerCase())
    : -1;

  if (matchIndex === -1) return <>{text}</>;

  const matchEnd = matchIndex + needle.length;
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchEnd);
  const after = text.slice(matchEnd);

  return (
    <>
      {before}
      <mark className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {match}
      </mark>
      {after}
    </>
  );
};

const RoleBadge = ({ role }: { role: Message["role"] }) => {
  const isUser = role === "user";

  const badgeClassName = cn(
    "flex size-6 shrink-0 items-center justify-center rounded-md",
    isUser ? "bg-primary/10" : "bg-muted/60",
  );

  const Icon = isUser ? User : Asterisk;
  const iconClassName = cn(
    "size-3.5",
    isUser ? "text-primary" : "text-muted-foreground",
  );

  return (
    <span className={badgeClassName}>
      <Icon strokeWidth={1.75} className={iconClassName} />
    </span>
  );
};

const ContentTypeIcon = ({ msg }: { msg: Message }) => {
  if (msg.attachments?.length) {
    return <Paperclip className="size-3 shrink-0 text-muted-foreground/60" />;
  }

  if (messageText(msg).trim()) return null;

  if (msg.toolCalls?.length) {
    return <Wrench className="size-3 shrink-0 text-muted-foreground/60" />;
  }
  return null;
};

const CurrentPill = () => {
  const pillClassName = cn(
    "shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5",
    "text-[10px] font-medium text-primary",
  );

  return <span className={pillClassName}>current</span>;
};

interface MessageResultItemProps {
  message: Message;
  index: number;
  isActive: boolean;
  query: string;
  onSelect: () => void;
}

const MessageResultItem = ({
  message,
  index,
  isActive,
  query,
  onSelect,
}: MessageResultItemProps) => {
  const preview = snippetFor(previewOf(message), query, PREVIEW_LENGTH);

  const itemClassName = cn(
    "relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-3",
    isActive && "bg-accent/40",
  );

  const indicatorClassName = cn(
    "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2",
    "rounded-r-full bg-primary",
  );

  const previewClassName = cn(
    "flex-1 truncate text-sm leading-snug text-foreground/80",
    "group-data-[selected=true]:text-foreground",
  );

  const indexClassName = cn(
    "ml-1 w-5 shrink-0 text-right text-[10px] tabular-nums",
    "text-muted-foreground/40",
  );

  return (
    <CommandItem
      value={messageText(message)}
      onSelect={onSelect}
      className={itemClassName}
    >
      {isActive && <span aria-hidden className={indicatorClassName} />}
      <RoleBadge role={message.role} />
      <ContentTypeIcon msg={message} />
      <span className={previewClassName}>
        <Highlight text={preview} query={query} />
      </span>
      {isActive && <CurrentPill />}
      <span className={indexClassName}>{index + 1}</span>
    </CommandItem>
  );
};

const EmptyState = ({ hasMessages }: { hasMessages: boolean }) => {
  const message = hasMessages
    ? "No messages match your search."
    : "No messages in this conversation yet.";

  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <SearchX strokeWidth={1.5} className="size-5 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
};

const Hint = ({ keys, label }: { keys: string; label: string }) => {
  const keysClassName = cn(
    "rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5",
    "text-[10px] font-medium text-muted-foreground/70",
  );

  return (
    <span className="flex items-center gap-1.5">
      <kbd className={keysClassName}>{keys}</kbd>
      <span>{label}</span>
    </span>
  );
};

const ResultsFooter = ({ count }: { count: number }) => {
  const footerClassName = cn(
    "flex items-center justify-between border-t border-border/40",
    "px-3 py-2 text-[10px] text-muted-foreground/60",
  );

  const label = count === 1 ? "1 message" : `${count} messages`;

  return (
    <div className={footerClassName}>
      <span className="tabular-nums">{label}</span>
      <div className="flex items-center gap-4">
        <Hint keys="↵" label="jump" />
        <Hint keys="esc" label="close" />
      </div>
    </div>
  );
};

export const JumpSelect = () => {
  const activeId = useSessionIndex((state) => state.activeId);
  const sessionData = useSession(activeId);
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const messages = sessionData?.messages ?? [];
  const hasMessages = messages.length > 0;

  useHotkey("Mod+F", (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const handleSelect = (messageId: string) => {
    handleOpenChange(false);
    scrollToMessage(messageId, { behavior: "smooth" });
  };

  const filterMessages = (value: string, query: string) =>
    value.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;

  const triggerClassName = cn(
    promptControlClasses,
    open && "bg-accent/60 text-foreground",
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={triggerClassName}
            onClick={() => setOpen(true)}
          >
            <Scroll className="h-4 w-4" />
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
        onOpenChange={handleOpenChange}
      >
        <Command filter={filterMessages}>
          <CommandInput
            placeholder="Search messages…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-96 p-1">
            <CommandEmpty>
              <EmptyState hasMessages={hasMessages} />
            </CommandEmpty>
            <CommandGroup className="p-0">
              {messages.map((m, i) => (
                <MessageResultItem
                  key={m.id}
                  message={m}
                  index={i}
                  isActive={currentAnchorId === m.id}
                  query={search}
                  onSelect={() => handleSelect(m.id)}
                />
              ))}
            </CommandGroup>
          </CommandList>
          {hasMessages && <ResultsFooter count={messages.length} />}
        </Command>
      </CommandDialog>
    </>
  );
};
