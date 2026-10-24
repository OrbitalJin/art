import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useUpload } from "@/hooks/use-upload";
import { useHasKey, useKeysLoading } from "@/lib/store/use-settings-store";
import { ART_KEY_NOTICE } from "./key-notice";
import { Button } from "@/components/ui/button";
import { MAX_ATTACHMENT_SIZE } from "@/lib/utils/images";
import { Paperclip } from "lucide-react";

const MAX_MB = Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024));

export const Attach = () => {
  const { pickFiles } = useUpload();
  const { isSending: disabled } = useChatStream();
  const hasUploadKey = useHasKey("uploads");
  const keysLoading = useKeysLoading();

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          size="icon"
          onClick={() => void pickFiles()}
          disabled={disabled || !hasUploadKey}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {hasUploadKey || keysLoading
          ? `Attach image or PDF · up to ${MAX_MB} MB`
          : `${ART_KEY_NOTICE} to attach files`}
      </TooltipContent>
    </Tooltip>
  );
};
