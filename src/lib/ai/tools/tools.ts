import type { Session } from "@/lib/store/session/types";
import type { ToolSet } from "ai";
import { GmailTools, SearchTools } from "@/lib/services/catalog";
import { tasksTools } from "./tasks";
import { fileTools } from "./files";
import { askUserTools } from "./ask-user";
import { doneTools } from "./done";
import { todoTools } from "./todo";
import { composioTools } from "./composio";
import { searchTools } from "./search";
import { youtubeTools } from "./youtube";
import { applyPolicy } from "./policy";

const cherryPick = (all: ToolSet, id: string): ToolSet => {
  const entry = all[id];
  return entry ? { [id]: entry } : {};
};

export const toolsFor = async (session: Session): Promise<ToolSet> => {
  const on = session.groups;

  if (session.type === "chat") {
    return searchFor(session);
  }

  const search = await searchFor(session);
  const services = await servicesFor(session);

  const tools: ToolSet = {
    ...search,
    ...services,
    ...doneTools(),
    ...(on.todo ? todoTools(session.id) : {}),
    ...(on.tasks ? tasksTools() : {}),
    ...(on.askUser ? askUserTools(session.id) : {}),
    ...(on.youtube ? youtubeTools() : {}),
    ...(on.files && session.folders?.length
      ? fileTools({ roots: session.folders })
      : {}),
  };

  return applyPolicy(tools, session.accessMode, session.id);
};

const searchFor = async (session: Session): Promise<ToolSet> => {
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

const servicesFor = async (session: Session): Promise<ToolSet> => {
  const on = session.groups;
  const services = await composioTools();

  return {
    ...(on[GmailTools.fetchEmails]
      ? cherryPick(services, GmailTools.fetchEmails)
      : {}),
    ...(on[GmailTools.listMessages]
      ? cherryPick(services, GmailTools.listMessages)
      : {}),
    ...(on[GmailTools.fetchMessageById]
      ? cherryPick(services, GmailTools.fetchMessageById)
      : {}),
    ...(on[GmailTools.listLabels]
      ? cherryPick(services, GmailTools.listLabels)
      : {}),
  };
};
