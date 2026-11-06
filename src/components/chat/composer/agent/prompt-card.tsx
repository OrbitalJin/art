import { cn } from "@/lib/utils";

export type PromptTone = "pending" | "positive" | "negative";

interface PromptCardProps {
  variant: "default" | "embedded";
  pending: boolean;
  children: React.ReactNode;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  variant,
  pending,
  children,
}) => {
  const isDefault = variant === "default";

  const cardClassName = cn(
    "overflow-hidden transition-colors duration-200",
    isDefault && [
      "mb-2 max-w-3xl rounded-xl border bg-card/40 shadow-sm backdrop-blur-xl",
      "ring-1 ring-inset ring-foreground/5",
      pending ? "border-amber-500/30" : "border-border/40",
    ],
    !isDefault && "w-full",
  );

  return <div className={cardClassName}>{children}</div>;
};

interface PromptStatusProps {
  tone: PromptTone;
  label: string;
}

export const PromptStatus: React.FC<PromptStatusProps> = ({ tone, label }) => {
  const pillClassName = cn(
    "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5",
    "text-[10px] font-medium ring-1 ring-inset",
    tone === "pending" &&
      "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
    tone === "positive" &&
      "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
    tone === "negative" &&
      "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400",
  );

  const dotClassName = cn(
    "size-1.5 rounded-full bg-current",
    tone === "pending" && "animate-pulse motion-reduce:animate-none",
  );

  return (
    <span className={pillClassName}>
      <span aria-hidden className={dotClassName} />
      {label}
    </span>
  );
};
