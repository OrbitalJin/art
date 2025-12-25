import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, MessageCircleDashed, Trash2 } from "lucide-react";
import { useSessions } from "@/contexts/sessions-context";

interface Props {
  id: string;
  title: string;
  active: boolean;
  disabled?: boolean;
  onSwitch?: () => void;
}

export const SessionListItem: React.FC<Props> = ({
  id,
  title,
  active,
  disabled,
  onSwitch,
}) => {
  const { switchTo, deleteSession } = useSessions();
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-row items-center px-3 py-3 text-sm rounded-md select-none",
        "rounded-md hover:bg-primary/20 transition-colors",
        "group relative justify-start gap-2 font-normal",
        active && "bg-primary/10 font-medium text-foreground",
        !active && "text-muted-foreground hover:text-foreground",
        disabled && "pointer-events-none opacity-60",
      )}
      onClick={() => {
        if (!editing) {
          switchTo(id);
          onSwitch?.();
        }
      }}
      onDoubleClick={() => {
        if (!disabled) setEditing(true);
      }}
    >
      {active ? (
        <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
      ) : (
        <MessageCircleDashed className="h-4 w-4 shrink-0 opacity-70" />
      )}
      <span className="truncate flex-1">{title}</span>

      <button
        className="
              opacity-0 group-hover:opacity-60 hover:opacity-100
              transition-opacity ml-2
              text-muted-foreground hover:text-destructive
            "
        onClick={(e) => {
          e.stopPropagation();
          deleteSession(id);
        }}
        aria-label="Delete session"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
