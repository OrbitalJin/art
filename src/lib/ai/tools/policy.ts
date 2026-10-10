import type { ToolSet } from "ai";
import { isMutatingTool, type AccessMode } from "./registry";
import { withApprovalTool } from "./approval";

export const applyAccessPolicy = (
  tools: ToolSet,
  mode: AccessMode,
  sessionId: string,
): ToolSet => {
  const result: ToolSet = {};

  for (const [name, entry] of Object.entries(tools)) {
    if (!isMutatingTool(name)) {
      result[name] = entry;
      continue;
    }

    if (mode === "readonly") continue;

    if (mode === "autonomous") {
      result[name] = entry;
      continue;
    }

    result[name] = withApprovalTool(entry, { name, sessionId });
  }

  return result;
};
