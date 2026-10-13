import type { FC } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";
import type { ToolCallBlock } from "@/lib/store/session/types";

export interface RendererProps<I = unknown, O = unknown> {
  block: ToolCallBlock;
  /** The block's input parsed against the tool's input schema, or `null`. */
  input: I | null;
  /** The block's output parsed against the tool's output schema, or `null`. */
  output: O | null;
}

export interface ToolRenderer<I = unknown, O = unknown> {
  icon: LucideIcon;
  title: string;
  /** The tool's input schema, used to parse the block once before rendering. */
  inputSchema?: z.ZodType<I>;
  /** The tool's output schema, used to parse the block once before rendering. */
  outputSchema?: z.ZodType<O>;
  Summary?: FC<RendererProps<I, O>>;
  Detail?: FC<RendererProps<I, O>>;
}
