import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
} from "@/components/ui/code-block";

/* Code and diff */

// shadcn's diff variants tint added lines neutral and removed lines red. We keep
// the app's green/red language (the summary badges are green/red too) by
// re-tinting the added lines and the +/- markers.
const ADDED_LINE =
  "bg-emerald-500/5 text-emerald-700/90 after:text-emerald-600/70 dark:text-emerald-400/90";
const REMOVED_LINE =
  "bg-red-500/5 text-red-700/90 after:text-red-600/70 dark:text-red-400/90";

const splitLines = (text: string): string[] =>
  text.replace(/\n$/, "").split("\n");

export const DiffPanel: FC<{
  removed?: string | null;
  added?: string | null;
}> = ({ removed, added }) => {
  const removedLines = removed ? splitLines(removed) : [];
  const addedLines = added ? splitLines(added) : [];

  return (
    <CodeBlock className="text-[11px]">
      <CodeBlockContent wrap className="max-h-60">
        {removedLines.map((line, index) => (
          <CodeBlockLine
            key={`removed-${index}`}
            variant="removed"
            className={REMOVED_LINE}
          >
            {line}
          </CodeBlockLine>
        ))}
        {addedLines.map((line, index) => (
          <CodeBlockLine
            key={`added-${index}`}
            variant="added"
            className={ADDED_LINE}
          >
            {line}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
};

export const CodePanel: FC<{
  children: ReactNode;
  maxHeightClass?: string;
  tone?: "default" | "error" | "added";
}> = ({ children, maxHeightClass = "max-h-40", tone = "default" }) => (
  <CodeBlock
    size="sm"
    variant={tone === "error" ? "destructive" : "default"}
    className={cn(tone === "default" && "bg-muted/30")}
  >
    <CodeBlockContent
      wrap
      className={cn(
        "text-[11px]",
        maxHeightClass,
        tone === "default" && "text-foreground/70",
        tone === "added" && "text-emerald-700/90 dark:text-emerald-400/90",
      )}
    >
      {children}
    </CodeBlockContent>
  </CodeBlock>
);
