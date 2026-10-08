// user-message.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Undo2,
  GitBranch,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
import { messageText } from "@/lib/store/session/types";
import { previewUrl } from "@/lib/utils/images";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";
import { useChatMessages } from "@/contexts/chat-context";
import { useChatStream } from "@/hooks/use-chat-stream";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MessageAttachment = NonNullable<Message["attachments"]>[number];

const formatBytes = (bytes?: number): string => {
  if (bytes === undefined) return "";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const formatAttachment = (attachment: MessageAttachment): string => {
  const type = attachment.mediaType?.split("/")[1]?.toUpperCase() ?? "";
  const size = formatBytes(attachment.size);
  return [type, size].filter(Boolean).join(" · ");
};

const Hint: React.FC<{ keys: string; label: string }> = ({ keys, label }) => (
  <span className="flex items-center gap-1.5">
    <kbd className="rounded border border-border/60 bg-muted/30 px-1 py-px font-mono text-[10px] text-muted-foreground/70">
      {keys}
    </kbd>
    <span>{label}</span>
  </span>
);

const SingleAttachment: React.FC<{ attachment: MessageAttachment }> = ({
  attachment,
}) => {
  const name = attachment.name ?? "image";
  const details = formatAttachment(attachment);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Attachment
          className="cursor-pointer rounded-lg text-left transition-colors hover:bg-muted/60"
          orientation="horizontal"
          size="sm"
        >
          <AttachmentMedia variant="image">
            <img
              className="scale-110 transition-transform duration-300 group-hover:scale-100"
              src={previewUrl(attachment)}
              alt={name}
            />
          </AttachmentMedia>
          <AttachmentContent className="min-w-0 text-left">
            <AttachmentTitle className="truncate text-left">
              {name}
            </AttachmentTitle>
            <AttachmentDescription className="text-left">
              {details}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </DialogTrigger>

      <DialogContent className="max-w-4xl overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="border-b px-6 py-4 pr-12 text-left">
          <DialogTitle className="truncate text-left">{name}</DialogTitle>
          <DialogDescription className="text-left">{details}</DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[75vh] min-h-48 items-center justify-center p-4">
          <img
            className="max-h-[70vh] max-w-full rounded-md object-contain"
            src={previewUrl(attachment)}
            alt={name}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttachmentChip: React.FC<{ attachment: MessageAttachment }> = ({
  attachment,
}) => {
  const name = attachment.name ?? "image";

  return (
    <Attachment className="rounded-lg" orientation="horizontal">
      <AttachmentMedia className="group" variant="image">
        <img
          className="scale-110 blur-[1px] transition-all group-hover:scale-100 group-hover:blur-none"
          src={previewUrl(attachment)}
          alt={name}
        />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>
          {formatAttachment(attachment)}
        </AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
};

const MessageAttachments: React.FC<{ attachments: MessageAttachment[] }> = ({
  attachments,
}) => {
  if (attachments.length === 0) return null;

  if (attachments.length === 1) {
    return <SingleAttachment attachment={attachments[0]} />;
  }

  return (
    <AttachmentGroup>
      {attachments.map((attachment, index) => (
        <AttachmentChip key={index} attachment={attachment} />
      ))}
    </AttachmentGroup>
  );
};

const EditBox: React.FC<{
  draft: string;
  enterKeySends: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}> = ({
  draft,
  enterKeySends,
  textAreaRef,
  onChange,
  onKeyDown,
  onCancel,
  onSave,
}) => {
  const containerClasses = cn(
    "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50",
    "shadow-sm transition-colors duration-200 hover:border-border",
    "focus-within:border-ring/40 focus-within:ring-4 focus-within:ring-ring/10",
  );

  const textareaClasses = cn(
    "max-h-[250px] min-h-[80px] resize-none border-0 bg-transparent! shadow-none lg:max-h-[400px]",
    "px-3.5 pt-3.5 pb-1 text-[15px] text-foreground/90",
    "placeholder:text-muted-foreground/50 focus-visible:ring-0",
  );

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    const end = event.currentTarget.value.length;
    event.currentTarget.setSelectionRange(end, end);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className={containerClasses}>
        <Textarea
          autoFocus
          ref={textAreaRef}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Edit message…"
          className={textareaClasses}
          onKeyDown={onKeyDown}
          onFocus={handleFocus}
        />

        <div className="flex items-center justify-between gap-3 px-3 pb-2.5">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
            <Hint keys="Esc" label="cancel" />
            <Hint
              keys={enterKeySends ? "Enter" : "Shift + Enter"}
              label="save"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCancel}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={!draft.trim()}
              className="h-7 text-xs"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserMessage: React.FC<Message> = (message) => {
  const content = messageText(message);
  const attachments = message.attachments ?? [];

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const { editMessage } = useChatMessages();
  const enterKeySends = useSettingsStore((state) => state.enterKeySends);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(content);
  const [prevText, setPrevText] = useState<string>(content);

  if (content !== prevText) {
    setPrevText(content);
    if (!isEditing) {
      setDraft(content);
    }
  }

  const handleCancelEdit = () => {
    setDraft(content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    const trimmed = draft.trim();

    if (!trimmed || trimmed === content) {
      setIsEditing(false);
      return;
    }

    editMessage(message.id, trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (
      event.key === "Enter" &&
      (enterKeySends ? !event.shiftKey : event.shiftKey)
    ) {
      event.preventDefault();
      handleSaveEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea && isEditing) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [draft, isEditing]);

  return (
    <div className="group flex w-full flex-col items-end gap-1.5 animate-in fade-in duration-100 select-auto">
      {isEditing ? (
        <EditBox
          draft={draft}
          enterKeySends={enterKeySends}
          textAreaRef={textAreaRef}
          onChange={setDraft}
          onKeyDown={handleKeyDown}
          onCancel={handleCancelEdit}
          onSave={handleSaveEdit}
        />
      ) : (
        <>
          {content && (
            <div className="max-w-[85%] min-w-0 rounded-2xl rounded-tr-sm bg-muted/50 px-3.5 py-2.5 text-foreground/90">
              <Renderer content={content} />
            </div>
          )}

          <MessageAttachments attachments={attachments} />
        </>
      )}

      <MessageFooter
        content={content}
        messageId={message.id}
        setDraft={setDraft}
        setIsEditing={setIsEditing}
      />
    </div>
  );
};

const FooterAction: React.FC<{
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, disabled, onClick, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className="size-7 text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground"
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

const RevertAction: React.FC<{
  disabled: boolean;
  onConfirm: () => void;
}> = ({ disabled, onConfirm }) => (
  <AlertDialog>
    <Tooltip>
      <TooltipTrigger asChild>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Revert to here"
            disabled={disabled}
            className="size-7 text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive"
          >
            <Undo2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Revert: remove this and everything after it
      </TooltipContent>
    </Tooltip>

    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Revert to here?</AlertDialogTitle>
        <AlertDialogDescription>
          This message and everything after it will be removed. This can't be
          undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Revert
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

interface FooterProps {
  messageId: string;
  content: string;
  setDraft: (draft: string) => void;
  setIsEditing: (editing: boolean) => void;
}

const MessageFooter: React.FC<FooterProps> = ({
  content,
  messageId,
  setDraft,
  setIsEditing,
}) => {
  const activeId = useSessionStore((state) => state.activeId);
  const branchFrom = useSessionStore((state) => state.branchFrom);
  const revertMessage = useSessionStore((state) => state.revertMessage);

  const { isSending: disabled } = useChatStream();
  const { editMessage } = useChatMessages();
  const { copied, copy } = useCopy(content);

  const handleRevert = () => {
    if (!activeId) return;

    const success = revertMessage(activeId, messageId);
    if (success) {
      toast.success("Message reverted successfully");
    }
  };

  const handleBranch = () => {
    if (!activeId || disabled) return;

    const success = branchFrom(activeId, messageId, false);
    if (success) {
      toast.info("Session branched successfully");
    } else {
      toast.error("Failed to branch: Session not found");
    }
  };

  const handleStartEdit = () => {
    if (disabled) return;
    setDraft(content);
    setIsEditing(true);
  };

  const handleRetry = useCallback(() => {
    editMessage(messageId, content);
  }, [content, editMessage, messageId]);

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 opacity-0 transition-opacity duration-150",
        "group-hover:opacity-100 focus-within:opacity-100",
      )}
    >
      <RevertAction disabled={disabled} onConfirm={handleRevert} />

      <FooterAction label="Retry" disabled={disabled} onClick={handleRetry}>
        <RefreshCcw className="size-3.5" />
      </FooterAction>

      <FooterAction
        label="Branch off"
        disabled={disabled}
        onClick={handleBranch}
      >
        <GitBranch className="size-3.5" />
      </FooterAction>

      <FooterAction label="Edit" disabled={disabled} onClick={handleStartEdit}>
        <Pencil className="size-3.5" />
      </FooterAction>

      <FooterAction label={copied ? "Copied" : "Copy"} onClick={copy}>
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </FooterAction>
    </div>
  );
};
