import type { FC } from "react";
import { FolderTree } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import { EmptyNote, ListRow, RowList } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

type ListFoldersInput = z.infer<typeof fileToolSchemas.list_folders.input>;
type ListFoldersOutput = z.infer<typeof fileToolSchemas.list_folders.output>;

const Detail: FC<RendererProps<ListFoldersInput, ListFoldersOutput>> = ({
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

export const renderer = defineRenderer<ListFoldersInput, ListFoldersOutput>({
  icon: FolderTree,
  title: "Listed folders",
  executingTitle: "Listing folders",
  inputSchema: fileToolSchemas.list_folders.input,
  outputSchema: fileToolSchemas.list_folders.output,
  Detail,
});
