import type { ToolRenderer } from "../../types";
import { PLAN_TOOL_NAME, type PlanToolName } from "@/lib/ai/tools/plan";
import { renderer as planWrite } from "./plan-write";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const planRenderers = {
  [PLAN_TOOL_NAME]: planWrite,
} satisfies Record<PlanToolName, AnyRenderer>;
