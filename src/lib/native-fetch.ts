import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export const nativeFetch: typeof globalThis.fetch = async (input, init) => {
  const headers = new Headers(init?.headers);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "Mozilla/5.0");
  }
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  const method = (init?.method ?? "GET").toUpperCase();
  console.log("[native-fetch] →", method, url);
  try {
    const res = await tauriFetch(input as string, { ...init, headers });
    console.log("[native-fetch] ←", res.status, method, url);
    return res;
  } catch (err) {
    console.error("[native-fetch] ✖", method, url, err);
    throw err;
  }
};
