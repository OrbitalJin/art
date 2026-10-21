import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const NUTRITION_TOOL_NAME = "show_nutrition";

export const nutritionItemSchema = z.object({
  name: z.string().min(1).describe("Food or meal name, e.g. 'Grilled chicken'."),
  protein: z.number().min(0).describe("Protein in grams."),
  carbs: z.number().min(0).describe("Carbohydrates in grams."),
  fat: z.number().min(0).describe("Fat in grams."),
  calories: z
    .number()
    .min(0)
    .optional()
    .describe(
      "Calories in kcal. Omit to derive it from the macros (4/4/9).",
    ),
});

export const nutritionInputSchema = z.object({
  title: z
    .string()
    .optional()
    .describe("Short label for the card, e.g. 'Lunch' or 'Protein shake'."),
  items: z.array(nutritionItemSchema).min(1).max(20),
});

const normalizedItemSchema = z.object({
  name: z.string(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  calories: z.number(),
});

export const nutritionTotalsSchema = z.object({
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  calories: z.number(),
});

export const nutritionOutputSchema = z.object({
  title: z.string().optional(),
  items: z.array(normalizedItemSchema),
  totals: nutritionTotalsSchema,
});

export type NutritionItem = z.infer<typeof nutritionItemSchema>;
export type NutritionInput = z.infer<typeof nutritionInputSchema>;
export type NutritionOutput = z.infer<typeof nutritionOutputSchema>;
export type NutritionTotals = z.infer<typeof nutritionTotalsSchema>;

const round = (value: number): number => Math.round(value);

const caloriesOf = (item: NutritionItem): number =>
  round(item.calories ?? item.protein * 4 + item.carbs * 4 + item.fat * 9);

export const normalizeNutrition = (input: NutritionInput): NutritionOutput => {
  const items = input.items.map((item) => ({
    name: item.name,
    protein: round(item.protein),
    carbs: round(item.carbs),
    fat: round(item.fat),
    calories: caloriesOf(item),
  }));

  const totals = items.reduce<NutritionTotals>(
    (sum, item) => ({
      protein: sum.protein + item.protein,
      carbs: sum.carbs + item.carbs,
      fat: sum.fat + item.fat,
      calories: sum.calories + item.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 },
  );

  return { title: input.title, items, totals };
};

export const nutritionTools = (): ToolSet => ({
  [NUTRITION_TOOL_NAME]: tool({
    title: "Nutrition",
    description:
      "Render a nutrition card showing protein, carbs, fat, and calories. " +
      "Use it whenever the user asks about macros or calories, or when you " +
      "estimate the nutrition of a food or meal (including from web results). " +
      "Pass one item per food and grams for each macro; omit `calories` and it " +
      "is derived from the macros (4/4/9). Give the card a short `title` such " +
      "as the meal name. Call it once per meal, and do not repeat the same " +
      "numbers in prose — let the card carry them.",
    inputSchema: nutritionInputSchema,
    outputSchema: nutritionOutputSchema,
    execute: async (input) => normalizeNutrition(input),
  }),
});

export type NutritionToolName = keyof ReturnType<typeof nutritionTools>;
