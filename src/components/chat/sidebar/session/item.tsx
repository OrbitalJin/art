import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  MessageCircleDashed,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSessions } from "@/contexts/sessions-context";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
  const { switchTo, deleteSession, updateTitle } = useSessions();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  const handleSubmit = () => {
    if (!text.trim()) {
      setText(title);
      setEditing(false);
      return;
    }

    updateTitle(id, text);
    setEditing(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild disabled={disabled || editing}>
        <div
          tabIndex={0}
          className={cn(
            "flex items-center gap-2 px-3 py-3 text-sm rounded-md select-none",
            "group relative transition-colors outline-none hover:bg-primary/15",
            active && "bg-primary/10 font-medium text-foreground",
            !active &&
              "text-muted-foreground hover:text-foreground hover:bg-primary/20",
            disabled && "pointer-events-none opacity-60",
          )}
          onClick={() => {
            if (!editing) {
              switchTo(id);
              onSwitch?.();
            }
          }}
          onKeyDown={(e) => {
            if (editing || disabled) return;

            if (e.key === "F2") {
              e.preventDefault();
              setEditing(true);
            }

            if ((e.key === "Delete" || e.key === "Backspace") && !active) {
              e.preventDefault();
              deleteSession(id);
            }
          }}
        >
          {active ? (
            <MessageCircle className="h-4 w-4 shrink-0 opacity-70" />
          ) : (
            <MessageCircleDashed className="h-4 w-4 shrink-0 opacity-70" />
          )}

          {editing ? (
            <input
              type="text"
              value={text}
              autoFocus
              onChange={(e) => setText(e.target.value)}
              onBlur={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
                if (e.key === "Escape") {
                  setText(title);
                  setEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-primary"
            />
          ) : (
            <span className="truncate flex-1">{title}</span>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            setEditing(true);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rename
          <span className="ml-auto text-xs opacity-60">F2</span>
        </ContextMenuItem>

        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => deleteSession(id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
          <span className="ml-auto text-xs opacity-60">Del</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
