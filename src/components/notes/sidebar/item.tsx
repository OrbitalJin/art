import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, TextCursor, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useNoteStore } from "@/lib/store/use-note-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TagList } from "./tag-list";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  active: boolean;
  updatedAt: number;
  tags: string[];
  onSwitch?: () => void;
}

export const Item: React.FC<Props> = ({ id, title, active, updatedAt, tags }) => {
  const setActive = useNoteStore((state) => state.setActive);
  const deleteFn = useNoteStore((state) => state.deleteFn);
  const updateTitle = useNoteStore((state) => state.updateTitle);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(title);

  const cancel = () => {
    setText(title);
    setEditing(false);
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

  const handleEdit = () => {
    setActive(id);
    setEditing(true);
  };

  return (
    <div
      onClick={() => {
        setActive(id);
      }}
      className={cn(
        "flex flex-row p-2 gap-2 group items-center justify-between opacity-80",
        "transition-colors hover:bg-accent hover:border-l hover:border-primary rounded-md",
        active && "bg-accent border-l border-primary opacity-100",
      )}
    >
      <div className="flex-1 flex flex-col gap-1">
        {editing ? (
          <input
            autoFocus
            value={text}
            onBlur={cancel}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") {
                cancel();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-sm"
          />
        ) : (
          <p className="text-sm">{title}</p>
        )}
        <p className="text-xs text-foreground/70">{formatDate(updatedAt)}</p>
        {tags.length > 0 && (
          <TagList tags={tags} />
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="
            h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 
            data-[state=open]:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={handleEdit}>
            <TextCursor className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onSelect={(e) => {
              deleteFn(id);
              e.preventDefault();
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
