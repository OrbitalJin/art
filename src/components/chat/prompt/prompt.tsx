import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { useChatInput, useChatStream } from "@/contexts/chat-context";
import { ModeSelect } from "./mode-select";
import { ModelSelect } from "@/components/chat/prompt/model-select";
import { JumpSelect } from "./jump-select";
import { useSessionStore } from "@/lib/store/use-session-store";
import { previewUrl } from "@/lib/utils/images";
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
import { AgentBar } from "./agent/bar";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

type PromptAttachment = ReturnType<typeof useChatInput>["attachments"][number];

const PromptAttachmentItem: React.FC<{
  attachment: PromptAttachment;
  onRemove: () => void;
}> = ({ attachment, onRemove }) => {
  const name = attachment.name ?? "image";
  const type = attachment.mediaType?.split("/")[1]?.toUpperCase() ?? "IMAGE";

  return (
    <Attachment className="rounded-md" orientation="horizontal" size="xs">
      <AttachmentMedia variant="image">
        <img src={previewUrl(attachment)} alt={name} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>{type}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction onClick={onRemove}>
          <X className="size-3" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};

const PromptAttachments: React.FC<{
  attachments: PromptAttachment[];
  onRemove: (index: number) => void;
}> = ({ attachments, onRemove }) => (
  <AttachmentGroup className="gap-1 px-3 pt-3">
    {attachments.map((attachment, index) => (
      <PromptAttachmentItem
        key={index}
        attachment={attachment}
        onRemove={() => onRemove(index)}
      />
    ))}
  </AttachmentGroup>
);

const SendButton: React.FC<{
  visible: boolean;
  stopping: boolean;
  disabled: boolean;
  onClick: () => void;
}> = ({ visible, stopping, disabled, onClick }) => {
  const buttonClasses = cn(
    "size-8 rounded-full transition-all duration-200",
    visible
      ? "scale-100 opacity-100"
      : "pointer-events-none scale-90 opacity-0",
  );

  return (
    <Button
      type="button"
      size="icon"
      aria-label={stopping ? "Stop generating" : "Send message"}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {stopping ? (
        <Square className="size-3.5 animate-pulse fill-current motion-reduce:animate-none" />
      ) : (
        <ArrowUp className="size-4" />
      )}
    </Button>
  );
};

export const Prompt: React.FC<Props> = ({ textAreaRef }) => {
  const { prompt, setPrompt, attachments, removeAttachment, sendMessage } =
    useChatInput();
  const { abortStream, isSending, streamingSessionId } = useChatStream();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const isAgent = session?.type === "agent";
  const disabled = session?.id !== streamingSessionId && isSending;
  const hasAttachments = attachments.length > 0;
  const canSend = Boolean(prompt.trim()) || hasAttachments;
  const stopping = isSending && !disabled;
  const showSendButton = isSending || canSend;

  const placeholder = isAgent ? "Give your agent a task…" : "Ask anything…";

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
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && (enterKeySends ? !e.shiftKey : e.shiftKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerClasses = cn(
    "relative flex flex-col overflow-hidden rounded-xl border border-border/60",
    "bg-card/50 shadow-sm transition-colors duration-200",
    "hover:border-border",
    "focus-within:border-ring/40 focus-within:ring-4 focus-within:ring-ring/10",
    disabled && "pointer-events-none opacity-50",
  );

  const textareaClasses = cn(
    "resize-none border-0 bg-transparent! shadow-none focus-visible:ring-0",
    "min-h-[100px] max-h-[250px] lg:max-h-[400px]",
    "px-3.5 pt-3.5 pb-1 text-[15px] text-foreground/90",
    "placeholder:text-muted-foreground/50",
  );

  return (
    <footer className="z-20">
      <div className="mx-auto flex max-w-3xl flex-col">
        <div className={containerClasses}>
          <AgentBar />

          {hasAttachments && (
            <PromptAttachments
              attachments={attachments}
              onRemove={removeAttachment}
            />
          )}

          <Textarea
            autoFocus
            ref={textAreaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className={textareaClasses}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex flex-row items-center gap-1.5">
              <JumpSelect />
              <ModelSelect />
              {!isAgent && <ModeSelect />}
              <Attach />
            </div>

            <SendButton
              visible={showSendButton}
              stopping={stopping}
              disabled={!isSending && !canSend}
              onClick={isSending ? abortStream : handleSend}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
