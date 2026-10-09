import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  language: string;
  lineCount: number;
  isExpanded: boolean;
  shouldCollapse: boolean;
  wraps: boolean;
  copied: boolean;
  onToggle(): void;
  onToggleWrap(): void;
  onCopy(): void;
}

const HeaderAction: React.FC<{
  label: string;
  pressed?: boolean;
  tone?: "default" | "success";
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, pressed, tone = "default", onClick, children }) => {
  const classes = cn(
    "cursor-pointer rounded px-1.5 py-0.5 text-[11px] outline-none",
    "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring/50",
    tone === "success" && "text-emerald-600 dark:text-emerald-400",
    tone === "default" &&
      (pressed
        ? "bg-foreground/5 text-foreground"
        : "text-muted-foreground/70 hover:text-foreground"),
  );

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
};

const LanguageLabel: React.FC<{
  language: string;
  lineCount: number;
  isExpanded: boolean;
  shouldCollapse: boolean;
  onToggle: () => void;
}> = ({ language, lineCount, isExpanded, shouldCollapse, onToggle }) => {
  const lines = `${lineCount.toLocaleString()} ${lineCount === 1 ? "line" : "lines"}`;

  const chevronClasses = cn(
    "shrink-0 text-muted-foreground/50 transition-transform duration-200",
    "motion-reduce:transition-none",
    isExpanded && "rotate-90",
  );

  if (!shouldCollapse) {
    return (
      <span className="font-mono text-[11px] lowercase text-muted-foreground">
        {language}
      </span>
    );
  }

  const buttonClasses = cn(
    "flex cursor-pointer items-center gap-1.5 rounded text-[11px] outline-none",
    "text-muted-foreground transition-colors duration-150 hover:text-foreground",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
  );

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={onToggle}
      className={buttonClasses}
    >
      <ChevronRight size={12} aria-hidden className={chevronClasses} />
      <span className="font-mono lowercase">{language}</span>
      {!isExpanded && <span className="text-muted-foreground/50">{lines}</span>}
    </button>
  );
};

export const CodeBlockHeader = ({
  language,
  lineCount,
  isExpanded,
  shouldCollapse,
  wraps,
  copied,
  onToggle,
  onToggleWrap,
  onCopy,
}: Props) => {
  const showingContent = !shouldCollapse || isExpanded;

  const containerClasses = cn(
    "flex items-center justify-between gap-3 px-3 py-1.5 select-none",
    showingContent && "border-b border-border/40",
  );

  return (
    <div className={containerClasses}>
      <LanguageLabel
        language={language}
        lineCount={lineCount}
        isExpanded={isExpanded}
        shouldCollapse={shouldCollapse}
        onToggle={onToggle}
      />

      <div className="flex items-center gap-0.5">
        {showingContent && (
          <HeaderAction
            label="Wrap lines"
            pressed={wraps}
            onClick={onToggleWrap}
          >
            Wrap
          </HeaderAction>
        )}

        <HeaderAction
          label="Copy code"
          tone={copied ? "success" : "default"}
          onClick={onCopy}
        >
          {copied ? "Copied" : "Copy"}
        </HeaderAction>
      </div>
    </div>
  );
};
