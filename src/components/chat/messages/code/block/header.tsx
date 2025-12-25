import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  ChevronRight,
  TextWrap,
  TextAlignStart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  language: string;
  lineCount: number;
  isExpanded: boolean;
  shouldCollapse: boolean;
  wraps: boolean;
  copied: boolean;
  onToggle(): void;
  onToggleWrap(): void;
  onCopy(): void;
}

export const CodeBlockHeader = ({
  language,
  lineCount,
  isExpanded,
  shouldCollapse,
  wraps,
  copied,
  onToggle,
  onToggleWrap,
  onCopy,
}: Props) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-2 border-b transition-colors select-none",
        shouldCollapse && "cursor-pointer",
        isExpanded
          ? "bg-muted/40 border-border"
          : "bg-muted/10 hover:bg-muted/20 border-transparent",
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2 text-xs">
        {shouldCollapse && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform text-muted-foreground",
              isExpanded && "rotate-90",
            )}
          />
        )}

        <span className="lowercase font-medium">{language}</span>

        {shouldCollapse && !isExpanded && (
          <span className="text-[10px] text-muted-foreground opacity-70">
            {lineCount} lines
          </span>
        )}
      </div>

      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        {isExpanded && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={onToggleWrap}
              >
                {wraps ? (
                  <TextWrap className="h-3.5 w-3.5" />
                ) : (
                  <TextAlignStart className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {wraps ? "Unwrap" : "Wrap"}
            </TooltipContent>
          </Tooltip>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
};
