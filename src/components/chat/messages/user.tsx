import React from "react";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import { Check, Copy, Undo2 } from "lucide-react";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface UserMessageProps extends Message {
  onPrune?: () => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  content,
  onPrune,
}) => {
  const { copied, copy } = useCopy(content);

  return (
    <div className="group flex w-full flex-col gap-2 items-end animate-in fade-in duration-100 select-auto">
      <div className="relative rounded-md rounded-tr-none border bg-muted/40 p-3 text-foreground/80 shadow-sm">
        <Renderer content={content} />
      </div>

      <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <AlertDialog>
          <AlertDialogTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Prune conversation from here</p>
              </TooltipContent>
            </Tooltip>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onPrune}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
