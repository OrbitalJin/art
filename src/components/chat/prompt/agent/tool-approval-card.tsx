import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToolName } from "@/components/chat/messages/tool-call-card";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import type { ApprovalStatus } from "@/lib/store/use-approval-store";

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

const StatusDot: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const dotClasses = cn(
    "size-1.5 shrink-0 rounded-full",
    status === "pending" &&
      "animate-pulse bg-amber-500 motion-reduce:animate-none",
    status === "approved" && "bg-emerald-500/70",
    status === "rejected" && "bg-red-500/70",
  );

  return <span aria-hidden className={dotClasses} />;
};

const RequestBlock: React.FC<{ input: unknown }> = ({ input }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[11px] font-medium text-muted-foreground/60 select-none">
      Request
    </span>
    <pre className="max-h-48 overflow-auto rounded-md bg-muted/30 p-2.5 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap text-foreground/70">
      {formatInput(input)}
    </pre>
  </div>
);

const ApprovalActions: React.FC<{
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
}> = ({ disabled, onApprove, onReject }) => (
  <div className="flex items-center justify-end gap-1.5">
    <Button
      size="sm"
      variant="ghost"
      disabled={disabled}
      onClick={onReject}
      className="h-7 text-xs text-muted-foreground hover:text-destructive"
    >
      Reject
    </Button>
    <Button
      size="sm"
      disabled={disabled}
      onClick={onApprove}
      className="h-7 text-xs"
    >
      Approve
    </Button>
  </div>
);

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

  const containerClasses = cn(
    "overflow-hidden transition-colors duration-200",
    variant === "default" && [
      "mb-2 max-w-3xl rounded-lg border bg-muted/10",
      isPending ? "border-amber-500/30" : "border-border/40",
    ],
    variant === "embedded" && "w-full",
  );

  const headerClasses = cn(
    "flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-2 text-left",
    "outline-none transition-colors duration-150 select-none",
    "focus-visible:ring-2 focus-visible:ring-ring/50",
    variant === "default" && "rounded-md",
  );

  const bodyClasses = cn(
    "flex flex-col gap-3 border-t border-border/30 px-3 py-3",
    "animate-in fade-in duration-150 motion-reduce:animate-none",
  );

  return (
    <div className={containerClasses}>
      <div className="flex w-full items-center gap-2 px-3">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className={headerClasses}
        >
          <StatusDot status={status} />
          <span className="shrink-0 text-xs font-medium text-foreground/80">
            {statusLabel}
          </span>
          <span className="min-w-0 truncate text-xs text-muted-foreground/70">
            {title}
          </span>
        </button>

        {trailing ? (
          <div className="flex shrink-0 items-center gap-1">{trailing}</div>
        ) : null}
      </div>

      {isOpen && (
        <div className={bodyClasses}>
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
    </div>
  );
};
