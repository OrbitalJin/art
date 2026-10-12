import type { FC } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";
import type { ToolCallBlock } from "@/lib/store/session/types";

export interface RendererProps<O = unknown> {
  block: ToolCallBlock;
  /** The block's output parsed against the tool's schema, or `null`. */
  output: O | null;
}

export interface ToolRenderer<O = unknown> {
  icon: LucideIcon;
  title: string;
  /** The tool's output schema, used to parse the block once before rendering. */
  schema?: z.ZodType<O>;
  Summary?: FC<RendererProps<O>>;
  Detail?: FC<RendererProps<O>>;
}
