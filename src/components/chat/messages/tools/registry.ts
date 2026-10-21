import type { ToolCallBlock } from "@/lib/store/session/types";
import type { FileToolName } from "@/lib/ai/tools/files";
import type { TaskToolName } from "@/lib/ai/tools/tasks";
import type { AskUserToolName } from "@/lib/ai/tools/ask-user";
import type { PlanToolName } from "@/lib/ai/tools/plan";
import type { YoutubeToolName } from "@/lib/ai/tools/youtube";
import type {
  NutritionToolName,
  FetchMacrosToolName,
} from "@/lib/ai/tools/nutrition";
import { ASK_USER_TOOL_NAME } from "@/lib/ai/tools/ask-user";
import { PLAN_TOOL_NAME } from "@/lib/ai/tools/plan";
import {
  SHOW_NUTRITION_TOOL_NAME,
  FETCH_FOOD_MACROS_TOOL_NAME,
} from "@/lib/ai/tools/nutrition";
import type { ToolRendererEntry } from "./types";
import { renderer as copyPath } from "./renderers/files/copy-path";
import { renderer as editFile } from "./renderers/files/edit-file";
import { renderer as listFolder } from "./renderers/files/list-folder";
import { renderer as listFolders } from "./renderers/files/list-folders";
import { renderer as makeDir } from "./renderers/files/make-dir";
import { renderer as movePath } from "./renderers/files/move-path";
import { renderer as readFile } from "./renderers/files/read-file";
import { renderer as readImage } from "./renderers/files/read-image";
import { renderer as readPdf } from "./renderers/files/read-pdf";
import { renderer as removePath } from "./renderers/files/remove-path";
import { renderer as stat } from "./renderers/files/stat";
import { renderer as writeFile } from "./renderers/files/write-file";
import { renderer as fetchUrl } from "./renderers/search/fetch-url";
import { renderer as flightSearch } from "./renderers/search/flight-search";
import { renderer as hotelSearch } from "./renderers/search/hotel-search";
import { renderer as mapsSearch } from "./renderers/search/maps-search";
import { renderer as newsSearch } from "./renderers/search/news-search";
import { renderer as webSearch } from "./renderers/search/web-search";
import { renderer as createProject } from "./renderers/tasks/create-project";
import { renderer as createProjectWithTasks } from "./renderers/tasks/create-project-with-tasks";
import { renderer as createTask } from "./renderers/tasks/create-task";
import { renderer as deleteProject } from "./renderers/tasks/delete-project";
import { renderer as deleteTask } from "./renderers/tasks/delete-task";
import { renderer as getProjects } from "./renderers/tasks/get-projects";
import { renderer as getTask } from "./renderers/tasks/get-task";
import { renderer as getTasks } from "./renderers/tasks/get-tasks";
import { renderer as moveTask } from "./renderers/tasks/move-task";
import { renderer as moveTaskToPosition } from "./renderers/tasks/move-task-to-position";
import { renderer as updateProject } from "./renderers/tasks/update-project";
import { renderer as updateTask } from "./renderers/tasks/update-task";
import { renderer as planWrite } from "./renderers/plan/plan-write";
import { renderer as askUser } from "./renderers/ask-user/ask-user";
import { renderer as fetchEmails } from "./renderers/email/fetch-emails";
import { renderer as fetchMessage } from "./renderers/email/fetch-message";
import { renderer as listLabels } from "./renderers/email/list-labels";
import { renderer as listMessages } from "./renderers/email/list-messages";
import { renderer as batchGet } from "./renderers/googlesheets/batch-get";
import { renderer as getSheetNames } from "./renderers/googlesheets/get-sheet-names";
import { renderer as getSpreadsheetInfo } from "./renderers/googlesheets/get-spreadsheet-info";
import { renderer as lookupRow } from "./renderers/googlesheets/lookup-row";
import { renderer as searchSpreadsheets } from "./renderers/googlesheets/search-spreadsheets";
import { renderer as valuesGet } from "./renderers/googlesheets/values-get";
import { renderer as transcript } from "./renderers/youtube/transcript";
import { renderer as nutrition } from "./renderers/nutrition/nutrition";
import { renderer as fetchMacros } from "./renderers/nutrition/fetch-macros";
import { genericRenderer } from "./renderers/generic";

const fileRenderers = {
  list_folders: listFolders,
  list_folder: listFolder,
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

const taskRenderers = {
  get_tasks: getTasks,
  get_task: getTask,
  create_task: createTask,
  update_task: updateTask,
  move_task: moveTask,
  move_task_to_position: moveTaskToPosition,
  delete_task: deleteTask,
  get_projects: getProjects,
  create_project: createProject,
  update_project: updateProject,
  delete_project: deleteProject,
  create_project_with_tasks: createProjectWithTasks,
} satisfies Record<TaskToolName, ToolRendererEntry>;

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
  COMPOSIO_SEARCH_WEB: webSearch,
  COMPOSIO_SEARCH_FETCH_URL_CONTENT: fetchUrl,
  COMPOSIO_SEARCH_NEWS: newsSearch,
  COMPOSIO_SEARCH_FLIGHTS: flightSearch,
  COMPOSIO_SEARCH_HOTELS: hotelSearch,
  COMPOSIO_SEARCH_GOOGLE_MAPS: mapsSearch,
} satisfies Record<string, ToolRendererEntry>;

const emailRenderers = {
  GMAIL_FETCH_EMAILS: fetchEmails,
  GMAIL_LIST_MESSAGES: listMessages,
  GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID: fetchMessage,
  GMAIL_LIST_LABELS: listLabels,
} satisfies Record<string, ToolRendererEntry>;

const googlesheetsRenderers = {
  GOOGLESHEETS_GET_SPREADSHEET_INFO: getSpreadsheetInfo,
  GOOGLESHEETS_GET_SHEET_NAMES: getSheetNames,
  GOOGLESHEETS_VALUES_GET: valuesGet,
  GOOGLESHEETS_BATCH_GET: batchGet,
  GOOGLESHEETS_SEARCH_SPREADSHEETS: searchSpreadsheets,
  GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW: lookupRow,
} satisfies Record<string, ToolRendererEntry>;

/**
 * The single tool-name → renderer map. `satisfies Record<string, …>` checks
 * every value is a renderer entry.
 */
const TOOL_RENDERERS = {
  ...fileRenderers,
  ...searchRenderers,
  ...taskRenderers,
  ...askUserRenderers,
  ...planRenderers,
  ...emailRenderers,
  ...googlesheetsRenderers,
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
