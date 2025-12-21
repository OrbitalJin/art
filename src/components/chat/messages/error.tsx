import { AlertCircle } from "lucide-react";
import type { Message } from "@/lib/llm/common/memory/types";

export const ErrorMessage: React.FC<Message> = ({ error }) => {
  return (
    <div className="flex w-full py-4">
      <div
        className="
        flex items-center gap-2 rounded-md w-full
        border border-destructive/20 bg-destructive/10 
        px-4 py-2 text-sm text-destructive"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Error: {error?.type}</span>
      </div>
    </div>
  );
};
