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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useSessionStore } from "@/lib/store/use-session-store";
import { PocketKnife } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
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
  google_search: "$",
  url_context: "$",
  journal: "$$$",
  tasks: "$$$",
  audio: "$$",
};

const toolNamesIn = (names: string[]) => new Set(names);

export const ToolOptions = () => {
  const toolOptions = useSettingsStore((state) => state.toolOptions);
  const setToolOptions = useSettingsStore((state) => state.setToolOptions);
  const { isSending } = useChat();
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

  return (
    <DropdownMenu>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild disabled={isSending}>
            <Button
              variant="outline"
              size="icon"
              className={cn("h-9 w-9 transition-all relative group")}
            >
              <PocketKnife
                className={cn(
                  "h-4 w-4 transition-all",
                  "group-hover:-rotate-45 text-muted-foreground",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Tools</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="start"
        className="w-72 p-0 shadow-xl border-muted-foreground/20"
      >
        <div className="flex flex-col gap-1 border-b bg-muted/30 p-3">
          <p className="text-sm font-medium">Tools</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Configure what the model can see and use.
          </p>
        </div>

        {/* Display */}
        <div className="flex flex-col p-2 gap-1">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Display
          </p>

          <ToolOptionRow
            label="Tool Calls"
            isOn={toolOptions.showCalls}
            onText="Tool calls are shown in the chat."
            offText="Tool calls are hidden from the chat."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                showCalls: !toolOptions.showCalls,
              })
            }
          />
        </div>

        {/* Provider Tools */}
        <div className="flex flex-col p-2 gap-1 border-t">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Provider Tools
          </p>

          <ToolOptionRow
            label="Google Search"
            isOn={toolOptions.google_search}
            onText="The model can search the web for current information."
            offText="Web search is disabled for this conversation."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                google_search: !toolOptions.google_search,
              })
            }
          />

          <ToolOptionRow
            label="URL Context"
            isOn={toolOptions.url_context}
            onText="The model can fetch and read content from URLs."
            offText="URL fetching is disabled."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                url_context: !toolOptions.url_context,
              })
            }
          />
        </div>

        {/* Custom Tools */}
        <div className="flex flex-col p-2 gap-1 border-t">
          <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
            Custom Tools
          </p>

          <ToolOptionRow
            label="Journal"
            isOn={toolOptions.journal}
            dollars={CATEGORY_DOLLARS.journal}
            calls={toolCounts.journal}
            onText="The model can read and write journal entries."
            offText="Journal access is disabled."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                journal: !toolOptions.journal,
              })
            }
          />

          <ToolOptionRow
            label="Tasks"
            isOn={toolOptions.tasks}
            dollars={CATEGORY_DOLLARS.tasks}
            calls={toolCounts.tasks}
            onText="The model can create and manage tasks."
            offText="Task management is disabled."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                tasks: !toolOptions.tasks,
              })
            }
          />

          <ToolOptionRow
            label="Player"
            isOn={toolOptions.audio}
            dollars={CATEGORY_DOLLARS.audio}
            calls={toolCounts.audio}
            onText="The model can interact with the music player."
            offText="Music player interaction is disabled."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                audio: !toolOptions.audio,
              })
            }
          />
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
  onText: string;
  offText: string;
  onClick: () => void;
}

const ToolOptionRow = ({
  label,
  isOn,
  dollars,
  calls,
  onText,
  offText,
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
        "flex flex-col p-2 gap-2 cursor-pointer rounded-sm transition-all duration-200 group",
        isOn ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent/20",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isOn ? "text-primary" : "text-foreground",
            )}
          >
            {label}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] py-0 h-5 font-normal opacity-60 group-hover:opacity-100 transition-opacity",
            isOn && "opacity-100 border-primary/30 text-primary",
          )}
        >
          {isOn ? "On" : "Off"}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/70 leading-snug pr-4">
          {isOn ? onText : offText}
        </p>
      </div>

      {usageLabel && (
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground/50">
            {usageLabel}
          </span>
        </div>
      )}
    </div>
  );
};
