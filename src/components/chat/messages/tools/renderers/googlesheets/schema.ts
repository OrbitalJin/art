import { z } from "zod";

/**
 * The `read_sheet` tool returns a gviz CSV grid normalized to `rows`. We parse
 * the payload once here and map it to the shape the sheets parts render, keeping
 * the UI decoupled from the tool payload.
 */

export const readSheetInput = z
  .object({
    url: z.string().optional(),
    sheet: z.string().optional(),
    range: z.string().optional(),
    asObjects: z.boolean().optional(),
  })
  .loose();
export type ReadSheetInput = z.infer<typeof readSheetInput>;

export const readSheetOutputSchema = z
  .object({
    spreadsheetId: z.string().nullish(),
    sheet: z.string().nullish(),
    range: z.string().nullish(),
    asObjects: z.boolean().optional(),
    headers: z.array(z.string()).nullish(),
    rows: z
      .array(z.array(z.union([z.string(), z.number(), z.null()])))
      .nullish(),
    objects: z.array(z.record(z.string(), z.string())).nullish(),
    rowCount: z.number().optional(),
    error: z.string().nullish(),
  })
  .loose()
  .transform((data) => ({
    range: data.range ?? null,
    values: (data.rows ?? []) as unknown[][],
    rowCount: data.rowCount ?? data.rows?.length ?? 0,
    error: data.error ?? null,
  }));
export type ReadSheetOutput = z.infer<typeof readSheetOutputSchema>;
