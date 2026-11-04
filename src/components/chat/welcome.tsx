import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useChatInput } from "@/contexts/chat-context";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const greetingFor = (now: Date): string => {
  const hour = now.getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const relativeTime = (timestamp: number): string => {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  return `${Math.floor(days / 30)}mo ago`;
};

const Shortcut: React.FC<{ label: string; keys: string }> = ({
  label,
  keys,
}) => (
  <span className="flex items-baseline gap-1.5">
    <span className="text-[10px] font-medium tracking-wide text-muted-foreground/60">
      {keys}
    </span>
    <span className="text-[10px] text-muted-foreground/45">{label}</span>
  </span>
);

const Starter: React.FC<{
  label: string;
  prompt: string;
  onSelect: (prompt: string) => void;
}> = ({ label, prompt, onSelect }) => {
  const classes = cn(
    "group flex w-full cursor-pointer items-center py-2.5 text-left outline-none",
  );

  return (
    <button type="button" onClick={() => onSelect(prompt)} className={classes}>
      <span
        className={cn(
          "relative text-[15.5px] text-foreground/70",
          "transition-colors duration-200",
          "group-hover:text-foreground group-focus-visible:text-foreground",
        )}
      >
        {label}
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-primary/50",
            "transition-transform duration-300 ease-out",
            "group-hover:scale-x-100 group-focus-visible:scale-x-100",
          )}
        />
      </span>
    </button>
  );
};

const RecentRow: React.FC<{
  title: string;
  updatedAt: number;
  onOpen: () => void;
}> = ({ title, updatedAt, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex w-full cursor-pointer items-baseline gap-4 py-2 text-left outline-none"
  >
    <span
      className={cn(
        "min-w-0 flex-1 truncate text-[13px] text-muted-foreground/70",
        "transition-colors duration-150",
        "group-hover:text-foreground group-focus-visible:text-foreground",
      )}
    >
      {title}
    </span>
    <span
      className={cn(
        "shrink-0 text-[10.5px] tabular-nums text-muted-foreground/45",
        "transition-colors duration-150",
        "group-hover:text-muted-foreground/70 group-focus-visible:text-muted-foreground/70",
      )}
    >
      {relativeTime(updatedAt)}
    </span>
  </button>
);

const ChatStarters: React.FC<{ onSelect: (prompt: string) => void }> = ({
  onSelect,
}) => (
  <>
    <Starter
      label="Summarize my notes about…"
      prompt="Summarize my notes about "
      onSelect={onSelect}
    />
    <Starter
      label="Draft an email about…"
      prompt="Draft an email about "
      onSelect={onSelect}
    />
    <Starter
      label="Explain this like I'm new to it…"
      prompt="Explain this like I'm new to it: "
      onSelect={onSelect}
    />
  </>
);

const AgentStarters: React.FC<{ onSelect: (prompt: string) => void }> = ({
  onSelect,
}) => (
  <>
    <Starter
      label="Plan out my week…"
      prompt="Plan out my week: "
      onSelect={onSelect}
    />
    <Starter
      label="Add a task to…"
      prompt="Add a task to "
      onSelect={onSelect}
    />
    <Starter
      label="Check my email inbox"
      prompt="Check my email inbox"
      onSelect={onSelect}
    />
  </>
);

const WelcomeMessage: React.FC<Props> = ({ textAreaRef }) => {
  const { setPrompt } = useChatInput();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const routeType = type === "agent" ? "agent" : "chat";
  const isAgent = routeType === "agent";

  const userProfile = useSettingsStore((state) => state.userProfile);
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const sessions = useSessionIndex((state) => state.sessions);
  const activeId = useSessionIndex((state) => state.activeId);

  const greeting = useMemo(() => greetingFor(new Date()), []);

  const recents = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          (session.type ?? "chat") === routeType &&
          !session.archived &&
          session.id !== activeId &&
          !session.readOnly,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
  }, [sessions, activeId, routeType]);

  const firstName = userProfile.name?.trim().split(" ")[0] || "there";

  const handleStarter = (prompt: string) => {
    setPrompt(prompt);
    textAreaRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 select-none",
        "animate-in fade-in slide-in-from-bottom-1 duration-500 ease-out fill-mode-backwards",
      )}
    >
      <h1 className="font-serif text-[36px] leading-[1.12] tracking-[-0.01em] text-foreground">
        {greeting}, {firstName}.
      </h1>

      <div className="mt-11 flex flex-col">
        {isAgent ? (
          <AgentStarters onSelect={handleStarter} />
        ) : (
          <ChatStarters onSelect={handleStarter} />
        )}
      </div>

      {recents.length > 0 && (
        <section className="mt-11 flex flex-col border-t border-border/40 pt-5">
          {recents.map((session) => (
            <RecentRow
              key={session.id}
              title={session.title}
              updatedAt={session.updatedAt}
              onOpen={() =>
                navigate(`/session/${session.type ?? "chat"}/${session.id}`)
              }
            />
          ))}
        </section>
      )}

      <footer className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Shortcut keys="Ctrl + Tab" label="mode" />
        <Shortcut keys="Ctrl + /" label="focus" />
        <Shortcut keys="Ctrl + K" label="commands" />
        <Shortcut
          keys={enterKeySends ? "Enter" : "Shift + Enter"}
          label="send"
        />
      </footer>
    </div>
  );
};

export default WelcomeMessage;
