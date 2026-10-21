import type { FC } from "react";
import { Flame } from "lucide-react";
import {
  nutritionInputSchema,
  nutritionOutputSchema,
  normalizeNutrition,
  type NutritionInput,
  type NutritionOutput,
} from "@/lib/ai/tools/nutrition";
import {
  ResultBadge,
  SummaryRow,
  SummaryStatus,
  SummaryText,
} from "../../shared";
import { defineRenderer, type RendererProps } from "../../types";
import { NutritionCard } from "./nutrition-card";

const dataOf = (
  input: NutritionInput | null,
  output: NutritionOutput | null,
): NutritionOutput | null => {
  if (output) return output;
  if (input) return normalizeNutrition(input);
  return null;
};

const Summary: FC<RendererProps<NutritionInput, NutritionOutput>> = ({
  block,
  input,
  output,
}) => {
  const data = dataOf(input, output);
  if (!data) return null;

  const label =
    data.title?.trim() ||
    data.items.map((item) => item.name).join(", ") ||
    "Nutrition";

  return (
    <SummaryRow>
      <SummaryText title={label}>{label}</SummaryText>
      <SummaryStatus block={block}>
        <ResultBadge>{data.totals.calories.toLocaleString()} kcal</ResultBadge>
      </SummaryStatus>
    </SummaryRow>
  );
};

const Detail: FC<RendererProps<NutritionInput, NutritionOutput>> = ({
  block,
  input,
  output,
}) => {
  const data = dataOf(input, output);
  if (!data) return null;

  return (
    <NutritionCard
      data={data}
      state={block.state === "executing" ? "executing" : "result"}
    />
  );
};

export const renderer = defineRenderer<NutritionInput, NutritionOutput>({
  icon: Flame,
  title: "Nutrition",
  executingTitle: "Estimating nutrition",
  surface: "bare",
  inputSchema: nutritionInputSchema,
  outputSchema: nutritionOutputSchema,
  Summary,
  Detail,
});
