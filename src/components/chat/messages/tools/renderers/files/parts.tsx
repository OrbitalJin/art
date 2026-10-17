import type { FC } from "react";
import { cn } from "@/lib/utils";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockFooter,
} from "@/components/ui/code-block";
import {
  Arrow,
  DoneNote,
  KeyValueList,
  SummaryRow,
  SummaryText,
  basename,
  formatCount,
} from "../../shared";
import type { RendererProps } from "../../types";
import { MAX_FILE_LINES, type FolderEntry, pathOf } from "./helpers";

/* Shared presentational pieces */

export const FilePath: FC<{ folder: string | null; path: string | null }> = ({
  folder,
  path,
}) => {
  if (!folder && !path) return null;

  return (
    <p className="min-w-0 font-mono text-[11px] break-all text-muted-foreground/60">
      {folder ? <span>{folder}</span> : null}
      {folder && path ? (
        <span className="mx-1 text-muted-foreground/30">/</span>
      ) : null}
      {path ? <span className="text-foreground/80">{path}</span> : null}
    </p>
  );
};

export const FileName: FC<{ path: string | null }> = ({ path }) =>
  path ? (
    <SummaryText mono title={path}>
      {basename(path)}
    </SummaryText>
  ) : null;

export const FileContent: FC<{ text: string }> = ({ text }) => {
  const lines = text.replace(/\n$/, "").split("\n");
  const shown = lines.slice(0, MAX_FILE_LINES);
  const hidden = lines.length - shown.length;

  return (
    <CodeBlock size="sm">
      <CodeBlockContent lineNumbers wrap className="max-h-72 text-[11px]">
        {shown.join("\n")}
      </CodeBlockContent>

      {hidden > 0 ? (
        <CodeBlockFooter className="pt-0">
          <span className="text-[11px] text-muted-foreground/50">
            +{formatCount(hidden, "more line")}
          </span>
        </CodeBlockFooter>
      ) : null}
    </CodeBlock>
  );
};

export const FolderEntryRow: FC<{ entry: FolderEntry }> = ({ entry }) => {
  const nameClasses = cn(
    "min-w-0 truncate",
    entry.isDirectory ? "text-foreground/85" : "text-muted-foreground",
  );

  return (
    <li className="flex items-baseline justify-between gap-3 py-0.5 font-mono text-[11px]">
      <span className={nameClasses}>
        {entry.name}
        {entry.isDirectory ? "/" : ""}
      </span>
      {entry.isSymlink ? (
        <span className="shrink-0 font-sans text-[10px] text-muted-foreground/50">
          link
        </span>
      ) : null}
    </li>
  );
};

/* Renderers shared by more than one tool */

interface PathInput {
  folder: string;
  path: string;
}

interface MoveInput {
  folder: string;
  from: string;
  to: string;
}

export const PathSummary: FC<RendererProps<PathInput, unknown>> = ({
  input,
}) => {
  const { path } = pathOf(input);
  return (
    <SummaryRow>
      <FileName path={path} />
    </SummaryRow>
  );
};

export const PathDetail: FC<RendererProps<PathInput, unknown>> = ({
  input,
  block,
}) => {
  const { folder, path } = pathOf(input);

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={path} />
      <DoneNote block={block} />
    </div>
  );
};

export const MoveSummary: FC<RendererProps<MoveInput, unknown>> = ({
  input,
}) => {
  const from = input?.from ?? null;
  const to = input?.to ?? null;

  return (
    <SummaryRow>
      <FileName path={from} />
      {from && to ? <Arrow /> : null}
      <FileName path={to} />
    </SummaryRow>
  );
};

export const MoveDetail: FC<RendererProps<MoveInput, unknown>> = ({
  input,
  block,
}) => {
  const folder = input?.folder ?? null;
  const from = input?.from ?? null;
  const to = input?.to ?? null;

  return (
    <div className="flex flex-col gap-2.5">
      <FilePath folder={folder} path={null} />
      <KeyValueList
        entries={[
          {
            label: "From",
            value: <span className="font-mono break-all">{from ?? "—"}</span>,
          },
          {
            label: "To",
            value: <span className="font-mono break-all">{to ?? "—"}</span>,
          },
        ]}
      />
      <DoneNote block={block} />
    </div>
  );
};
