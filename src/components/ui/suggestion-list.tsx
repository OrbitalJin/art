import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface NavigationKeyProps {
  event: KeyboardEvent;
}

export const useSuggestionNavigation = <T,>(
  items: readonly T[],
  onChoose: (item: T) => void,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Clamp to the filtered list; the stored index can exceed it after filtering.
  const activeIndex = items.length
    ? Math.min(selectedIndex, items.length - 1)
    : 0;

  useEffect(() => {
    rowRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (index: number) => {
    const item = items[index];
    if (item !== undefined) onChoose(item);
  };

  const registerRow = (index: number) => (element: HTMLDivElement | null) => {
    rowRefs.current[index] = element;
  };

  const handleKeyDown = ({ event }: NavigationKeyProps): boolean => {
    // Empty list: consume navigation so the caret stays put, but let Enter
    // fall through so the composer can decide (send / newline).
    if (!items.length) {
      return event.key === "ArrowUp" || event.key === "ArrowDown";
    }

    if (event.key === "ArrowUp") {
      setSelectedIndex((activeIndex + items.length - 1) % items.length);
      return true;
    }
    if (event.key === "ArrowDown") {
      setSelectedIndex((activeIndex + 1) % items.length);
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      choose(activeIndex);
      return true;
    }
    return false;
  };

  return {
    activeIndex,
    setSelectedIndex,
    choose,
    registerRow,
    handleKeyDown,
  };
};

export const SuggestionPanel: React.FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  children,
  ...props
}) => {
  const panelClassName = cn(
    "z-50 w-72 overflow-hidden rounded-xl border border-border/40",
    "bg-popover/80 text-popover-foreground backdrop-blur-2xl",
    "shadow-lg shadow-black/10",
    className,
  );

  return (
    <div className={panelClassName} {...props}>
      {children}
    </div>
  );
};

const headerBarClassName = cn(
  "flex items-center gap-1 border-b border-border/40 px-3.5 py-2",
);

export const SuggestionHeader: React.FC<{ label: string }> = ({ label }) => {
  const labelClassName = cn(
    headerBarClassName,
    "text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60",
  );

  return <div className={labelClassName}>{label}</div>;
};

export const SuggestionTabBar: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <div role="tablist" className={cn(headerBarClassName, "px-2")}>
    {children}
  </div>
);

export const SuggestionTab: React.FC<{
  label: string;
  selected: boolean;
  onSelect: () => void;
}> = ({ label, selected, onSelect }) => {
  const tabClassName = cn(
    "rounded-md px-2 py-0.5 text-[11px] font-medium",
    "transition-colors duration-150",
    selected
      ? "bg-accent/60 text-foreground"
      : "text-muted-foreground/70 hover:text-foreground",
  );

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={tabClassName}
    >
      {label}
    </button>
  );
};

export const SuggestionListbox: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <div
    role="listbox"
    className="flex max-h-64 flex-col gap-0.5 overflow-y-auto p-1"
  >
    {children}
  </div>
);

interface SuggestionRowProps {
  selected: boolean;
  rowRef: (element: HTMLDivElement | null) => void;
  onHover: () => void;
  onSelect: () => void;
  className?: string;
  children: ReactNode;
}

export const SuggestionRow: React.FC<SuggestionRowProps> = ({
  selected,
  rowRef,
  onHover,
  onSelect,
  className,
  children,
}) => {
  const rowClassName = cn(
    "group/row flex w-full cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5",
    "text-left text-sm outline-none transition-colors duration-150",
    selected ? "bg-accent/60 text-foreground" : "text-foreground/80",
    className,
  );

  return (
    <div
      ref={rowRef}
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={rowClassName}
    >
      {children}
    </div>
  );
};

export const SuggestionLabel: React.FC<{ children: ReactNode }> = ({
  children,
}) => <span className="shrink-0 font-medium">{children}</span>;

export const SuggestionMeta: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <span className="min-w-0 truncate text-xs text-muted-foreground/60">
    {children}
  </span>
);

export const SuggestionEmpty: React.FC<{ message: string }> = ({ message }) => (
  <p className="px-3.5 py-3 text-xs text-muted-foreground/70">{message}</p>
);
