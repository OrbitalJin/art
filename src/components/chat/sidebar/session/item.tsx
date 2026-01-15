import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Trash2,
  MoreVertical,
  Sparkle,
  Loader2,
  TextCursor,
  Pin,
  PinOff,
  Split,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { useGenerateTitle } from "@/hooks/use-generate-title";
import { useSessionStore } from "@/lib/store/use-session-store";
import { useStreamingState } from "@/hooks/use-streaming-state";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  id: string;
  title: string;
  active: boolean;
  forkOf?: string;
  pinned: boolean;
  onSwitch?: () => void;
}

export const SessionListItem: React.FC<Props> = ({
  id,
  title,
  active,
  pinned,
  onSwitch,
  forkOf,
}) => {
  const { isSessionStreaming } = useStreamingState();
  const { generating, generateTitle } = useGenerateTitle();
  const setActive = useSessionStore((s) => s.setActive);
  const updateTitle = useSessionStore((s) => s.updateTitle);

  const getFn = useSessionStore((state) => state.getFn);

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

  useEffect(() => {
    setText(title);
  }, [title]);

  return (
    <div
      tabIndex={0}
      className={cn(
        "group relative flex items-center w-full gap-2 rounded-md px-3 py-2",
        "text-sm select-none transition-all outline-none",
        "hover:bg-accent hover:text-accent-foreground cursor-pointer",
        active &&
          "bg-accent/80 font-medium text-accent-foreground ring-1 ring-inset ring-foreground/5",
      )}
      onClick={() => {
        if (!editing && !generating) {
          setActive(id);
          onSwitch?.();
        }
      }}
    >
      {forkOf && (
        <Tooltip>
          <TooltipTrigger>
            <Split className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          </TooltipTrigger>
          <TooltipContent>Forked from: {getFn(forkOf)?.title}</TooltipContent>
        </Tooltip>
      )}
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
            onBlur={cancel}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") cancel();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-none outline-none focus:ring-0 p-0"
          />
        ) : isSessionStreaming(id) ? (
          <ShimmerText>{title}</ShimmerText>
        ) : (
          <>
            <span className="wrap-break-word text-left text-foreground/80">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        {isSessionStreaming(id) ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        ) : (
          !editing &&
          !generating && (
            <Menu
              id={id}
              title={title}
              pinned={pinned}
              setText={setText}
              setEditing={setEditing}
              updateTitle={updateTitle}
              generateTitle={generateTitle}
            />
          )
        )}
      </div>
    </div>
  );
};

interface MenuProps {
  id: string;
  title: string;
  pinned: boolean;
  setText: (text: string) => void;
  setEditing: (value: boolean) => void;
  updateTitle: (id: string, title: string) => void;
  generateTitle: (id: string) => Promise<string | void>;
}

const Menu: React.FC<MenuProps> = ({
  id,
  pinned,
  setText,
  setEditing,
  updateTitle,
  generateTitle,
}) => {
  const togglePin = useSessionStore((s) => s.togglePin);
  const deleteFn = useSessionStore((s) => s.deleteFn);

  const handleDelete = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    deleteFn(id);
  };

  const handleGenerate = async () => {
    const title = await generateTitle(id);
    if (title) {
      setText(title);
      updateTitle(id, title);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <span>
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onSelect={handleGenerate}
          className="text-primary focus:text-primary focus:bg-primary/10"
        >
          <Sparkle className="h-4 w-4" />
          <span>Generate title</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => togglePin(id)}>
          {pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
          <span>{pinned ? "Unpin" : "Pin"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => setEditing(true)}>
          <TextCursor className="h-4 w-4" />
          <span>Rename</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
