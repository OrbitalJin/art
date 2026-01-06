import { AlertCircle } from "lucide-react";
import type { Message } from "@/lib/store/session/types";

export const ErrorMessage: React.FC<Message> = ({ errMsg }) => {
  return (
    <div className="flex w-full py-4">
      <div
        className="
        flex items-center gap-2 rounded-md w-full
        border border-destructive/20 bg-destructive/10 
        p-4 text-sm text-destructive select-auto"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Error: {errMsg}</span>
      </div>
    </div>
  );
};
