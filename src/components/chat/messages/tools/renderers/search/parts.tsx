import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { EmptyNote, ErrorNote, ListRow, RowList } from "../../primitives";
import { asArray, asRecord, getString, hostnameOf } from "../../helpers";
import { errorOf, resultsOf } from "./helpers";

export const ResultItem: FC<{ result: Record<string, unknown> }> = ({
  result,
}) => {
  const title = getString(result, "title") ?? "Untitled";
  const url = getString(result, "url");
  const highlight = asArray(result.highlights).find(
    (item): item is string => typeof item === "string",
  );
  const snippet =
    getString(result, "summary") ?? getString(result, "text") ?? highlight;

  const titleClasses =
    "truncate text-[12px] font-medium text-foreground/85 outline-none";

  return (
    <ListRow>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title={title}
          className={`${titleClasses} hover:text-primary hover:underline focus-visible:underline`}
        >
          {title}
        </a>
      ) : (
        <span className={titleClasses}>{title}</span>
      )}

      {url ? (
        <span className="truncate text-[10px] text-muted-foreground/50">
          {hostnameOf(url)}
        </span>
      ) : null}

      {snippet ? (
        <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground/70">
          {snippet}
        </p>
      ) : null}
    </ListRow>
  );
};

export const ResultsDetail: FC<{ block: ToolCallBlock; emptyLabel: string }> = ({
  block,
  emptyLabel,
}) => {
  const error = errorOf(block.output);
  if (error) return <ErrorNote>{error}</ErrorNote>;

  if (block.state === "executing") return <EmptyNote>Searching…</EmptyNote>;

  const results = resultsOf(block.output);
  if (results.length === 0) return <EmptyNote>{emptyLabel}</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-72">
      {results.map((item, index) => (
        <ResultItem key={index} result={asRecord(item) ?? {}} />
      ))}
    </RowList>
  );
};
