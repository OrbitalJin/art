import { useState } from "react";
import {
  ChevronRight,
  DraftingCompass,
  Hammer,
  LoaderPinwheel,
  Pickaxe,
  Wrench,
} from "lucide-react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";

const ICONS = [Hammer, Wrench, Pickaxe, DraftingCompass];

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
          "flex w-full cursor-pointer items-center gap-2 text-foreground/85",
          "-ml-1.5 rounded-sm px-1.5 py-1 transition-colors duration-150",
          "hover:text-foreground",
        )}
      >
        {isExecuting ? (
          <LoaderPinwheel className="animate-spin text-amber-600" size={13} />
        ) : (
          <ToolIcon className="text-primary" size={13} />
        )}

        <span className="font-mono text-xs font-medium">{block.toolName}</span>

        <ChevronRight
          size={13}
          className={cn(
            "text-muted-foreground/50 transition-transform duration-200",
            isOpen && "rotate-90",
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

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <span className="text-xs text-muted-foreground/50">{label}</span>
    {children}
  </div>
);
