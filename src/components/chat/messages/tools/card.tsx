import type { FC } from "react";
import { surfaceTitle } from "./presentation";
import type { ResolvedTool } from "./registry";

/**
 * A tool result rendered as a framed card in the prose flow: a title header
 * (icon, title, summary) over the renderer's detail body.
 */
export const ToolCard: FC<{ resolved: ResolvedTool }> = ({ resolved }) => {
  const { entry, block, input, output } = resolved;
  const Detail = entry.Detail;
  const Summary = entry.Summary;
  const Icon = entry.icon;

  return (
    <section className="my-1.5 min-w-0 rounded-xl border border-border/60 bg-muted/15 p-3">
      <header className="mb-2.5 flex min-w-0 items-center gap-2 border-b border-border/40 pb-2.5">
        <Icon className="size-4 shrink-0 text-muted-foreground/70" />
        <span className="min-w-0 truncate text-[13px] font-medium text-foreground/90">
          {surfaceTitle(block, entry)}
        </span>
        {Summary ? (
          <span className="ml-auto flex min-w-0 justify-end">
            <Summary block={block} input={input} output={output} />
          </span>
        ) : null}
      </header>

      {Detail ? <Detail block={block} input={input} output={output} /> : null}
    </section>
  );
};
