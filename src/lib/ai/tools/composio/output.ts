import type { z } from "zod";

/**
 * Builds an `errorResult` from a tool's empty success value, e.g.
 * `failed({ messages: [] })`. Keeps every tool's failure shape identical to
 * its success shape.
 */
export const failed =
  <T extends object>(defaults: T) =>
  (error: string): T & { error: string } => ({ ...defaults, error });

/** Parse a tool output against its schema, returning `null` when it does not match. */
export const parseOutput = <O extends z.ZodTypeAny>(
  schema: O,
  output: unknown,
): z.infer<O> | null => {
  const parsed = schema.safeParse(output);
  return parsed.success ? parsed.data : null;
};
