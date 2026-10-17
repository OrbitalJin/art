import type { ToolRenderer } from "../../types";
import { renderer as fetchUrl } from "./fetch-url";
import { renderer as flightSearch } from "./flight-search";
import { renderer as hotelSearch } from "./hotel-search";
import { renderer as mapsSearch } from "./maps-search";
import { renderer as newsSearch } from "./news-search";
import { renderer as webSearch } from "./web-search";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRenderer = ToolRenderer<any, any>;

export const searchRenderers = {
  COMPOSIO_SEARCH_WEB: webSearch,
  COMPOSIO_SEARCH_FETCH_URL_CONTENT: fetchUrl,
  COMPOSIO_SEARCH_NEWS: newsSearch,
  COMPOSIO_SEARCH_FLIGHTS: flightSearch,
  COMPOSIO_SEARCH_HOTELS: hotelSearch,
  COMPOSIO_SEARCH_GOOGLE_MAPS: mapsSearch,
} satisfies Record<string, AnyRenderer>;
