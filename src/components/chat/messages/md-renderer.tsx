import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

export const MDRenderer: React.FC<Props> = ({ content, className }) => {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none leading-relaxed",
        "wrap-break-word text-sm",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ ...props }) => (
            <div className="grid max-w-full overflow-x-auto">
              <CodeBlock {...props} />
            </div>
          ),
          a: ({ children, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80 break-all"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border-collapse border border-zinc-200 dark:border-zinc-800">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
