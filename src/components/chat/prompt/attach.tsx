import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatInput, useChatStream } from "@/contexts/chat-context";
import { useImportImage } from "@/hooks/use-import-image";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";

export const Attach = () => {
  const { importFSImage, importClipboardImage } = useImportImage();
  const { addAttachment } = useChatInput();
  const { isSending: disabled } = useChatStream();

  const handleAttachPaste = async () => {
    const imported = await importClipboardImage();
    if (!imported) return;
    addAttachment(imported);
  };

  const handleAttachClick = async () => {
    const imported = await importFSImage();
    if (!imported) return;
    addAttachment(imported);
  };

  useHotkey("Mod+Shift+V", handleAttachPaste);
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
      <TooltipContent>Attach image (Ctrl+Shift+V)</TooltipContent>
    </Tooltip>
  );
};
