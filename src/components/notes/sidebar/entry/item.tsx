import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  ArrowRightLeft,
  MoreVertical,
  TextCursor,
  Trash2,
  Sparkle,
  Loader2,
  PinOff,
  Pin,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useNoteStore } from "@/lib/store/use-note-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TagList } from "@/components/notes/sidebar/entry/tag/list";
import { WORKSPACES } from "@/lib/store/notes/types";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useGenerateNoteTitle } from "@/hooks/use-generate-note-title";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  pinned?: boolean;
  active: boolean;
  createdAt: number;
  tags: string[];
  onSwitch?: () => void;
}

export const EntryListItem: React.FC<Props> = ({
  id,
  title,
  active,
  pinned,
  createdAt,
  tags,
}) => {
  const updateTitle = useNoteStore((state) => state.updateTitle);
  const setActive = useNoteStore((state) => state.setActive);
  const { generating, generateTitle } = useGenerateNoteTitle();

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

  return (
    <div
      className={cn(
        "flex flex-row p-2 group items-center justify-between opacity-80",
        "transition-colors hover:bg-accent rounded-md",
        editing && "text-accent-foreground",
        active &&
          "bg-accent/80 font-medium ring-1 ring-inset ring-foreground/5",
      )}
      onClick={() => {
        if (!editing && !generating) {
          setActive(id);
        }
      }}
    >
      <div className="flex-1 flex flex-col gap-2">
        {generating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
            <ShimmerText className="text-sm truncate">
              Generating title...
            </ShimmerText>
          </div>
        ) : editing ? (
          <input
            autoFocus
            value={text}
            onBlur={cancel}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") cancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-sm"
          />
        ) : (
          <p className="text-sm">{title}</p>
        )}
        <p className="text-xs text-foreground/70">{formatDate(createdAt)}</p>
        {tags.length > 0 && <TagList active={active} tags={tags} />}
      </div>

      {!editing && !generating && (
        <EntryMenu
          id={id}
          pinned={!!pinned}
          setEditing={setEditing}
          setText={setText}
          updateTitle={updateTitle}
          generateTitle={generateTitle}
        />
      )}
    </div>
  );
};

interface EntryMenuProps {
  id: string;
  pinned: boolean;
  setEditing: (val: boolean) => void;
  setText: (text: string) => void;
  updateTitle: (id: string, title: string) => void;
  generateTitle: (id: string) => Promise<string | void>;
}

const EntryMenu: React.FC<EntryMenuProps> = ({
  id,
  pinned,
  setEditing,
  setText,
  updateTitle,
  generateTitle,
}) => {
  const changeWorkspace = useNoteStore((state) => state.changeWorkspace);
  const deleteFn = useNoteStore((state) => state.deleteFn);
  const togglePin = useNoteStore((state) => state.togglePin);
  const setActive = useNoteStore((state) => state.setActive);

  return (
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
          className="text-primary focus:text-primary focus:bg-primary/10"
          onSelect={async (e) => {
            e.preventDefault();
            const newTitle = await generateTitle(id);
            if (newTitle) {
              setText(newTitle);
              updateTitle(id, newTitle);
            }
          }}
        >
          <Sparkle className="h-4 w-4" />
          <span>Generate title</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ArrowRightLeft className="h-4 w-4" />
            <span>Move to</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {WORKSPACES.map((workspace) => (
                <DropdownMenuItem
                  key={workspace}
                  onSelect={() => changeWorkspace(id, workspace)}
                >
                  {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuItem onSelect={() => togglePin(id)}>
          {pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
          <span>{pinned ? "Unpin" : "Pin"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setActive(id);
            setEditing(true);
          }}
        >
          <TextCursor className="h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onSelect={() => deleteFn(id)}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
