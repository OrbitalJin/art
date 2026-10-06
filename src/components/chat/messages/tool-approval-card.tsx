import { useState } from "react";
import {
  ShieldAlert,
  Check,
  X,
  ChevronRight,
  Loader2,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import type { ApprovalStatus } from "@/lib/store/use-approval-store";

export const ToolApprovalCard: React.FC<{
  toolCallId: string;
  toolName: string;
  input: unknown;
  status: ApprovalStatus;
}> = ({ toolCallId, toolName, input, status }) => {
  const resolve = useApprovalStore((state) => state.resolve);

  const isPending = status === "pending";
  const isApproved = status === "approved";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(isPending ? true : false);

  const handleApprove = () => {
    setIsSubmitting(true);
    resolve(toolCallId, true);
    setIsOpen(false);
  };
  const handleReject = () => {
    setIsSubmitting(true);
    resolve(toolCallId, false);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "mb-2 max-w-3xl overflow-hidden rounded-md border select-none",
        "transition-all duration-200",
        isPending
          ? "border-amber-500/40 bg-amber-500/5"
          : isApproved
            ? "border-emerald-500/30 bg-emerald-500/5"
            : "border-red-500/30 bg-red-500/5",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between",
          "px-3.5 py-2.5 transition-colors duration-150 hover:bg-muted/20",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md",
              isPending
                ? "text-amber-400"
                : isApproved
                  ? "text-emerald-400"
                  : "text-red-400",
            )}
          >
            {isPending ? (
              <ShieldAlert size={15} />
            ) : isApproved ? (
              <ShieldCheck size={15} />
            ) : (
              <ShieldX size={15} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isPending
                ? "Tool Approval Request"
                : isApproved
                  ? "Tool Call Approved"
                  : "Tool Call Rejected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSubmitting && isPending && (
            <Loader2
              size={13}
              className="animate-spin text-muted-foreground/60"
            />
          )}
          <ChevronRight
            size={14}
            className={cn(
              "text-muted-foreground/50 transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border/30 bg-black/20 px-3.5 py-3 space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground/50">
              Requested Tool
            </span>
            <span className="font-mono text-xs font-semibold text-foreground/80">
              {toolName}
            </span>
          </div>

          {input !== undefined && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground/50">
                Parameters
              </span>
              <pre
                className={cn(
                  "max-h-48 overflow-x-auto rounded-lg",
                  "bg-black/30 p-3 text-xs font-mono text-foreground/75 leading-relaxed",
                )}
              >
                {JSON.stringify(input, null, 2)}
              </pre>
            </div>
          )}

          {isPending && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleApprove}
                className={cn(
                  "h-7 gap-1.5",
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                  "hover:bg-emerald-500/20 hover:text-emerald-300 text-xs",
                )}
              >
                <Check size={12} />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleReject}
                className={cn(
                  "h-7 gap-1.5",
                  "border-red-500/40 bg-red-500/10 text-red-400",
                  "hover:bg-red-500/20 hover:text-red-300 text-xs",
                )}
              >
                <X size={12} />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
