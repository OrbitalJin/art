import React, { memo } from "react";
import { useCodeBlock } from "@/hooks/use-code-block";
import { CodeBlockHeader } from "@/components/chat/messages/code/block/header";
import { CodeBlockPreview } from "@/components/chat/messages/code/block/preview";
import { CodeBlockContent } from "@/components/chat/messages/code/block/content";

interface CodeBlockProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CodeBlockComponent = ({
  className,
  children,
  defaultExpanded,
}: CodeBlockProps) => {
  const code = String(children ?? "").replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = (match?.[1] ?? "text").toLowerCase();

  const {
    lineCount,
    shouldCollapse,
    previewCode,
    isExpanded,
    setIsExpanded,
    wraps,
    setWraps,
    copyState,
  } = useCodeBlock({
    code,
    defaultExpanded,
  });

  return (
    <div className="relative my-2 overflow-hidden rounded-md border bg-background/50">
      <CodeBlockHeader
        language={language}
        lineCount={lineCount}
        shouldCollapse={shouldCollapse}
        isExpanded={isExpanded}
        wraps={wraps}
        copied={copyState.copied}
        onToggle={() => shouldCollapse && setIsExpanded(!isExpanded)}
        onToggleWrap={() => setWraps((v) => !v)}
        onCopy={copyState.copy}
      />

      {!shouldCollapse || isExpanded ? (
        <CodeBlockContent code={code} language={language} wraps={wraps} />
      ) : (
        <CodeBlockPreview
          code={previewCode}
          onExpand={() => setIsExpanded(true)}
        />
      )}
    </div>
  );
};

export const CodeBlock = memo(CodeBlockComponent);
