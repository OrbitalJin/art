import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FsRoot } from "@/lib/fs";
import { SubPageHeader } from "./category-page";

const FolderItem: React.FC<{
  folder: FsRoot;
  onRemove: (folderId: string) => void;
}> = ({ folder, onRemove }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border border-foreground/15 bg-muted/50 px-2.5 py-2">
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[13px] font-medium text-foreground">
        {folder.name}
      </span>
      <span
        title={folder.path}
        className="truncate text-[11px] leading-snug text-muted-foreground"
      >
        {folder.path}
      </span>
    </div>
    <button
      type="button"
      onClick={() => onRemove(folder.id)}
      aria-label={`Remove ${folder.name}`}
      className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
    >
      <X size={14} aria-hidden />
    </button>
  </div>
);

export const FilesPage: React.FC<{
  folders: FsRoot[];
  onBack: () => void;
  onAdd: () => void;
  onRemove: (folderId: string) => void;
}> = ({ folders, onBack, onAdd, onRemove }) => (
  <>
    <SubPageHeader title="Files" onBack={onBack} />

    <div className="flex flex-col gap-1 p-1.5">
      {folders.length === 0 ? (
        <p className="px-2.5 py-3 text-xs leading-snug text-muted-foreground">
          No folders connected. Connect a folder to let the agent read and write
          files in it.
        </p>
      ) : (
        folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} onRemove={onRemove} />
        ))
      )}
    </div>

    <div className="border-t border-border/50 p-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-full justify-start gap-1.5 text-xs text-muted-foreground shadow-none hover:text-foreground"
        onClick={onAdd}
      >
        <Plus size={13} aria-hidden />
        {folders.length === 0 ? "Connect folder" : "Add folder"}
      </Button>
    </div>
  </>
);
