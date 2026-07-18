import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCopy } from "@/hooks/use-copy";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  Undo2,
  GitBranch,
  Pencil,
  ArrowUp,
  RefreshCcw,
} from "lucide-react";
import { Renderer } from "./renderer";
import type { Message } from "@/lib/store/session/types";
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import { toast } from "sonner";
import { useChatMessages, useChatStream } from "@/contexts/chat-context";
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

function formatBytes(bytes?: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatAttachment(attachment: {
  name?: string;
  size?: number;
  mediaType?: string;
}): string {
  const mime = attachment.mediaType?.split("/")[1]?.toUpperCase() ?? "";
  const size = formatBytes(attachment.size);
  return [mime, size].filter(Boolean).join(" · ");
}

export const UserMessage: React.FC<Message> = (message) => {
  const { content } = message;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (enterKeySends ? !e.shiftKey : e.shiftKey)) {
      e.preventDefault();
      handleSaveEdit();
    }

    if (e.key === "Escape") {
      e.preventDefault();
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
    <div className="group flex w-full flex-col items-end gap-1 animate-in fade-in duration-100 select-auto">
      {isEditing ? (
        <div className="w-full max-w-2xl">
          <div
            className={cn(
              "relative flex flex-col gap-2 p-2 transition-all",
              "rounded-md border bg-card/50 shadow-md hover:border-primary/30",
              "focus-within:border-ring/30 focus-within:ring-4 focus-within:ring-ring/10",
            )}
          >
            <Textarea
              autoFocus
              ref={textAreaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Edit message..."
              className={cn(
                "bg-transparent! min-h-[80px] max-h-[250px] resize-none border-0 p-2 shadow-none",
                "text-foreground/80 placeholder:text-muted-foreground focus-visible:ring-0",
                "lg:max-h-[400px]",
              )}
              onKeyDown={handleKeyDown}
              onFocus={(e) => {
                const val = e.target.value;
                e.target.value = "";
                e.target.value = val;
              }}
            />

            <div className="flex items-center justify-between px-1">
              <div className="text-xs text-muted-foreground">
                <a>Esc </a>to cancel ·{" "}
                <a>{enterKeySends ? "Enter" : "Shift + Enter"}</a> to save
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSaveEdit}
                  disabled={!draft.trim()}
                  className={cn(
                    "transition-all duration-300",
                    draft.trim()
                      ? "scale-105 opacity-100"
                      : "pointer-events-none scale-100 opacity-0",
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {content && (
            <div className="relative rounded-md rounded-tr-none border bg-muted/40 p-3 text-foreground/80 shadow-sm">
              <Renderer content={content} />
            </div>
          )}

          {message.attachments?.length === 0 ? null : message.attachments
              ?.length === 1 ? (
            <Dialog>
              <DialogTrigger>
                <Attachment className="rounded-md" orientation="vertical">
                  <AttachmentMedia className="group" variant="image">
                    <img
                      className="scale-110 group-hover:scale-100 transition-all"
                      src={previewUrl(message.attachments[0])}
                    />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>
                      {message.attachments[0].name ?? "image"}
                    </AttachmentTitle>
                    <AttachmentDescription>
                      {formatAttachment(message.attachments[0])}
                    </AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {message.attachments[0].name ?? "image"}
                  </DialogTitle>
                  <DialogDescription>
                    {formatAttachment(message.attachments[0])}
                  </DialogDescription>
                </DialogHeader>
                <img
                  className="self-center mx-auto"
                  src={previewUrl(message.attachments[0])}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <AttachmentGroup>
              {message.attachments?.map((attachment) => (
                <Attachment
                  className="self-end rounded-md"
                  orientation="horizontal"
                >
                  <AttachmentMedia className="group" variant="image">
                    <img
                      className="blur-[1px] group-hover:blur-none scale-110 group-hover:scale-100 transition-all"
                      src={previewUrl(attachment)}
                    />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>
                      {attachment.name ?? "image"}
                    </AttachmentTitle>
                    <AttachmentDescription>
                      {formatAttachment(attachment)}
                    </AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
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

  const handleBranch = () => {
    if (activeId && !disabled) {
      const success = branchFrom(activeId, messageId, false);
      if (success) {
        toast.info("Session branched successfully");
      } else {
        toast.error("Failed to branch: Session not found");
      }
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
    <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <AlertDialog>
        <HoverCard openDelay={300} closeDelay={150}>
          <HoverCardTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled}
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
          </HoverCardTrigger>
          <HoverCardContent
            align="center"
            side="bottom"
            className="w-64 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
          >
            <div className="flex items-center justify-between border-b bg-muted/30 p-2 px-3">
              <p className="text-sm font-medium">Revert</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-muted-foreground/80">
                Remove this and all subsequent messages to restore a previous
                state.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                const success = revertMessage(activeId!, messageId);
                if (success) {
                  toast.success("Message reverted successfully");
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-muted"
            onClick={handleRetry}
            disabled={disabled}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          align="center"
          side="bottom"
          className="w-60 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
        >
          <div className="border-b bg-muted/30 p-2 px-3">
            <p className="text-sm font-medium">Retry</p>
          </div>
          <div className="p-3">
            <p className="text-[11px] text-muted-foreground/80">
              Revert to this point and resend.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-muted"
            onClick={handleBranch}
            disabled={disabled}
          >
            <GitBranch className="h-3.5 w-3.5" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          align="center"
          side="bottom"
          className="w-72 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
        >
          <div className="flex items-center justify-between border-b bg-muted/30 p-3">
            <p className="text-sm font-medium">Branch Off</p>
            <span className="rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              New Branch
            </span>
          </div>
          <div className="p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              Create a duplicate of this conversation from the current point.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard openDelay={300} closeDelay={150}>
        <HoverCardTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:bg-muted"
            onClick={handleStartEdit}
            disabled={disabled}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          align="center"
          side="bottom"
          className="w-56 overflow-hidden border-muted-foreground/20 p-0 shadow-xl"
        >
          <div className="border-b bg-muted/30 p-2 px-3">
            <p className="text-sm font-medium">Edit message</p>
          </div>
          <div className="p-3">
            <p className="text-[11px] text-muted-foreground/80">
              Update this message inline.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      <Button
        size="icon"
        variant="ghost"
        onClick={copy}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
};
