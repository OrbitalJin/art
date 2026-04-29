import React from "react";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, Undo2, GitBranch } from "lucide-react";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";

interface UserMessageProps extends Message {
  onRevert?: () => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  id: messageId,
  content,
  onRevert,
}) => {
  const { copied, copy } = useCopy(content);

  const activeId = useSessionStore((state) => state.activeId);
  const branchFrom = useSessionStore((state) => state.branchFrom);
  const { isCurrentSessionStreaming } = useStreamingState();

  const handleBranch = () => {
    if (activeId && !isCurrentSessionStreaming) {
      branchFrom(activeId, messageId);
    }
  };

  return (
    <div className="group flex w-full flex-col gap-1 items-end animate-in fade-in duration-100 select-auto">
      <div className="relative rounded-md rounded-tr-none border bg-muted/40 p-3 text-foreground/80 shadow-sm">
        <Renderer content={content} />
      </div>

      <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <AlertDialog>
          <HoverCard openDelay={300} closeDelay={150}>
            <HoverCardTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
            </HoverCardTrigger>
            <HoverCardContent
              align="center"
              side="bottom"
              className="w-64 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b bg-muted/30 p-2 px-3">
                <p className="text-sm font-medium">Revert</p>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-muted-foreground/80">
                  Remove this and all subsequent messages to restore a previous
                  state.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onRevert}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
            className="w-72 p-0 shadow-xl border-muted-foreground/20 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b bg-muted/30 p-3">
              <p className="text-sm font-medium">Branch Out</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded border bg-background text-muted-foreground">
                New Branch
              </span>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Create a duplicate of this conversation from the current point.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <Button
          size="icon"
          variant="ghost"
          onClick={copy}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
};
