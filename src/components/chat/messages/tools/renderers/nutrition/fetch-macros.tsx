import type { FC } from "react";
import { Search } from "lucide-react";
import {
  fetchMacrosInputSchema,
  fetchMacrosOutputSchema,
  type FetchMacrosInput,
  type FetchMacrosOutput,
  type FoodMatch,
} from "@/lib/ai/tools/nutrition";
import {
  Chip,
  DetailGate,
  DetailTitle,
  EmptyNote,
  ErrorNote,
  ListRow,
  MetaLine,
  ResultBadge,
  RowList,
  SectionLabel,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";

const grams = (value: number): string =>
  `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}g`;

const MatchRow: FC<{ match: FoodMatch }> = ({ match }) => {
  const { perServing } = match;

  return (
    <ListRow>
      <DetailTitle title={match.description}>
        <Chip mono>fdcId {match.fdcId}</Chip>
      </DetailTitle>
      <MetaLine
        items={[
          match.dataType,
          `${perServing.calories} kcal`,
          `P ${grams(perServing.protein)}`,
          `C ${grams(perServing.carbs)}`,
          `F ${grams(perServing.fat)}`,
        ]}
      />
    </ListRow>
  );
};

const Summary: FC<RendererProps<FetchMacrosInput, FetchMacrosOutput>> = ({
  block,
  input,
  output,
}) => {
  const label = output?.query ?? input?.query ?? null;
  const top = output?.results[0];

  return (
    <SummaryRow>
      {label ? <SummaryText title={label}>{label}</SummaryText> : null}
      <SummaryStatus block={block}>
        {top ? (
          <ResultBadge>{top.perServing.calories} kcal</ResultBadge>
        ) : null}
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<FetchMacrosInput, FetchMacrosOutput>> = ({
  block,
  output,
}) => (
  <DetailGate block={block} executingLabel="Looking up macros…">
    {output?.error ? (
      <ErrorNote>{output.error}</ErrorNote>
    ) : !output || output.results.length === 0 ? (
      <EmptyNote>No USDA matches returned.</EmptyNote>
    ) : (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>
          Per {grams(output.grams)} · {output.results.length} match
          {output.results.length === 1 ? "" : "es"}
        </SectionLabel>
        <RowList maxHeightClass="max-h-72">
          {output.results.map((match) => (
            <MatchRow key={match.fdcId} match={match} />
          ))}
        </RowList>
      </div>
    )}
  </DetailGate>
);

export const renderer = defineRenderer<FetchMacrosInput, FetchMacrosOutput>({
  icon: Search,
  title: "Look up macros",
  executingTitle: "Looking up macros",
  inputSchema: fetchMacrosInputSchema,
  outputSchema: fetchMacrosOutputSchema,
  Summary,
  Detail,
});
