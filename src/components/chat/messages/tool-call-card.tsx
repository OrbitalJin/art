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

const ICONS = [Hammer, Wrench, Pickaxe, Drill, DraftingCompass];

export const ToolCallCard: React.FC<{ block: ToolCallBlock }> = ({ block }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isExecuting = block.state !== "result";

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
              <LoaderPinwheel className="animate-spin" size={15} />
            ) : (
              <ToolIcon className="text-primary" size={15} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Tool Call
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-xs font-semibold text-foreground/85">
              {block.toolName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ChevronRight
            size={14}
            className={cn(
              "text-muted-foreground/50 transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border/30 bg-black/20 px-3.5 py-3 space-y-3">
          <Section label="Parameters">
            <pre className="max-h-48 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs font-mono text-foreground/75 leading-relaxed">
              {JSON.stringify(block.input, null, 2)}
            </pre>
          </Section>

          {block.output !== undefined && (
            <Section label="Returned Value">
              <pre className="max-h-48 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs font-mono text-emerald-400/90 leading-relaxed">
                {JSON.stringify(block.output, null, 2)}
              </pre>
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs text-muted-foreground/50">{label}</span>
    {children}
  </div>
);
