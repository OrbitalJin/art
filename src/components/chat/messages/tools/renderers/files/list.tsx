import type { FC } from "react";
import {
  EmptyNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
} from "../../primitives";
import { formatCount } from "../../helpers";
import type { RendererProps } from "../../types";
import { pathOf, type FolderEntry } from "./helpers";
import { FileName, FilePath, FolderEntryRow } from "./parts";

interface ListFolderInput {
  folder: string;
  path?: string;
}

interface FolderEntryOutput {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}

export const ListFolderSummary: FC<
  RendererProps<ListFolderInput, FolderEntryOutput[]>
> = ({ input, output, block }) => {
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

export const ListFolderDetail: FC<
  RendererProps<ListFolderInput, FolderEntryOutput[]>
> = ({ input, output, block }) => {
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

export const ListFoldersDetail: FC<
  RendererProps<Record<string, never>, { name: string; path: string }[]>
> = ({ output }) => {
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
