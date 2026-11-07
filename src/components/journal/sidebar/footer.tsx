import { useMemo } from "react";
import { Check, Copy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopy } from "@/hooks/use-copy";
import { useJournalIndex } from "@/lib/store/journal/index-store";
import { usePageMarkdown } from "@/lib/store/journal/content-store";
import { cn } from "@/lib/utils";

const ActionButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon: LucideIcon;
  active?: boolean;
}> = ({ label, onClick, disabled, icon: Icon, active }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "size-6 shrink-0 text-muted-foreground hover:text-foreground",
          active && "text-emerald-500 hover:text-emerald-500",
        )}
      >
        <Icon className="size-3.5" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="top">{label}</TooltipContent>
  </Tooltip>
);

const formatStat = (value: number, singular: string, plural: string) =>
  `${value.toLocaleString()} ${value === 1 ? singular : plural}`;

export const SidebarFooter = () => {
  const currentTab = useJournalIndex((state) => state.currentWorkspace);
  const activeId = useJournalIndex((state) => state.activeId);
  const pages = useJournalIndex((state) => state.pages);
  const content = usePageMarkdown(activeId) ?? "";
  const { copy, copied } = useCopy(content);

  const stats = useMemo(() => {
    const workspacePages = pages.filter(
      (page) => page.workspace === currentTab,
    );
    const words = workspacePages.reduce(
      (total, page) => total + page.wordCount,
      0,
    );
    return { count: workspacePages.length, words };
  }, [pages, currentTab]);

  return (
    <footer className="flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2">
      <p className="min-w-0 truncate text-[11px] text-muted-foreground/70 tabular-nums">
        {formatStat(stats.count, "page", "pages")}
        <span aria-hidden className="mx-1.5">
          ·
        </span>
        {formatStat(stats.words, "word", "words")}
      </p>

      <div className="flex shrink-0 items-center gap-0.5">
        <ActionButton
          label={copied ? "Copied" : "Copy note"}
          onClick={copy}
          disabled={!content}
          icon={copied ? Check : Copy}
          active={copied}
        />
      </div>
    </footer>
  );
};
