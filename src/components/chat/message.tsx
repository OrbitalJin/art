// import ReactMarkdown from "react-markdown"; // You might need to install: npm install react-markdown
import { Copy, Loader2, Palette, Rabbit, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export type Role = "user" | "assistant";
export type Message = { role: Role; content: string };

export const ChatMessage: React.FC<Message> = ({ role, content }) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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
      className={`group flex w-full gap-3 px-4 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {isUser ? (
          <Rabbit className="h-4 w-4" />
        ) : (
          <Palette className="h-4 w-4" />
        )}
      </div>

      <div
        className={`relative max-w-[80%] rounded-md px-5 py-3 text-sm shadow-sm group ${
          isUser
            ? "bg-muted/40 text-foreground rounded-tr-none border"
            : "bg-muted/50 text-foreground rounded-tl-sm border"
        }`}
      >
        {content ? (
          <div
            className={cn(
              "prose prose-sm dark:prose-invert leading-relaxed",
              !isUser && "pr-4",
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-line">{content.trim()}</p>
            ) : (
              <ReactMarkdown>{content}</ReactMarkdown>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Thinking...</span>
          </div>
        )}

        {!isUser && content && (
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCopy}
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-80 transition-opacity"
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
