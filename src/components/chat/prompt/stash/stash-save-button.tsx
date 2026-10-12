import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import { StashFormDialog } from "./stash-form-dialog";

export const StashSaveButton = () => {
  const { prompt } = useChatInput();
  const { isSending } = useChatStream();
  const [open, setOpen] = useState(false);

  const disabled = isSending || !prompt.trim();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <BookmarkPlus className="h-4 w-4" />
            <span className="sr-only">Save to stash</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save to stash</TooltipContent>
      </Tooltip>

      <StashFormDialog
        open={open}
        onOpenChange={setOpen}
        initialContent={prompt}
      />
    </>
  );
};
