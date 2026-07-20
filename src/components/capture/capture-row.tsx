import React, { useState } from "react";
import {
  Link,
  Copy,
  Star,
  Trash2,
  Check,
  Text,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { cn, formatDateAsAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCopy } from "@/hooks/use-copy";
import type { Capture } from "@/lib/store/capture/types";
import { useCaptureStore } from "@/lib/store/use-capture-store";

interface Props {
  capture: Capture;
}

const isValidUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const KindBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
}> = ({ icon, label }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
    {icon}
    {label}
  </span>
);

const LinkCaptureContent: React.FC<{
  capture: Capture & { kind: "link" };
}> = ({ capture }) => {
  const displayLabel = capture.title?.trim() ? capture.title : "Link";

  return (
    <div className="flex flex-col gap-1">
      <KindBadge icon={<Link className="size-3" />} label={displayLabel} />
      <span
        className="cursor-pointer truncate text-sm text-foreground/80 hover:underline"
        onClick={() => void openUrl(capture.content)}
      >
        {capture.content}
      </span>
    </div>
  );
};

const TextCaptureContent: React.FC<{
  capture: Capture & { kind: "text" };
}> = ({ capture }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = capture.content.length > 180;
  const displayLabel = capture.title?.trim() ? capture.title : "Text";

  return (
    <>
      <KindBadge icon={<Text className="size-3" />} label={displayLabel} />

      <p
        className={cn(
          "mt-1.5 whitespace-pre-wrap wrap-break-word text-sm text-foreground/80",
          !expanded && "line-clamp-3",
        )}
      >
        {capture.content}
      </p>

      {isLongText && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-[11px] font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
};

const CaptureActions: React.FC<{
  capture: Capture;
  onCopy: () => void;
  copied: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ capture, onCopy, copied, onEdit, onDelete }) => {
  const toggleStar = useCaptureStore((state) => state.toggleStar);

  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 focus-within:opacity-100">
      {capture.kind === "link" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => void openUrl(capture.content)}
              aria-label="Open link"
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open link</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => toggleStar(capture.id)}
            aria-label={capture.starred ? "Unstar" : "Star"}
          >
            <Star
              className={cn(
                "size-3.5",
                capture.starred && "fill-amber-400 text-amber-400",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{capture.starred ? "Unstar" : "Star"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onEdit}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onCopy}
            aria-label="Copy"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:text-destructive"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  );
};

const DeleteCaptureDialog: React.FC<{
  capture: Capture;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}> = ({ capture, open, onOpenChange, onConfirm }) => {
  const displayTitle = capture.title?.trim() ? capture.title : capture.content;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this capture?</AlertDialogTitle>
          <AlertDialogDescription>
            "{displayTitle}" will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditCaptureDialog: React.FC<{
  capture: Capture;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, content: string) => void;
}> = ({ capture, open, onOpenChange, onSave }) => {
  const [title, setTitle] = useState(capture.title ?? "");
  const [content, setContent] = useState(capture.content);
  const [touched, setTouched] = useState(false);

  const isLink = capture.kind === "link";
  const contentIsInvalid = isLink && touched && !isValidUrl(content);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(capture.title ?? "");
      setContent(capture.content);
      setTouched(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (isLink && !isValidUrl(content)) {
      setTouched(true);
      return;
    }

    onSave(title.trim(), content.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit capture</DialogTitle>
          <DialogDescription>
            Update the title and content of this capture.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capture-title">Title</Label>
            <Input
              id="capture-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isLink ? "Link" : "Text"}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="capture-content">Content</Label>
            {isLink ? (
              <>
                <Input
                  id="capture-content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (touched) setTouched(false);
                  }}
                  onBlur={() => setTouched(true)}
                  placeholder="https://example.com"
                  aria-invalid={contentIsInvalid}
                  className={cn(
                    contentIsInvalid &&
                      "border-destructive focus-visible:ring-destructive/40",
                  )}
                />
                {contentIsInvalid && (
                  <p className="text-xs text-destructive">
                    Enter a valid URL, e.g. https://example.com
                  </p>
                )}
              </>
            ) : (
              <Textarea
                id="capture-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CaptureRow: React.FC<Props> = ({ capture }) => {
  const remove = useCaptureStore((state) => state.remove);
  const update = useCaptureStore((state) => state.update);

  const { copied, copy } = useCopy({
    kind: "text",
    data: capture.content,
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  let content: React.ReactNode;

  if (capture.kind === "link") {
    content = (
      <LinkCaptureContent capture={capture as Capture & { kind: "link" }} />
    );
  } else {
    content = (
      <TextCaptureContent capture={capture as Capture & { kind: "text" }} />
    );
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card/50 px-3 py-2 backdrop-blur-xl",
        "transition-all duration-200 hover:border-primary/30 hover:shadow-sm",
        capture.starred && "border-l-amber-400/70 hover:border-l-amber-400",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {content}

          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/60">
            <span>{formatDateAsAgo(capture.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{capture.source}</span>
          </div>
        </div>

        <CaptureActions
          capture={capture}
          copied={copied}
          onCopy={() => void copy()}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

      <EditCaptureDialog
        capture={capture}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(title, newContent) => {
          update(capture.id, {
            title: title.length ? title : undefined,
            content: newContent,
          });
        }}
      />

      <DeleteCaptureDialog
        capture={capture}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          remove(capture.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
};
