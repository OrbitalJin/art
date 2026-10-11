import React from "react";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, GitBranch } from "lucide-react";
import type { Message } from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { MessageParts } from "./parts";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/ai/models";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/store/use-session-store";
import { toast } from "sonner";
import { ThinkingSection } from "./thinking-section";
import { useChatStream } from "@/hooks/use-chat-stream";

const FooterAction: React.FC<{
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, disabled, onClick, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="size-7 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground"
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

const MessageMeta: React.FC<{
  tokens: number;
  modelName?: string;
  premium: boolean;
}> = ({ tokens, modelName, premium }) => {
  const modelClasses = cn(premium && "text-amber-500/70");

  return (
    <div className="flex cursor-default items-center gap-1.5 text-xs text-muted-foreground/60 select-none">
      {tokens > 0 && (
        <span className="tabular-nums">{tokens.toLocaleString()} tokens</span>
      )}
      {tokens > 0 && modelName && <span aria-hidden>·</span>}
      {modelName && <span className={modelClasses}>{modelName}</span>}
    </div>
  );
};

export const AssistantMessage: React.FC<Message> = (message) => {
  const { parts, modelId, id: messageId, tokenUsage, reasoning } = message;
  const { output } = tokenUsage;

  const activeId = useSessionStore((state) => state.activeId);
  const branchFrom = useSessionStore((state) => state.branchFrom);
  const { isSending, streamingMessageId } = useChatStream();

  const content = messageText(message);
  const { copied, copy } = useCopy(content);

  const model = MODELS.find((m) => m.id === modelId);
  const premium = model?.tier === 3;

  const hasContent = parts.length > 0 || !!reasoning;
  const isStreamingMessage = messageId === streamingMessageId;
  const shouldRenderFooter = hasContent && !isStreamingMessage;

  const handleBranch = () => {
    if (!activeId || isSending) return;

    const success = branchFrom(activeId, messageId, true);
    if (success) {
      toast.info("Session branched successfully");
    } else {
      toast.error("Failed to branch: Session not found");
    }
  };

  const footerClasses = cn(
    "mt-2 flex items-center justify-between gap-3",
    "opacity-0 transition-opacity duration-150",
    "group-hover:opacity-100 focus-within:opacity-100",
  );

  return (
    <div className="group relative w-full min-w-0 animate-in fade-in duration-100 select-auto">
      <div className="min-w-0 leading-7 text-foreground/80 text-base">
        <ThinkingSection
          reasoning={reasoning}
          status={isStreamingMessage ? "streaming" : "done"}
        />

        <MessageParts parts={parts} />

        {shouldRenderFooter && (
          <div className={footerClasses}>
            <div className="flex items-center gap-0.5">
              <FooterAction label={copied ? "Copied" : "Copy"} onClick={copy}>
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </FooterAction>

              <FooterAction
                label="Branch off"
                disabled={isSending}
                onClick={handleBranch}
              >
                <GitBranch className="size-3.5" />
              </FooterAction>
            </div>

            <MessageMeta
              tokens={output}
              modelName={model?.displayName}
              premium={premium}
            />
          </div>
        )}
      </div>
    </div>
  );
};
