import { Spinner } from "@/components/ui/spinner";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, Sparkle, Cpu } from "lucide-react";
import { estimateTokens } from "@/lib/llm/common/utils";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import { MODELS } from "@/lib/llm/common/types";

export const AssistantMessage: React.FC<Message> = ({
  content,
  modelId,
  status,
}) => {
  const { copied, copy } = useCopy(content);
  const isThinking = status === "thinking";
  const hasContent = content.length > 0;
  const model = MODELS.find((m) => m.id === modelId);
  const premium = model?.tier === 3;

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
            <Button
              size="icon"
              variant="ghost"
              onClick={copy}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="text-green-400" /> : <Copy />}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
