import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { nativeFetch } from "@/lib/native-fetch";
import { useSettingsStore } from "@/lib/store/use-settings-store";

export const SHOW_NUTRITION_TOOL_NAME = "show_nutrition";
export const FETCH_FOOD_MACROS_TOOL_NAME = "fetch_food_macros";

export const nutritionItemSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Food or meal name, e.g. 'Grilled chicken'."),
  protein: z.number().min(0).describe("Protein in grams."),
  carbs: z.number().min(0).describe("Carbohydrates in grams."),
  fat: z.number().min(0).describe("Fat in grams."),
  calories: z
    .number()
    .min(0)
    .optional()
    .describe("Calories in kcal. Omit to derive it from the macros (4/4/9)."),
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

const FDC_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

const ENERGY_KCAL_ID = 1008;
const ENERGY_ATWATER_GENERAL_ID = 2047;
const ENERGY_ATWATER_SPECIFIC_ID = 2048;
const PROTEIN_ID = 1003;
const FAT_ID = 1004;
const CARBS_ID = 1005;

interface FdcNutrient {
  nutrientId: number;
  value: number;
}

interface FdcFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: FdcNutrient[];
}

interface FdcSearchResponse {
  foods: FdcFood[];
}

export const macroSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

export const foodMatchSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  dataType: z.string(),
  per100g: macroSchema,
  perServing: macroSchema,
});

export const fetchMacrosInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe("Food or meal name to look up, e.g. 'chicken breast, cooked'."),
  grams: z
    .number()
    .positive()
    .optional()
    .describe("Serving size in grams. Defaults to 100."),
});

export const fetchMacrosOutputSchema = z.object({
  query: z.string(),
  grams: z.number(),
  results: z.array(foodMatchSchema),
  error: z.string().optional(),
});

export type MacroSet = z.infer<typeof macroSchema>;
export type FoodMatch = z.infer<typeof foodMatchSchema>;
export type FetchMacrosInput = z.infer<typeof fetchMacrosInputSchema>;
export type FetchMacrosOutput = z.infer<typeof fetchMacrosOutputSchema>;

const valueOf = (nutrients: FdcNutrient[], id: number): number | undefined =>
  nutrients.find((nutrient) => nutrient.nutrientId === id)?.value;

const round1 = (value: number): number => Math.round(value * 10) / 10;

const readMacros = (nutrients: FdcNutrient[], scale: number): MacroSet => {
  const calories =
    valueOf(nutrients, ENERGY_KCAL_ID) ??
    valueOf(nutrients, ENERGY_ATWATER_GENERAL_ID) ??
    valueOf(nutrients, ENERGY_ATWATER_SPECIFIC_ID) ??
    0;
  const protein = valueOf(nutrients, PROTEIN_ID) ?? 0;
  const carbs = valueOf(nutrients, CARBS_ID) ?? 0;
  const fat = valueOf(nutrients, FAT_ID) ?? 0;

  return {
    calories: Math.round(calories * scale),
    protein: round1(protein * scale),
    carbs: round1(carbs * scale),
    fat: round1(fat * scale),
  };
};

const fetchFoodMacros = async ({
  query,
  grams,
}: FetchMacrosInput): Promise<FetchMacrosOutput> => {
  const serving = grams ?? 100;
  const apiKey = useSettingsStore.getState().keys?.usda;

  if (!apiKey) {
    return {
      query,
      grams: serving,
      results: [],
      error:
        "No USDA FoodData Central key configured. Ask the user to add one in " +
        "Settings, then estimate the macros instead.",
    };
  }

  const params = new URLSearchParams({
    query,
    dataType: "Foundation,SR Legacy",
    pageSize: "3",
    api_key: apiKey,
  });

  let response: Response;
  try {
    response = await nativeFetch(`${FDC_URL}?${params}`);
  } catch (error) {
    return {
      query,
      grams: serving,
      results: [],
      error: `USDA request failed: ${String(error).slice(0, 200)}`,
    };
  }

  if (!response.ok) {
    return {
      query,
      grams: serving,
      results: [],
      error: `USDA request failed: ${response.status} ${response.statusText}`,
    };
  }

  const data = (await response.json()) as FdcSearchResponse;
  const foods = data.foods ?? [];

  if (foods.length === 0) {
    return {
      query,
      grams: serving,
      results: [],
      error: `No USDA matches for "${query}".`,
    };
  }

  const scale = serving / 100;
  const results = foods.map((food) => ({
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    per100g: readMacros(food.foodNutrients, 1),
    perServing: readMacros(food.foodNutrients, scale),
  }));

  return { query, grams: serving, results };
};

export const nutritionTools = (): ToolSet => ({
  [SHOW_NUTRITION_TOOL_NAME]: tool({
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

export const fetchMacrosTools = (): ToolSet => ({
  [FETCH_FOOD_MACROS_TOOL_NAME]: tool({
    title: "Look up macros",
    description:
      "Look up accurate per-serving macros for a food from the USDA FoodData " +
      "Central database. Call this before show_nutrition whenever the user " +
      "names a specific food or meal and you need reliable numbers. Pass the " +
      "food name as `query` and the serving size in grams as `grams` (defaults " +
      "to 100g). Foundation and SR Legacy entries are returned. Take the " +
      "`perServing` macros from the best-matching result and pass them into " +
      "show_nutrition; prefer the closest description. If the result carries an " +
      "`error` or no matches, tell the user instead of inventing numbers." +
      "ONLY USE IF NO NUTRITIONAL VALUES WERE PROVIDED BY THE USER",
    inputSchema: fetchMacrosInputSchema,
    outputSchema: fetchMacrosOutputSchema,
    execute: async (input) => fetchFoodMacros(input),
  }),
});

export type NutritionToolName = keyof ReturnType<typeof nutritionTools>;
export type FetchMacrosToolName = keyof ReturnType<typeof fetchMacrosTools>;
