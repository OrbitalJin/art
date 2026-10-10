import { tool, type Tool } from "ai";

export const writeTool = <INPUT, OUTPUT>(
  config: Tool<INPUT, OUTPUT>,
): Tool<INPUT, OUTPUT> =>
  tool({ ...config, mutates: true } as Tool<INPUT, OUTPUT> & { mutates: true });

export const isMutating = (entry: unknown): boolean =>
  typeof entry === "object" &&
  entry !== null &&
  (entry as { mutates?: unknown }).mutates === true;
