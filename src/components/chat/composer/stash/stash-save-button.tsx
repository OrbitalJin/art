import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LayersPlus } from "lucide-react";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useStashUiStore } from "@/lib/store/use-stash-ui-store";
import { composerControlClasses } from "../toolbar";

export const StashSaveButton = () => {
  const { prompt } = useChatInput();
  const { isSending } = useChatStream();
  const openCreate = useStashUiStore((state) => state.openCreate);

  const disabled = isSending || !prompt.trim();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => openCreate({ initialContent: prompt })}
          className={composerControlClasses}
        >
          <LayersPlus />
          <span className="sr-only">Save to stash</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Save to stash</TooltipContent>
    </Tooltip>
  );
};
