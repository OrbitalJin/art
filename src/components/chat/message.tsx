import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { CodeBlock } from "./code-block";

export type Role = "user" | "assistant";
export type MessageObject = { role: Role; content: string };

export const Message: React.FC<MessageObject> = ({ role, content }) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleMessageCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={`group flex w-full gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`relative shadow-sm group ${
          isUser
            ? "bg-muted/40 rounded-md max-w-[80%] border text-sm text-foreground/80 p-3"
            : "text-foreground/90 leading-7 max-w-full"
        }`}
      >
        {content ? (
          <div
            className={cn(
              "prose prose-sm dark:prose-invert leading-relaxed wrap-break-word max-w-none",
            )}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
                a({ children, ...props }) {
                  return (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <span className="text-xs">Thinking...</span>
            <Spinner />
          </div>
        )}

        {!isUser && content && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleMessageCopy}
            className="absolute bottom-0 translate-y-6 left-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
