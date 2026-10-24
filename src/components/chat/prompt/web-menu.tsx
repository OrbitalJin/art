import { useState } from "react";
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
import { useSessionIndex } from "@/lib/store/session/index-store";
import { useSettingsStore, useKeysLoading } from "@/lib/store/use-settings-store";
import { useChatStream } from "@/hooks/use-chat-stream";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEARCH_GROUPS } from "./agent/configure-menu/groups";
import { ToolRow } from "./agent/configure-menu/rows";
import { ART_KEY_NOTICE, KeyNotice } from "./key-notice";

/**
 * Chat-mode control for the search toolset. Only the tools declared in
 * `SEARCH_GROUPS` are ever surfaced here, so no non-search tool can leak into a
 * chat session through this menu.
 */
export const WebMenu: React.FC = () => {
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const setGroup = useSessionIndex((state) => state.setGroup);
  const setGroups = useSessionIndex((state) => state.setGroups);
  const hasKey = useSettingsStore(
    (state) => (state.keys?.composio.length ?? 0) > 0,
  );
  const keysLoading = useKeysLoading();
  const { isSending: disabled } = useChatStream();
  const [open, setOpen] = useState(false);

  if (!session) return null;

  const enabledCount = SEARCH_GROUPS.filter(
    (group) => session.groups?.[group.key] === true,
  ).length;
  const allOn = enabledCount === SEARCH_GROUPS.length;

  const handleToggle = (key: string, value: boolean) => {
    if (!hasKey) return;
    setGroup(session.id, key, value);
  };

  const handleToggleAll = () => {
    if (!hasKey) return;
    setGroups(
      session.id,
      Object.fromEntries(SEARCH_GROUPS.map((group) => [group.key, !allOn])),
    );
  };

  const triggerClasses = cn(
    "h-9 w-9 bg-card/50 border-border/50 transition-all relative",
    "hover:bg-accent/20 group",
    !hasKey && "opacity-60",
  );

  const contentClasses = cn(
    "w-72 max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-xl",
    "max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto",
    "border-muted-foreground/20",
  );

  const rowsClasses = cn(
    "flex flex-col gap-0.5 p-1.5",
    !hasKey && "pointer-events-none opacity-50",
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <div className="relative inline-block">
          <Tooltip>
            <TooltipTrigger asChild disabled={disabled}>
              <Button
                variant="outline"
                size="icon"
                className={triggerClasses}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                {enabledCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground tabular-nums">
                    {enabledCount}
                  </span>
                )}
                <span className="sr-only">
                  Web tools{enabledCount > 0 ? ` (${enabledCount} on)` : ""}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Web tools</TooltipContent>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        side="bottom"
        sideOffset={8}
        className={contentClasses}
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/30 py-2 pr-2 pl-3.5">
          <div className="flex flex-col">
            <p className="text-sm font-medium">Web tools</p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              Toggle search tools for this chat.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs text-muted-foreground shadow-none hover:text-foreground"
            onClick={handleToggleAll}
            disabled={!hasKey}
          >
            {allOn ? "All off" : "All on"}
          </Button>
        </div>

        <div className={rowsClasses}>
          {SEARCH_GROUPS.map((group) => {
            const enabled = session.groups?.[group.key] === true;
            return (
              <ToolRow
                key={group.key}
                label={group.label}
                subtitle={group.description}
                enabled={enabled}
                onToggle={() => handleToggle(group.key, !enabled)}
              />
            );
          })}
        </div>

        {!hasKey && !keysLoading && (
          <KeyNotice className="border-t border-border/50 px-3.5 py-2.5">
            {ART_KEY_NOTICE} to use web tools.
          </KeyNotice>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
