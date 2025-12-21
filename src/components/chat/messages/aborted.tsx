import { Copy, Check, Cpu, Sparkle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn, estimateTokens } from "@/lib/utils";
import type { Message } from "@/lib/llm/common/memory/types";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { Renderer } from "@/components/chat/messages/renderer";
import { useCopy } from "@/hooks/use-copy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const AbortedMessage: React.FC<Message> = ({ content, model }) => {
  const { copied, copy } = useCopy(content);
  const hasContent = content.length > 0;

  if (!hasContent) {
    return (
      <div
        className="flex w-full animate-in fade-in duration-100
        "
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md",
            "border border-destructive/20 bg-destructive/10",
            "p-4 text-sm text-destructive",
          )}
        >
          <StopCircle className="h-4 w-4" />
          <span>Stopped by user</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full animate-in fade-in duration-100">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="aborted" className="border-none">
          <AccordionTrigger
            className={cn(
              "flex w-full items-center justify-between gap-2 p-4",
              "border border-destructive/20",
              "text-sm text-destructive",
              "bg-destructive/10",
              "hover:bg-destructive/15",
              "no-underline!",
              "data-[state=open]:rounded-none",
              "data-[state=open]:rounded-t-md",
              "data-[state=open]:bg-destructive/5",
              "data-[state=open]:bg-destructive/5",
              "data-[state=open]:hover:bg-destructive/10",
            )}
          >
            <div className="flex items-center gap-2">
              <StopCircle className="h-4 w-4" />
              <span>Stopped by user</span>
            </div>
          </AccordionTrigger>

          <AccordionContent className="border rounded-md border-t-0 border-destructive/20 p-0">
            <div className="p-2">
              <Renderer content={content} />
            </div>

            <div
              className="
                flex items-center justify-between gap-2
                transition-opacity bg-card/50 p-2
              border-t border-destructive/20
              "
            >
              <Button
                size="icon"
                variant="outline"
                onClick={copy}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="text-green-400" /> : <Copy />}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Cpu size={12} /> {estimateTokens(content)} tokens
                </span>
                <span className="flex items-center gap-1">
                  <Sparkle size={12} />
                  <ShimmerText>{model?.key}</ShimmerText>
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
