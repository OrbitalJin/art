import type React from "react";
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

import { CodeBlock } from "@/components/chat/messages/code/block/block";
import { InlineCode } from "@/components/chat/messages/code/inline";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

const RendererComponent: React.FC<Props> = ({ content, className }) => {
  return (
    <div
      className={cn(
        "max-w-none break-words text-foreground/90 leading-6",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1({ children }) {
            return (
              <h1 className="mb-3 mt-6 text-2xl font-semibold tracking-tight first:mt-0">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="mb-2 mt-5 text-xl font-semibold tracking-tight first:mt-0">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="mb-2 mt-4 text-lg font-semibold tracking-tight first:mt-0">
                {children}
              </h3>
            );
          },

          h4({ children }) {
            return (
              <h4 className="mb-2 mt-4 text-base font-semibold first:mt-0">
                {children}
              </h4>
            );
          },

          h5({ children }) {
            return (
              <h5 className="mb-1 mt-3 text-sm font-semibold first:mt-0">
                {children}
              </h5>
            );
          },

          h6({ children }) {
            return (
              <h6 className="mb-1 mt-3 text-sm font-medium text-muted-foreground first:mt-0">
                {children}
              </h6>
            );
          },

          p({ children }) {
            return <p className="my-3 first:mt-0 last:mb-0">{children}</p>;
          },

          ul({ children }) {
            return (
              <ul className="my-3 list-disc space-y-1 pl-6 first:mt-0 last:mb-0">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="my-3 list-decimal space-y-1 pl-6 first:mt-0 last:mb-0">
                {children}
              </ol>
            );
          },

          li({ children }) {
            return <li className="marker:text-muted-foreground">{children}</li>;
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-l-4 border-border/60 pl-4 italic text-muted-foreground first:mt-0 last:mb-0">
                {children}
              </blockquote>
            );
          },

          hr() {
            return <hr className="my-6 border-border/50" />;
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return <em className="italic">{children}</em>;
          },

          code({ className, children, ...props }) {
            const text = String(children).replace(/\n$/, "");
            const isBlock =
              !!className?.includes("language-") || text.includes("\n");

            if (!isBlock) {
              return (
                <InlineCode className={cn(className)} {...props}>
                  {children}
                </InlineCode>
              );
            }

            return (
              <div className="my-4 grid max-w-full overflow-x-auto first:mt-0 last:mb-0">
                <CodeBlock className={className}>{text}</CodeBlock>
              </div>
            );
          },

          a({ children, href, ...props }) {
            const handleClick = async (e: React.MouseEvent) => {
              e.preventDefault();

              if (!href) return;

              try {
                await openUrl(href);
              } catch (error) {
                toast.error("Failed to open URL");
                console.log(error);
              }
            };

            return (
              <a
                {...props}
                href={href}
                onClick={handleClick}
                className="cursor-pointer break-all text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
              >
                {children}
              </a>
            );
          },

          table({ children }) {
            return (
              <div className="my-4 w-full overflow-x-auto first:mt-0 last:mb-0">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },

          thead({ children }) {
            return <thead className="bg-muted/40">{children}</thead>;
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
              <th className="h-10 border border-border/50 px-3 text-left align-middle font-medium text-foreground">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-border/40 px-3 py-2 align-middle">
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
  return prev.content === next.content && prev.className === next.className;
});
