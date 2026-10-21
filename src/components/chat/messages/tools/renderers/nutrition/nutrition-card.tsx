// nutrition-card.tsx
import type { FC } from "react";
import type { NutritionOutput } from "@/lib/ai/tools/nutrition";
import { cn } from "@/lib/utils";

const PROTEIN_KCAL_PER_GRAM = 4;
const CARBS_KCAL_PER_GRAM = 4;
const FAT_KCAL_PER_GRAM = 9;

const formatGrams = (value: number): string =>
  `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}g`;

const toPercent = (kcal: number, totalKcal: number): number =>
  totalKcal > 0 ? (kcal / totalKcal) * 100 : 0;

const BarSegment: FC<{ kcal: number; tone: string }> = ({ kcal, tone }) => {
  if (kcal <= 0) return null;

  return (
    <span
      className={cn("h-full basis-0 rounded-full", tone)}
      style={{ flexGrow: kcal }}
    />
  );
};

const MacroBar: FC<{
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  isExecuting: boolean;
}> = ({ proteinKcal, carbsKcal, fatKcal, isExecuting }) => (
  <div
    className={cn(
      "flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-muted/60",
      isExecuting && "animate-pulse",
    )}
    role="img"
    aria-label="Macro calorie breakdown"
  >
    <BarSegment kcal={proteinKcal} tone="bg-sky-400" />
    <BarSegment kcal={carbsKcal} tone="bg-amber-400" />
    <BarSegment kcal={fatKcal} tone="bg-rose-400" />
  </div>
);

const MacroRow: FC<{
  label: string;
  dot: string;
  grams: number;
  percent: number;
}> = ({ label, dot, grams, percent }) => {
  const roundedPercent = Math.round(percent);

  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dot)} />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium tabular-nums text-foreground">
        {formatGrams(grams)}
      </span>
      <span className="w-9 text-right text-xs tabular-nums text-muted-foreground/60">
        {roundedPercent}%
      </span>
    </div>
  );
};

const ItemRow: FC<{ name: string; calories: number }> = ({
  name,
  calories,
}) => (
  <li className="flex items-baseline justify-between gap-4">
    <span className="min-w-0 truncate text-sm text-foreground/80">{name}</span>
    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
      {calories.toLocaleString()} kcal
    </span>
  </li>
);

export const NutritionCard: FC<{
  data: NutritionOutput;
  state: "executing" | "result";
}> = ({ data, state }) => {
  const { title, items, totals } = data;

  const isExecuting = state === "executing";
  const showItems = items.length > 1;
  const heading = title?.trim() || "Nutrition";
  const status = isExecuting ? "Estimating…" : "Estimated";

  const proteinKcal = totals.protein * PROTEIN_KCAL_PER_GRAM;
  const carbsKcal = totals.carbs * CARBS_KCAL_PER_GRAM;
  const fatKcal = totals.fat * FAT_KCAL_PER_GRAM;
  const totalKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinPercent = toPercent(proteinKcal, totalKcal);
  const carbsPercent = toPercent(carbsKcal, totalKcal);
  const fatPercent = toPercent(fatKcal, totalKcal);

  return (
    <div className="my-1 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-sm font-medium text-foreground">
          {heading}
        </h3>
        <span
          className={cn(
            "shrink-0 text-xs text-muted-foreground/70",
            isExecuting && "animate-pulse",
          )}
        >
          {status}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {totals.calories.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">kcal</span>
      </div>

      <div className="mt-4">
        <MacroBar
          proteinKcal={proteinKcal}
          carbsKcal={carbsKcal}
          fatKcal={fatKcal}
          isExecuting={isExecuting}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <MacroRow
          label="Protein"
          dot="bg-sky-400"
          grams={totals.protein}
          percent={proteinPercent}
        />
        <MacroRow
          label="Carbs"
          dot="bg-amber-400"
          grams={totals.carbs}
          percent={carbsPercent}
        />
        <MacroRow
          label="Fat"
          dot="bg-rose-400"
          grams={totals.fat}
          percent={fatPercent}
        />
      </div>

      {showItems && (
        <ul className="mt-5 flex flex-col gap-2 border-t border-border/40 pt-4">
          {items.map((item, index) => (
            <ItemRow
              key={`${item.name}-${index}`}
              name={item.name}
              calories={item.calories}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
