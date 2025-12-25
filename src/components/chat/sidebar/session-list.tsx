import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessions } from "@/contexts/sessions-context";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  MessageCircleDashed,
  TextCursor,
  Trash2,
} from "lucide-react";

interface Props {
  onSelect?: () => void;
  disabled?: boolean;
}

export const SessionList: React.FC<Props> = ({ disabled, onSelect }) => {
  const { activeId, sessions, switchTo, deleteSession } = useSessions();

  const handleSwitch = (id: string) => {
    switchTo(id);
    onSelect?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Recent
        </span>

        <div className="flex flex-col gap-1">
          {sessions.map((session) => {
            const isActive = activeId === session.id;

            return (
              <div
                key={session.id}
                className={cn(
                  "flex flex-row items-center p-2 text-sm rounded-md",
                  "rounded-md hover:bg-primary/20 transition-colors",
                  "group relative justify-start gap-2 h-11 font-normal pr-9",
                  isActive && "bg-primary/10 font-medium text-foreground",
                  !isActive && "text-muted-foreground hover:text-foreground",
                  disabled && "pointer-events-none opacity-60",
                )}
                onClick={() => {
                  handleSwitch(session.id);
                }}
              >
                {isActive ? (
                  <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
                ) : (
                  <MessageCircleDashed className="h-4 w-4 shrink-0 opacity-70" />
                )}

                <span className="truncate">{session.title}</span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-8 opacity-0 transition-opacity",
                        "group-hover:opacity-100 hover:bg-accent",
                        "hover:text-accent-foreground rounded-md p-1",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      disabled={disabled}
                    >
                      <TextCursor className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rename Session</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-2 opacity-0 transition-opacity",
                        "group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md p-1",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Session</TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
