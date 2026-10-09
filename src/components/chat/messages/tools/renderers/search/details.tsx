import type { FC } from "react";
import type { ToolCallBlock } from "@/lib/store/session/types";
import { ResultsDetail } from "./parts";

export const WebSearchDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ResultsDetail block={block} emptyLabel="No results found." />
);

export const FetchDetail: FC<{ block: ToolCallBlock }> = ({ block }) => (
  <ResultsDetail block={block} emptyLabel="No content returned." />
);
