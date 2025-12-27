import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useUsage } from "@/hooks/use-usage";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { Plus } from "lucide-react";

interface Props {
  disabled?: boolean;
}

export const SidebarFooter: React.FC<Props> = () => {
  const { createSession } = useSessionStore();
  const { isSending } = useChat();
  const { usage } = useUsage();

  return (
    <div className="border-t bg-card/50">
      <UsageIndicator usage={usage} />
      <div className="p-3 pt-0">
        <Button
          variant="outline"
          className="w-full gap-2 justify-start pl-3"
          disabled={isSending}
          onClick={() => createSession()}
        >
          <Plus className="h-4 w-4" />
          New session
        </Button>
      </div>
    </div>
  );
};

const UsageIndicator = ({ usage }: { usage?: string }) => {
  if (!usage) return null;

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Memory</span>
        <span className="font-medium text-foreground">{usage}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full bg-primary/80 transition-all duration-500 ease-out"
          style={{ width: usage }}
        />
      </div>
    </div>
  );
};
