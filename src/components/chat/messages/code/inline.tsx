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
      style={{
        fontFamily: "monospace",
      }}
      className={cn(
        "text-xs bg-muted/50 p-1 rounded-sm font-semibold",
        "overflow-hidden max-w-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
};
