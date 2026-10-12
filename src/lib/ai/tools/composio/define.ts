import { tool } from "ai";
import { z } from "zod";
import { runComposioTool, type SessionResolver } from "./execute";

/**
 * Defines a Composio-powered tool the same way as any other tool: an input
 * schema, an output schema, and a mapping from the raw Composio payload to the
 * typed output. The factory owns session resolution, execution, error
 * handling, and output validation, so a definition only describes the tool.
 */
export interface ComposioToolDef<
  I extends z.ZodTypeAny,
  O extends z.ZodTypeAny,
> {
  /** Composio tool slug, e.g. `GMAIL_FETCH_EMAILS`. */
  slug: string;
  title: string;
  description: string;
  inputSchema: I;
  outputSchema: O;
  /** Optionally reshape validated input into the Composio argument payload. */
  args?: (input: z.infer<I>) => Record<string, unknown>;
  /** Map the tool's `data` payload into the declared output shape. */
  map: (data: Record<string, unknown>, input: z.infer<I>) => z.infer<O>;
  /** The output to return when the call fails. */
  errorResult: (error: string) => z.infer<O>;
  /** Session to execute against. Defaults to the connections session. */
  session?: SessionResolver;
}

export const composioTool = <I extends z.ZodTypeAny, O extends z.ZodTypeAny>(
  def: ComposioToolDef<I, O>,
) =>
  tool({
    title: def.title,
    description: def.description,
    inputSchema: def.inputSchema,
    outputSchema: def.outputSchema,
    execute: async (input) => {
      const args =
        def.args?.(input as z.infer<I>) ?? (input as Record<string, unknown>);
      const result = await runComposioTool(def.slug, args, def.session);
      if (!result.ok) {
        return def.errorResult(result.error ?? "Unknown error");
      }

      try {
        const parsed = def.outputSchema.safeParse(
          def.map(result.data, input as z.infer<I>),
        );
        if (parsed.success) return parsed.data;
        return def.errorResult(`Unexpected response from ${def.title}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return def.errorResult(`Could not read response from ${def.title}: ${message}`);
      }
    },
  });
