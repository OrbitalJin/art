import type { FC } from "react";
import { FolderTree } from "lucide-react";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { EmptyNote, ListRow, RowList } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";

type ListFoldersOutput = { name: string; path: string }[];

const Detail: FC<RendererProps<Record<string, never>, ListFoldersOutput>> = ({
  output,
}) => {
  const folders = output ?? [];
  if (folders.length === 0) return <EmptyNote>Waiting…</EmptyNote>;

  return (
    <RowList>
      {folders.map((folder, index) => (
        <ListRow key={index}>
          <span className="truncate text-[12px] font-medium text-foreground/85">
            {folder.name}
          </span>
          <span className="truncate font-mono text-[10px] text-muted-foreground/50">
            {folder.path}
          </span>
        </ListRow>
      ))}
    </RowList>
  );
};

export const renderer: ToolRenderer<Record<string, never>, ListFoldersOutput> = {
  icon: FolderTree,
  title: "Listed folders",
  executingTitle: "Listing folders",
  inputSchema: fileToolSchemas.list_folders.input,
  outputSchema: fileToolSchemas.list_folders.output,
  Detail,
};
