import type { FC } from "react";
import { Newspaper } from "lucide-react";
import { CountSummary } from "../../shared";
import type { RendererProps, ToolRenderer } from "../../types";
import { ResultsDetail } from "./parts";
import { newsSearchInput, newsSearchOutputSchema } from "./schema";
import type { NewsSearchInput, NewsSearchOutput } from "./schema";

const Summary: FC<RendererProps<NewsSearchInput, NewsSearchOutput>> = ({
  block,
  input,
  output,
}) => (
  <CountSummary
    block={block}
    label={input?.query ?? null}
    count={output?.results.length ?? 0}
    noun="article"
  />
);

const Detail: FC<RendererProps<NewsSearchInput, NewsSearchOutput>> = ({
  block,
  output,
}) => (
  <ResultsDetail block={block} output={output} emptyLabel="No articles found." />
);

export const renderer: ToolRenderer<NewsSearchInput, NewsSearchOutput> = {
  icon: Newspaper,
  title: "Searched news",
  executingTitle: "Searching news",
  inputSchema: newsSearchInput,
  outputSchema: newsSearchOutputSchema,
  Summary,
  Detail,
};
