import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultBadge, SummaryRow, SummaryText } from "../../primitives";
import { asRecord, formatCount, getString, hostnameOf } from "../../helpers";
import { errorOf, resultsOf } from "./helpers";

export const WebSearchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const query = getString(asRecord(block.input), "query");
  const error = errorOf(block.output);
  const results = resultsOf(block.output);

  return (
    <SummaryRow>
      {query ? <SummaryText title={query}>{query}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : block.state !== "executing" ? (
        <ResultBadge>{formatCount(results.length, "result")}</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};

export const FetchSummary: FC<{ block: ToolCallBlock }> = ({ block }) => {
  const url = getString(asRecord(block.input), "url");
  const error = errorOf(block.output);
  const title = getString(asRecord(resultsOf(block.output)[0]), "title");

  return (
    <SummaryRow>
      {url ? <SummaryText title={url}>{hostnameOf(url)}</SummaryText> : null}
      {error ? (
        <ResultBadge tone="error">failed</ResultBadge>
      ) : title ? (
        <ResultBadge>read</ResultBadge>
      ) : null}
    </SummaryRow>
  );
};
