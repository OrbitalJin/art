import { type FC, type ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";

/* Basics */

export const SectionLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-medium text-muted-foreground/60 select-none">
    {children}
  </span>
);

export const EmptyNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-[11px] text-muted-foreground/50">{children}</p>
);

export const ErrorNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="rounded-md bg-red-500/5 px-2.5 py-2 text-[11px] leading-snug break-words text-red-600/90 dark:text-red-400/90">
    {children}
  </p>
);

export const SuccessNote: FC<{ label?: string }> = ({
  label = "Completed",
}) => (
  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <span aria-hidden className="size-1.5 rounded-full bg-emerald-500/70" />
    {label}
  </span>
);

export const DoneNote: FC<{ block: ToolCallBlock; label?: string }> = ({
  block,
  label,
}) => (block.state === "result" ? <SuccessNote label={label} /> : null);
