import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToolName } from "@/components/chat/messages/tools/shared";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import type { ApprovalStatus } from "@/lib/store/use-approval-store";
import { PromptCard, PromptStatus, type PromptTone } from "./prompt-card";

interface Props {
  toolCallId: string;
  toolName: string;
  input: unknown;
  status: ApprovalStatus;
  variant?: "default" | "embedded";
  trailing?: React.ReactNode;
}

const formatInput = (input: unknown): string => {
  try {
    return JSON.stringify(input, null, 2) ?? String(input);
  } catch {
    return String(input);
  }
};

const toneOf = (status: ApprovalStatus): PromptTone => {
  if (status === "pending") return "pending";
  if (status === "approved") return "positive";
  return "negative";
};

const RequestBlock: React.FC<{ input: unknown }> = ({ input }) => {
  const labelClassName = cn(
    "select-none text-[10px] font-medium uppercase tracking-wider",
    "text-muted-foreground/60",
  );

  const preClassName = cn(
    "max-h-48 overflow-auto rounded-lg border border-border/40 bg-background/40 p-3",
    "font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap",
    "text-foreground/70",
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className={labelClassName}>Request</span>
      <pre className={preClassName}>{formatInput(input)}</pre>
    </div>
  );
};

const ApprovalActions: React.FC<{
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}> = ({ disabled, onApprove, onReject }) => {
  const rejectClassName = cn(
    "h-7 rounded-full px-3 text-xs text-muted-foreground",
    "hover:bg-destructive/10 hover:text-destructive",
  );

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled}
        onClick={onReject}
        className={rejectClassName}
      >
        Reject
      </Button>
      <Button
        size="sm"
        disabled={disabled}
        onClick={onApprove}
        className="h-7 rounded-full px-3 text-xs"
      >
        Approve
      </Button>
    </div>
  );
};

export const ToolApprovalCard: React.FC<Props> = ({
  toolCallId,
  toolName,
  input,
  status,
  variant = "default",
  trailing,
}) => {
  const resolve = useApprovalStore((state) => state.resolve);

  const isPending = status === "pending";
  const isApproved = status === "approved";

  const [prevToolCallId, setPrevToolCallId] = useState(toolCallId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(isPending);

  if (prevToolCallId !== toolCallId) {
    setPrevToolCallId(toolCallId);
    setIsSubmitting(false);
    setIsOpen(status === "pending");
  }

  const statusLabel = isPending
    ? "Needs your approval"
    : isApproved
      ? "Approved"
      : "Rejected";

  const title = formatToolName(toolName);
  const hasInput = input !== undefined;

  const handleResolve = (approved: boolean) => {
    setIsSubmitting(true);
    resolve(toolCallId, approved);
    setIsOpen(false);
  };

  const headerClassName = cn(
    "group/header flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-2 text-left",
    "outline-none transition-colors duration-150 select-none",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    variant === "default" && "rounded-md",
  );

  const titleClassName = cn(
    "min-w-0 truncate text-xs text-muted-foreground/70",
    "transition-colors duration-150 group-hover/header:text-foreground",
  );

  const chevronClassName = cn(
    "ml-auto size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",
    isOpen && "rotate-180",
  );

  const bodyClassName = cn(
    "flex flex-col gap-3 border-t border-border/40 px-3 py-3",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
  );

  return (
    <PromptCard variant={variant} pending={isPending}>
      <div className="flex w-full items-center gap-2 px-3">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className={headerClassName}
        >
          <PromptStatus tone={toneOf(status)} label={statusLabel} />
          <span className={titleClassName}>{title}</span>
          <ChevronDown strokeWidth={2.25} className={chevronClassName} />
        </button>

        {trailing ? (
          <div className="flex shrink-0 items-center gap-1">{trailing}</div>
        ) : null}
      </div>

      {isOpen && (
        <div className={bodyClassName}>
          {hasInput && <RequestBlock input={input} />}

          {isPending && (
            <ApprovalActions
              disabled={isSubmitting}
              onApprove={() => handleResolve(true)}
              onReject={() => handleResolve(false)}
            />
          )}
        </div>
      )}
    </PromptCard>
  );
};
