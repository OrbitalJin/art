import React, { useMemo } from "react";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, Sparkle, Cpu, Globe, GitBranch } from "lucide-react";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/ai/models";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSessionStore } from "@/lib/store/use-session-store";
import { toast } from "sonner";
import { ToolCallCard } from "./tool-call-card";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useChatStream } from "@/contexts/chat-context";

export const AssistantMessage: React.FC<Message> = ({
  content: _content,
  modelId,
  id: messageId,
  grounded,
  tokenUsage: { output },
}) => {
  const activeId = useSessionStore((state) => state.activeId);
  const branchFrom = useSessionStore((state) => state.branchFrom);
  const showCalls = useSettingsStore((state) => state.toolOptions.showCalls);
  const { isSending } = useChatStream();

  const content = useMemo(() => {
    if (typeof _content === "string") return _content;
    return _content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
  }, [_content]);

  const { copied, copy } = useCopy(content);

  const model = MODELS.find((m) => m.id === modelId);
  const premium = model?.tier === 3;

  const hasContent =
    content.length > 0 || (Array.isArray(_content) && _content.length > 0);

  const shouldRenderFooter = hasContent && !isSending;
  const isThinking = !hasContent;

  const handleBranch = () => {
    if (activeId && !isSending) {
      const success = branchFrom(activeId, messageId, true);
      if (success) {
        toast.info("Session branched successfully");
      } else {
        toast.error("Failed to branch: Session not found");
      }
    }
  };

  return (
    <div className="group flex w-full gap-3 animate-in fade-in duration-100 select-auto">
      <div
        className={cn(
          "relative flex-1 leading-7 min-w-0 transition-all text-foreground",
        )}
      >
        {isThinking && (
          <div className="flex items-center gap-2 py-1 text-muted-foreground mb-2">
            <ShimmerText className="text-sm">Thinking</ShimmerText>
          </div>
        )}

        {hasContent && (
          <div
            className={cn(
              "space-y-1",
              isThinking ? "opacity-50" : "opacity-90",
            )}
          >
            {typeof _content === "string" ? (
              <Renderer content={_content} />
            ) : (
              _content.map((block, idx) => {
                if (block.type === "text") {
                  return <Renderer key={idx} content={block.text} />;
                }
                if (block.type === "tool-call" && showCalls) {
                  return <ToolCallCard key={block.id} block={block} />;
                }
                return null;
              })
            )}
          </div>
        )}

        {shouldRenderFooter && (
          <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100">
            <div className="flex flex-row gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={copy}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="text-green-400" /> : <Copy />}
              </Button>

              <HoverCard openDelay={300} closeDelay={150}>
                <HoverCardTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:bg-muted"
                    onClick={handleBranch}
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent
                  align="center"
                  side="bottom"
                  className="w-72 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b bg-muted/30 p-3">
                    <p className="text-sm font-medium">Branch Off</p>
                    <span className="rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      New Branch
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                      Create a duplicate of this conversation from the current
                      Point.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-default">
              {grounded && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="flex items-center gap-1">
                      <Globe size={12} />
                      Grounded
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      This response is based on information from the internet.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}

              <span className="flex items-center gap-1">
                <Cpu size={12} /> {output} tokens
              </span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  premium && "text-amber-300/60",
                )}
              >
                <Sparkle size={12} />
                <ShimmerText className={cn(premium && "text-amber-300/60")}>
                  {model?.displayName}
                </ShimmerText>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
