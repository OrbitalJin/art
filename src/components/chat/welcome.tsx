import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useChatInput } from "@/contexts/chat-context";
import type { ComposerHandle } from "./composer/editor";

interface Props {
  composerRef: React.RefObject<ComposerHandle | null>;
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

const Reveal: React.FC<{
  delay: number;
  className?: string;
  children: React.ReactNode;
}> = ({ delay, className, children }) => {
  const revealClassName = cn(
    "animate-in fade-in slide-in-from-bottom-1 duration-500 ease-out fill-mode-backwards",
    className,
  );
  const revealStyle = { animationDelay: `${delay}ms` };

  return (
    <div className={revealClassName} style={revealStyle}>
      {children}
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const labelClassName = cn(
    "mb-1 text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  return <p className={labelClassName}>{children}</p>;
};

const Shortcut: React.FC<{ label: string; keys: string }> = ({
  label,
  keys,
}) => {
  const keysClassName = cn(
    "rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5",
    "text-[10px] font-medium tabular-nums text-muted-foreground/60",
  );

  return (
    <span className="flex items-center gap-2">
      <kbd className={keysClassName}>{keys}</kbd>
      <span className="text-[10px] text-muted-foreground/50">{label}</span>
    </span>
  );
};

interface StarterProps {
  label: string;
  prompt: string;
  onSelect: (prompt: string) => void;
}

const Starter: React.FC<StarterProps> = ({ label, prompt, onSelect }) => {
  const rowClassName = cn(
    "group flex w-full cursor-pointer items-center gap-3 py-3 text-left outline-none",
    "border-b border-border/30 last:border-b-0",
  );

  const labelClassName = cn(
    "flex-1 text-sm text-foreground/70 transition-colors duration-200",
    "group-hover:text-foreground group-focus-visible:text-foreground",
  );

  const arrowClassName = cn(
    "size-3.5 shrink-0 -translate-x-1 text-muted-foreground/60 opacity-0",
    "transition-all duration-200 ease-out",
    "group-hover:translate-x-0 group-hover:opacity-100",
    "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(prompt)}
      className={rowClassName}
    >
      <span className={labelClassName}>{label}</span>
      <ArrowRight strokeWidth={1.75} className={arrowClassName} />
    </button>
  );
};

const RecentRow: React.FC<{
  title: string;
  updatedAt: number;
  onOpen: () => void;
}> = ({ title, updatedAt, onOpen }) => {
  const rowClassName = cn(
    "group flex w-full cursor-pointer items-center gap-4 py-2 text-left outline-none",
  );

  const titleClassName = cn(
    "min-w-0 flex-1 truncate text-[13px] text-muted-foreground/70",
    "transition-colors duration-150",
    "group-hover:text-foreground group-focus-visible:text-foreground",
  );

  const timeClassName = cn(
    "shrink-0 text-[10.5px] tabular-nums text-muted-foreground/45",
    "transition-colors duration-150",
    "group-hover:text-muted-foreground/70 group-focus-visible:text-muted-foreground/70",
  );

  return (
    <button type="button" onClick={onOpen} className={rowClassName}>
      <span className={titleClassName}>{title}</span>
      <span className={timeClassName}>{relativeTime(updatedAt)}</span>
    </button>
  );
};

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

const WelcomeMessage: React.FC<Props> = ({ composerRef }) => {
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
  const subtitle = isAgent
    ? "What should we get done?"
    : "What would you like to explore?";

  const handleStarter = (prompt: string) => {
    setPrompt(prompt);
    composerRef.current?.focus();
  };

  const containerClassName = cn(
    "mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 select-none",
  );

  const glowClassName = cn(
    "pointer-events-none absolute -left-12 -top-20 -z-10 size-72",
    "rounded-full bg-primary/5 blur-3xl",
  );

  return (
    <div className={containerClassName}>
      <Reveal delay={0} className="relative isolate">
        <div aria-hidden className={glowClassName} />
        <h1 className="font-serif text-[36px] leading-[1.12] tracking-[-0.01em] text-foreground">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground/60">{subtitle}</p>
      </Reveal>

      <Reveal delay={80} className="mt-10 flex flex-col">
        <SectionLabel>Start</SectionLabel>
        {isAgent ? (
          <AgentStarters onSelect={handleStarter} />
        ) : (
          <ChatStarters onSelect={handleStarter} />
        )}
      </Reveal>

      {recents.length > 0 && (
        <Reveal delay={160} className="mt-10 flex flex-col">
          <SectionLabel>Recent</SectionLabel>
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
        </Reveal>
      )}

      <Reveal
        delay={240}
        className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2"
      >
        <Shortcut keys="@" label="stash" />
        <Shortcut keys="#" label="journal" />
        <Shortcut keys="Ctrl + Tab" label="mode" />
        <Shortcut keys="Ctrl + /" label="focus" />
        <Shortcut keys="Ctrl + K" label="commands" />
        <Shortcut
          keys={enterKeySends ? "Enter" : "Shift + Enter"}
          label="send"
        />
      </Reveal>
    </div>
  );
};

export default WelcomeMessage;
