import type { Ref } from "react";
import { cn } from "@/lib/utils";

interface Props {
  ref?: Ref<HTMLParagraphElement>;
  description: string;
  completed?: boolean;
  expanded: boolean;
  showFade: boolean;
}

export const BoardItemDescription = ({
  ref,
  description,
  completed = false,
  expanded,
  showFade,
}: Props) => (
  <div className="pt-1">
    <p
      ref={ref}
      className={cn(
        "whitespace-pre-line break-words text-xs leading-relaxed text-muted-foreground",
        completed && "opacity-70 line-through",
        !expanded && "max-h-[3.65625rem] overflow-hidden",
        showFade &&
          "[mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
      )}
    >
      {description}
    </p>
  </div>
);
