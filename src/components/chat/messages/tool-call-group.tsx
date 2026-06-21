import { useState } from "react";
import {
  ChevronRight,
  DraftingCompass,
  Drill,
  Hammer,
  LoaderPinwheel,
  Pickaxe,
  Wrench,
} from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { ToolCallCard } from "./tool-call-card";

const ICONS = [Hammer, Wrench, Pickaxe, Drill, DraftingCompass];

export const ToolCallGroup: React.FC<{ blocks: ToolCallBlock[] }> = ({
  blocks,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const lastBlock = blocks[blocks.length - 1];
  const isExecuting = lastBlock.state !== "result";

  const [ToolIcon] = useState(() => {
    const randomIndex = Math.floor(Math.random() * ICONS.length);
    return ICONS[randomIndex];
  });

  return (
    <div
      className={cn(
        "mb-2 max-w-3xl overflow-hidden rounded-md border select-none",
        "border-border/40 bg-card/20 backdrop-blur-sm",
        "transition-all duration-200",
        isOpen && "border-border/70 bg-card/30 shadow-sm",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between",
          "px-3.5 py-2.5 transition-colors duration-150",
          "hover:bg-muted/20",
          isOpen && "bg-muted/10",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              isExecuting ? "text-secondary" : "text-primary",
            )}
          >
            {isExecuting ? (
              <LoaderPinwheel
                className="animate-spin text-amber-600"
                size={15}
              />
            ) : (
              <ToolIcon className="text-primary" size={15} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isExecuting ? "Tool Calls " : "Tool Results "}(
              <a className="text-primary">{blocks.length}</a>)
            </span>
            {isExecuting && <span className="text-muted-foreground/40">·</span>}
            {isExecuting && (
              <span className="font-mono text-xs font-semibold text-foreground/85">
                {lastBlock.toolName}
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          size={14}
          className={cn(
            "text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border/30 bg-black/20 px-3 py-2.5">
          {blocks.map((block) => (
            <ToolCallCard key={block.id} block={block} />
          ))}
        </div>
      )}
    </div>
  );
};
