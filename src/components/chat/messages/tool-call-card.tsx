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

interface Props {
  block: ToolCallBlock;
  className?: string;
}

export const ToolCallCard: React.FC<Props> = ({ className, block }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isExecuting = block.state !== "result";

  const [ToolIcon] = useState(() => {
    const randomIndex = Math.floor(Math.random() * ICONS.length);
    return ICONS[randomIndex];
  });

  return (
    <div className={cn("select-none", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2",
          "-ml-1.5 rounded-sm px-1.5 py-1 transition-colors duration-150",
          "hover:bg-muted/30",
        )}
      >
        {isExecuting ? (
          <LoaderPinwheel className="animate-spin text-amber-600" size={13} />
        ) : (
          <ToolIcon className="text-primary" size={13} />
        )}

        <span className="font-mono text-xs font-medium text-foreground/85">
          {block.toolName}
        </span>

        <ChevronRight
          size={13}
          className={cn(
            "ml-auto text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-1 ml-5 space-y-2">
          <Section label="Parameters">
            <pre className="max-h-48 overflow-auto rounded bg-muted/30 p-2 font-mono text-xs leading-relaxed text-foreground/75">
              {JSON.stringify(block.input, null, 2)}
            </pre>
          </Section>

          {block.output !== undefined && (
            <Section label="Returned Value">
              <pre className="max-h-48 overflow-auto rounded bg-muted/30 p-2 font-mono text-xs leading-relaxed text-emerald-400/90">
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
  <div className="flex min-w-0 flex-col gap-1">
    <span className="text-xs text-muted-foreground/50">{label}</span>
    {children}
  </div>
);
