// welcome-message.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { modelById } from "@/lib/ai/models";
import { TOOL_FAMILIES } from "@/lib/ai/tools/registry";
import { toolkitEnabled } from "@/lib/ai/tools/toolkits";
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

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="rounded border border-border/60 bg-muted/30 px-1 py-px font-mono text-[10px] text-muted-foreground/70">
    {children}
  </kbd>
);

const Shortcut: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <span className="flex items-center gap-1.5">
    <span className="flex items-center gap-0.5">{children}</span>
    <span>{label}</span>
  </span>
);

const Section: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-xs font-medium text-muted-foreground/50">{label}</h2>
    <div className="flex flex-col divide-y divide-border/40">{children}</div>
  </section>
);

const Starter: React.FC<{
  label: string;
  prompt: string;
  onSelect: (prompt: string) => void;
}> = ({ label, prompt, onSelect }) => {
  const classes = cn(
    "w-full cursor-pointer py-2.5 text-left text-[15px] text-foreground/70",
    "outline-none transition-colors duration-150",
    "hover:text-foreground focus-visible:text-foreground",
  );

  return (
    <button type="button" onClick={() => onSelect(prompt)} className={classes}>
      {label}
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

const RecentRow: React.FC<{
  title: string;
  updatedAt: number;
  onOpen: () => void;
}> = ({ title, updatedAt, onOpen }) => {
  const classes = cn(
    "group flex w-full cursor-pointer items-baseline gap-4 py-2.5 text-left",
    "outline-none",
  );

  const titleClasses = cn(
    "min-w-0 flex-1 truncate text-sm text-foreground/70",
    "transition-colors duration-150",
    "group-hover:text-foreground group-focus-visible:text-foreground",
  );

  return (
    <button type="button" onClick={onOpen} className={classes}>
      <span className={titleClasses}>{title}</span>
      <span className="shrink-0 text-[11px] text-muted-foreground/50 tabular-nums">
        {relativeTime(updatedAt)}
      </span>
    </button>
  );
};

const WelcomeMessage: React.FC<Props> = ({ textAreaRef }) => {
  const { setPrompt } = useChatInput();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const routeType = type === "agent" ? "agent" : "chat";
  const isAgent = routeType === "agent";

  const userProfile = useSettingsStore((state) => state.userProfile);
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const sessions = useSessionStore((state) => state.sessions);
  const activeId = useSessionStore((state) => state.activeId);

  const greeting = useMemo(() => greetingFor(new Date()), []);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeId),
    [sessions, activeId],
  );

  const modelName = useMemo(
    () => modelById(activeSession?.modelId).displayName,
    [activeSession],
  );

  const tools = useMemo(() => {
    if (!isAgent || !activeSession) return [];

    return TOOL_FAMILIES.flatMap((family) =>
      toolkitEnabled(activeSession, family.key) ? [family.label] : [],
    );
  }, [isAgent, activeSession]);

  const recents = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          (session.type ?? "chat") === routeType &&
          !session.archived &&
          session.id !== activeId &&
          session.messages.length > 0 &&
          !session.readOnly,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
  }, [sessions, activeId, routeType]);

  const firstName = userProfile.name?.trim().split(" ")[0] || "there";
  const modeLabel = isAgent ? "Agent" : "Chat";
  const toolsLabel =
    tools.length > 0 ? tools.join(" · ") : "No tools enabled yet";

  const handleStarter = (prompt: string) => {
    setPrompt(prompt);
    textAreaRef.current?.focus();
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-12 px-4 select-none animate-in fade-in duration-300 fill-mode-backwards">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {greeting}, {firstName}.
        </h1>

        <div className="flex flex-col gap-1 text-sm text-muted-foreground/60">
          <p>
            {modeLabel} · {modelName}
          </p>
          {isAgent && (
            <p
              className={cn(
                "text-xs",
                tools.length === 0 && "text-muted-foreground/40",
              )}
            >
              {toolsLabel}
            </p>
          )}
        </div>
      </header>

      <Section label="Try asking">
        {isAgent ? (
          <AgentStarters onSelect={handleStarter} />
        ) : (
          <ChatStarters onSelect={handleStarter} />
        )}
      </Section>

      {recents.length > 0 && (
        <Section label="Recent">
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
        </Section>
      )}

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted-foreground/40">
        <Shortcut label="chat/agent">
          <Kbd>Ctrl</Kbd>
          <Kbd>Tab</Kbd>
        </Shortcut>
        <Shortcut label="focus">
          <Kbd>Ctrl</Kbd>
          <Kbd>/</Kbd>
        </Shortcut>
        <Shortcut label="commands">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </Shortcut>
        <Shortcut label="send">
          {enterKeySends ? (
            <Kbd>Enter</Kbd>
          ) : (
            <>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
            </>
          )}
        </Shortcut>
      </footer>
    </div>
  );
};

export default WelcomeMessage;
