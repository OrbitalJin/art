import mockContent from "@/assets/mock.md?raw";
import { countWords } from "./content";
import { journalContentStore } from "./content-store";
import { useJournalIndex } from "./index-store";
import { createPageMeta } from "./meta";
import { migrateLegacyJournal } from "./migrate";
import type { Workspace } from "./types";

export const createPage = (workspace: Workspace, title?: string): string => {
  const meta = createPageMeta(workspace, title);
  useJournalIndex.getState().addPage(meta);
  return meta.id;
};

export const deletePage = (id: string): void => {
  useJournalIndex.getState().removePage(id);
  journalContentStore.getState().remove(id);
};

/**
 * Persist a page's body and the index fields derived from it (tags, word
 * count, updated time). The single write path for page content.
 */
export const savePageMarkdown = (
  id: string,
  markdown: string,
  tags: string[],
): void => {
  journalContentStore.getState().set(id, markdown);
  useJournalIndex.getState().updatePage(id, {
    tags,
    wordCount: countWords(markdown),
    updatedAt: Date.now(),
  });
};

/**
 * Boots the journal index and page bodies. Migrates the legacy `notes.json`
 * layout on first run, otherwise seeds a welcome page.
 */
export const hydrateJournal = async (): Promise<void> => {
  await useJournalIndex.persist.rehydrate();

  const state = useJournalIndex.getState();
  if (!state.migrated && state.pages.length === 0) {
    const migrated = await migrateLegacyJournal();
    if (migrated) {
      useJournalIndex.setState({ ...migrated, migrated: true });
    } else {
      const meta = {
        ...createPageMeta("personal", "Welcome to Art"),
        pinned: true,
      };
      useJournalIndex.setState({
        pages: [meta],
        activeId: meta.id,
        migrated: true,
      });
      journalContentStore.getState().set(meta.id, mockContent);
    }
  } else if (!state.migrated) {
    // Index already holds pages but predates the marker; don't re-import.
    useJournalIndex.setState({ migrated: true });
  }

  const hydrated = useJournalIndex.getState();
  const activeId =
    hydrated.activeId &&
    hydrated.pages.some((page) => page.id === hydrated.activeId)
      ? hydrated.activeId
      : (hydrated.pages[0]?.id ?? null);

  useJournalIndex.setState({ activeId, hydrated: true });
  if (activeId) await journalContentStore.getState().ensure(activeId);
};
