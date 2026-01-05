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
        "text-xs bg-muted text-primary p-1 rounded-sm font-semibold overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
};
