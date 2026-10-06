import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { modelById } from "@/lib/ai/models";
import { useChatInput } from "@/contexts/chat-context";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const CHAT_STARTERS: { id: string; label: string; prompt: string }[] = [
  {
    id: "summarize",
    label: "Summarize my notes about…",
    prompt: "Summarize my notes about ",
  },
  {
    id: "draft",
    label: "Draft an email about…",
    prompt: "Draft an email about ",
  },
  {
    id: "explain",
    label: "Explain this like I'm new to it…",
    prompt: "Explain this like I'm new to it: ",
  },
];

const AGENT_STARTERS: { id: string; label: string; prompt: string }[] = [
  {
    id: "plan",
    label: "Plan out my week…",
    prompt: "Plan out my week: ",
  },
  {
    id: "task",
    label: "Add a task to…",
    prompt: "Add a task to ",
  },
  {
    id: "journal",
    label: "Summarize my recent journal…",
    prompt: "Summarize my recent journal entries about ",
  },
];

const greetingFor = (now: Date): string => {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.round(day / 30);
  return `${mo}mo ago`;
};

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1 py-px text-[10px] font-mono text-muted-foreground/70 border-b border-border">
    {children}
  </kbd>
);

const WelcomeMessage: React.FC<Props> = ({ textAreaRef }) => {
  const { setPrompt } = useChatInput();
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const routeType = type === "agent" ? "agent" : "chat";
  const isAgent = routeType === "agent";
  const userProfile = useSettingsStore((s) => s.userProfile);
  const enterKeySends = useSettingsStore((s) => s.enterKeySends);
  const sessions = useSessionStore((s) => s.sessions);
  const activeId = useSessionStore((s) => s.activeId);

  const greeting = useMemo(() => greetingFor(new Date()), []);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  const modelName = useMemo(
    () => modelById(activeSession?.modelId).displayName,
    [activeSession],
  );

  const starters = isAgent ? AGENT_STARTERS : CHAT_STARTERS;

  const tools = useMemo(() => {
    if (!isAgent || !activeSession) return [];
    const enabled: string[] = [];
    if (activeSession.capabilities.journal) enabled.push("Journal");
    if (activeSession.capabilities.tasks) enabled.push("Tasks");
    if (activeSession.knowledgeBase) enabled.push("Knowledge Base");
    return enabled;
  }, [isAgent, activeSession]);

  const recents = useMemo(() => {
    return sessions
      .filter(
        (s) =>
          (s.type ?? "chat") === routeType &&
          !s.archived &&
          s.id !== activeId &&
          s.messages.length > 0 &&
          !s.readOnly,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3);
  }, [sessions, activeId, routeType]);

  const firstName = userProfile.name?.trim().split(" ")[0] || "there";

  const starterClick = (prompt: string) => {
    setPrompt(prompt);
    textAreaRef.current?.focus();
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 max-w-xl mx-auto w-full select-none animate-in fade-in duration-300 fill-mode-backwards">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground/60">
          Using {modelName}
        </p>
        {isAgent && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            {tools.length > 0 ? (
              tools.map((tool) => (
                <span
                  key={tool}
                  className="px-1.5 py-0.5 border border-border rounded"
                >
                  {tool}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground/40">
                No tools enabled yet
              </span>
            )}
          </div>
        )}
      </div>

      {/* Starters */}
      <div className="mb-12">
        <p className="mb-4 text-xs text-muted-foreground/50">Try asking</p>
        <ul className="space-y-1">
          {starters.map((starter) => (
            <li key={starter.id}>
              <button
                onClick={() => starterClick(starter.prompt)}
                className={cn(
                  "w-full text-left text-[15px] text-foreground/70",
                  "hover:text-foreground transition-colors duration-100",
                  "py-1 focus-visible:outline-none focus-visible:text-foreground",
                )}
              >
                {starter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recents */}
      {recents.length > 0 && (
        <div className="mb-12">
          <p className="mb-4 text-xs text-muted-foreground/50">Recent</p>
          <ul className="space-y-1">
            {recents.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => navigate(`/session/${s.type}/${s.id}`)}
                  className={cn(
                    "group w-full flex items-baseline gap-4 text-left py-1",
                    "focus-visible:outline-none",
                  )}
                >
                  <span className="flex-1 min-w-0 truncate text-sm text-foreground/70 group-hover:text-foreground group-focus-visible:text-foreground transition-colors duration-100">
                    {s.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground/50 tabular-nums">
                    {relativeTime(s.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40">
        <span className="flex items-baseline gap-1.5">
          <Kbd>Tab</Kbd>
          chat/agens
        </span>
        <span className="flex items-baseline gap-1.5">
          <Kbd>Ctrl</Kbd>
          <Kbd>/</Kbd>
          focus
        </span>
        <span className="flex items-baseline gap-1.5">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
          commands
        </span>
        <span className="flex items-baseline gap-1.5">
          {enterKeySends ? (
            <Kbd>Enter</Kbd>
          ) : (
            <>
              <Kbd>Shift</Kbd>
              <Kbd>Enter</Kbd>
            </>
          )}
          send
        </span>
      </div>
    </div>
  );
};

export default WelcomeMessage;
