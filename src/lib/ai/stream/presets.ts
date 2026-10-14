import type { SessionMeta } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { toolsFor } from "../tools/tools";
import { DONE_TOOL_NAME } from "../tools/done";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { CONNECTED_SERVICES } from "@/lib/services/catalog";
import { stepCountIs, hasToolCall } from "ai";
import { adaptiveStopCondition, BACKSTOP_STEPS } from "./stop-conditions";

export interface RequestContext {
  session: SessionMeta;
  profiles: Profiles;
}

const connectedServices = (session: SessionMeta): string[] =>
  CONNECTED_SERVICES.map((service) => service.id).filter((id) => {
    if (!useConnectionsStore.getState().connections[id]?.isActive) return false;
    return session.groups?.[id] === true;
  });

export const presetFor = async (ctx: RequestContext) => {
  const { session } = ctx;
  const tools = await toolsFor(session);

  if (session.type === "agent") {
    return {
      system: system({
        ...ctx,
        type: session.type,
        accessMode: session.accessMode,
        connections: connectedServices(session),
      }),
      tools,
      stopWhen: [
        hasToolCall(DONE_TOOL_NAME),
        adaptiveStopCondition(),
        stepCountIs(BACKSTOP_STEPS),
      ],
    };
  }

  return {
    system: system({ ...ctx, type: session.type, persona: session.persona }),
    tools,
    stopWhen: stepCountIs(5),
  };
};
