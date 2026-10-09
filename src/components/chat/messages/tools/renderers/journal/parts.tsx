import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import {
  DoneNote,
  EmptyNote,
  ListRow,
  MetaLine,
  RowList,
} from "../../primitives";
import { asArray, asRecord, getBoolean, getString } from "../../helpers";
import { MAX_TAGS, inputRecord } from "./helpers";

export const TagList: FC<{ tags: unknown }> = ({ tags }) => {
  const list = asArray(tags).filter(
    (tag): tag is string => typeof tag === "string",
  );
  if (list.length === 0) return null;

  const hidden = list.length - MAX_TAGS;

  return (
    <p className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground/70">
      {list.slice(0, MAX_TAGS).map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
      {hidden > 0 ? (
        <span className="text-muted-foreground/50">+{hidden}</span>
      ) : null}
    </p>
  );
};

export const EntryTitle: FC<{ page: Record<string, unknown> }> = ({
  page,
}) => {
  const title = getString(page, "title") ?? "Untitled";
  const workspace = getString(page, "workspace");
  const pinned = getBoolean(page, "pinned");

  return (
    <div className="flex min-w-0 items-baseline justify-between gap-3">
      <span className="min-w-0 truncate text-[12px] font-medium text-foreground/85">
        {title}
      </span>
      <MetaLine items={[pinned && "Pinned", workspace]} />
    </div>
  );
};

export const JournalEntryRow: FC<{ page: Record<string, unknown> }> = ({
  page,
}) => {
  const content = getString(page, "content");

  return (
    <ListRow>
      <EntryTitle page={page} />
      {content ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/70">
          {content}
        </p>
      ) : null}
      <TagList tags={page.tags} />
    </ListRow>
  );
};

export const JournalEntriesDetail: FC<{ block: ToolCallBlock }> = ({
  block,
}) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const pages = asArray(block.output);
  if (pages.length === 0) return <EmptyNote>No entries.</EmptyNote>;

  return (
    <RowList maxHeightClass="max-h-64">
      {pages.map((item, index) => (
        <JournalEntryRow key={index} page={asRecord(item) ?? {}} />
      ))}
    </RowList>
  );
};

export const JournalEntryDetail: FC<{ block: ToolCallBlock }> = ({ block }) => {
  if (block.state === "executing") return <EmptyNote>Loading…</EmptyNote>;

  const page = asRecord(block.output);
  if (!page) return <EmptyNote>Entry not found.</EmptyNote>;

  const content = getString(page, "content");

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <EntryTitle page={page} />
        <TagList tags={page.tags} />
      </div>

      {content ? (
        <div className="max-h-56 overflow-auto">
          <p className="text-[12px] leading-relaxed whitespace-pre-wrap text-foreground/75">
            {content}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export const InputTagsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <div className="flex flex-col gap-2">
    <TagList tags={inputRecord(block)?.tags} />
    <DoneNote block={block} />
  </div>
);

export const AllTagsDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <TagList tags={asRecord(block.output)?.tags} />
);

export const DeletedDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <DoneNote block={block} label="Deleted" />
);
