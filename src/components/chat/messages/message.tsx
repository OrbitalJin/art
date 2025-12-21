import { Copy, Check, AlertCircle, Cpu, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { cn, estimateTokens } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { Message as Msg } from "@/lib/llm/common/memory/types";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { Renderer } from "@/components/chat/messages/renderer";

export const Message: React.FC<Msg> = (props) => {
  if (props.role === "system") return null;
  if (props.role === "user") return <UserMessage {...props} />;
  if (props.role === "assistant") return <AssistantMessage {...props} />;
  if (props.role === "system" && props.content.startsWith("Error:")) {
    return (
      <ErrorMessage
        {...props}
        content={props.content.replace("Error:", "").trim()}
      />
    );
  }
  return null;
};

const UserMessage: React.FC<Msg> = ({ content }) => {
  return (
    <div className="flex w-full flex-row-reverse gap-3 animate-in fade-in duration-100">
      <div className="relative rounded-md border bg-muted/40 px-4 text-sm text-foreground/80 shadow-sm">
        <Renderer content={content} />
      </div>
    </div>
  );
};

const AssistantMessage: React.FC<Msg> = ({ content, model }) => {
  const [copied, setCopied] = useState(false);
  console.log(model);

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
    <div className="group flex w-full flex-row gap-3 animate-in fade-in duration-100">
      <div className="relative max-w-full min-w-0 flex-1 text-foreground/90 leading-7">
        {!content ? (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <Spinner />
            <ShimmerText className="text-sm">Thinking</ShimmerText>
          </div>
        ) : (
          <Renderer content={content} />
        )}

        {content && (
          <div
            className={cn(
              "flex items-center justify-between gap-2 mt-2 rounded-md opacity-0",
              "group-hover:opacity-100",
            )}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMessageCopy}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="text-green-400" />
              ) : (
                <Copy className="" />
              )}
            </Button>
            <div className="flex flex-row items-center gap-2 text-xs text-muted-foreground">
              <a className="flex flex-row items-center gap-1">
                <Cpu size={12} /> {estimateTokens(content)} tokens
              </a>
              <a className={cn("flex flex-row items-center text-xs gap-1")}>
                <Sparkle size={12} />
                <ShimmerText>{model?.key} </ShimmerText>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ErrorMessage = ({ content }: { content: string }) => {
  return (
    <div className="flex w-full justify-center py-4">
      <div
        className="
        flex items-center gap-2 rounded-md 
        border border-destructive/20 bg-destructive/10 
        px-4 py-2 text-sm text-destructive"
      >
        <AlertCircle className="h-4 w-4" />
        <span>{content}</span>
      </div>
    </div>
  );
};
