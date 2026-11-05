import { z } from "zod";

/**
 * The Exa search tools return a normalized `{ results }` payload. We parse it
 * once here and map it into the view model the search parts render, keeping the
 * UI decoupled from the backend payload.
 */

/* View models --------------------------------------------------------------- */

export interface SearchResult {
  title: string | null;
  url: string | null;
  snippet: string | null;
  text: string | null;
  date: string | null;
  author: string | null;
}

/* Inputs -------------------------------------------------------------------- */

export const webSearchInput = z
  .object({
    query: z.string().optional(),
    numResults: z.number().optional(),
    includeDomains: z.array(z.string()).optional(),
  })
  .loose();
export type WebSearchInput = z.infer<typeof webSearchInput>;

export const fetchUrlInput = z
  .object({
    urls: z.array(z.string()).optional(),
    maxCharacters: z.number().optional(),
  })
  .loose();
export type FetchUrlInput = z.infer<typeof fetchUrlInput>;

export const newsSearchInput = z
  .object({
    query: z.string().optional(),
    numResults: z.number().optional(),
    startPublishedDate: z.string().optional(),
  })
  .loose();
export type NewsSearchInput = z.infer<typeof newsSearchInput>;

/* Outputs ------------------------------------------------------------------- */

const exaResult = z
  .object({
    title: z.string().nullish(),
    url: z.string().nullish(),
    publishedDate: z.string().nullish(),
    author: z.string().nullish(),
    text: z.string().nullish(),
  })
  .loose();

const resultsEnvelope = z
  .object({ results: z.array(exaResult).nullish() })
  .loose();

const toResults = (data: {
  results?: Array<{
    title?: string | null;
    url?: string | null;
    publishedDate?: string | null;
    author?: string | null;
    text?: string | null;
  }> | null;
}): { results: SearchResult[] } => ({
  results: (data.results ?? []).map((result) => {
    const text = result.text ?? null;
    return {
      title: result.title ?? result.url ?? null,
      url: result.url ?? null,
      snippet: text,
      text,
      date: result.publishedDate ?? null,
      author: result.author ?? null,
    };
  }),
});

export const webSearchOutputSchema = resultsEnvelope.transform(toResults);
export type WebSearchOutput = z.infer<typeof webSearchOutputSchema>;

export const fetchUrlOutputSchema = resultsEnvelope.transform(toResults);
export type FetchUrlOutput = z.infer<typeof fetchUrlOutputSchema>;

export const newsSearchOutputSchema = resultsEnvelope.transform(toResults);
export type NewsSearchOutput = z.infer<typeof newsSearchOutputSchema>;
