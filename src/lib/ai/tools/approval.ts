import { tool, type Tool } from "ai";
import { useApprovalStore } from "@/lib/store/use-approval-store";

export class ToolApprovalDeniedError extends Error {
  constructor() {
    super("User denied approval to run this tool");
    this.name = "ToolApprovalDeniedError";
  }
}

interface RequireApprovalArgs {
  toolCallId: string;
  abortSignal?: AbortSignal;
}

export const requireApproval = async ({
  toolCallId,
  abortSignal,
}: RequireApprovalArgs): Promise<void> => {
  const approved = await useApprovalStore.getState().requestApproval({
    toolCallId,
    abortSignal,
  });

  if (!approved) throw new ToolApprovalDeniedError();
};

export interface ApprovalOptions<INPUT> {
  needsApproval?: boolean | ((input: INPUT) => boolean);
}

export const withApprovalTool = <INPUT, OUTPUT>(
  config: Tool<INPUT, OUTPUT>,
  options: ApprovalOptions<INPUT> = {},
): Tool<INPUT, OUTPUT> => {
  const execute = config.execute;
  if (!execute) return tool(config);

  const { needsApproval = true } = options;

  return tool({
    ...config,
    execute: async (input, execOptions) => {
      const required =
        typeof needsApproval === "function"
          ? needsApproval(input)
          : needsApproval;

      if (required) {
        await requireApproval({
          toolCallId: execOptions.toolCallId,
          abortSignal: execOptions.abortSignal,
        });
      }

      return execute(input, execOptions);
    },
  } as Tool<INPUT, OUTPUT>);
};
