import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/chat/messages/code/block";
import { InlineCode } from "@/components/chat/messages/code/inline";

interface Props {
  content: string;
  className?: string;
}

export const Renderer: React.FC<Props> = ({ content, className }) => {
  return (
    <div
      className={cn(
        "markdown",
        "max-w-none leading-relaxed",
        "wrap-break-word",
        "text-foreground/80 leading-6",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = Boolean(
              className && className.includes("language-"),
            );

            if (!isBlock) {
              return (
                <InlineCode className={className} {...props}>
                  {children}
                </InlineCode>
              );
            }

            return (
              <div className="grid max-w-full overflow-x-auto">
                <CodeBlock className={className}>{children}</CodeBlock>
              </div>
            );
          },

          a({ children, ...props }) {
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80 break-all"
              >
                {children}
              </a>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-left border-collapse border border-zinc-200 dark:border-zinc-800">
                  {children}
                </table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
