import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export const SidebarHeader = () => {
  const { create } = useSessionStore();
  return (
    <div className="flex items-center justify-between px-3 py-3 border-b bg-card/50">
      <span className="text-sm font-semibold tracking-tight px-1">
        Sessions
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={() => create("New Session")}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
