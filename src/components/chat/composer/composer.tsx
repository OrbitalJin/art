import { useState } from "react";
import {
  ArrowUp,
  File as FileIcon,
  FileText,
  RefreshCw,
  Square,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useHasKey,
  useKeysLoading,
  useSettingsStore,
} from "@/lib/store/use-settings-store";
import { useChatInput } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import { PersonaSelect } from "./persona-select";
import { WebMenu } from "./web-menu";
import { ModelSelect } from "@/components/chat/composer/model-select";
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
import { StashSaveButton } from "./stash/stash-save-button";
import { StashDialogs } from "./stash/stash-dialogs";
import { AgentBar } from "./agent/bar";
import { AgentAttention } from "./agent/attention";
import { KeyNotice } from "./key-notice";
import { useKeyNotice } from "./use-key-notice";
import { filesFromDataTransfer, useUpload } from "@/hooks/use-upload";
import { resolveAttachmentUrl } from "@/lib/upload/pocketbase";
import type { ChatAttachment } from "@/lib/store/session/types";
import { ComposerEditor, type ComposerHandle } from "./editor";

interface Props {
  composerRef: React.RefObject<ComposerHandle | null>;
  className?: string;
}

const AttachmentTypeIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
  if (isPdfMedia(mimeType)) return <FileText className="size-3.5" />;
  return <FileIcon className="size-3.5" />;
};

