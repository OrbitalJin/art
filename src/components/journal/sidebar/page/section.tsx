import { cn } from "@/lib/utils";
import { ChevronRight, Pin, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  count: number;
  open?: boolean;
  isPinned?: boolean;
  setOpen: (open: boolean) => void;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Section: React.FC<Props> = ({
  title,
  count,
  icon: Icon,
  setOpen,
  isPinned = false,
  open = false,
  children,
}) => {
  const headerClassName = cn(
    "group flex w-full cursor-pointer select-none items-center justify-between",
    "rounded-lg px-2.5 py-1.5 text-left outline-none",
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
    "transition-colors duration-150 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  const chevronClassName = cn(
    "size-3 shrink-0 text-muted-foreground/40 transition-transform duration-200",
    "group-hover:text-foreground",
    open && "rotate-90",
  );

  const leadingIcon = Icon ? (
    <Icon strokeWidth={1.75} className="size-3" />
  ) : isPinned ? (
    <Pin strokeWidth={1.75} className="size-3" />
  ) : null;

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={headerClassName}
      >
        <span className="flex items-center gap-2">
          {leadingIcon}
          <span>{title}</span>
          <span className="tabular-nums text-muted-foreground/40">{count}</span>
        </span>
        <ChevronRight strokeWidth={2.25} className={chevronClassName} />
      </button>

      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  );
};
