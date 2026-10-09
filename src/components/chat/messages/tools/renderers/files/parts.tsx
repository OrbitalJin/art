import type { FC } from "react";
import { cn } from "@/lib/utils";
import { SummaryText } from "../../primitives";
import { basename, formatCount } from "../../helpers";
import { MAX_FILE_LINES, type FolderEntry } from "./helpers";

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
    <div className="max-h-72 overflow-auto rounded-md bg-muted/30 py-2 font-mono text-[11px] leading-relaxed">
      {shown.map((line, index) => (
        <div key={index} className="flex gap-3 px-2.5">
          <span
            aria-hidden
            className="w-8 shrink-0 text-right text-muted-foreground/35 tabular-nums select-none"
          >
            {index + 1}
          </span>
          <span className="min-w-0 break-words whitespace-pre-wrap text-foreground/75">
            {line || " "}
          </span>
        </div>
      ))}

      {hidden > 0 ? (
        <p className="px-2.5 pt-2 font-sans text-muted-foreground/50">
          +{formatCount(hidden, "more line")}
        </p>
      ) : null}
    </div>
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
