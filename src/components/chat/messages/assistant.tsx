import { Spinner } from "@/components/ui/spinner";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, Sparkle, Cpu, Globe, GitBranch } from "lucide-react";
import { estimateTokens } from "@/lib/llm/common/utils";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/llm/common/types";
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
import { useStreamingState } from "@/hooks/use-streaming-state";
import { toast } from "sonner";

export const AssistantMessage: React.FC<Message> = ({
  content,
  modelId,
  id: messageId,
  status,
  grounded,
}) => {
  const { copied, copy } = useCopy(content);
  const activeId = useSessionStore((state) => state.activeId);
  const branchFrom = useSessionStore((state) => state.branchFrom);
  const { isCurrentSessionStreaming } = useStreamingState();

  const isThinking = status === "thinking";
  const hasContent = content.length > 0;
  const model = MODELS.find((m) => m.id === modelId);
  const premium = model?.tier === 3;

  const handleBranch = () => {
    if (activeId && !isCurrentSessionStreaming) {
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
      <div className="relative flex-1 leading-7 text-foreground/90">
        {isThinking && (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <Spinner />
            <ShimmerText className="text-sm">Thinking</ShimmerText>
          </div>
        )}

        {hasContent && <Renderer content={content} />}

        {hasContent && (
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
                      point.
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
                <Cpu size={12} /> {estimateTokens(content)} tokens
              </span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  premium && "text-amber-300/60",
                )}
              >
                <Sparkle size={12} />
                <ShimmerText className={cn(premium && "text-amber-300/60")}>
                  {model?.id}
                </ShimmerText>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
