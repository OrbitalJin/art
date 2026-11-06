import type { ToolCallBlock } from "@/lib/store/session/types";
import type { FileToolName } from "@/lib/ai/tools/files";
import type { AskUserToolName } from "@/lib/ai/tools/ask-user";
import type { PlanToolName } from "@/lib/ai/tools/plan";
import type { YoutubeToolName } from "@/lib/ai/tools/youtube";
import type {
  NutritionToolName,
  FetchMacrosToolName,
} from "@/lib/ai/tools/nutrition";
import { ASK_USER_TOOL_NAME } from "@/lib/ai/tools/ask-user";
import { PLAN_TOOL_NAME } from "@/lib/ai/tools/plan";
import { READ_SHEET_TOOL_NAME } from "@/lib/ai/tools/sheets";
import {
  JOURNAL_READ_TOOL_NAME,
  JOURNAL_SEARCH_TOOL_NAME,
} from "@/lib/ai/tools/journal";
import type { JournalToolName } from "@/lib/ai/tools/journal";
import {
  SHOW_NUTRITION_TOOL_NAME,
  FETCH_FOOD_MACROS_TOOL_NAME,
} from "@/lib/ai/tools/nutrition";
import type { ToolRendererEntry } from "./types";
import { renderer as copyPath } from "./renderers/files/copy-path";
import { renderer as editFile } from "./renderers/files/edit-file";
import { renderer as grepFiles } from "./renderers/files/grep-files";
import { renderer as listFolder } from "./renderers/files/list-folder";
import { renderer as listFolders } from "./renderers/files/list-folders";
import { renderer as listTree } from "./renderers/files/list-tree";
import { renderer as makeDir } from "./renderers/files/make-dir";
import { renderer as movePath } from "./renderers/files/move-path";
import { renderer as readFile } from "./renderers/files/read-file";
import { renderer as readImage } from "./renderers/files/read-image";
import { renderer as readPdf } from "./renderers/files/read-pdf";
import { renderer as removePath } from "./renderers/files/remove-path";
import { renderer as searchFiles } from "./renderers/files/search-files";
import { renderer as stat } from "./renderers/files/stat";
import { renderer as writeFile } from "./renderers/files/write-file";
import { renderer as fetchUrl } from "./renderers/search/fetch-url";
import { renderer as newsSearch } from "./renderers/search/news-search";
import { renderer as webSearch } from "./renderers/search/web-search";
import { renderer as planWrite } from "./renderers/plan/plan-write";
import { renderer as askUser } from "./renderers/ask-user/ask-user";
import { renderer as readSheet } from "./renderers/googlesheets/read-sheet";
import { renderer as transcript } from "./renderers/youtube/transcript";
import { renderer as nutrition } from "./renderers/nutrition/nutrition";
import { renderer as fetchMacros } from "./renderers/nutrition/fetch-macros";
import {
  readRenderer as journalRead,
  searchRenderer as journalSearch,
} from "./renderers/journal/journal";
import { genericRenderer } from "./renderers/generic";

const fileRenderers = {
  list_folders: listFolders,
  list_folder: listFolder,
  search_files: searchFiles,
  grep_files: grepFiles,
  list_tree: listTree,
  read_file: readFile,
  read_image: readImage,
  read_pdf: readPdf,
  stat,
  write_file: writeFile,
  edit_file: editFile,
  make_dir: makeDir,
  remove_path: removePath,
  move_path: movePath,
  copy_path: copyPath,
} satisfies Record<FileToolName, ToolRendererEntry>;

const askUserRenderers = {
  [ASK_USER_TOOL_NAME]: askUser,
} satisfies Record<AskUserToolName, ToolRendererEntry>;

const planRenderers = {
  [PLAN_TOOL_NAME]: planWrite,
} satisfies Record<PlanToolName, ToolRendererEntry>;

const nutritionRenderers = {
  [SHOW_NUTRITION_TOOL_NAME]: nutrition,
} satisfies Record<NutritionToolName, ToolRendererEntry>;

const fetchMacrosRenderers = {
  [FETCH_FOOD_MACROS_TOOL_NAME]: fetchMacros,
} satisfies Record<FetchMacrosToolName, ToolRendererEntry>;

const youtubeRenderers = {
  youtube_transcript: transcript,
} satisfies Record<YoutubeToolName, ToolRendererEntry>;

const searchRenderers = {
  exa_search: webSearch,
  exa_fetch: fetchUrl,
  exa_news: newsSearch,
} satisfies Record<string, ToolRendererEntry>;

const googlesheetsRenderers = {
  [READ_SHEET_TOOL_NAME]: readSheet,
} satisfies Record<string, ToolRendererEntry>;

const journalRenderers = {
  [JOURNAL_READ_TOOL_NAME]: journalRead,
  [JOURNAL_SEARCH_TOOL_NAME]: journalSearch,
} satisfies Record<JournalToolName, ToolRendererEntry>;

/**
 * The single tool-name → renderer map. `satisfies Record<string, …>` checks
 * every value is a renderer entry.
 */
const TOOL_RENDERERS = {
  ...fileRenderers,
  ...searchRenderers,
  ...askUserRenderers,
  ...planRenderers,
  ...googlesheetsRenderers,
  ...journalRenderers,
  ...youtubeRenderers,
  ...nutritionRenderers,
  ...fetchMacrosRenderers,
} satisfies Record<string, ToolRendererEntry>;

const entries: Record<string, ToolRendererEntry> = TOOL_RENDERERS;

/** A tool call resolved once: its renderer plus schema-parsed input/output. */
export interface ResolvedTool {
  entry: ToolRendererEntry;
  block: ToolCallBlock;
  input: unknown;
  output: unknown;
}

const parse = (
  schema: ToolRendererEntry["inputSchema"],
  value: unknown,
): unknown => {
  if (!schema) return value ?? null;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
};

export const resolveTool = (block: ToolCallBlock): ResolvedTool => {
  const entry = entries[block.toolName] ?? genericRenderer;
  return {
    entry,
    block,
    input: parse(entry.inputSchema, block.input),
    output: parse(entry.outputSchema, block.output),
  };
};
