import { Archive, BookText, Pin, Plus, Tag, Trash2 } from "lucide-react";
import type { ToolRenderer } from "../../types";
import { DoneNote } from "../../primitives";
import {
  AllTagsDetail,
  DeletedDetail,
  InputTagsDetail,
  JournalEntriesDetail,
  JournalEntryDetail,
} from "./parts";
import {
  AllTagsSummary,
  GetJournalsSummary,
  TagsSummary,
  TitleSummary,
} from "./summaries";

export const journalRenderers: Record<string, ToolRenderer> = {
  get_journals: {
    icon: BookText,
    title: "Read journal entries",
    Summary: GetJournalsSummary,
    Detail: JournalEntriesDetail,
  },
  get_journal: {
    icon: BookText,
    title: "Read journal entry",
    Summary: TitleSummary,
    Detail: JournalEntryDetail,
  },
  create_journal: {
    icon: Plus,
    title: "Created journal entry",
    Summary: TitleSummary,
    Detail: DoneNote,
  },
  update_journal: {
    icon: BookText,
    title: "Updated journal entry",
    Summary: TitleSummary,
    Detail: DoneNote,
  },
  delete_journal: {
    icon: Trash2,
    title: "Deleted journal entry",
    Summary: TitleSummary,
    Detail: DeletedDetail,
  },
  update_tags: {
    icon: Tag,
    title: "Updated tags",
    Summary: TagsSummary,
    Detail: InputTagsDetail,
  },
  get_all_tags: {
    icon: Tag,
    title: "Read tags",
    Summary: AllTagsSummary,
    Detail: AllTagsDetail,
  },
  toggle_pinned: {
    icon: Pin,
    title: "Toggled pin",
    Summary: TitleSummary,
    Detail: DoneNote,
  },
  toggle_archived: {
    icon: Archive,
    title: "Toggled archive",
    Summary: TitleSummary,
    Detail: DoneNote,
  },
};
