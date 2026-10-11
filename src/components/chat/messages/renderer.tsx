import type React from "react";
import { memo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

import { CodeBlock } from "@/components/chat/messages/code/block/block";
import { InlineCode } from "@/components/chat/messages/code/inline";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  className?: string;
}

let katexCssLoaded = false;

const rootClasses =
  "max-w-none wrap-break-word text-[15px] leading-[1.7] text-foreground/90";

const h1Classes =
  "mb-3 mt-6 text-xl font-semibold tracking-tight text-foreground first:mt-0";
const h2Classes =
  "mb-2 mt-5 text-lg font-semibold tracking-tight text-foreground first:mt-0";
const h3Classes =
  "mb-2 mt-4 text-base font-semibold tracking-tight text-foreground first:mt-0";
const h4Classes =
  "mb-1.5 mt-4 text-[15px] font-semibold text-foreground first:mt-0";
const h5Classes = "mb-1 mt-3 text-sm font-semibold text-foreground first:mt-0";
const h6Classes =
  "mb-1 mt-3 text-sm font-medium text-muted-foreground first:mt-0";

const linkClasses =
  "cursor-pointer break-words text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary";

const MarkdownLink: React.FC<React.ComponentPropsWithoutRef<"a">> = ({
  children,
  href,
  ...props
}) => {
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
    <a {...props} href={href} onClick={handleClick} className={linkClasses}>
      {children}
    </a>
  );
};

const RendererComponent: React.FC<Props> = ({ content, className }) => {
  useEffect(() => {
    if (!katexCssLoaded) {
      katexCssLoaded = true;
      import("katex/dist/katex.min.css");
    }
  }, []);

  return (
    <div className={cn(rootClasses, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1({ children }) {
            return <h1 className={h1Classes}>{children}</h1>;
          },

          h2({ children }) {
            return <h2 className={h2Classes}>{children}</h2>;
          },

          h3({ children }) {
            return <h3 className={h3Classes}>{children}</h3>;
          },

          h4({ children }) {
            return <h4 className={h4Classes}>{children}</h4>;
          },

          h5({ children }) {
            return <h5 className={h5Classes}>{children}</h5>;
          },

          h6({ children }) {
            return <h6 className={h6Classes}>{children}</h6>;
          },

          p({ children }) {
            return <p className="my-3 first:mt-0 last:mb-0">{children}</p>;
          },

          ul({ children }) {
            return (
              <ul className="my-3 list-disc space-y-1.5 pl-6 first:mt-0 last:mb-0 [&_ol]:my-1.5 [&_ul]:my-1.5">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="my-3 list-decimal space-y-1.5 pl-6 first:mt-0 last:mb-0 [&_ol]:my-1.5 [&_ul]:my-1.5">
                {children}
              </ol>
            );
          },

          li({ children }) {
            return (
              <li className="pl-0.5 marker:text-muted-foreground/70">
                {children}
              </li>
            );
          },

          input({ ...props }) {
            return (
              <input
                {...props}
                className="mr-2 translate-y-[1px] accent-primary"
              />
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-l-2 border-border pl-4 text-foreground/70 first:mt-0 last:mb-0">
                {children}
              </blockquote>
            );
          },

          hr() {
            return <hr className="my-6 border-border/40" />;
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

          del({ children }) {
            return (
              <del className="text-foreground/50 line-through">{children}</del>
            );
          },

          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="my-4 max-w-full rounded-lg border border-border/50"
              />
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          code({ className, children, ...props }) {
            const text = String(children).replace(/\n$/, "");
            const isMath = className?.includes("language-math");
            if (isMath) return null;

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
              <div className="my-4 grid min-w-0 max-w-full overflow-x-auto first:mt-0 last:mb-0">
                <CodeBlock className={className}>{text}</CodeBlock>
              </div>
            );
          },

          a({ children, href, ...props }) {
            return (
              <MarkdownLink href={href} {...props}>
                {children}
              </MarkdownLink>
            );
          },

          table({ children }) {
            return (
              <div className="my-4 w-full overflow-x-auto rounded-lg border border-border/50 first:mt-0 last:mb-0">
                <table className="w-full border-collapse text-[13.5px] leading-6">
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
              <tbody className="[&_tr:last-child_td]:border-b-0">
                {children}
              </tbody>
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
              <th className="border-b border-border/50 px-3 py-2 text-left align-middle font-medium text-foreground">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border-b border-border/30 px-3 py-2 align-middle text-foreground/85">
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
