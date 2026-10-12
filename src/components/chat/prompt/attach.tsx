import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useImportImage } from "@/hooks/use-import-image";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

export const Attach = () => {
  const { importFSImage } = useImportImage();
  const { addAttachment } = useChatInput();
  const { isSending: disabled } = useChatStream();

  const handleAttachClick = async () => {
    const imported = await importFSImage();
    if (!imported) return;
    addAttachment(imported);
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          size="icon"
          onClick={handleAttachClick}
          disabled={disabled}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Attach image</TooltipContent>
    </Tooltip>
  );
};
