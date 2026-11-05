import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface PanelRowProps extends ComponentPropsWithoutRef<"button"> {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  active?: boolean;
}

export const PanelRow = forwardRef<HTMLButtonElement, PanelRowProps>(
  ({ icon, label, trailing, active = false, className, ...props }, ref) => {
    const rowClassName = cn(
      "group/row relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm outline-none",
      "text-muted-foreground transition-colors duration-150",
      "hover:bg-accent/50 hover:text-foreground",
      "focus-visible:bg-accent/50 focus-visible:text-foreground",
      active && "bg-accent/60 text-foreground",
      className,
    );

    const indicatorClassName = cn(
      "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2",
      "rounded-r-full bg-primary",
    );

    return (
      <button ref={ref} type="button" {...props} className={rowClassName}>
        {active && <span aria-hidden className={indicatorClassName} />}
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {trailing}
      </button>
    );
  },
);

PanelRow.displayName = "PanelRow";
