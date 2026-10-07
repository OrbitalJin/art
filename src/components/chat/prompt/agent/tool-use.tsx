// tool-use.tsx
import { useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useChatStream } from "@/contexts/chat-context";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";
import { selectDirectory } from "@/lib/fs";
import {
  CompactSummary,
  formatToolName,
} from "@/components/chat/messages/tool-call-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JOURNAL_TOOLS = new Set([
  "get_journals",
  "get_journal",
  "create_journal",
  "update_journal",
  "delete_journal",
  "update_tags",
  "get_all_tags",
  "toggle_pinned",
  "toggle_archived",
]);

const TASKS_TOOLS = new Set([
  "get_tasks",
  "get_task",
  "create_task",
  "update_task",
  "move_task",
  "move_task_to_position",
  "delete_task",
  "get_projects",
  "create_project",
  "update_project",
  "delete_project",
  "create_project_with_tasks",
]);

const JOURNAL_COST = "$$$";
const TASKS_COST = "$$$";

const basename = (path: string): string => {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] ?? path;
};

const formatUsage = (cost: string, calls: number): string =>
  `${cost} · ${calls} call${calls === 1 ? "" : "s"}`;

const ToolTag: React.FC<{ label: string; value?: string }> = ({
  label,
  value,
}) => (
  <span
    className={cn(
      "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5",
      "bg-foreground/5 text-xs whitespace-nowrap text-foreground/80 ring-1 ring-border/50",
    )}
  >
    <span className={value ? "text-muted-foreground/70" : ""}>{label}</span>
    {value ? <span className="font-medium">{value}</span> : null}
  </span>
);

const EnabledTools: React.FC<{
  knowledgeBase?: string;
  journal: boolean;
  tasks: boolean;
}> = ({ knowledgeBase, journal, tasks }) => {
  const hasAnyTool = Boolean(knowledgeBase) || journal || tasks;
  const folderName = knowledgeBase ? basename(knowledgeBase) : undefined;

  if (!hasAnyTool) {
    return (
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground/40">
        No tools enabled
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
      {knowledgeBase ? <ToolTag label="Knowledge" value={folderName} /> : null}
      {journal ? <ToolTag label="Journal" /> : null}
      {tasks ? <ToolTag label="Tasks" /> : null}
    </span>
  );
};

const ActivityLine: React.FC<{
  toolCalls: ToolCallBlock[];
  running: number;
}> = ({ toolCalls, running }) => {
  const single = toolCalls.length === 1 ? toolCalls[0] : null;

  if (single) {
    const isDone = single.toolName === DONE_TOOL_NAME;
    const title = isDone ? "Wrapping up" : formatToolName(single.toolName);

    return (
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-xs text-foreground/80">{title}</span>
        {!isDone && <CompactSummary block={single} />}
      </span>
    );
  }

  const countLabel =
    running > 0
      ? `Running ${running} of ${toolCalls.length} tools…`
      : `Used ${toolCalls.length} tools`;

  return (
    <span className="flex min-w-0 flex-1 items-center">
      <span className="truncate text-xs text-foreground/80">{countLabel}</span>
    </span>
  );
};

const MenuSectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground/60 uppercase">
    {children}
  </p>
);

const KnowledgeRow: React.FC<{
  knowledgeBase?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}> = ({ knowledgeBase, onConnect, onDisconnect }) => {
  if (!knowledgeBase) {
    return (
      <button
        type="button"
        onClick={onConnect}
        className={cn(
          "flex w-full cursor-pointer flex-col gap-1 rounded-md p-2.5 text-left outline-none",
          "transition-colors duration-150 hover:bg-accent/20",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            Knowledge Base
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">
            Connect
          </span>
        </span>
        <span className="truncate text-[11px] leading-snug text-muted-foreground/70">
          Read files from a local folder
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-md bg-primary/5 p-2.5 ring-1 ring-primary/20">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-primary">
          Knowledge Base
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onConnect}
            className="cursor-pointer rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            aria-label="Disconnect knowledge base"
            className="cursor-pointer rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <X size={13} aria-hidden />
          </button>
        </div>
      </div>
      <p className="truncate text-[11px] leading-snug text-muted-foreground/70">
        {knowledgeBase}
      </p>
    </div>
  );
};

const ToolRow: React.FC<{
  label: string;
  subtitle: string;
  usage: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, subtitle, usage, enabled, onToggle }) => {
  const rowClasses = cn(
    "flex w-full cursor-pointer flex-col gap-1 rounded-md p-2.5 text-left outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    enabled ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/20",
  );

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={rowClasses}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              enabled ? "text-primary" : "text-foreground",
            )}
          >
            {label}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground/50 tabular-nums">
            {usage}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium",
            enabled ? "text-primary" : "text-muted-foreground/50",
          )}
        >
          {enabled ? "On" : "Off"}
        </span>
      </span>
      <span className="truncate text-[11px] leading-snug text-muted-foreground/70">
        {subtitle}
      </span>
    </button>
  );
};

