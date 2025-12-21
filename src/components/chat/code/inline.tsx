import { cn } from "@/lib/utils";

interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const InlineCode = ({
  className,
  children,
  ...props
}: InlineCodeProps) => {
  return (
    <code
      className={cn(
        "relative rounded-md px-1.5 py-0.5",
        "font-mono text-[0.85em]",
        "bg-muted/60 text-foreground/80",
        "border border-border/40",
        "whitespace-nowrap",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
};
