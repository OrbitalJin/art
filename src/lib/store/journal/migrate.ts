import { load } from "@tauri-apps/plugin-store";
import { countWords } from "./content";
import { writePageMarkdown } from "./content-adapter";
import type { Page, PageMeta, Workspace } from "./types";

const LEGACY_FILE = "notes.json";
const LEGACY_KEY = "note-storage";

interface LegacyState {
  pages?: Page[];
  activeId?: string | null;
  currentWorkspace?: Workspace;
}

interface LegacyPersisted {
  state?: LegacyState;
  version?: number;
}

export interface MigratedJournal {
  pages: PageMeta[];
  activeId: string | null;
  currentWorkspace: Workspace;
}

const toMeta = (page: Page): PageMeta => {
  const { content, ...meta } = page;
  return { ...meta, wordCount: countWords(content ?? "") };
};

/**
 * One-time, read-only conversion of the legacy `notes.json` blob into the new
 * `journal/` layout. `notes.json` is only ever read, so it remains as a backup
 * and the previous build keeps working after a rollback. Returns `null` when
 * there is nothing to migrate (a fresh install).
 */
export const migrateLegacyJournal = async (): Promise<MigratedJournal | null> => {
  const legacy =
    (await (await load(LEGACY_FILE)).get<LegacyPersisted>(LEGACY_KEY)) ?? null;

  const legacyPages = legacy?.state?.pages;
  if (!Array.isArray(legacyPages) || legacyPages.length === 0) return null;

  for (const page of legacyPages) {
    await writePageMarkdown(page.id, page.content ?? "");
  }

  return {
    pages: legacyPages.map(toMeta),
    activeId: legacy?.state?.activeId ?? null,
    currentWorkspace: legacy?.state?.currentWorkspace ?? "personal",
  };
};
