import type { FC } from "react";
import { FolderTree } from "lucide-react";
import type { z } from "zod";
import { fileToolSchemas } from "@/lib/ai/tools/files";
import {
  EmptyNote,
  ResultBadge,
  SummaryRow,
  formatCount,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { pathOf, type FolderEntry } from "./helpers";
import { FileName, FilePath, FolderEntryRow } from "./parts";

type ListFolderInput = z.infer<typeof fileToolSchemas.list_folder.input>;
type ListFolderOutput = z.infer<typeof fileToolSchemas.list_folder.output>;

const Summary: FC<RendererProps<ListFolderInput, ListFolderOutput>> = ({
  input,
  output,
  block,
}) => {
  const { path } = pathOf(input);

  return (
    <SummaryRow>
      <FileName path={path} />
      {block.state !== "executing" ? (
        <ResultBadge>{formatCount(output?.length ?? 0, "item")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<ListFolderInput, ListFolderOutput>> = ({
  input,
  output,
  block,
}) => {
  const { folder, path } = pathOf(input);
  const entries: FolderEntry[] = (output ?? [])
    .map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory,
      isSymlink: entry.isSymlink,
    }))
    .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory));

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      {entries.length > 0 ? (
        <ul className="flex max-h-56 flex-col overflow-auto">
          {entries.map((entry, index) => (
            <FolderEntryRow key={`${entry.name}-${index}`} entry={entry} />
          ))}
        </ul>
      ) : (
        <EmptyNote>
          {block.state === "executing" ? "Waiting…" : "Empty."}
        </EmptyNote>
      )}
    </div>
  );
};

export const renderer = defineRenderer<ListFolderInput, ListFolderOutput>({
  icon: FolderTree,
  title: "Listed directory",
  executingTitle: "Listing directory",
  inputSchema: fileToolSchemas.list_folder.input,
  outputSchema: fileToolSchemas.list_folder.output,
  Summary,
  Detail,
});
