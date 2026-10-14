import { MODELS, type ModelId } from "@/lib/ai/models";
import { SERVICES, SearchTools } from "@/lib/services/catalog";
import { useSettingsStore } from "@/lib/store/use-settings-store";
import type { SessionGroups, SessionMeta, SessionType } from "./types";

/**
 * The default group state for a new session. This is the single source of
 * truth for defaults; the tools builder only reads the stored map.
 */
export const defaultGroups = (type: SessionType): SessionGroups => ({
  tasks: false,
  todo: type === "agent",
  askUser: type === "agent",
  youtube: false,
  files: false,
  [SearchTools.web]: true,
  [SearchTools.fetch]: true,
  [SearchTools.news]: false,
  [SearchTools.flights]: false,
  [SearchTools.hotels]: false,
  [SearchTools.maps]: false,
  [SERVICES.gmail.id]: false,
  [SERVICES.sheets.id]: false,
});

interface CreateMetaOpts {
  title?: string;
  defaultModelId?: ModelId;
  type?: SessionType;
}

export const createMeta = ({
  title,
  defaultModelId,
  type,
}: CreateMetaOpts): SessionMeta => {
  const date = Date.now();
  const sessionType = type ?? "chat";
  const settings = useSettingsStore.getState();
  const modelId =
    defaultModelId ??
    MODELS.find(
      (m) =>
        m.id ===
        (sessionType === "agent"
          ? settings.defaultAgentModel
          : settings.defaultModel),
    )?.id ??
    MODELS[0].id;

  return {
    id: crypto.randomUUID(),
    type: sessionType,
    title: title ?? "New Session",
    accessMode: settings.defaultAccessMode,
    groups: defaultGroups(sessionType),
    persona: settings.defaultPersona,
    modelId,
    createdAt: date,
    updatedAt: date,
  };
};
