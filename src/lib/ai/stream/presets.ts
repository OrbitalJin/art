import type { Session } from "@/lib/store/session/types";
import { system, type Profiles } from "../prompts/system";
import { toolsFor } from "../tools/tools";
import { DONE_TOOL_NAME } from "../tools/done";
import { useConnectionsStore } from "@/lib/store/use-connections-store";
import { CONNECTED_SERVICES, serviceById } from "@/lib/services/catalog";
import { stepCountIs, hasToolCall } from "ai";
import { adaptiveStopCondition, BACKSTOP_STEPS } from "./stop-conditions";

export interface RequestContext {
  session: Session;
  profiles: Profiles;
}

const connectedServices = (session: Session): string[] =>
  CONNECTED_SERVICES.map((service) => service.id).filter((id) => {
    if (!useConnectionsStore.getState().connections[id]?.isActive) return false;
    const service = serviceById(id);
    return service
      ? Object.values(service.tools).some(
          (toolId) => session.groups?.[toolId] === true,
        )
      : false;
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
