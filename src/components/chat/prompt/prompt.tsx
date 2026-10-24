import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUp,
  File as FileIcon,
  FileText,
  RefreshCw,
  Square,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHasKey, useKeysLoading, useSettingsStore } from "@/lib/store/use-settings-store";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import { PersonaSelect } from "./persona-select";
import { WebMenu } from "./web-menu";
import { ModelSelect } from "@/components/chat/prompt/model-select";
import { JumpSelect } from "./jump-select";
import { useSessionIndex } from "@/lib/store/session/index-store";
import { attachmentTypeLabel, isPdfMedia } from "@/lib/utils/images";
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
import { StashSelect } from "./stash/stash-select";
import { StashSaveButton } from "./stash/stash-save-button";
import { AgentBar } from "./agent/bar";
import { AgentAttention } from "./agent/attention";
import { ART_KEY_NOTICE, KeyNotice } from "./key-notice";
import { filesFromDataTransfer, useUpload } from "@/hooks/use-upload";
import { resolveAttachmentUrl } from "@/lib/upload/pocketbase";
import type { ChatAttachment } from "@/lib/store/session/types";

interface Props {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const AttachmentTypeIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  if (isPdfMedia(mimeType)) return <FileText className="size-3.5" />;
  return <FileIcon className="size-3.5" />;
};

const PromptAttachmentItem: React.FC<{
  attachment: ChatAttachment;
  onRemove: () => void;
  onRetry: () => void;
}> = ({ attachment, onRemove, onRetry }) => {
  const isImage = attachment.mimeType.startsWith("image/");
  const preview = attachment.localUrl ?? resolveAttachmentUrl(attachment.url);
  const state = attachment.status ?? "done";

  const description =
    attachment.status === "uploading"
      ? "Uploading…"
      : attachment.status === "error"
        ? "Upload failed"
        : attachmentTypeLabel(attachment.mimeType);

  return (
    <Attachment
      state={state}
      className="rounded-md"
      orientation="horizontal"
      size="xs"
    >
      <AttachmentMedia variant={isImage ? "image" : "icon"}>
        {isImage && preview ? (
          <img src={preview} alt={attachment.name} />
        ) : (
          <AttachmentTypeIcon mimeType={attachment.mimeType} />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{attachment.name}</AttachmentTitle>
        <AttachmentDescription>{description}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        {attachment.status === "error" && (
          <AttachmentAction onClick={onRetry} aria-label="Retry upload">
            <RefreshCw className="size-3" />
          </AttachmentAction>
        )}
        <AttachmentAction onClick={onRemove} aria-label="Remove attachment">
          <X className="size-3" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
};

const PromptAttachments: React.FC<{
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}> = ({ attachments, onRemove, onRetry }) => (
  <AttachmentGroup className="gap-1 px-3 pt-3">
    {attachments.map((attachment) => (
      <PromptAttachmentItem
        key={attachment.id}
        attachment={attachment}
        onRemove={() => onRemove(attachment.id)}
        onRetry={() => onRetry(attachment.id)}
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
    "size-8 transition-all duration-200",
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
  const { prompt, setPrompt, attachments, sendMessage } = useChatInput();
  const { ingest, remove, retry, ingestClipboardImage } = useUpload();
  const { abortStream, isSending } = useChatStream();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const hasKey = useHasKey("gateway");
  const hasUploadKey = useHasKey("uploads");
  const keysLoading = useKeysLoading();
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const isAgent = session?.type === "agent";
  const hasAttachments = attachments.length > 0;
  const attachmentsPending = attachments.some(
    (a) => a.status === "uploading" || a.status === "error",
  );
  const canSend =
    hasKey && !attachmentsPending && (Boolean(prompt.trim()) || hasAttachments);
  const stopping = isSending;
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
    if (!hasKey || attachmentsPending) return;
    sendMessage(prompt, attachments);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && (enterKeySends ? !e.shiftKey : e.shiftKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (isSending) return;

    const data = e.clipboardData;
    if (!data) return;

    const files = filesFromDataTransfer(data);
    if (files.length) {
      if (!hasUploadKey) return;
      e.preventDefault();
      ingest(files);
      return;
    }

    const types = Array.from(data.types);
    if (types.includes("text/plain") || types.includes("text/html")) return;
    if (!hasUploadKey) return;

    const handled = await ingestClipboardImage();
    if (handled) e.preventDefault();
  };

  const containerClasses = cn(
    "relative flex flex-col overflow-hidden rounded-xl border border-border/60",
    "bg-card/50 shadow-sm transition-colors duration-200",
    "hover:border-border",
    "focus-within:border-ring/40 focus-within:ring-4 focus-within:ring-ring/10",
    !hasKey && "opacity-60",
  );

  const textareaClasses = cn(
    "resize-none border-0 bg-transparent! shadow-none focus-visible:ring-0",
    "min-h-[90px] max-h-[250px] lg:max-h-[400px]",
    "px-3.5 pt-3.5 pb-1 text-[15px] text-foreground/90",
    "placeholder:text-muted-foreground/50",
  );

  return (
    <footer className="z-20">
      <div className="mx-auto flex max-w-3xl flex-col">
        <AgentAttention />

        {(!hasKey || !hasUploadKey) && !keysLoading && (
          <KeyNotice className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
            {ART_KEY_NOTICE} to start chatting and attach files.
          </KeyNotice>
        )}

        {session?.legacyMedia && (
          <div className="mb-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
            This session predates the attachment system — some media may be
            missing or broken.
          </div>
        )}

        <div className={containerClasses}>
          {isAgent && <AgentBar />}

          {hasAttachments && (
            <PromptAttachments
              attachments={attachments}
              onRemove={remove}
              onRetry={retry}
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
            onPaste={handlePaste}
            disabled={!hasKey}
          />

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex flex-row items-center gap-1.5">
              <ModelSelect />
              <JumpSelect />
              <Attach />
              {!isAgent && <PersonaSelect />}
              {!isAgent && <WebMenu />}
              {isAgent && <StashSaveButton />}
              {isAgent && <StashSelect textAreaRef={textAreaRef} />}
            </div>

            <SendButton
              visible={showSendButton}
              stopping={stopping}
              disabled={!isSending && !canSend}
              onClick={isSending ? () => abortStream() : handleSend}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
