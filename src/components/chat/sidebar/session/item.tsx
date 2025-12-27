import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  MoreVertical,
  Sparkles,
  Loader2,
  TextCursor,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useGenerateTitle } from "@/hooks/use-generate-title";
import { useSessionStore } from "@/lib/ai/store/use-session-store";
import { toast } from "sonner";

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
  const { generating, generateTitle } = useGenerateTitle();
  const { setActive, deleteSession, updateTitle } = useSessionStore();

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  // Sync text state when title prop changes (e.g., when session is renamed externally)
  useEffect(() => {
    setText(title);
  }, [title]);

  const handleDelete = () => {
    deleteSession(id);
    toast.success("Session deleted successfully");
  };

  const handleGenerate = async () => {
    const title = await generateTitle(id);
    if (title) {
      setText(title);
      updateTitle(id, title);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      setText(title);
      setEditing(false);
      return;
    }
    updateTitle(id, text.trim());
    setEditing(false);
  };

  return (
    <div
      tabIndex={0}
      className={cn(
        "group relative flex items-center h-[45px] w-full gap-2 rounded-md px-3 ",
        "text-sm select-none transition-all outline-none",
        "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        active &&
          "bg-accent/80 font-medium text-accent-foreground ring-1 ring-inset ring-foreground/5",
        disabled && "pointer-events-none opacity-60",
      )}
      onClick={() => {
        if (!editing && !generating) {
          setActive(id);
          onSwitch?.();
        }
      }}
      onKeyDown={(e) => {
        if (editing || disabled || generating) return;
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
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <ShimmerText className="truncate">Generating title...</ShimmerText>
          </>
        ) : editing ? (
          <input
            type="text"
            value={text}
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") {
                setText(title);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0"
          />
        ) : (
          <span className="truncate block w-[220px] text-left">{title}</span>
        )}
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        {!editing && !generating && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onSelect={handleGenerate}
                className="text-primary focus:text-primary focus:bg-primary/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Auto-generate title</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={() => setEditing(true)}>
                <TextCursor className="mr-2 h-4 w-4" />
                <span>Rename</span>
                <DropdownMenuShortcut>F2</DropdownMenuShortcut>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onSelect={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
                <DropdownMenuShortcut>Del</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
