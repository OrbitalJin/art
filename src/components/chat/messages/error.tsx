import { AlertCircle } from "lucide-react";
import type { Message } from "@/lib/store/session/types";
import { formatDate, formatMessageTime } from "@/lib/utils";

export const ErrorMessage: React.FC<Message> = ({ createdAt }) => {
  return (
    <div className="group flex w-full flex-col gap-2 py-4">
      <div
        className="
        flex items-center gap-2 rounded-md w-full
        border border-destructive/20 bg-destructive/10 
        p-4 text-sm text-destructive select-auto"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Error occured during request</span>
      </div>

      {createdAt !== undefined && (
        <div
          className="
          flex justify-end opacity-0 transition-opacity duration-150
          group-hover:opacity-100 focus-within:opacity-100"
        >
          <time
            dateTime={new Date(createdAt).toISOString()}
            title={formatDate(createdAt)}
            className="text-xs tabular-nums text-muted-foreground/60 select-none"
          >
            {formatMessageTime(createdAt)}
          </time>
        </div>
      )}
    </div>
  );
};
