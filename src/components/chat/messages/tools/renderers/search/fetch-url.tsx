import type { FC } from "react";
import { Globe } from "lucide-react";
import {
  DetailGate,
  DetailTitle,
  EmptyNote,
  MetaLine,
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
  formatCount,
  hostnameOf,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { wordCountOf } from "./helpers";
import { fetchUrlInput, fetchUrlOutputSchema } from "./schema";
import type { FetchUrlInput, FetchUrlOutput } from "./schema";

const Summary: FC<RendererProps<FetchUrlInput, FetchUrlOutput>> = ({
  block,
  input,
  output,
}) => {
  const url = input?.urls?.[0] ?? null;
  const page = output?.results[0];
  const body = page?.text ?? page?.snippet ?? null;
  const words = body ? formatCount(wordCountOf(body), "word") : null;

  return (
    <SummaryRow>
      {url ? <SummaryText title={url}>{hostnameOf(url)}</SummaryText> : null}
      <SummaryStatus block={block}>
        {page ? <ResultBadge>{words ?? "read"}</ResultBadge> : null}
      </SummaryStatus>
    </SummaryRow>
  );
};

const FetchBody: FC<{ output: FetchUrlOutput | null }> = ({ output }) => {
  const page = output?.results[0];
  if (!page) return <EmptyNote>No content returned.</EmptyNote>;

  const source = page.url ? hostnameOf(page.url) : null;
  const title = page.title ?? source ?? "Untitled page";
  const body = page.text ?? page.snippet;
  const words = body ? formatCount(wordCountOf(body), "word") : null;

  const link = page.url ? (
    <a
      href={page.url}
      target="_blank"
      rel="noreferrer"
      className="outline-none hover:text-primary hover:underline focus-visible:underline"
    >
      {source}
    </a>
  ) : null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <DetailTitle title={title} />
        <MetaLine items={[link, words]} />
      </div>
    </div>
  );
};

const Detail: FC<RendererProps<FetchUrlInput, FetchUrlOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Fetching page…">
    <FetchBody output={output} />
  </DetailGate>
);

export const renderer = defineRenderer<FetchUrlInput, FetchUrlOutput>({
  icon: Globe,
  title: "Fetched page",
  executingTitle: "Fetching page",
  inputSchema: fetchUrlInput,
  outputSchema: fetchUrlOutputSchema,
  Summary,
  Detail,
});
