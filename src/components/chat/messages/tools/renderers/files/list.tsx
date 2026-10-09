import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  EmptyNote,
  ListRow,
  ResultBadge,
  RowList,
  SummaryRow,
} from "../../primitives";
import { asArray, asRecord, formatCount, getString } from "../../helpers";
import { pathOf, toFolderEntry } from "./helpers";
import { FileName, FilePath, FolderEntryRow } from "./parts";

export const ListFolderSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { path } = pathOf(block.input);
  const entries = asArray(block.output);

  return (
    <SummaryRow>
      <FileName path={path} />
      {block.state !== "executing" ? (
        <ResultBadge>{formatCount(entries.length, "item")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const ListFolderDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const { folder, path } = pathOf(block.input);
  const entries = asArray(block.output)
    .map(toFolderEntry)
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

export const ListFoldersDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const folders = asArray(block.output);
  if (folders.length === 0) return <EmptyNote>Waiting…</EmptyNote>;

  return (
    <RowList>
      {folders.map((item, index) => {
        const record = asRecord(item);
        return (
          <ListRow key={index}>
            <span className="truncate text-[12px] font-medium text-foreground/85">
              {getString(record, "name") ?? "Folder"}
            </span>
            <span className="truncate font-mono text-[10px] text-muted-foreground/50">
              {getString(record, "path")}
            </span>
          </ListRow>
        );
      })}
    </RowList>
  );
};
