import { useId, useState } from "react";
import type { FC, ReactNode } from "react";
import { Check, Copy, WrapText } from "lucide-react";

import { useCopy } from "@/hooks/use-copy";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";
import {
  CodeBlock as CodeBlockRoot,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A fence taller than this collapses behind a "Show all" footer, matching the
// old preview behavior.
const COLLAPSE_THRESHOLD = 10;

const CopyButton: FC<{ value: string }> = ({ value }) => {
  const { copied, copy } = useCopy(value);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : "Copy code"}
      onClick={copy}
      className={cn(copied && "text-emerald-600 dark:text-emerald-400")}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
};

interface Props {
  children: ReactNode;
  className?: string;
}

export const CodeBlock: FC<Props> = ({ className, children }) => {
  const code = String(children ?? "").replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = (match?.[1] ?? "text").toLowerCase();

  const lines = useHighlightedCode(code, language);

  const lineCount = code ? code.split("\n").length : 0;
  const shouldCollapse = lineCount > COLLAPSE_THRESHOLD;

  const [expanded, setExpanded] = useState(false);
  const [wrap, setWrap] = useState(true);
  const contentId = useId();

  const collapsed = shouldCollapse && !expanded;

  return (
    <CodeBlockRoot className="min-w-0">
      <CodeBlockHeader>
        <CodeBlockTitle className="font-mono text-[11px] font-normal lowercase text-muted-foreground">
          {language}
        </CodeBlockTitle>

        <CodeBlockActions>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Wrap lines"
            aria-pressed={wrap}
            onClick={() => setWrap((current) => !current)}
          >
            <WrapText />
          </Button>

          <CopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>

      <CodeBlockContent
        id={contentId}
        wrap={wrap}
        className={cn(
          "text-[13px]",
          collapsed && "max-h-60 overflow-y-hidden scroll-fade-y",
        )}
      >
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>

      {shouldCollapse && (
        <CodeBlockFooter className="justify-center">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded
              ? "Show less"
              : `Show all ${lineCount.toLocaleString()} lines`}
          </Button>
        </CodeBlockFooter>
      )}
    </CodeBlockRoot>
  );
};
