import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useChatInput, useChatStream } from "@/contexts/chat-context";
import { TraitSelect } from "./trait-select";
import { ModeSelect } from "./mode-select";
import { ModelSelect } from "@/components/chat/prompt/model-select";
import { ToolOptions } from "./tool-options";
import { JumpSelect } from "./jump-select";
import { useSessionStore } from "@/lib/store/use-session-store";
import { toast } from "sonner";
import { fileToAttachment, previewUrl } from "@/lib/utils/images";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Attach } from "./attach";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const Prompt: React.FC<Props> = ({ textAreaRef }) => {
  const {
    prompt,
    setPrompt,
    attachments,
    addAttachment,
    removeAttachment,
    sendMessage,
  } = useChatInput();
  const { abortStream, isSending, streamingSessionId } = useChatStream();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const activeSession = useSessionStore((state) => state.activeId);
  const disabled = activeSession !== streamingSessionId && isSending;

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt, textAreaRef]);

  const handleSend = () => {
    sendMessage(prompt, attachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (enterKeySends ? !e.shiftKey : e.shiftKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const readFileAsAttachment = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name} is not an image`);
      return;
    }

    try {
      addAttachment(await fileToAttachment(file));
    } catch {
      toast.error(`Failed to read ${file.name}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await readFileAsAttachment(file);
    }
  };

  const hasAttachments = attachments.length > 0;

  return (
    <footer className="z-20">
      <div className="mx-auto max-w-3xl flex flex-col gap-2">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col gap-2 transition-all",
            "rounded-md border hover:border-primary/30 bg-card shadow-md",
            "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
            disabled && "pointer-events-none opacity-50",
            isDragOver && "border-primary/60 ring-4 ring-ring/20",
          )}
        >
          {hasAttachments && (
            <AttachmentGroup className="gap-1 p-0">
              {attachments.map((attachment, index) => (
                <Attachment
                  key={index}
                  className="rounded-md"
                  orientation="horizontal"
                  size="xs"
                >
                  <AttachmentMedia variant="image">
                    <img src={previewUrl(attachment)} />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>
                      {attachment.name ?? "image"}
                    </AttachmentTitle>
                    <AttachmentDescription>
                      {attachment.mediaType?.split("/")[1]?.toUpperCase() ??
                        "IMAGE"}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction onClick={() => removeAttachment(index)}>
                      <X className="size-3" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
          <Textarea
            autoFocus
            ref={textAreaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message..."
            className={cn(
              "bg-transparent! border-0 shadow-none resize-none p-4",
              "min-h-[80px] max-h-[250px] lg:max-h-[400px]",
              "text-foreground/80 placeholder:text-muted-foreground/50 focus-visible:ring-0",
            )}
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-between items-center p-2 bg-background/50 rounded-b-md">
            <div className="flex flex-row gap-2">
              <ModelSelect />
              <ToolOptions />
              <ModeSelect />
              <TraitSelect />
              <JumpSelect />
              <Attach />
            </div>
            <Button
              variant="default"
              size="icon"
              className={cn(
                "transition-all duration-300",
                isSending || prompt.trim() || hasAttachments
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100 pointer-events-none",
              )}
              onClick={isSending ? abortStream : handleSend}
              disabled={!isSending && !prompt.trim() && !hasAttachments}
            >
              {isSending && !disabled ? (
                <Square className="animate-pulse" />
              ) : (
                <ArrowUp />
              )}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
