import type { FC, ReactNode } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { cn } from "@/lib/utils";
import {
  DateStamp,
  DetailGate,
  EmptyNote,
  ListRow,
  MetaLine,
  RowList,
  hostnameOf,
} from "../../shared";
import { formatResultDate, type WebResult } from "./helpers";

export const rowTitleClasses =
  "min-w-0 truncate text-[12px] font-medium text-foreground/85 outline-none";

export const LinkTitle: FC<{
  href: string | null;
  title?: string;
  children: ReactNode;
}> = ({ href, title, children }) => {
  if (!href) {
    return (
      <span title={title} className={rowTitleClasses}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={cn(
        rowTitleClasses,
        "hover:text-primary hover:underline focus-visible:underline",
      )}
    >
      {children}
    </a>
  );
};

export const Rating: FC<{ rating: number | null }> = ({ rating }) => {
  if (rating === null) return null;

  return (
    <span className="shrink-0 text-[11px] tabular-nums text-amber-500/90">
      ★ {rating.toFixed(1)}
    </span>
  );
};

export const Price: FC<{ value: string; suffix?: string }> = ({
  value,
  suffix,
}) => (
  <span className="ml-auto flex shrink-0 items-baseline gap-0.5 font-mono">
    <span className="text-[12px] font-semibold tabular-nums text-foreground/90">
      {value}
    </span>
    {suffix ? (
      <span className="text-[10px] text-muted-foreground/50">{suffix}</span>
    ) : null}
  </span>
);

/* Web and news */

const headlineClasses =
  "line-clamp-2 text-[13px] font-medium leading-snug text-foreground/90 outline-none";

const Headline: FC<{ href: string | null; title: string }> = ({
  href,
  title,
}) => {
  if (!href) {
    return (
      <span title={title} className={headlineClasses}>
        {title}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={cn(
        headlineClasses,
        "hover:text-primary hover:underline focus-visible:underline",
      )}
    >
      {title}
    </a>
  );
};

export const ResultItem: FC<{ result: WebResult }> = ({ result }) => {
  const title = result.title ?? "Untitled";
  const source = result.url ? hostnameOf(result.url) : null;
  const date = formatResultDate(result.date);

  return (
    <ListRow>
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <MetaLine items={[source, result.author]} />
        </div>
        <DateStamp value={date} />
      </div>

      <Headline href={result.url} title={title} />

      {result.snippet ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {result.snippet}
        </p>
      ) : null}
    </ListRow>
  );
};

export const ResultsDetail: FC<{
  block: ToolCallBlock;
  output: { results: WebResult[] } | null;
  emptyLabel: string;
  executingLabel?: string;
}> = ({ block, output, emptyLabel, executingLabel = "Searching…" }) => {
  const results = output?.results ?? [];

  return (
    <DetailGate block={block} executingLabel={executingLabel}>
      {results.length === 0 ? (
        <EmptyNote>{emptyLabel}</EmptyNote>
      ) : (
        <RowList maxHeightClass="max-h-72">
          {results.map((result, index) => (
            <ResultItem key={index} result={result} />
          ))}
        </RowList>
      )}
    </DetailGate>
  );
};
