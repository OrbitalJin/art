import { type FC, type ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { blockErrorOf } from "./format";
import { EmptyNote, ErrorNote } from "./notes";

/* Detail */

export const DetailGate: FC<{
  block: ToolCallBlock;
  executingLabel?: string;
  children: ReactNode;
}> = ({ block, executingLabel = "Loading…", children }) => {
  const error = blockErrorOf(block);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") {
    return <EmptyNote>{executingLabel}</EmptyNote>;
  }

  return <>{children}</>;
};

export const DetailTitle: FC<{ title: string; children?: ReactNode }> = ({
  title,
  children,
}) => (
  <div className="flex min-w-0 items-center gap-2">
    <span
      className="min-w-0 truncate text-[12px] font-medium text-foreground/90"
      title={title}
    >
      {title}
    </span>
    {children}
  </div>
);

export const DetailSubtitle: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="truncate text-[10px] text-muted-foreground/50">{children}</p>
);

export const HeaderLine: FC<{
  label: string;
  mono?: boolean;
  children: ReactNode;
}> = ({ label, mono, children }) => (
  <div className="flex min-w-0 items-baseline gap-2">
    <span className="w-14 shrink-0 text-[10px] text-muted-foreground/50">
      {label}
    </span>
    <span
      className={cn(
        "min-w-0 break-words text-[11px] text-foreground/70",
        mono && "font-mono text-[10px]",
      )}
    >
      {children}
    </span>
  </div>
);
