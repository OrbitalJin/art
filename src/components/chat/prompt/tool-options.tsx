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
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Hammer } from "lucide-react";
import { useChatStream } from "@/contexts/chat-context";
import { useMemo } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";

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
  audio: [
    "toggle_playing_state",
    "set_playing",
    "set_volume",
    "toggle_muted",
    "set_muted",
    "set_loop",
    "add_to_playlist",
    "remove_from_playlist",
    "clear_playlist",
    "play_next",
    "play_previous",
    "play_at",
  ],
};

const CATEGORY_DOLLARS: Record<string, string> = {
  web_search: "$",
  fetch_url: "$",
  journal: "$$$",
  tasks: "$$$",
  audio: "$$",
};

const toolNamesIn = (names: string[]) => new Set(names);

export const ToolOptions = () => {
  const web_search = useSettingsStore((state) => state.toolOptions.web_search);
  const fetch_url = useSettingsStore((state) => state.toolOptions.fetch_url);
  const journal = useSettingsStore((state) => state.toolOptions.journal);
  const tasks = useSettingsStore((state) => state.toolOptions.tasks);
  const audio = useSettingsStore((state) => state.toolOptions.audio);
  const setToolOptions = useSettingsStore((state) => state.setToolOptions);
  const { isSending } = useChatStream();
  const sessions = useSessionStore((state) => state.sessions);
  const activeId = useSessionStore((state) => state.activeId);

  const toolCounts = useMemo(() => {
    const counts: Record<string, number> = { journal: 0, tasks: 0, audio: 0 };
    const activeSession = sessions.find((s) => s.id === activeId);
    if (!activeSession) return counts;

    for (const msg of activeSession.messages) {
      if (!Array.isArray(msg.content)) continue;
      for (const block of msg.content) {
        if (block.type !== "tool-call") continue;
        const tc = block as ToolCallBlock;
        for (const [cat, names] of Object.entries(CATEGORY_TOOLS)) {
          if (toolNamesIn(names).has(tc.toolName)) {
            counts[cat] = (counts[cat] ?? 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [sessions, activeId]);

  const disableAllTools = () =>
    setToolOptions({
      web_search: false,
      fetch_url: false,
      journal: false,
      tasks: false,
      audio: false,
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isSending}>
        <div className="relative inline-block">
          <Tooltip delayDuration={400}>
            <TooltipTrigger asChild disabled={isSending}>
              <Button variant="outline" size="icon">
                <Hammer
                  className={cn("h-4 w-4 transition-all text-muted-foreground")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Tools</TooltipContent>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-2.5">
          <p className="text-sm font-medium">Tools</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Configure what the model can see and use.
          </p>
        </div>

        {/* Search Tools */}
        <div className="flex flex-col p-2 gap-1 border-t">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Search Tools
          </p>

          <ToolOptionRow
            label="Web Search"
            isOn={web_search}
            subtitle="Search the web for current info"
            onClick={() => setToolOptions({ web_search: !web_search })}
          />

          <ToolOptionRow
            label="Fetch URL"
            isOn={fetch_url}
            subtitle="Fetch and read content from URLs"
            onClick={() => setToolOptions({ fetch_url: !fetch_url })}
          />
        </div>

        {/* Custom Tools */}
        <div className="flex flex-col p-2 gap-1 border-t">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Custom Tools
          </p>

          <ToolOptionRow
            label="Journal"
            isOn={journal}
            dollars={CATEGORY_DOLLARS.journal}
            calls={toolCounts.journal}
            subtitle="Read & write journal entries"
            onClick={() => setToolOptions({ journal: !journal })}
          />

          <ToolOptionRow
            label="Tasks"
            isOn={tasks}
            dollars={CATEGORY_DOLLARS.tasks}
            calls={toolCounts.tasks}
            subtitle="Create and manage tasks"
            onClick={() => setToolOptions({ tasks: !tasks })}
          />

          <ToolOptionRow
            label="Player"
            isOn={audio}
            dollars={CATEGORY_DOLLARS.audio}
            calls={toolCounts.audio}
            subtitle="Control the music player"
            onClick={() => setToolOptions({ audio: !audio })}
          />
        </div>

        <div className="flex items-center justify-between p-2 border-t bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 text-muted-foreground hover:text-destructive"
            onClick={disableAllTools}
          >
            Disable all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ToolOptionRowProps {
  label: string;
  isOn: boolean;
  dollars?: string;
  calls?: number;
  subtitle: string;
  onClick: () => void;
}

const ToolOptionRow = ({
  label,
  isOn,
  dollars,
  calls,
  subtitle,
  onClick,
}: ToolOptionRowProps) => {
  const usageLabel =
    dollars && calls !== undefined
      ? `${dollars} · ${calls} call${calls === 1 ? "" : "s"}`
      : dollars;

  return (
    <div
      onClick={onClick}
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
