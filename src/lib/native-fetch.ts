import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export const nativeFetch: typeof globalThis.fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "Mozilla/5.0");
  }
  return tauriFetch(input as string, { ...init, headers });
};
