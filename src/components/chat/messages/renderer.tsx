import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/chat/messages/code/block/block";
import { InlineCode } from "@/components/chat/messages/code/inline";
import { memo } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

interface Props {
  content: string;
  className?: string;
}

const RendererComponent: React.FC<Props> = ({ content, className }) => {
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
                <InlineCode
                  className={cn("overflow-x-auto", className)}
                  {...props}
                >
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

          a({ children, href, ...props }) {
            const handleClick = async (e: React.MouseEvent) => {
              e.preventDefault();
              if (href) {
                try {
                  await openUrl(href);
                } catch (error) {
                  toast.error("Failed to open URL");
                  console.log(error);
                }
              }
            };
            return (
              <a
                {...props}
                href={href}
                onClick={handleClick}
                className="text-primary underline underline-offset-4 hover:text-primary/80 break-all cursor-pointer"
              >
                {children}
              </a>
            );
          },

          table({ children }) {
            return (
              <div className="my-6 w-full overflow-x-auto opacity-70 font-light">
                <table className="w-full border-collapse">{children}</table>
              </div>
            );
          },

          thead({ children }) {
            return <thead className="bg-muted/50 ">{children}</thead>;
          },

          tbody({ children }) {
            return (
              <tbody className="divide-y divide-border/40">{children}</tbody>
            );
          },

          tr({ children }) {
            return (
              <tr className="transition-colors hover:bg-muted/20">
                {children}
              </tr>
            );
          },

          th({ children }) {
            return (
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                {children}
              </td>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const Renderer = memo(RendererComponent, (prev, next) => {
  return prev.content === next.content;
});
