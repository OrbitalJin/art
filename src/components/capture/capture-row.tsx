import React, { useState } from "react";
import {
  Link,
  Copy,
  Star,
  Trash2,
  Check,
  Image as ImageIcon,
  Text,
  ExternalLink,
} from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { cn, formatDateAsAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useCopy } from "@/hooks/use-copy";
import type { Capture } from "@/lib/store/capture/types";
import { useCaptureStore } from "@/lib/store/use-capture-store";

interface Props {
  capture: Capture;
}

const KindBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
}> = ({ icon, label }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
    {icon}
    {label}
  </span>
);

const ImageCaptureContent: React.FC<{
  capture: Capture & { kind: "image" };
}> = ({ capture }) => (
  <>
    <KindBadge icon={<ImageIcon className="size-3" />} label="Image" />
    <img
      src={capture.content}
      alt={capture.title}
      className="mt-2 max-h-64 w-auto rounded-md border border-border/40 object-contain"
    />
  </>
);

const LinkCaptureContent: React.FC<{
  capture: Capture & { kind: "link" };
}> = ({ capture }) => (
  <div className="flex flex-col gap-1.5">
    <KindBadge icon={<Link className="size-3" />} label="Link" />
    <span
      className="truncate text-sm text-foreground/80 hover:underline cursor-pointer"
      onClick={() => void openUrl(capture.content)}
    >
      {capture.content}
    </span>
  </div>
);

const TextCaptureContent: React.FC<{
  capture: Capture & { kind: "text" };
}> = ({ capture }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = capture.content.length > 220;

  return (
    <>
      <KindBadge icon={<Text className="size-3" />} label="Text" />
      <p
        className={cn(
          "mt-2 text-sm text-foreground/80 whitespace-pre-wrap wrap-break-word",
          !expanded && "line-clamp-4",
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
  onDelete: () => void;
}> = ({ capture, onCopy, copied, onDelete }) => {
  const toggleStar = useCaptureStore((state) => state.toggleStar);

  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
      {capture.kind === "link" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => void openUrl(capture.content)}
            >
              <ExternalLink className="size-4" />
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
                "size-4",
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
            onClick={onCopy}
            aria-label="Copy"
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
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
            <Trash2 className="size-4" />
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
}> = ({ capture, open, onOpenChange, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this capture?</AlertDialogTitle>
        <AlertDialogDescription>
          "{capture.title}" will be permanently deleted. This cannot be undone.
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

export const CaptureRow: React.FC<Props> = ({ capture }) => {
  const remove = useCaptureStore((state) => state.remove);
  const { copied, copy } = useCopy(
    capture.kind === "image" ? capture.title : capture.content,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);

  let content: React.ReactNode;
  if (capture.kind === "image") {
    content = (
      <ImageCaptureContent capture={capture as Capture & { kind: "image" }} />
    );
  } else if (capture.kind === "link") {
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
        "group relative rounded-lg border bg-card/50 backdrop-blur-xl",
        "px-3 py-2.5 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm",
        capture.starred && "border-l-amber-400/70 hover:border-l-amber-400",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {content}

          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground/60">
            <span>{formatDateAsAgo(capture.createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{capture.source}</span>
          </div>
        </div>

        <CaptureActions
          capture={capture}
          copied={copied}
          onCopy={() => void copy()}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

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
