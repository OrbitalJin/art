import { Fragment, type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Basics */

export const Chip: FC<{
  children: ReactNode;
  mono?: boolean;
  title?: string;
}> = ({ children, mono, title }) => (
  <span
    title={title}
    className={cn(
      "inline-flex max-w-full min-w-0 items-center rounded-md bg-muted/50 px-1.5 py-0.5",
      "text-[11px] leading-none text-foreground/70",
      mono && "font-mono",
    )}
  >
    <span className="truncate">{children}</span>
  </span>
);

export const MetaLine: FC<{
  items: (ReactNode | null | undefined | false)[];
}> = ({ items }) => {
  const visible = items.filter(Boolean);
  if (visible.length === 0) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground/60">
      {visible.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span aria-hidden className="text-muted-foreground/30">
              ·
            </span>
          )}
          <span>{item}</span>
        </Fragment>
      ))}
    </p>
  );
};

export const KeyValueList: FC<{
  entries: { label: string; value: ReactNode }[];
}> = ({ entries }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[11px]">
    {entries.map((entry) => (
      <Fragment key={entry.label}>
        <dt className="text-muted-foreground/60">{entry.label}</dt>
        <dd className="min-w-0 break-words text-foreground/80">
          {entry.value}
        </dd>
      </Fragment>
    ))}
  </dl>
);

/* Lists */

export const RowList: FC<{
  children: ReactNode;
  maxHeightClass?: string;
}> = ({ children, maxHeightClass }) => (
  <ul
    className={cn(
      "flex flex-col divide-y divide-border/40 overflow-auto scroll-fade-y",
      maxHeightClass,
    )}
  >
    {children}
  </ul>
);

export const ListRow: FC<{ children: ReactNode }> = ({ children }) => (
  <li className="flex min-w-0 flex-col gap-1 py-2 first:pt-0 last:pb-0">
    {children}
  </li>
);

export const DateStamp: FC<{
  value: string | null;
  href?: string | null;
}> = ({ value, href }) => {
  if (!value) return null;

  const classes =
    "ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground/50";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          classes,
          "outline-none hover:text-primary hover:underline focus-visible:underline",
        )}
      >
        {value}
      </a>
    );
  }

  return <span className={classes}>{value}</span>;
};
