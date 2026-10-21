import type { SessionMeta } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import {
  GmailTools,
  GoogleSheetsTools,
  SERVICES,
  SearchTools,
} from "@/lib/services/catalog";
import { tasksTools } from "./tasks";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { planTools } from "./plan";
import { composioTools } from "./composio";
import { searchTools } from "./search";
import { youtubeTools } from "./youtube";
import { fetchMacrosTools, nutritionTools } from "./nutrition";
import { applyPolicy } from "./policy";
import { useSettingsStore } from "@/lib/store/use-settings-store";

const cherryPick = (all: ToolSet, id: string): ToolSet => {
  const entry = all[id];
  return entry ? { [id]: entry } : {};
};

export const toolsFor = async (session: SessionMeta): Promise<ToolSet> => {
  const on = session.groups;
  const nutrition = nutritionTools();
  const macros = useSettingsStore.getState().fdcApiKey ? fetchMacrosTools() : {};

  if (session.type === "chat") {
    return { ...(await searchFor(session)), ...nutrition, ...macros };
  }

  const search = await searchFor(session);
  const services = await servicesFor(session);

  const tools: ToolSet = {
    ...search,
    ...services,
    ...nutrition,
    ...macros,
    ...doneTools(),
    ...(on.plan ? planTools(session.id) : {}),
    ...(on.tasks ? tasksTools() : {}),
    ...(on.askUser ? askUserTools(session.id) : {}),
    ...(on.youtube ? youtubeTools() : {}),
    ...(on.files && session.folders?.length
      ? fileTools({ roots: session.folders })
      : {}),
  };

  return applyPolicy(tools, session.accessMode, session.id);
};

const searchFor = async (session: SessionMeta): Promise<ToolSet> => {
  const on = session.groups;
  const search = await searchTools();
  return {
    ...(on[SearchTools.web] ? cherryPick(search, SearchTools.web) : {}),
    ...(on[SearchTools.fetch] ? cherryPick(search, SearchTools.fetch) : {}),
    ...(on[SearchTools.news] ? cherryPick(search, SearchTools.news) : {}),
    ...(on[SearchTools.flights] ? cherryPick(search, SearchTools.flights) : {}),
    ...(on[SearchTools.hotels] ? cherryPick(search, SearchTools.hotels) : {}),
    ...(on[SearchTools.maps] ? cherryPick(search, SearchTools.maps) : {}),
  };
};

const servicesFor = async (session: SessionMeta): Promise<ToolSet> => {
  const on = session.groups;
  const services = await composioTools();

  return {
    ...(on[SERVICES.gmail.id]
      ? {
          ...cherryPick(services, GmailTools.fetchEmails),
          ...cherryPick(services, GmailTools.listMessages),
          ...cherryPick(services, GmailTools.fetchMessageById),
          ...cherryPick(services, GmailTools.listLabels),
        }
      : {}),
    ...(on[SERVICES.sheets.id]
      ? {
          ...cherryPick(services, GoogleSheetsTools.search),
          ...cherryPick(services, GoogleSheetsTools.getSpreadsheetInfo),
          ...cherryPick(services, GoogleSheetsTools.getSheetNames),
          ...cherryPick(services, GoogleSheetsTools.valuesGet),
          ...cherryPick(services, GoogleSheetsTools.batchGet),
          ...cherryPick(services, GoogleSheetsTools.lookupRow),
        }
      : {}),
  };
};
