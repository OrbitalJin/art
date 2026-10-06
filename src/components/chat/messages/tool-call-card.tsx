import { useState } from "react";
import {
  ChevronRight,
  CircleCheck,
  DraftingCompass,
  Hammer,
  LoaderPinwheel,
  Pickaxe,
  Wrench,
} from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { DONE_TOOL_NAME } from "@/lib/ai/tools/done";

const ICONS = [Hammer, Wrench, Pickaxe, DraftingCompass];

interface Props {
  block: ToolCallBlock;
  className?: string;
  variant?: "default" | "compact";
}

export const ToolCallCard: React.FC<Props> = ({
  className,
  block,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDone = block.toolName === DONE_TOOL_NAME;
  const isExecuting = block.state !== "result" && !isDone;

  const [ToolIcon] = useState(() => {
    const randomIndex = Math.floor(Math.random() * ICONS.length);
    return ICONS[randomIndex];
  });

  const compact = variant === "compact";

  return (
    <div className={cn("select-none", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 text-foreground/85",
          "rounded-sm px-1.5 py-1 transition-colors duration-150",
          "hover:text-foreground",
          !compact && "-ml-1.5",
          compact && "py-0.5",
        )}
      >
        {isExecuting ? (
          <LoaderPinwheel className="animate-spin text-amber-600" size={13} />
        ) : isDone || compact ? (
          <CircleCheck className="text-emerald-500" size={13} />
        ) : (
          <ToolIcon className="text-primary" size={13} />
        )}

        <span className="font-mono text-xs font-medium">{block.toolName}</span>

        {compact && <CompactSummary block={block} />}

        <ChevronRight
          size={13}
          className={cn(
            "text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-90",
            compact && "ml-auto",
          )}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 p-2">
          <Section label="Parameters">
            <pre className="max-h-24 overflow-auto rounded bg-muted/30 p-2 font-mono text-xs leading-relaxed text-foreground/75">
              {JSON.stringify(block.input, null, 2)}
            </pre>
          </Section>

          {block.output !== undefined && (
            <Section label="Returned Value">
              <pre className="max-h-36 overflow-auto rounded bg-muted/30 p-2 font-mono text-xs leading-relaxed text-emerald-400/90">
                {JSON.stringify(block.output, null, 2)}
              </pre>
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

export const CompactSummary: React.FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  if (block.state === "executing") return null;

  const input = block.input;
  if (input && typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const key of ["summary", "query", "path", "url", "title", "name"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return (
          <span className="truncate text-xs text-muted-foreground/70">
            {value}
          </span>
        );
      }
    }
  }

  return null;
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <span className="text-xs text-muted-foreground/50">{label}</span>
    {children}
  </div>
);
