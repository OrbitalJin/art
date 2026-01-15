import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/store/use-session-store";
import { Split } from "lucide-react";

export const ForkSession = () => {
  const activeId = useSessionStore((state) => state.activeId);
  const fork = useSessionStore((state) => state.fork);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => activeId && fork(activeId)}
        >
          <Split className="text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Fork Session</TooltipContent>
    </Tooltip>
  );
};
