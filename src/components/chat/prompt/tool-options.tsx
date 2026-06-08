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
import { PocketKnife } from "lucide-react";
import { useChat } from "@/contexts/chat-context";

export const ToolOptions = () => {
  const toolOptions = useSettingsStore((state) => state.toolOptions);
  const setToolOptions = useSettingsStore((state) => state.setToolOptions);
  const { isSending } = useChat();

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
                  "h-4 w-4 transition-all group-hover:-rotate-45 text-muted-foreground",
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
            onText="The model can create and manage tasks."
            offText="Task management is disabled."
            onClick={() =>
              setToolOptions({
                ...toolOptions,
                tasks: !toolOptions.tasks,
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
  onText: string;
  offText: string;
  onClick: () => void;
}

const ToolOptionRow = ({
  label,
  isOn,
  onText,
  offText,
  onClick,
}: ToolOptionRowProps) => {
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
    </div>
  );
};
