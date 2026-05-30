import { useState } from "react";
import { Hammer, LoaderPinwheel } from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const ToolCallCard: React.FC<{ block: ToolCallBlock }> = ({ block }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "bg-card/30 rounded-lg border border-border/50",
        "overflow-hidden my-3 select-none max-w-3xl",
        isOpen && "border-border",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full cursor-pointer",
          "p-2.5 text-xs text-muted-foreground",
          "hover:bg-muted/20 transition-colors",
          isOpen && "border-b",
        )}
      >
        <div className="flex items-center gap-2">
          {block.state === "executing" ? (
            <LoaderPinwheel className="animate-spin text-secondary" size={14} />
          ) : (
            <Hammer className="text-primary fill-primary" size={14} />
          )}
          <span className="text-foreground/80">{block.toolName}</span>
        </div>
        <Badge variant="outline">
          {block.state === "executing" ? "running..." : "completed"}
        </Badge>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-muted/30 bg-muted/5 space-y-2.5 text-xs font-mono select-text">
          <div className="flex flex-col gap-2">
            <div>Parameters</div>
            <pre className="text-foreground/80 overflow-x-auto max-h-40 bg-zinc-900/50 p-2 rounded">
              {JSON.stringify(block.input, null, 2)}
            </pre>
          </div>
          {block.output !== undefined && (
            <div className="flex flex-col gap-2">
              <div>Value Returned</div>
              <pre className="text-emerald-500/90 overflow-x-auto max-h-40 bg-zinc-900/50 p-2 rounded">
                {JSON.stringify(block.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
