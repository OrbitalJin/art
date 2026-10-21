import type { FC } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";
import type { ToolCallBlock } from "@/lib/store/session/types";

/** How a tool's result is presented in the message flow. */
export type ToolSurface = "trace" | "card" | "bare";

export interface RendererProps<I = unknown, O = unknown> {
  block: ToolCallBlock;
  /** The block's input parsed against the tool's input schema, or `null`. */
  input: I | null;
  /** The block's output parsed against the tool's output schema, or `null`. */
  output: O | null;
}

/**
 * One tool's renderer as held in the registry, with its input/output types
 * erased. The registry stores heterogeneous renderers, so this is the only
 * place the I/O types become `unknown`; every renderer file stays typed via
 * `defineRenderer`.
 */
export interface ToolRendererEntry {
  icon: LucideIcon;
  title: string;
  /**
   * Headline shown while the tool is executing; the surface appends "…". Falls
   * back to `title` when omitted.
   */
  executingTitle?: string;
  /** Presentation surface. Defaults to `"trace"`. */
  surface?: ToolSurface;
  inputSchema?: z.ZodTypeAny;
  outputSchema?: z.ZodTypeAny;
  Summary?: FC<RendererProps<unknown, unknown>>;
  Detail?: FC<RendererProps<unknown, unknown>>;
}

interface RendererConfig<I, O> {
  icon: LucideIcon;
  title: string;
  executingTitle?: string;
  surface?: ToolSurface;
  inputSchema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  Summary?: FC<RendererProps<I, O>>;
  Detail?: FC<RendererProps<I, O>>;
}

/**
 * Declare a tool renderer, keeping `Summary`/`Detail` props typed to the tool's
 * schemas while widening to `ToolRendererEntry` for storage. The cast is the
 * single, unavoidable widening point for a heterogeneous component registry.
 */
export const defineRenderer = <I, O>(
  config: RendererConfig<I, O>,
): ToolRendererEntry => config as unknown as ToolRendererEntry;
