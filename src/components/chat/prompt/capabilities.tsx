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
import { cn } from "@/lib/utils";
import { selectDirectory } from "@/lib/fs";
import { useSessionStore } from "@/lib/store/use-session-store";
import type { SessionCapabilities } from "@/lib/store/session/types";
import { Book, BookOpen, Hammer, X } from "lucide-react";
import { useChatStream } from "@/contexts/chat-context";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

const CATEGORY_TOOLS: Record<string, string[]> = {
  journal: [
    "get_journals",
    "get_journal",
    "create_journal",
    "update_journal",
    "delete_journal",
    "update_tags",
    "get_all_tags",
    "toggle_pinned",
    "toggle_archived",
  ],
  tasks: [
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
  ],
};

const CATEGORY_DOLLARS: Record<string, string> = {
  journal: "$$$",
  tasks: "$$$",
};

const toolNamesIn = (names: string[]) => new Set(names);

export const Capabilities = () => {
  const { isSending } = useChatStream();
  const activeId = useSessionStore((state) => state.activeId);
  const sessions = useSessionStore((state) => state.sessions);
  const setKnowledgeBase = useSessionStore((state) => state.setKnowledgeBase);
  const setCapability = useSessionStore((state) => state.setCapability);
  const disableAllCapabilities = useSessionStore(
    (state) => state.disableAllCapabilities,
  );

  const session = sessions.find((s) => s.id === activeId);
  const knowledgeRoot = session?.knowledgeBase;
  const capabilities = session?.capabilities;

  const toolCounts = useMemo(() => {
    const counts: Record<string, number> = { journal: 0, tasks: 0 };
    if (!session) return counts;

    for (const msg of session.messages) {
      for (const block of msg.toolCalls ?? []) {
        for (const [cat, names] of Object.entries(CATEGORY_TOOLS)) {
          if (toolNamesIn(names).has(block.toolName)) {
            counts[cat] = (counts[cat] ?? 0) + 1;
          }
        }
      }
    }
    return counts;
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
  }, [setKnowledgeBase, activeId]);

  const handleDisconnect = useCallback(() => {
    if (!activeId) return;
    setKnowledgeBase(activeId, undefined);
    toast.info("Knowledge Base folder disconnected");
  }, [setKnowledgeBase, activeId]);

  const handleToggle = useCallback(
    (key: keyof SessionCapabilities, value: boolean) => {
      if (!activeId) return;
      setCapability(activeId, key, value);
    },
    [setCapability, activeId],
  );

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isSending}>
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild disabled={isSending}>
              <Button className="h-9 w-9" variant="outline" size="icon">
                <Hammer
                  className={cn("h-4 w-4 transition-all text-muted-foreground")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Capabilities</TooltipContent>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-80 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-2.5">
          <p className="text-sm font-medium">Capabilities</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Manage what your agent can see and use in this session.
          </p>
        </div>

        {/* Knowledge */}
        <div className="flex flex-col p-2 gap-1">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Local
          </p>

          <div
            onClick={knowledgeRoot ? undefined : handleConnect}
            className={cn(
              "flex flex-col p-2.5 gap-1 rounded-md transition-all duration-200 group",
              knowledgeRoot
                ? "bg-primary/5 ring-1 ring-primary/20"
                : "hover:bg-accent/20 cursor-pointer",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {knowledgeRoot ? (
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
                ) : (
                  <Book className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    knowledgeRoot ? "text-primary" : "text-foreground",
                  )}
                >
                  Knowledge Base
                </span>
              </div>

              {knowledgeRoot ? (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect();
                    }}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Change
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisconnect();
                    }}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                  Connect
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-snug truncate">
              {knowledgeRoot ?? "Read files from a local folder"}
            </p>
          </div>
        </div>

        {/* Custom Tools */}
        <div className="flex flex-col p-2 gap-1 border-t">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Custom Tools
          </p>

          <CapabilityRow
            label="Journal"
            isOn={!!capabilities?.journal}
            dollars={CATEGORY_DOLLARS.journal}
            calls={toolCounts.journal}
            subtitle="Read & write journal entries"
            onToggle={() => handleToggle("journal", !capabilities?.journal)}
          />

          <CapabilityRow
            label="Tasks"
            isOn={!!capabilities?.tasks}
            dollars={CATEGORY_DOLLARS.tasks}
            calls={toolCounts.tasks}
            subtitle="Create and manage tasks"
            onToggle={() => handleToggle("tasks", !capabilities?.tasks)}
          />
        </div>

        <div className="flex items-center justify-between p-2 border-t bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-muted-foreground hover:text-destructive"
            onClick={() => activeId && disableAllCapabilities(activeId)}
            disabled={!capabilities?.journal && !capabilities?.tasks}
          >
            Revoke all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface CapabilityRowProps {
  label: string;
  isOn: boolean;
  dollars?: string;
  calls?: number;
  subtitle: string;
  onToggle: () => void;
}

const CapabilityRow = ({
  label,
  isOn,
  dollars,
  calls,
  subtitle,
  onToggle,
}: CapabilityRowProps) => {
  const usageLabel =
    dollars && calls !== undefined
      ? `${dollars} · ${calls} call${calls === 1 ? "" : "s"}`
      : dollars;

  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex flex-col p-2.5 gap-1 cursor-pointer rounded-md transition-all duration-200 group",
        isOn ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/20",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isOn ? "text-primary" : "text-foreground",
            )}
          >
            {label}
          </span>
          {usageLabel && (
            <span className="text-[10px] font-medium tabular-nums text-muted-foreground/50 shrink-0">
              {usageLabel}
            </span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/70 leading-snug truncate">
        {subtitle}
      </p>
    </div>
  );
};