const ComposerAttachmentItem: React.FC<{
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

const ComposerAttachments: React.FC<{
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}> = ({ attachments, onRemove, onRetry }) => (
  <AttachmentGroup className="gap-1 px-3 pt-3">
    {attachments.map((attachment) => (
      <ComposerAttachmentItem
        key={attachment.id}
        attachment={attachment}
        onRemove={() => onRemove(attachment.id)}
        onRetry={() => onRetry(attachment.id)}
      />
    ))}
  </AttachmentGroup>
);

const HintKey: React.FC<{ keys: string; label: string }> = ({
  keys,
  label,
}) => {
  const keysClassName = cn(
    "rounded-md border border-border/50 bg-background/40 px-1.5 py-0.5",
    "text-[10px] font-medium text-muted-foreground/60",
  );

  return (
    <span className="flex items-center gap-1.5">
      <kbd className={keysClassName}>{keys}</kbd>
      <span>{label}</span>
    </span>
  );
};

const EmptyHint: React.FC = () => {
  const hintClassName = cn(
    "pointer-events-none absolute right-4 top-4 hidden items-center gap-3",
    "text-[10px] text-muted-foreground/50 sm:flex",
  );

  return (
    <div aria-hidden className={hintClassName}>
      <HintKey keys="@" label="stash" />
      <HintKey keys="#" label="journal" />
    </div>
  );
};

interface SendButtonProps {
  stopping: boolean;
  disabled: boolean;
  reason: string | null;
  onClick: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({
  stopping,
  disabled,
  reason,
  onClick,
}) => {
  const buttonClassName = cn(
    "size-8 transition-opacity duration-200",
    disabled && "opacity-40",
  );

  const button = (
    <Button
      type="button"
      size="icon"
      aria-label={stopping ? "Stop generating" : "Send message"}
      className={buttonClassName}
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

  if (!reason) return button;

  // A disabled button swallows pointer events, so the tooltip hangs off a wrapper.
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{reason}</TooltipContent>
    </Tooltip>
  );
};

export const Composer: React.FC<Props> = ({ composerRef, className }) => {
  const { prompt, setPrompt, attachments, sendMessage } = useChatInput();
  const { ingest, remove, retry, ingestClipboardImage } = useUpload();
  const { abortStream, isSending } = useChatStream();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);
  const hasKey = useHasKey("gateway");
  const hasUploadKey = useHasKey("uploads");
  const keysLoading = useKeysLoading();
  const keyNotice = useKeyNotice();
  const session = useSessionIndex((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );

  const [dragging, setDragging] = useState(false);

  const isAgent = session?.type === "agent";
  const hasAttachments = attachments.length > 0;
  const hasText = Boolean(prompt.trim());
  const uploading = attachments.some((a) => a.status === "uploading");
  const failed = attachments.some((a) => a.status === "error");
  const attachmentsPending = uploading || failed;
  const canSend = hasKey && !attachmentsPending && (hasText || hasAttachments);
  const canAcceptFiles = hasUploadKey && !isSending;
  const showHint = prompt.length === 0;

  const sendBlockReason = !hasKey
    ? "Add your API key to send"
    : uploading
      ? "Waiting for uploads to finish"
      : failed
        ? "Remove or retry the failed upload"
        : null;

  const placeholder = isAgent ? "Give your agent a task…" : "Ask anything…";

  const editorLabel = isAgent ? "Agent task" : "Message";

  const handleSend = () => {
    if (!canSend || isSending) return;
    sendMessage(prompt, attachments);
  };

  const handlePaste = (event: ClipboardEvent): boolean => {
    if (isSending) return false;

    const data = event.clipboardData;
    if (!data) return false;

    const files = filesFromDataTransfer(data);
    if (files.length) {
      if (!hasUploadKey) return false;
      event.preventDefault();
      ingest(files);
      return true;
    }

    const types = Array.from(data.types);
    if (types.includes("text/plain") || types.includes("text/html"))
      return false;
    if (!hasUploadKey) return false;

    void ingestClipboardImage();
    return true;
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!canAcceptFiles) return;
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    setDragging(false);
    if (!canAcceptFiles) return;

    const files = filesFromDataTransfer(event.dataTransfer);
    if (!files.length) return;

    event.preventDefault();
    ingest(files);
  };

  const handleSendClick = isSending ? () => abortStream() : handleSend;

  const containerClasses = cn(
    "relative flex flex-col overflow-hidden rounded-xl border border-border/60",
    "bg-card/70 backdrop-blur-xl backdrop-saturate-150",
    "shadow-lg shadow-black/5 transition-colors duration-200",
    "hover:border-border",
    "focus-within:border-ring/40 focus-within:ring-4 focus-within:ring-ring/10",
    dragging && "border-ring/60 bg-accent/30 ring-4 ring-ring/15",
    !hasKey && "opacity-60",
  );

  return (
    <footer className={cn("pb-2", className)}>
      <div className="mx-auto flex max-w-3xl flex-col">
        <AgentAttention />

        {(!hasKey || !hasUploadKey) && !keysLoading && (
          <KeyNotice className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs">
            {keyNotice} to start chatting and attach files.
          </KeyNotice>
        )}

        {session?.legacyMedia && (
          <div className="mb-2 rounded-lg border border-border/60 bg-muted px-3 py-2 text-[11px] leading-snug text-muted-foreground">
            This session predates the attachment system — some media may be
            missing or broken.
          </div>
        )}

        <div
          className={containerClasses}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isAgent && <AgentBar />}

          {hasAttachments && (
            <ComposerAttachments
              attachments={attachments}
              onRemove={remove}
              onRetry={retry}
            />
          )}

          <div className="relative">
            <ComposerEditor
              key={session?.id ?? "composer"}
              ref={composerRef}
              value={prompt}
              onChange={setPrompt}
              placeholder={placeholder}
              ariaLabel={editorLabel}
              editable={hasKey}
              autoFocus
              onSend={handleSend}
              enterKeySends={enterKeySends}
              onPaste={handlePaste}
            />
            {showHint && <EmptyHint />}
          </div>

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex flex-row items-center gap-1.5">
              <Attach />
              {!isAgent && <PersonaSelect />}
              {!isAgent && <WebMenu />}
              {hasText && <StashSaveButton />}
              <JumpSelect />
            </div>

            <div className="flex flex-row items-center gap-1.5">
              <ModelSelect />
              <SendButton
                stopping={isSending}
                disabled={!isSending && !canSend}
                reason={isSending ? null : sendBlockReason}
                onClick={handleSendClick}
              />
            </div>
          </div>
        </div>

        <StashDialogs composerRef={composerRef} />
      </div>
    </footer>
  );
};
