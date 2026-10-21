import type { FC } from "react";
import { Search } from "lucide-react";
import { CountSummary } from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { ResultsDetail } from "./parts";
import { webSearchInput, webSearchOutputSchema } from "./schema";
import type { WebSearchInput, WebSearchOutput } from "./schema";

const Summary: FC<RendererProps<WebSearchInput, WebSearchOutput>> = ({
  block,
  input,
  output,
}) => (
  <CountSummary
    block={block}
    label={input?.query ?? null}
    count={output?.results.length ?? 0}
    noun="result"
  />
);

const Detail: FC<RendererProps<WebSearchInput, WebSearchOutput>> = ({
  block,
  output,
}) => (
  <div className="flex flex-col gap-3">
    <ResultsDetail
      block={block}
      output={output}
      emptyLabel="No results found."
    />
  </div>
);

export const renderer = defineRenderer<WebSearchInput, WebSearchOutput>({
  icon: Search,
  title: "Searched the web",
  executingTitle: "Searching the web",
  inputSchema: webSearchInput,
  outputSchema: webSearchOutputSchema,
  Summary,
  Detail,
});