const ConfigureMenu: React.FC<{
  disabled: boolean;
  knowledgeBase?: string;
  journal: boolean;
  tasks: boolean;
  journalCalls: number;
  tasksCalls: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleJournal: () => void;
  onToggleTasks: () => void;
  onRevokeAll: () => void;
}> = ({
  disabled,
  knowledgeBase,
  journal,
  tasks,
  journalCalls,
  tasksCalls,
  onConnect,
  onDisconnect,
  onToggleJournal,
  onToggleTasks,
  onRevokeAll,
}) => {
  const journalUsage = formatUsage(JOURNAL_COST, journalCalls);
  const tasksUsage = formatUsage(TASKS_COST, tasksCalls);
  const nothingToRevoke = !journal && !tasks;

  const triggerClasses = cn(
    "flex shrink-0 cursor-pointer items-center rounded-full px-2.5 py-0.5",
    "text-xs whitespace-nowrap text-muted-foreground/70 ring-1 ring-border/50 outline-none",
    "transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    "data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={triggerClasses}>
          Configure
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 border-muted-foreground/20 p-0 shadow-xl"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-2.5">
          <p className="text-sm font-medium">Configure agent</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            Choose what your agent can see and use in this session.
          </p>
        </div>

        <div className="flex flex-col gap-1 p-2">
          <MenuSectionLabel>Local</MenuSectionLabel>
          <KnowledgeRow
            knowledgeBase={knowledgeBase}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>

        <div className="flex flex-col gap-1 border-t p-2">
          <MenuSectionLabel>Custom Tools</MenuSectionLabel>
          <ToolRow
            label="Journal"
            subtitle="Read & write journal entries"
            usage={journalUsage}
            enabled={journal}
            onToggle={onToggleJournal}
          />
          <ToolRow
            label="Tasks"
            subtitle="Create and manage tasks"
            usage={tasksUsage}
            enabled={tasks}
            onToggle={onToggleTasks}
          />
        </div>

        <div className="flex items-center justify-between border-t bg-muted/10 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
            onClick={onRevokeAll}
            disabled={nothingToRevoke}
          >
            Revoke all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ToolUseProps {
  active: boolean;
}

export const ToolUse: React.FC<ToolUseProps> = ({ active }) => {
  const activeId = useSessionStore((state) => state.activeId);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const setKnowledgeBase = useSessionStore((state) => state.setKnowledgeBase);
  const setCapability = useSessionStore((state) => state.setCapability);
  const disableAllCapabilities = useSessionStore(
    (state) => state.disableAllCapabilities,
  );
  const { isSending, toolCalls } = useChatStream();

  const toolCounts = useMemo(() => {
    let journal = 0;
    let tasks = 0;

    if (!session) return { journal, tasks };

    for (const message of session.messages) {
      for (const block of message.toolCalls ?? []) {
        if (JOURNAL_TOOLS.has(block.toolName)) journal += 1;
        if (TASKS_TOOLS.has(block.toolName)) tasks += 1;
      }
    }

    return { journal, tasks };
  }, [session]);

  const handleConnect = useCallback(async () => {
    if (!activeId) return;

    const root = await selectDirectory();
    if (!root) {
      toast.warning("No folder was selected.");
      return;
    }

    setKnowledgeBase(activeId, root);
    toast.info("Knowledge Base folder connected");
  }, [activeId, setKnowledgeBase]);

  const handleDisconnect = useCallback(() => {
    if (!activeId) return;

    setKnowledgeBase(activeId, undefined);
    toast.info("Knowledge Base folder disconnected");
  }, [activeId, setKnowledgeBase]);

  const journalOn = !!session?.capabilities.journal;
  const tasksOn = !!session?.capabilities.tasks;

  const handleToggleJournal = useCallback(() => {
    if (!activeId) return;
    setCapability(activeId, "journal", !journalOn);
  }, [activeId, journalOn, setCapability]);

  const handleToggleTasks = useCallback(() => {
    if (!activeId) return;
    setCapability(activeId, "tasks", !tasksOn);
  }, [activeId, tasksOn, setCapability]);

  const handleRevokeAll = useCallback(() => {
    if (!activeId) return;
    disableAllCapabilities(activeId);
  }, [activeId, disableAllCapabilities]);

  if (!session) return null;

  const running = toolCalls.filter(
    (call) => call.state === "executing" && call.toolName !== DONE_TOOL_NAME,
  ).length;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {active ? (
        <ActivityLine toolCalls={toolCalls} running={running} />
      ) : (
        <EnabledTools
          knowledgeBase={session.knowledgeBase}
          journal={journalOn}
          tasks={tasksOn}
        />
      )}

      <ConfigureMenu
        disabled={isSending}
        knowledgeBase={session.knowledgeBase}
        journal={journalOn}
        tasks={tasksOn}
        journalCalls={toolCounts.journal}
        tasksCalls={toolCounts.tasks}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onToggleJournal={handleToggleJournal}
        onToggleTasks={handleToggleTasks}
        onRevokeAll={handleRevokeAll}
      />
    </div>
  );
};
